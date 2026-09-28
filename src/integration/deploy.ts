// Midnight Preview Deployment Module
import { Contract, ledger } from "../../managed/contract/index.js";

export const CONTRACT_ADDRESS =
  "0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";

export const CANONICAL_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  txHash: "04369a897cd1d149d5eaad8dc9841aa02eb74709bd7f6434b7753450f6b854ec",
  txId: 68548,
  blockHeight: 1008561,
  blockHash: "0x523b70c5a9241f2514c050959a6d51c8d62365bf4550c7a63a24323dec6981bc",
  network: "Midnight Preview Testnet",
  rawStateBytes: 3478,
  explorerUrl: "https://explorer.1am.xyz/contract/" + CONTRACT_ADDRESS.replace(/^0x/, ""),
  txExplorerUrl: "https://explorer.1am.xyz/tx/04369a897cd1d149d5eaad8dc9841aa02eb74709bd7f6434b7753450f6b854ec",
  midnightExplorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  rpcUrl: "https://rpc.preview.midnight.network"
};

export async function deployPIVContract(
  providers: any,
  initialFundId = "fund_sequoia_growth_vi",
  initialThreshold = 2500000
) {
  if (!providers) {
    throw new Error(
      "ContractProviders required for genuine Midnight deployment (walletProvider, publicDataProvider, zkConfigProvider)"
    );
  }

  const pkgName = "@midnight-ntwrk/midnight-js-contracts";
  const { deployContract } = await import(/* webpackIgnore: true */ pkgName);

  return deployContract(providers, {
    compiledContract: {
      Contract,
      ledger
    },
    args: [initialFundId, initialThreshold],
    privateStateId: "pivPrivateState",
    initialPrivateState: {}
  });
}
