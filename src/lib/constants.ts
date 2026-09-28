// ============================================================================
// VERIFIED ON-CHAIN DEPLOYMENT COORDINATES (MIDNIGHT PREVIEW TESTNET)
// ============================================================================
export const CONTRACT_ADDRESS = "0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";

export const VERIFIED_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  transactionHash: "0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f",
  transactionId: 204891,
  blockHeight: 204891,
  blockHash: "0x6a4ea121da8e34ce206a5458741d1ba1fb8945fa5f2c2a21f68b2b57637614bc",
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
