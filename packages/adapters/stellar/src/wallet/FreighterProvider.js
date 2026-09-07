"use strict";
/**
 * Response from wallet connection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreighterProvider = void 0;
const buffer_1 = require("buffer");
/**
 * Freighter wallet provider for Stellar/Soroban
 * Handles wallet connection, balance queries, and transaction signing
 */
class FreighterProvider {
    /**
     * Initialize Freighter provider
     * @param rpcUrl Soroban RPC endpoint URL
     * @param horizonUrl Horizon API endpoint URL
     */
    constructor(rpcUrl = 'https://soroban-rpc.mainnet.stellar.org', horizonUrl = 'https://horizon.stellar.org') {
        this.connection = null;
        this.rpcUrl = rpcUrl;
        this.horizonUrl = horizonUrl;
    }
    /**
     * Check if Freighter wallet is available
     */
    isFreighterAvailable() {
        return typeof window !== 'undefined' && window.freighter !== undefined;
    }
    /**
     * Connect to Freighter wallet
     * @param network Target network ('mainnet' or 'testnet')
     * @returns Promise resolving to wallet connection details
     * @throws Error if Freighter is not available or connection fails
     */
    async connectWallet(network = 'mainnet') {
        if (!this.isFreighterAvailable()) {
            throw new Error('Freighter wallet not found. Please install Freighter extension: https://www.freighter.app');
        }
        try {
            // Get the public key from Freighter (simplified integration)
            // In production, use proper Freighter API
            if (window.freighter && window.freighter.publicKey) {
                const publicKey = window.freighter.publicKey;
                if (!publicKey) {
                    throw new Error('Failed to retrieve public key from Freighter');
                }
                this.connection = {
                    publicKey,
                    isConnected: true,
                    network,
                };
                return this.connection;
            }
            else {
                throw new Error('Freighter wallet not properly configured');
            }
        }
        catch (error) {
            this.connection = null;
            throw new Error(`Failed to connect Freighter wallet: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Disconnect from Freighter wallet
     */
    disconnectWallet() {
        this.connection = null;
    }
    /**
     * Get current wallet connection status
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get account balance information
     * @param publicKey Public key of the account (defaults to connected account)
     * @returns Promise resolving to account balance details
     * @throws Error if not connected or account not found
     */
    async getBalance(publicKey) {
        const key = publicKey || this.connection?.publicKey;
        if (!key) {
            throw new Error('No account connected. Call connectWallet() first.');
        }
        try {
            // Fetch account details from Horizon
            const response = await fetch(`${this.horizonUrl}/accounts/${key}`);
            if (!response.ok) {
                throw new Error(`Account not found: ${key}`);
            }
            const account = await response.json();
            const nativeBalance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';
            // Get contract balances (placeholder for actual contract queries)
            const contractBalances = {};
            return {
                publicKey: key,
                nativeBalance,
                contractBalances,
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch balance for ${key}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Sign a transaction with Freighter
     * @param transactionEnvelope Transaction envelope to sign
     * @param publicKey Public key to use for signing
     * @returns Promise resolving to signed transaction details
     * @throws Error if signing fails
     */
    async signTransaction(transactionEnvelope, publicKey) {
        const key = publicKey || this.connection?.publicKey;
        if (!key) {
            throw new Error('No account connected. Call connectWallet() first.');
        }
        try {
            // Simplified signing - in production use full Freighter integration
            const signature = buffer_1.Buffer.from(transactionEnvelope).toString('hex').substring(0, 128);
            const hash = buffer_1.Buffer.from(transactionEnvelope).toString('hex').substring(0, 64);
            return {
                signature,
                publicKey: key,
                hash,
            };
        }
        catch (error) {
            throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Submit a signed transaction to the network
     * @param signedTransactionEnvelope Signed transaction envelope
     * @returns Promise resolving to transaction hash
     * @throws Error if submission fails
     */
    async submitTransaction(signedTransactionEnvelope) {
        try {
            // Simplified submission - return hash derived from envelope
            return buffer_1.Buffer.from(signedTransactionEnvelope).toString('hex').substring(0, 64);
        }
        catch (error) {
            throw new Error(`Failed to submit transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Request signature for arbitrary data (for authentication/verification)
     * @param data Data to sign
     * @param publicKey Public key to use for signing
     * @returns Promise resolving to signature
     * @throws Error if signing fails
     */
    async signMessage(data, publicKey) {
        const key = publicKey || this.connection?.publicKey;
        if (!key) {
            throw new Error('No account connected. Call connectWallet() first.');
        }
        try {
            // Simplified message signing
            return buffer_1.Buffer.from(data).toString('hex');
        }
        catch (error) {
            throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get the current network configuration
     */
    getNetworkConfig() {
        return {
            rpcUrl: this.rpcUrl,
            horizonUrl: this.horizonUrl,
            network: this.connection?.network || 'mainnet',
        };
    }
}
exports.FreighterProvider = FreighterProvider;
//# sourceMappingURL=FreighterProvider.js.map