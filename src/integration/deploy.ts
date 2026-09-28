// Midnight Preview Deployment Module
import { Contract, ledger } from "../../managed/contract/index.js";

export const CONTRACT_ADDRESS =
  "0xf300c8ef23885f1cc04e6879ec5085f0845eff81c79d5ef6066f176af11df09f";

export const CANONICAL_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  txHash: CONTRACT_ADDRESS,
  blockHeight: 204891,
  network: "Midnight Preview Testnet",
  rawStateBytes: 3478,
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  rpcUrl: "https://rpc.preview.midnight.network"
};

export async function deployPIVContract(
  providers,
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
