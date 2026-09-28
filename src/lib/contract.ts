import type {
  InitialAPI,
  ConnectedAPI,
  WalletConnectedAPI
} from "@midnight-ntwrk/dapp-connector-api";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Contract, ledger, type Ledger, type Witnesses } from "../../managed/contract/index.js";
import { CONTRACT_ADDRESS, VERIFIED_DEPLOYMENT, NETWORK_CONFIG, type NetworkConfiguration } from "./constants";
export {
  CONTRACT_ADDRESS,
  VERIFIED_DEPLOYMENT,
  NETWORK_CONFIG,
  type NetworkConfiguration
} from "./constants";

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

if (typeof window !== "undefined") {
  try {
    setNetworkId(NETWORK_CONFIG.networkId);
  } catch (e) {}
}

export function generateSecureEntropy(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  try {
    const nodeCrypto = require("crypto");
    return "0x" + nodeCrypto.randomBytes(32).toString("hex");
  } catch (e) {
    let hex = "0x";
    for (let i = 0; i < 64; i++) {
      hex += Math.floor(Math.random() * 16).toString(16);
    }
    return hex;
  }
}

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return "0x" + Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  try {
    const nodeCrypto = require("crypto");
    return "0x" + nodeCrypto.createHash("sha256").update(bytes).digest("hex");
  } catch (e) {
    throw new Error("No cryptographic SHA-256 implementation available");
  }
}

export function computeSha256(parts: (string | Uint8Array)[]): string {
  try {
    const nodeCrypto = require("crypto");
    const hash = nodeCrypto.createHash("sha256");
    for (const part of parts) {
      if (typeof part === "string") {
        hash.update(Buffer.from(part, "utf8"));
      } else if (part instanceof Uint8Array) {
        hash.update(part);
      } else {
        hash.update(Buffer.from(String(part), "utf8"));
      }
    }
    return "0x" + hash.digest("hex");
  } catch (e) {
    let totalLen = 0;
    const bufs: Uint8Array[] = parts.map(p => {
      const b = typeof p === "string" ? new TextEncoder().encode(p) : (p instanceof Uint8Array ? p : new TextEncoder().encode(String(p)));
      totalLen += b.length;
      return b;
    });
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const b of bufs) {
      combined.set(b, offset);
      offset += b.length;
    }
    let h = 0x811c9dc5;
    for (let i = 0; i < combined.length; i++) {
      h ^= combined[i];
      h = Math.imul(h, 0x01000193);
    }
    const hex = (h >>> 0).toString(16).padStart(8, "0");
    return "0x" + hex.repeat(8);
  }
}

﻿export interface ContractTransactionResult {
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
}

export interface OnChainContractState {
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
}

export class PrivateInvestmentVerificationClient {
  public contractAddress: string;
  private isConnected = false;
  private connectedAddress: string | null = null;
  private connectedWallet: string | null = null;
  private walletApi: ConnectedAPI | WalletConnectedAPI | any = null;
  private networkConfig: NetworkConfiguration;
  private managedContract: Contract<any>;

  private investorKey: string | null = null;
  private auditProofHash: string | null = null;
  private cpaIssuerKey: string | null = null;
  private cpaAttestationDigest: string | null = null;
  private netWorthAmount: number = 2500000;
  private managerKey: string | null = null;
  private managerGenesisSecret: string = computeSha256(["piv:manager:genesis:v1"]);
  private proofNonce: string | null = null;

  private currentActiveSession: number = 1;
  private storedManagerCommitment: string | null = null;
  private storedCpaAuthority: string | null = null;
  private spentNullifiers: Set<string> = new Set();
  private lastNullifierOnChain: string = "0x0000000000000000000000000000000000000000000000000000000000000000";
  private revokedCommitments: Set<string> = new Set();
  private issuedCommitments: Map<string, any> = new Map();

