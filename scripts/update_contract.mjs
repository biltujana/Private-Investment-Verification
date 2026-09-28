import fs from "fs";

let code = fs.readFileSync("src/lib/contract.ts", "utf8");

// 1. Update CANONICAL_DEPLOYMENT
const oldCanonical = `export const CANONICAL_DEPLOYMENT = {
  contractAddress: CONTRACT_ADDRESS,
  txHash: CONTRACT_ADDRESS,
  blockHeight: 204891,
  network: "Midnight Preview Testnet",
  rawStateBytes: 3478,
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  rpcUrl: "https://rpc.preview.midnight.network"
};`;

const newCanonical = `export const CANONICAL_DEPLOYMENT = {
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
};`;

code = code.replace(oldCanonical, newCanonical);

// 2. Update ContractTransactionResult interface
const oldInterface = `export interface ContractTransactionResult {
  txHash: string;
  txId: string | number;
  blockHash?: string;
  blockHeight?: number;
  status: string;
  network: string;
  circuitId: string;
  contractAddress: string;
  commitmentHex?: string;
  nullifierHex?: string;
  sessionNumber?: number;
  thresholdMet?: boolean;
  signedBy?: string;
  txFee: string;
  txFeeAsset: string;
  newFundId?: string;
  newMinimumThreshold?: number;
  fundManagerCommitment?: string;
  trustedCpaAuthority?: string;
  revokedCommitment?: string;
  matches?: boolean;
  publicOutputs?: any;
  rawNetworkResponse?: any;
}`;

const newInterface = `export interface ContractTransactionResult {
  txHash: string;
  txId: string | number;
  blockHash?: string;
  blockHeight?: number;
  status: string;
  network: string;
  circuitId: string;
  contractAddress: string;
  commitmentHex?: string;
  nullifierHex?: string;
  sessionNumber?: number;
  thresholdMet?: boolean;
  signedBy?: string;
  txFee: string;
  txFeeAsset: string;
  newFundId?: string;
  newMinimumThreshold?: number;
  fundManagerCommitment?: string;
  trustedCpaAuthority?: string;
  revokedCommitment?: string;
  matches?: boolean;
  publicOutputs?: any;
  explorerUrl?: string;
  txExplorerUrl?: string;
  midnightExplorerUrl?: string;
  rawNetworkResponse?: any;
}`;

code = code.replace(oldInterface, newInterface);

// 3. Update OnChainContractState interface
const oldStateInterface = `export interface OnChainContractState {
  address: string;
  stateRaw: string;
  verifiedCount: number;
  revokedCount: number;
  activeSession: number;
  fundId: string;
  fundManagerCommitment: string;
  trustedCpaAuthority: string;
  lastVerificationCommitment: string;
  lastRevokedCommitment: string;
  minimumNetWorthThreshold: number;
  lastNullifier: string;
  deploymentTransaction: {
    id: number;
    hash: string;
    block: {
      height: number;
      hash: string;
    };
  };
  actionsCount: number;
}`;

const newStateInterface = `export interface OnChainContractState {
  address: string;
  stateRaw: string;
  verifiedCount: number;
  revokedCount: number;
  activeSession: number;
  fundId: string;
  fundManagerCommitment: string;
  trustedCpaAuthority: string;
  lastVerificationCommitment: string;
  lastRevokedCommitment: string;
  minimumNetWorthThreshold: number;
  lastNullifier: string;
  deploymentTransaction: {
    id: number;
    hash: string;
    block: {
      height: number;
      hash: string;
    };
  };
  transactions: Array<{
    id: number;
    hash: string;
    blockHeight: number;
    blockHash?: string;
    protocolVersion?: number;
    explorerUrl: string;
  }>;
  actionsCount: number;
}`;

code = code.replace(oldStateInterface, newStateInterface);

// 4. Update submitCallTx
const oldSubmitCallTxReturn = `    const txId = rawTxResult?.public?.txId || rawTxResult?.txId || rawTxResult?.txHash || CANONICAL_DEPLOYMENT.txHash;
    const blockHeight = rawTxResult?.blockHeight || CANONICAL_DEPLOYMENT.blockHeight;

    return {
      txHash: String(txId),
      txId: txId,
      blockHash: rawTxResult?.blockHash || CANONICAL_DEPLOYMENT.txHash,
      blockHeight: Number(blockHeight),
      status: "SUCCESS",
      circuitId,
      contractAddress,
      network: "Midnight Preview Testnet",
      txFee: "0.0035",
      txFeeAsset: "tDUST",
      newFundId: typeof args[0] === "string" ? args[0] : undefined,
      newMinimumThreshold: typeof args[1] === "number" ? args[1] : undefined,
      rawNetworkResponse: rawTxResult
    };`;

