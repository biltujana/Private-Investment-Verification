// ============================================================================
// VERIFIED ON-CHAIN DEPLOYMENT COORDINATES (MIDNIGHT PREVIEW TESTNET)
// ============================================================================
export const CONTRACT_ADDRESS = "0x443a1a8b3dfcca0bc809e15fbee0160bfc3e9eb375cfee4f8383b8a3b2fcbaa2";

export const VERIFIED_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  transactionHash: "0x2c09c04b9bf87ff1476b0433b86bb6697b53cd7d2b437e257c47c028ef19fbab",
  transactionId: 67494,
  blockHeight: 932658,
  blockHash: "0x8cbbdfd523d7924d82212fcf917536a34b325cd9f7479670ba3f4537d4d16393",
  network: "Midnight Preview Testnet",
  rpcUrl: "https://rpc.preview.midnight.network",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS
};

export interface NetworkConfiguration {
  networkId: string;
  indexerUrl: string;
  nodeUrl: string;
  faucetUrl: string;
  proofServerUrl: string;
  explorerUrl: string;
}

export const NETWORK_CONFIG: NetworkConfiguration = {
  networkId: "preview",
  indexerUrl: VERIFIED_DEPLOYMENT.indexerUrl,
  nodeUrl: VERIFIED_DEPLOYMENT.rpcUrl,
  faucetUrl: "https://faucet.preview.midnight.network",
  proofServerUrl: "http://localhost:6300",
  explorerUrl: VERIFIED_DEPLOYMENT.explorerUrl,
};