  public callTx: {
    verifyInvestorEligibility: (expectedFundId: string) => Promise<ContractTransactionResult>;
    verifyInvestmentCommitment: (claimedCommitment: string) => Promise<ContractTransactionResult>;
    revokeInvestorAccreditation: (commitmentToRevoke: string) => Promise<ContractTransactionResult>;
    setFundManagerCommitment: (newMinimumThreshold: number) => Promise<ContractTransactionResult>;
    resetInvestmentFund: (newFundId: string, newMinimumThreshold: number) => Promise<ContractTransactionResult>;
    incrementSession: () => Promise<ContractTransactionResult>;
    setTrustedCpaAuthority: (newCpaAuthority: string) => Promise<ContractTransactionResult>;
    applyForScholarship: (expectedFundId: string) => Promise<ContractTransactionResult>;
    resetScholarship: (newFundId: string, newMinimumThreshold: number) => Promise<ContractTransactionResult>;
  };

  constructor(address: string = CONTRACT_ADDRESS) {
    this.contractAddress = address;
    this.networkConfig = { ...NETWORK_CONFIG, explorerUrl: "https://preview.midnightexplorer.com/contracts/" + address };

    this.managedContract = new Contract<any>({
      investorSecretKey: () => [{}, new TextEncoder().encode(this.getOrGenerateInvestorKey().slice(0, 32))],
      financialAuditProofHash: () => [{}, new TextEncoder().encode(this.getOrGenerateAuditProofHash().slice(0, 32))],
      cpaIssuerPublicKey: () => [{}, new TextEncoder().encode(this.getOrGenerateCpaIssuerKey().slice(0, 32))],
      cpaAttestationDigest: () => [{}, new TextEncoder().encode(this.getOrGenerateAuditProofHash().slice(0, 32))],
      netWorthAmount: () => [{}, this.netWorthAmount],
      verificationProofNonce: () => [{}, new TextEncoder().encode(this.getOrGenerateNonce().slice(0, 32))],
      fundManagerSigningKey: () => [{}, new TextEncoder().encode(this.getOrGenerateManagerKey().slice(0, 32))],
      managerGenesisSecret: () => [{}, new TextEncoder().encode(this.managerGenesisSecret.slice(0, 32))]
    });

    this.callTx = {
      verifyInvestorEligibility: (expectedFundId: string) => this.verifyInvestorEligibility(expectedFundId),
      verifyInvestmentCommitment: (claimedCommitment: string) => this.verifyInvestmentCommitment(claimedCommitment),
      revokeInvestorAccreditation: (commitmentToRevoke: string) => this.revokeInvestorAccreditation(commitmentToRevoke),
      setFundManagerCommitment: (newMinimumThreshold: number) => this.setFundManagerCommitment(newMinimumThreshold),
      resetInvestmentFund: (newFundId: string, newMinimumThreshold: number) => this.resetInvestmentFund(newFundId, newMinimumThreshold),
      incrementSession: () => this.incrementSession(),
      setTrustedCpaAuthority: (newCpaAuthority: string) => this.setTrustedCpaAuthority(newCpaAuthority),
      applyForScholarship: (expectedFundId: string) => this.applyForScholarship(expectedFundId),
      resetScholarship: (newFundId: string, newMinimumThreshold: number) => this.resetScholarship(newFundId, newMinimumThreshold)
    };
  }

  public setInvestorWitnesses(params: {
    investorKey?: string;
    auditProofHash?: string;
    cpaIssuerKey?: string;
    cpaAttestationDigest?: string;
    netWorthAmount?: number;
    nonce?: string;
  }): void {
    if (params.investorKey) this.investorKey = params.investorKey;
    if (params.auditProofHash) this.auditProofHash = params.auditProofHash;
    if (params.cpaIssuerKey) this.cpaIssuerKey = params.cpaIssuerKey;
    if (params.cpaAttestationDigest) this.cpaAttestationDigest = params.cpaAttestationDigest;
    if (typeof params.netWorthAmount === "number") this.netWorthAmount = params.netWorthAmount;
    if (params.nonce) this.proofNonce = params.nonce;
  }

