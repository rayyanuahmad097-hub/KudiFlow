"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeContract = void 0;
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
class BridgeContract {
    constructor(config) {
        this.config = config;
        this.rpcClient = axios_1.default.create({
            baseURL: config.rpcUrl,
            headers: { "Content-Type": "application/json" },
        });
    }
    async prepareBridgeTransfer(params, sourceAccount) {
        try {
            const preparedTx = {
                sourceAccount: sourceAccount.publicKey,
                contractId: this.config.contractId,
                operation: "bridge",
                params: {
                    sourceChain: params.sourceChain,
                    targetChain: params.targetChain,
                    amount: params.amount,
                    recipient: params.recipient,
                    slippage: params.slippage || 0.005,
                },
                networkPassphrase: this.config.networkPassphrase,
                fee: 100000,
                timebounds: {
                    minTime: Math.floor(Date.now() / 1000),
                    maxTime: Math.floor(Date.now() / 1000) + 600,
                },
            };
            return preparedTx;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error("Failed to prepare bridge transfer: " + msg);
        }
    }
    async submitBridgeTransfer(signedTransaction) {
        try {
            const response = await this.rpcClient.post("/transactions", { tx: signedTransaction });
            return {
                transactionHash: response.data.hash || response.data.id,
                operationId: response.data.id || ("bridge-" + Date.now()),
                status: "pending",
                bridgeAmount: response.data.amount || "0",
                estimatedTime: response.data.estimatedTime || 30000,
            };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error("Failed to submit bridge transfer: " + msg);
        }
    }
    async queryBridgeStatus(operationId) {
        try {
            const url = "/operations/" + operationId;
            const response = await this.rpcClient.get(url);
            const statusMap = {
                pending: "pending",
                confirmed: "confirmed",
                success: "confirmed",
                failed: "failed",
                error: "failed",
            };
            return {
                transactionHash: response.data.hash,
                operationId: response.data.id,
                status: statusMap[response.data.status] || "pending",
                bridgeAmount: response.data.bridgeAmount || "0",
                estimatedTime: response.data.estimatedTime || 0,
            };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error("Failed to query bridge status: " + msg);
        }
    }
    async estimateBridgeFees(params) {
        try {
            const amount = BigInt(params.amount);
            const baseFee = BigInt(100000);
            const bridgeFee = amount / BigInt(1000);
            const totalFee = baseFee + bridgeFee;
            return {
                baseFee: baseFee.toString(),
                bridgeFee: bridgeFee.toString(),
                totalFee: totalFee.toString(),
                feePercentage: "0.1",
            };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error("Failed to estimate bridge fees: " + msg);
        }
    }
    createBridgeArgs(params) {
        const args = [];
        args.push(buffer_1.Buffer.from(params.sourceChain));
        args.push(buffer_1.Buffer.from(params.targetChain));
        args.push(buffer_1.Buffer.from(params.amount));
        args.push(buffer_1.Buffer.from(params.recipient));
        if (params.tokenAddress) {
            args.push(buffer_1.Buffer.from(params.tokenAddress));
        }
        if (params.slippage !== undefined) {
            args.push(buffer_1.Buffer.from(String(params.slippage)));
        }
        return args;
    }
}
exports.BridgeContract = BridgeContract;
//# sourceMappingURL=BridgeContract.js.map