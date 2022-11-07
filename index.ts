import fs from "fs";
import path from "path";
import {FireblocksSDK, PeerType, TransactionArguments, TransactionOperation, TransactionStatus} from "fireblocks-sdk";
import { KSMStaker } from "./src/ksm-staker";


const apiSecret = fs.readFileSync(path.resolve(__dirname, "./fireblocks_secret.key"), "utf8");
const apiKey = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";
const fireblocks = new FireblocksSDK(apiSecret, apiKey);
const ksmStaker = new KSMStaker(fireblocks, false);

(async() => {
    
    //Your code...


})().catch(console.log);