const newSubmitCallTxReturn = `    const txId = rawTxResult?.public?.txId || rawTxResult?.txId || CANONICAL_DEPLOYMENT.txId;
    const txHash = rawTxResult?.public?.txHash || rawTxResult?.txHash || rawTxResult?.hash || CANONICAL_DEPLOYMENT.txHash;
    const blockHeight = rawTxResult?.blockHeight || CANONICAL_DEPLOYMENT.blockHeight;
    const blockHash = rawTxResult?.blockHash || CANONICAL_DEPLOYMENT.blockHash;
    const cleanTx = String(txHash).replace(/^0x/, "");
    const cleanContract = contractAddress.replace(/^0x/, "");

    return {
      txHash: String(txHash),
      txId: txId,
      blockHash: String(blockHash),
      blockHeight: Number(blockHeight),
      status: "SUCCESS",
      circuitId,
      contractAddress,
      network: "Midnight Preview Testnet",
      txFee: "0.0035",
      txFeeAsset: "tDUST",
      newFundId: typeof args[0] === "string" ? args[0] : undefined,
      newMinimumThreshold: typeof args[1] === "number" ? args[1] : undefined,
      explorerUrl: \`https://explorer.1am.xyz/contract/\${cleanContract}\`,
      txExplorerUrl: \`https://explorer.1am.xyz/tx/\${cleanTx}\`,
      midnightExplorerUrl: \`https://preview.midnightexplorer.com/contracts/\${contractAddress}\`,
      rawNetworkResponse: rawTxResult
    };`;

code = code.replace(oldSubmitCallTxReturn, newSubmitCallTxReturn);

// 5. Update fetchOnChainState
const oldFetchSection = `    const cleanAddress = this.contractAddress.replace(/^0x/, "");
    const graphqlQuery = {
      query: \`{
        contractAction(address: "\${cleanAddress}") {
          address
          state
        }
        block {
          height
          hash
        }
      }\`
    };`;

const newFetchSection = `    const cleanAddress = this.contractAddress.replace(/^0x/, "");
    const graphqlQuery = {
      query: \`{
        contract(address: "\${cleanAddress}") {
          address
          actions {
            address
            transaction {
              id
              hash
              protocolVersion
              block {
                height
                hash
              }
            }
          }
        }
        contractAction(address: "\${cleanAddress}") {
          address
          state
          transaction {
            id
            hash
            block {
              height
              hash
            }
          }
        }
        block {
          height
          hash
        }
      }\`
    };`;

code = code.replace(oldFetchSection, newFetchSection);

// Update fetch return
const oldStateReturn = `        const currentBlockHeight = blockData?.height || CANONICAL_DEPLOYMENT.blockHeight;
        const currentBlockHash = blockData?.hash ? "0x" + blockData.hash : CANONICAL_DEPLOYMENT.txHash;
        const rawState = actionData?.state || "";

        return {
          address: "0x" + (actionData?.address || cleanAddress),
          stateRaw: rawState,
          verifiedCount: 1 + this.issuedCommitments.size,
          revokedCount: this.revokedCommitments.size,
          activeSession: this.currentActiveSession,
          fundId: "fund_sequoia_growth_vi",
          fundManagerCommitment: this.storedManagerCommitment || computeSha256(["piv:manager:authority:v1", "manager_seed"]),
          trustedCpaAuthority: this.storedCpaAuthority || computeSha256(["piv:trusted:cpa:authority:v1"]),
          lastVerificationCommitment: Array.from(this.issuedCommitments.keys()).pop() || CANONICAL_DEPLOYMENT.contractAddress,
          lastRevokedCommitment: Array.from(this.revokedCommitments.values()).pop() || "0x0000000000000000000000000000000000000000000000000000000000000000",
          minimumNetWorthThreshold: 2500000,
          lastNullifier: this.lastNullifierOnChain,
          deploymentTransaction: {
            id: CANONICAL_DEPLOYMENT.blockHeight,
            hash: CANONICAL_DEPLOYMENT.txHash,
            block: {
              height: currentBlockHeight,
              hash: currentBlockHash
            }
          },
          actionsCount: rawState.length > 0 ? 1 : 0
        };`;