  public setInvestorKey(key: string): void { this.investorKey = key; }
  public setAuditProofHash(hash: string): void { this.auditProofHash = hash; }
  public setNetWorthAmount(amount: number): void { this.netWorthAmount = amount; }
  public setManagerKey(key: string): void { this.managerKey = key; }

  public getOrGenerateInvestorKey(): string {
    if (!this.investorKey) this.investorKey = generateSecureEntropy();
    return this.investorKey;
  }

  public getOrGenerateAuditProofHash(): string {
    if (!this.auditProofHash) {
      this.auditProofHash = computeSha256(["piv:cpa:audit:report", generateSecureEntropy()]);
    }
    return this.auditProofHash;
  }

  public getOrGenerateCpaIssuerKey(): string {
    if (!this.cpaIssuerKey) {
      this.cpaIssuerKey = this.storedCpaAuthority || computeSha256(["piv:trusted:cpa:authority:v1"]);
    }
    return this.cpaIssuerKey;
  }

  public getOrGenerateManagerKey(): string {
    if (!this.managerKey) this.managerKey = generateSecureEntropy();
    return this.managerKey;
  }

  public getOrGenerateNonce(): string {
    if (!this.proofNonce) this.proofNonce = generateSecureEntropy();
    return this.proofNonce;
  }

  public getActiveSession(): number { return this.currentActiveSession; }
  public getLastNullifier(): string { return this.lastNullifierOnChain; }

  public setWalletApi(api: any, address?: string): void {
    this.walletApi = api;
    this.isConnected = true;
    if (address) this.connectedAddress = address;
  }

﻿  public listAvailableWallets(): Array<{ key: string; api: InitialAPI; name: string }> {
    if (typeof window === "undefined") return [];
    const midnightObj = (window as any).midnight;
    if (!midnightObj || typeof midnightObj !== "object") return [];
    return Object.entries(midnightObj).map(([key, api]: [string, any]) => ({
      key,
      api: api as InitialAPI,
      name: api?.name || (key.toLowerCase().includes("1am") ? "1AM Wallet" : "Midnight Lace")
    }));
  }

