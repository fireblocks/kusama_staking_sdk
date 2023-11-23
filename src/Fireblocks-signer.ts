import { FireblocksSDK, RawMessageData, TransactionArguments, TransactionOperation, PeerType, TransactionStatus } from "fireblocks-sdk";

import { SignerOptions } from "@polkadot/api/submittable/types";
import type { Signer, SignerResult } from "@polkadot/api/types";
import type { SignerPayloadRaw } from "@polkadot/types/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { assert, hexToU8a, u8aToHex } from "@polkadot/util";
import { blake2AsHex } from '@polkadot/util-crypto';

class FireblocksSigner implements Signer {
    constructor(public fireblocks: FireblocksSDK, private vaultAccountId: string, private txNote?: string, private testnet: boolean = false) {
    }

    public async signRaw({ data, type }: SignerPayloadRaw): Promise<SignerResult> {
        return new Promise(async (resolve) => {

            data = (data.length > (256 + 1) * 2) ? blake2AsHex(data) : data;

            console.log('Payload: ' + data);
            console.log('Type: ' + type);
            console.log('hexToU8a(data): ' + hexToU8a(data));

            const rawMessageData: RawMessageData = {
                messages: [{
                    content: data.substring(2)
                }]
            }

            const tx: TransactionArguments = {
                operation: TransactionOperation.RAW,
                source: {
                    type: PeerType.VAULT_ACCOUNT,
                    id: this.vaultAccountId
                },
                assetId: this.testnet ? "WND" : 'KSM',
                extraParameters: { rawMessageData },
                note: this.txNote || ""
            }

            const txId = (await this.fireblocks.createTransaction(tx)).id;
            console.log('TXID: ' + txId);

            while ((await this.fireblocks.getTransactionById(txId)).status != TransactionStatus.COMPLETED) {
                console.log((await this.fireblocks.getTransactionById(txId)).status);
                setTimeout(() => { }, 4000);
            }

            const signedTx = (await this.fireblocks.getTransactionById(txId)).signedMessages;
            if (signedTx != undefined) {
                const signature = '0x00' + signedTx[0].signature.fullSig;
                console.log('Signature: ' + signature);

                //@ts-ignore
                resolve({ id: 1, signature });
            }
        });
    }
}

export async function sendTransaction(fireblocks: FireblocksSDK, account: string, blocks: number | undefined, endpoint: string, [txName, ...params]: string[], vaultAccountId, txNote, testnet): Promise<void> {
    const api = await ApiPromise.create({ provider: new WsProvider(endpoint) });

    const [section, method] = txName.split('.');
    assert(api.tx[section] && api.tx[section][method], `Unable to find method ${section}.${method}`);

    const options: Partial<SignerOptions> = { signer: new FireblocksSigner(fireblocks, vaultAccountId, txNote, testnet) };

    if (blocks === 0) {
        // immortal extrinsic
        options.era = 0;
    } else if (blocks != null) {
        // Get current block if we want to modify the number of blocks we have to sign
        const signedBlock = await api.rpc.chain.getBlock();

        options.blockHash = signedBlock.block.header.hash;
        // @ts-ignore
        options.era = api.createType('ExtrinsicEra', {
            current: signedBlock.block.header.number,
            period: blocks
        });
    }

    await api.tx[section][method](...params).signAndSend(account, options, (result): void => {

        if (result.isInBlock || result.isFinalized) {

            if (result.dispatchError?.isModule) {
                const decoded = api.registry.findMetaError(result.dispatchError.asModule);
                const { docs, name, section } = decoded;

                console.log(`${section}.${name}: ${docs.join(' ')}`);   
            }

            console.log(JSON.stringify(result.toHuman(), null, 2));
            process.exit(0);
        }
    });
}