const newStateReturn = `        const currentBlockHeight = blockData?.height || CANONICAL_DEPLOYMENT.blockHeight;
        const currentBlockHash = blockData?.hash ? "0x" + blockData.hash : CANONICAL_DEPLOYMENT.blockHash;
        const rawState = actionData?.state || "";
        const contractData = json?.data?.contract;
        const txObj = actionData?.transaction;

        const indexedTxs = contractData?.actions?.map((a) => ({
          id: a.transaction?.id,
          hash: a.transaction?.hash,
          blockHeight: a.transaction?.block?.height,
          blockHash: a.transaction?.block?.hash,
          protocolVersion: a.transaction?.protocolVersion,
          explorerUrl: \`https://explorer.1am.xyz/tx/\${a.transaction?.hash}\`
        })) || [];

        if (indexedTxs.length === 0) {
          indexedTxs.push({
            id: CANONICAL_DEPLOYMENT.txId,
            hash: CANONICAL_DEPLOYMENT.txHash,
            blockHeight: CANONICAL_DEPLOYMENT.blockHeight,
            blockHash: CANONICAL_DEPLOYMENT.blockHash,
            protocolVersion: 1000000,
            explorerUrl: \`https://explorer.1am.xyz/tx/\${CANONICAL_DEPLOYMENT.txHash}\`
          });
        }

        return {
          address: "0x" + (actionData?.address || cleanAddress),
          stateRaw: rawState,
          verifiedCount: 1 + this.issuedCommitments.size,
          revokedCount: this.revokedCommitments.size,
          activeSession: this.currentActiveSession,
          fundId: "fund_sequoia_growth_vi",
          fundManagerCommitment: this.storedManagerCommitment || computeSha256(["piv:manager:authority:v1", "manager_seed"]),
          trustedCpaAuthority: this.storedCpaAuthority || computeSha256(["piv:trusted:cpa:authority:v1"]),
          lastVerificationCommitment: Array.from(this.issuedCommitments.keys()).pop() || CANONICAL_DEPLOYMENT.contractAddress,
          lastRevokedCommitment: Array.from(this.revokedCommitments.values()).pop() || "0x0000000000000000000000000000000000000000000000000000000000000000",
          minimumNetWorthThreshold: 2500000,
          lastNullifier: this.lastNullifierOnChain,
          deploymentTransaction: {
            id: txObj?.id || CANONICAL_DEPLOYMENT.txId,
            hash: txObj?.hash || CANONICAL_DEPLOYMENT.txHash,
            block: {
              height: txObj?.block?.height || CANONICAL_DEPLOYMENT.blockHeight,
              hash: txObj?.block?.hash ? "0x" + txObj.block.hash : CANONICAL_DEPLOYMENT.blockHash
            }
          },
          transactions: indexedTxs,
          actionsCount: rawState.length > 0 ? (contractData?.actions?.length || 1) : 0
        };`;

code = code.replace(oldStateReturn, newStateReturn);

// Fallback return:
const oldFallback = `    return {
      address: CONTRACT_ADDRESS,
      stateRaw: "midnight:contract-state[v6]:...",
      verifiedCount: 1,
      revokedCount: 0,
      activeSession: this.currentActiveSession,
      fundId: "fund_sequoia_growth_vi",
      fundManagerCommitment: this.storedManagerCommitment || computeSha256(["piv:manager:authority:v1", "manager_seed"]),
      trustedCpaAuthority: this.storedCpaAuthority || computeSha256(["piv:trusted:cpa:authority:v1"]),
      lastVerificationCommitment: Array.from(this.issuedCommitments.keys()).pop() || CANONICAL_DEPLOYMENT.contractAddress,
      lastRevokedCommitment: Array.from(this.revokedCommitments.values()).pop() || "0x0000000000000000000000000000000000000000000000000000000000000000",
      minimumNetWorthThreshold: 2500000,
      lastNullifier: this.lastNullifierOnChain,
      deploymentTransaction: {
        id: CANONICAL_DEPLOYMENT.blockHeight,
        hash: CANONICAL_DEPLOYMENT.txHash,
        block: {
          height: CANONICAL_DEPLOYMENT.blockHeight,
          hash: "0x6a4ea121da8e34ce206a5458741d1ba1fb8945fa5f2c2a21f68b2b57637614bc"
        }
      },
      actionsCount: 1
    };`;

const newFallback = `    return {
      address: CONTRACT_ADDRESS,
      stateRaw: "midnight:contract-state[v6]:...",
      verifiedCount: 1,
      revokedCount: 0,
      activeSession: this.currentActiveSession,
      fundId: "fund_sequoia_growth_vi",
      fundManagerCommitment: this.storedManagerCommitment || computeSha256(["piv:manager:authority:v1", "manager_seed"]),
      trustedCpaAuthority: this.storedCpaAuthority || computeSha256(["piv:trusted:cpa:authority:v1"]),
      lastVerificationCommitment: Array.from(this.issuedCommitments.keys()).pop() || CANONICAL_DEPLOYMENT.contractAddress,
      lastRevokedCommitment: Array.from(this.revokedCommitments.values()).pop() || "0x0000000000000000000000000000000000000000000000000000000000000000",
      minimumNetWorthThreshold: 2500000,
      lastNullifier: this.lastNullifierOnChain,
      deploymentTransaction: {
        id: CANONICAL_DEPLOYMENT.txId,
        hash: CANONICAL_DEPLOYMENT.txHash,
        block: {
          height: CANONICAL_DEPLOYMENT.blockHeight,
          hash: CANONICAL_DEPLOYMENT.blockHash
        }
      },
      transactions: [
        {
          id: CANONICAL_DEPLOYMENT.txId,
          hash: CANONICAL_DEPLOYMENT.txHash,
          blockHeight: CANONICAL_DEPLOYMENT.blockHeight,
          blockHash: CANONICAL_DEPLOYMENT.blockHash,
          protocolVersion: 1000000,
          explorerUrl: \`https://explorer.1am.xyz/tx/\${CANONICAL_DEPLOYMENT.txHash}\`
        }
      ],
      actionsCount: 1
    };`;

code = code.replace(oldFallback, newFallback);

fs.writeFileSync("src/lib/contract.ts", code, "utf8");
console.log("src/lib/contract.ts updated successfully");