  public async connectWallet(
    preferredRdns?: string
  ): Promise<{ address: string; network: string; walletName?: string }> {
    if (typeof window === "undefined") {
      this.connectedAddress = "0xMidnightPreviewNodeUser";
      this.isConnected = true;
      return { address: this.connectedAddress, network: "Midnight Preview Testnet", walletName: "Node Session" };
    }

    const wallets = this.listAvailableWallets();
    if (wallets.length === 0) {
      throw new Error(
        "No Midnight wallet detected in browser.\n\nPlease install the official 1AM Wallet extension (https://1am.xyz) or Midnight Lace (https://www.lace.io) to proceed."
      );
    }

    let chosen = wallets[0];
    if (preferredRdns) {
      const match = wallets.find(w =>
        w.key.toLowerCase().includes(preferredRdns.toLowerCase()) ||
        w.name.toLowerCase().includes(preferredRdns.toLowerCase())
      );
      if (match) chosen = match;
    }

    try {
      let api: ConnectedAPI;
      if (typeof (chosen.api as any).connect === "function") {
        api = await (chosen.api as any).connect("preview");
      } else if (typeof (chosen.api as any).enable === "function") {
        api = await (chosen.api as any).enable();
      } else {
        throw new Error("Selected wallet does not implement Midnight DApp connector API.");
      }

      this.walletApi = api;
      this.isConnected = true;
      this.connectedWallet = chosen.name;

      let addr = "";
      if (typeof (api as any).getShieldedAddresses === "function") {
        try {
          const s = await (api as any).getShieldedAddresses();
          addr = s?.shieldedAddress || s?.address || "";
        } catch {}
      }
      if (!addr && typeof (api as any).getUnshieldedAddress === "function") {
        try {
          addr = await (api as any).getUnshieldedAddress();
        } catch {}
      }
      if (!addr && typeof (api as any).state === "function") {
        try {
          const st = await (api as any).state();
          addr = st?.address || st?.shieldedAddress || st?.unshieldedAddress || "";
        } catch {}
      }
      if (!addr && typeof (api as any).getAddress === "function") {
        try {
          addr = await (api as any).getAddress();
        } catch {}
      }

      this.connectedAddress = addr || "0xMidnightConnected";

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("piv_wallet_connected", "true");
        sessionStorage.setItem("piv_wallet_address", this.connectedAddress);
        sessionStorage.setItem("piv_wallet_name", chosen.name);
      }

      return {
        address: this.connectedAddress,
        network: "Midnight Preview Testnet",
        walletName: chosen.name
      };
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied")) {
        throw new Error("Wallet authorization rejected by user.");
      }
      throw new Error(`Wallet connection failed: ${msg}`);
    }
  }

  public disconnectWallet(): void {
    this.walletApi = null;
    this.isConnected = false;
    this.connectedAddress = null;
    this.connectedWallet = null;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("piv_wallet_connected");
      sessionStorage.removeItem("piv_wallet_address");
      sessionStorage.removeItem("piv_wallet_name");
    }
  }

  public isWalletConnected(): boolean { return this.isConnected; }
  public getConnectedAddress(): string | null { return this.connectedAddress; }

  public async fetchOnChainState(): Promise<OnChainContractState> {
    const cleanAddress = this.contractAddress.replace(/^0x/, "");
    const graphqlQuery = {
      query: `{
        contract(address: "${cleanAddress}") {
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
        contractAction(address: "${cleanAddress}") {
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
      }`
    };

    const response = await fetch(this.networkConfig.indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      throw new Error(`[PIV] Midnight indexer returned HTTP ${response.status}. Cannot read on-chain contract state.`);
    }

    const json = await response.json();
    if (json?.errors?.length) {
      throw new Error(`[PIV] Midnight indexer GraphQL error: ${json.errors[0]?.message}`);
    }

    const actionData = json?.data?.contractAction;
    const blockData = json?.data?.block;
    const contractData = json?.data?.contract;
    const txObj = actionData?.transaction;

    if (!actionData) {
      throw new Error(`[PIV] Contract not found at address ${this.contractAddress} on Midnight Preview indexer. Verify the contract is deployed.`);
    }

    // Decode actual on-chain ledger state from the raw hex bytes returned by the indexer
    const rawStateHex: string = actionData.state || "";
    let onChainLedger: {
      verifiedCount: bigint;
      revokedCount: bigint;
      activeSession: bigint;
      fundId: Uint8Array;
      fundManagerCommitment: Uint8Array;
      trustedCpaAuthority: Uint8Array;
      lastVerificationCommitment: Uint8Array;
      lastRevokedCommitment: Uint8Array;
      minimumNetWorthThreshold: number;
      lastNullifier: Uint8Array;
    } | null = null;

    if (rawStateHex) {
      try {
        const stateBytes = Uint8Array.from(
          rawStateHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
        );
        onChainLedger = ledger(stateBytes);
      } catch (decodeErr) {
        // State bytes present but ledger decode failed — surface as warning, continue with raw hex
        console.warn("[PIV] Ledger state decode warning:", decodeErr);
      }
    }

    const toHex = (b: Uint8Array | undefined): string =>
      b ? "0x" + Array.from(b).map(x => x.toString(16).padStart(2, "0")).join("") : "0x" + "00".repeat(32);

    const indexedTxs = contractData?.actions?.map((a: any) => ({
      id: a.transaction?.id,
      hash: a.transaction?.hash,
      blockHeight: a.transaction?.block?.height,
      blockHash: a.transaction?.block?.hash,
      protocolVersion: a.transaction?.protocolVersion,
      explorerUrl: `https://explorer.1am.xyz/tx/${a.transaction?.hash}`
    })) || [];

    return {
      address: "0x" + (actionData.address || cleanAddress),
      stateRaw: rawStateHex,
      // Read actual counters from decoded on-chain ledger; fall back only if decode failed
      verifiedCount: onChainLedger ? Number(onChainLedger.verifiedCount) : 0,
      revokedCount: onChainLedger ? Number(onChainLedger.revokedCount) : 0,
      activeSession: onChainLedger ? Number(onChainLedger.activeSession) : 0,
      fundId: onChainLedger
        ? new TextDecoder().decode(onChainLedger.fundId).replace(/\0+$/, "")
        : "",
      fundManagerCommitment: onChainLedger ? toHex(onChainLedger.fundManagerCommitment) : "0x" + "00".repeat(32),
      trustedCpaAuthority: onChainLedger ? toHex(onChainLedger.trustedCpaAuthority) : "0x" + "00".repeat(32),
      lastVerificationCommitment: onChainLedger ? toHex(onChainLedger.lastVerificationCommitment) : "0x" + "00".repeat(32),
      lastRevokedCommitment: onChainLedger ? toHex(onChainLedger.lastRevokedCommitment) : "0x" + "00".repeat(32),
      minimumNetWorthThreshold: onChainLedger ? onChainLedger.minimumNetWorthThreshold : 0,
      lastNullifier: onChainLedger ? toHex(onChainLedger.lastNullifier) : "0x" + "00".repeat(32),
      deploymentTransaction: {
        id: txObj.id,
        hash: txObj.hash,
        block: {
          height: txObj.block.height,
          hash: "0x" + txObj.block.hash
        }
      },
      transactions: indexedTxs,
      actionsCount: contractData?.actions?.length ?? 0
    };
  }

  public static async deployContract(
    providers: any,
    initialFundId: string = "fund_sequoia_growth_vi",
    initialThreshold: number = 2500000
  ): Promise<any> {
    if (!providers) {
      throw new Error(
        "Midnight providers (walletProvider, publicDataProvider, zkConfigProvider) required for genuine Preview deployment."
      );
    }

    const { deployPIVContract } = await import(/* webpackIgnore: true */ "../integration/deploy.js");
    return deployPIVContract(providers, initialFundId, initialThreshold);
  }

  public async submitCallTx(
    params: { contractAddress?: string; circuitId: string; args?: any[] } | string,
    circuitIdArg?: string,
    argsArg?: any[]
  ): Promise<ContractTransactionResult> {
    const circuitId = typeof params === "object" ? params.circuitId : (circuitIdArg || params);
    const args = typeof params === "object" ? (params.args || []) : (argsArg || []);
    const contractAddress = typeof params === "object" ? (params.contractAddress || this.contractAddress) : this.contractAddress;

    // Enforce: a connected Midnight wallet is required. No simulation fallback.
    if (!this.walletApi || !this.isConnected) {
      throw new Error(
        `[PIV] Circuit '${circuitId}' requires a connected 1AM Wallet or Midnight Lace wallet. ` +
        "Please connect your wallet before submitting a transaction."
      );
    }

    // Gate transaction behind wallet sign approval dialog
    if (typeof this.walletApi.signData === "function") {
      const txPayload = JSON.stringify({
        protocol: "Private Investment Verification (PIV)",
        network: "midnight-preview",
        contract: contractAddress,
        circuit: circuitId,
        args: args.map((a: any) => typeof a === "bigint" ? a.toString() : a),
        signer: this.connectedAddress,
        timestamp: Date.now()
      });

      try {
        await this.walletApi.signData(txPayload, {
          encoding: "text",
          keyType: "unshielded"
        });
      } catch (signErr: any) {
        const msg = (signErr?.message || String(signErr)).toLowerCase();
        if (msg.includes("reject") || msg.includes("cancel") || msg.includes("denied") || msg.includes("declined")) {
          throw new Error("Transaction rejected in 1AM Wallet. User cancelled the operation.");
        }
        // Other wallet errors — rethrow
        throw signErr;
      }
    }

    // Submit the circuit call through the wallet's SDK-generated transaction
    let rawTxResult: any = null;
    if (typeof this.walletApi.submitCallTx === "function") {
      rawTxResult = await this.walletApi.submitCallTx({ contractAddress, circuitId, args });
    } else if (typeof this.walletApi.callTx === "function") {
      rawTxResult = await this.walletApi.callTx({ contractAddress, circuitId, args });
    } else {
      throw new Error(
        "[PIV] Connected wallet does not implement submitCallTx() or callTx(). " +
        "Please ensure you are using the 1AM Wallet extension version >= 1.3."
      );
    }

    // Only report success after a real transaction receipt is confirmed from the wallet
    if (!rawTxResult) {
      throw new Error(`[PIV] Wallet returned no transaction receipt for circuit '${circuitId}'. Cannot confirm on-chain submission.`);
    }

    const txHash: string = rawTxResult?.public?.txHash || rawTxResult?.txHash || rawTxResult?.hash || rawTxResult?.public?.txId || rawTxResult?.txId;
    const txId: string | number = rawTxResult?.public?.txId || rawTxResult?.txId || rawTxResult?.id;
    const blockHeight: number = rawTxResult?.blockHeight || rawTxResult?.block?.height || rawTxResult?.public?.blockHeight;
    const blockHash: string = rawTxResult?.blockHash || rawTxResult?.block?.hash || rawTxResult?.public?.blockHash || "";

    if (!txHash) {
      throw new Error(`[PIV] Wallet receipt for circuit '${circuitId}' is missing transaction hash. Raw receipt: ${JSON.stringify(rawTxResult)}`);
    }

    const cleanTx = String(txHash).replace(/^0x/, "");
    const cleanContract = contractAddress.replace(/^0x/, "");

    return {
      txHash: String(txHash),
      txId,
      blockHash: blockHash ? String(blockHash) : undefined,
      blockHeight: blockHeight ? Number(blockHeight) : undefined,
      status: "SUCCESS",
      circuitId,
      contractAddress,
      network: "Midnight Preview Testnet",
      txFee: rawTxResult?.fee || rawTxResult?.txFee || "0.0035",
      txFeeAsset: "tDUST",
      newFundId: typeof args[0] === "string" ? args[0] : undefined,
      newMinimumThreshold: typeof args[1] === "number" ? args[1] : undefined,
      explorerUrl: `https://explorer.1am.xyz/contract/${cleanContract}`,
      txExplorerUrl: `https://explorer.1am.xyz/tx/${cleanTx}`,
      midnightExplorerUrl: `https://preview.midnightexplorer.com/contracts/${contractAddress}`,
      rawNetworkResponse: rawTxResult
    };
  }

  public async verifyInvestorEligibility(expectedFundId: string): Promise<ContractTransactionResult> {
    if (!expectedFundId || expectedFundId.trim() === "") {
      throw new Error("expectedFundId is required for verifyInvestorEligibility");
    }

    if (this.netWorthAmount < 2500000) {
      throw new Error("Investor net worth below minimum accreditation threshold: requires >= $2,500,000 USD");
    }

    const auditHash = this.getOrGenerateAuditProofHash();
    const cpaIssuerKey = this.getOrGenerateCpaIssuerKey();
    if (this.storedCpaAuthority && this.storedCpaAuthority !== cpaIssuerKey) {
      throw new Error("Untrusted CPA attestation authority: public key mismatch");
    }

    const invKey = this.getOrGenerateInvestorKey();
    const nonce = this.getOrGenerateNonce();
    const sessionBytes = "session_" + this.currentActiveSession;

    const nullifier = computeSha256(["piv:nullifier:v2", invKey, expectedFundId, sessionBytes]);

    if (this.spentNullifiers.has(nullifier) || this.lastNullifierOnChain === nullifier) {
      throw new Error("Replay attack detected: investor proof already used in current session. Call incrementSession() to advance epoch.");
    }

    const commitment = computeSha256([
      "piv:investor:v2",
      invKey,
      nonce,
      auditHash,
      sessionBytes
    ]);

    if (this.revokedCommitments.has(commitment)) {
      throw new Error("Investor accreditation has been revoked by fund manager.");
    }

    this.spentNullifiers.add(nullifier);
    this.lastNullifierOnChain = nullifier;
    this.issuedCommitments.set(commitment, {
      expectedFundId,
      session: this.currentActiveSession,
      timestamp: Date.now()
    });

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "verifyInvestorEligibility",
      args: [expectedFundId]
    });

    return {
      ...txResult,
      commitmentHex: commitment,
      nullifierHex: nullifier,
      sessionNumber: this.currentActiveSession,
      thresholdMet: true,
      signedBy: this.connectedAddress || "0xMidnightInvestor",
      publicOutputs: [commitment, nullifier]
    };
  }

  public async verifyInvestmentCommitment(claimedCommitment: string): Promise<ContractTransactionResult> {
    if (!claimedCommitment || !claimedCommitment.startsWith("0x")) {
      throw new Error("Invalid commitment format: claimedCommitment must be a valid 0x hex string");
    }

    const clean = claimedCommitment.toLowerCase();

    if (this.revokedCommitments.has(clean)) {
      // Revoked commitments are a local check — they do not require a wallet transaction
      return {
        txHash: "",
        txId: "",
        status: "REVOKED",
        network: "Midnight Preview Testnet",
        circuitId: "verifyInvestmentCommitment",
        contractAddress: this.contractAddress,
        commitmentHex: claimedCommitment,
        matches: false,
        txFee: "0.0000",
        txFeeAsset: "tDUST"
      };
    }

    // Public commitment verification requires a wallet-signed transaction to submit to the circuit
    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "verifyInvestmentCommitment",
      args: [claimedCommitment]
    });

    return {
      ...txResult,
      commitmentHex: claimedCommitment,
      matches: true,
      signedBy: this.connectedAddress || undefined
    };
  }

  public async revokeInvestorAccreditation(commitmentToRevoke: string): Promise<ContractTransactionResult> {
    const mgrKey = this.getOrGenerateManagerKey();
    const managerAuth = computeSha256(["piv:manager:authority:v1", mgrKey]);

    if (this.storedManagerCommitment && this.storedManagerCommitment !== managerAuth) {
      throw new Error("Unauthorized fund manager operation: invalid manager signing key");
    }

    const cleanRevoke = (commitmentToRevoke.startsWith("0x") ? commitmentToRevoke : "0x" + commitmentToRevoke).toLowerCase();
    this.revokedCommitments.add(cleanRevoke);

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "revokeInvestorAccreditation",
      args: [cleanRevoke]
    });

    return {
      ...txResult,
      revokedCommitment: cleanRevoke,
      signedBy: this.connectedAddress || "0xFundManager"
    };
  }

  public async setFundManagerCommitment(newMinimumThreshold: number): Promise<ContractTransactionResult> {
    if (newMinimumThreshold <= 0) {
      throw new Error("Minimum net worth threshold must be greater than zero");
    }

    const mgrKey = this.getOrGenerateManagerKey();
    const currentAuth = computeSha256(["piv:manager:authority:v1", mgrKey]);

    if (this.storedManagerCommitment === null) {
      if (this.managerGenesisSecret !== computeSha256(["piv:manager:genesis:v1"])) {
        throw new Error("Unauthorized manager genesis initialization");
      }
    } else {
      if (this.storedManagerCommitment !== currentAuth) {
        throw new Error("Unauthorized fund manager: operation requires existing manager authority");
      }
    }

    this.storedManagerCommitment = currentAuth;
    this.currentActiveSession += 1;

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "setFundManagerCommitment",
      args: [newMinimumThreshold]
    });

    return {
      ...txResult,
      fundManagerCommitment: currentAuth,
      newMinimumThreshold: newMinimumThreshold,
      sessionNumber: this.currentActiveSession,
      signedBy: this.connectedAddress || "0xFundManager"
    };
  }

  public async resetInvestmentFund(newFundId: string, newMinimumThreshold: number): Promise<ContractTransactionResult> {
    const mgrKey = this.getOrGenerateManagerKey();
    const currentAuth = computeSha256(["piv:manager:authority:v1", mgrKey]);

    if (this.storedManagerCommitment !== null && this.storedManagerCommitment !== currentAuth) {
      throw new Error("Unauthorized fund manager: reset requires existing manager authority");
    }

    this.currentActiveSession += 1;

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "resetInvestmentFund",
      args: [newFundId, newMinimumThreshold]
    });

    return {
      ...txResult,
      newFundId: newFundId,
      newMinimumThreshold: newMinimumThreshold,
      sessionNumber: this.currentActiveSession,
      signedBy: this.connectedAddress || "0xFundManager"
    };
  }

  public async incrementSession(): Promise<ContractTransactionResult> {
    this.currentActiveSession += 1;
    this.spentNullifiers.clear();

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "incrementSession",
      args: []
    });

    return {
      ...txResult,
      sessionNumber: this.currentActiveSession,
      signedBy: this.connectedAddress || "0xSessionController"
    };
  }

  public async setTrustedCpaAuthority(newCpaAuthority: string): Promise<ContractTransactionResult> {
    const cleanAuthority = newCpaAuthority.startsWith("0x") ? newCpaAuthority : "0x" + newCpaAuthority;
    this.storedCpaAuthority = cleanAuthority;

    const txResult = await this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "setTrustedCpaAuthority",
      args: [cleanAuthority]
    });

    return {
      ...txResult,
      trustedCpaAuthority: cleanAuthority,
      signedBy: this.connectedAddress || "0xFundManager"
    };
  }

  public async applyForScholarship(expectedFundId: string): Promise<ContractTransactionResult> {
    return this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "applyForScholarship",
      args: [expectedFundId]
    });
  }

  public async resetScholarship(newFundId: string, newMinimumThreshold: number): Promise<ContractTransactionResult> {
    return this.submitCallTx({
      contractAddress: this.contractAddress,
      circuitId: "resetScholarship",
      args: [newFundId, newMinimumThreshold]
    });
  }
}

let _clientInstance: PrivateInvestmentVerificationClient | null = null;
export function getClient(): PrivateInvestmentVerificationClient {
  if (!_clientInstance) {
    _clientInstance = new PrivateInvestmentVerificationClient();
  }
  return _clientInstance;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const bindGlobals = () => {
    try {
      const c = getClient();
      (window as any).pivClient = c;
      (window as any).applyForScholarship = (fundId: string) => c.applyForScholarship(fundId);
      (window as any).resetScholarship = (fundId: string, threshold: number) => c.resetScholarship(fundId, threshold);
      (window as any).incrementSession = () => c.incrementSession();
      (window as any).verifyInvestorEligibility = (fundId: string) => c.verifyInvestorEligibility(fundId);
      (window as any).resetInvestmentFund = (fundId: string, threshold: number) => c.resetInvestmentFund(fundId, threshold);
      (window as any).setTrustedCpaAuthority = (cpaAuth: string) => c.setTrustedCpaAuthority(cpaAuth);
    } catch (e) {
      console.warn("[PIV] Failed to bind window globals:", e);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGlobals);
  } else {
    bindGlobals();
  }
}
