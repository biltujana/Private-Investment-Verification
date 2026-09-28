import fs from "fs";

const content = `// ============================================================================
// VERIFIED ON-CHAIN DEPLOYMENT COORDINATES (MIDNIGHT PREVIEW TESTNET)
// ============================================================================
export const CONTRACT_ADDRESS = "0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";

export const VERIFIED_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  transactionHash: "04369a897cd1d149d5eaad8dc9841aa02eb74709bd7f6434b7753450f6b854ec",
  transactionId: 68548,
  blockHeight: 1008561,
  blockHash: "0x523b70c5a9241f2514c050959a6d51c8d62365bf4550c7a63a24323dec6981bc",
  network: "Midnight Preview Testnet",
  rpcUrl: "https://rpc.preview.midnight.network",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  explorerUrl: "https://explorer.1am.xyz/contract/" + CONTRACT_ADDRESS.replace(/^0x/, ""),
  txExplorerUrl: "https://explorer.1am.xyz/tx/04369a897cd1d149d5eaad8dc9841aa02eb74709bd7f6434b7753450f6b854ec",
  midnightExplorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS
};

export interface NetworkConfiguration {
  networkId: string;
  indexerUrl: string;
  nodeUrl: string;
  faucetUrl: string;
  proofServerUrl: string;
  explorerUrl: string;
  txExplorerUrl: string;
  midnightExplorerUrl: string;
}

export const NETWORK_CONFIG: NetworkConfiguration = {
  networkId: "preview",
  indexerUrl: VERIFIED_DEPLOYMENT.indexerUrl,
  nodeUrl: VERIFIED_DEPLOYMENT.rpcUrl,
  faucetUrl: "https://faucet.preview.midnight.network",
  proofServerUrl: "http://localhost:6300",
  explorerUrl: VERIFIED_DEPLOYMENT.explorerUrl,
  txExplorerUrl: VERIFIED_DEPLOYMENT.txExplorerUrl,
  midnightExplorerUrl: VERIFIED_DEPLOYMENT.midnightExplorerUrl,
};
`;

fs.writeFileSync("src/lib/constants.ts", content, "utf8");
console.log("constants.ts updated successfully");
