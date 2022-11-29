import { sendTransaction } from "./Fireblocks-signer";


export  class KSMStaker {
    constructor(public apiClient, public testnet = false) {
    }

    getAssetId () {
        return this.testnet ? 'WND' : 'KSM';
    }

    getEndpoint() {
        return this.testnet ? 'wss://westend-rpc.polkadot.io/' : 'wss://kusama-rpc.polkadot.io';
    }

    async getPermanentAddress(vaultAccountId) {
        var depositAddress = await this.apiClient.getDepositAddresses(vaultAccountId, this.getAssetId());
        return depositAddress[0].address;
    }
    

    async sendTransaction({ vaultAccountId, params, txNote}: {vaultAccountId: string, params: string[], txNote?: string}) {
        const permanentAddress = await this.getPermanentAddress(vaultAccountId);
        return sendTransaction(this.apiClient, permanentAddress, 0, this.getEndpoint(), params , vaultAccountId, txNote, this.testnet);
    }

    async bond(vaultAccountId, amount?: number, controllerAddress?: string, rewardDestination?: string) {
        if(!amount) {
            const availableBalance = (await this.apiClient.getVaultAccountAsset(vaultAccountId, this.getAssetId())).available;
            amount = Number.parseFloat(availableBalance);
        } 

        const txNote = controllerAddress ? `Bond ${amount} KSM to ${controllerAddress}` : `Bond ${amount} KSM`;
        console.log(txNote);

        await this.sendTransaction({
            vaultAccountId,
            params: [
                'staking.bond', controllerAddress || await this.getPermanentAddress(vaultAccountId),
                (amount * 1000000000000).toString(),
                rewardDestination? rewardDestination: 'Stash'
            ],
            txNote
        });
    }
    
    async bondExtra(vaultAccountId, amount?: number) {
        if(!amount) {
            const availableBalance = await this.apiClient.getVaultAccountAsset(vaultAccountId, this.getAssetId()).available;
            amount = Number.parseFloat(availableBalance);
        }
        await this.sendTransaction({ params: ['staking.bondExtra', (amount * 1000000000000).toString()], vaultAccountId, txNote: `Bond extra ${amount} KSM`});
    }
    
    async unbond(vaultAccountId, amount?: number) {
        await this.sendTransaction({params: ['staking.unbond',(amount * 1000000000000).toString()], vaultAccountId, txNote: `Unbonding ${amount} KSM`});
    }
    
    async addProxy(vaultAccountId, proxyAddress) {
        await this.sendTransaction({params: ['proxy.addProxy', proxyAddress, 'Staking', '0'], vaultAccountId, txNote: `Adding the following proxy: ${proxyAddress}`});
    }

    async chill(vaultAccountId) {
        await this.sendTransaction({params: ['staking.chill'], vaultAccountId, txNote: `Chilling the controller account`});
    }

    async removeProxy(vaultAccountId, proxyAddress, proxyType?) {
        await this.sendTransaction({params: ['proxy.removeProxy', proxyAddress, proxyType? proxyType: 'Staking', '0'], vaultAccountId, txNote: `Removing the following proxy: ${proxyAddress}`});
    }
    async withdrawUnbonded(vaultAccountId) {
        await this.sendTransaction({params: ['staking.withdrawUnbonded', null], vaultAccountId, txNote: `Withdrawing Unbonded Funds`});
    }
}

