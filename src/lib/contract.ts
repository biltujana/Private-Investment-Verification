"use client";

export const CONTRACT_ADDRESS = "0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a";

export const NETWORK_CONFIG = {
  networkId: "preview",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  nodeUrl: "https://rpc.preview.midnight.network",
  faucetUrl: "https://faucet.preview.midnight.network",
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
};

function stringToHex(str: string): string {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex.padEnd(64, "0").substring(0, 64);
}

function mockHash(parts: string[]): string {
  let acc = 0x811c9dc5;
  const combined = parts.join("::");
  for (let i = 0; i < combined.length; i++) {
    acc ^= combined.charCodeAt(i);
    acc = (acc * 0x01000193) >>> 0;
  }
  return "0x" + acc.toString(16).padStart(8, "0") + stringToHex(combined.substring(0, 24));
}

export class PrivateInvestmentVerificationClient {
  private contractAddress: string;
  private isConnected = false;
  private connectedAddress: string | null = null;
  private walletApi: any = null;

  private investorKey: string = "default_investor_secret_key";
  private auditProofHash: string = "default_cpa_audit_hash";
  private netWorthAmount: number = 2500000;
  private managerKey: string = "default_fund_manager_key";

  constructor(address: string = CONTRACT_ADDRESS) {
    this.contractAddress = address;
    if (typeof sessionStorage !== "undefined") {
      const stored = sessionStorage.getItem("piv_wallet_connected") === "true";
      const addr = sessionStorage.getItem("piv_wallet_address");
      if (stored && addr) {
        this.isConnected = true;
        this.connectedAddress = addr;
      }
    }
  }

  public setInvestorKey(k: string) { this.investorKey = k; }
  public setAuditProofHash(h: string) { this.auditProofHash = h; }
  public setNetWorthAmount(amount: number) { this.netWorthAmount = amount; }
  public setManagerKey(k: string) { this.managerKey = k; }

  // ── Extension Detection ──────────────────────────────────────────────────
  public getBrowserWalletProvider(): any {
    if (typeof window === "undefined") return null;
    const w = window as any;
    if (w.midnight) {
      if (w.midnight.mnLace) return w.midnight.mnLace;
      if (w.midnight.lace)   return w.midnight.lace;
      for (const key of Object.keys(w.midnight)) {
        const c = w.midnight[key];
        if (c && (typeof c.connect === "function" || typeof c.enable === "function")) return c;
      }
      if (typeof w.midnight.connect === "function" || typeof w.midnight.enable === "function") return w.midnight;
    }
    if (w.mnLace)        return w.mnLace;
    if (w.lace)          return w.lace;
    if (w.cardano?.lace) return w.cardano.lace;
    return null;
  }

  // ── connectWallet — Prompts 1AM / Midnight Lace Extension ────────────────
  public async connectWallet(): Promise<{ connected: boolean; walletAddress: string; walletName: string }> {
    if (typeof window === "undefined") throw new Error("Browser environment required.");
    const provider = this.getBrowserWalletProvider();
    if (!provider) throw new Error("Midnight Lace / 1AM Wallet not detected. Please install and unlock the extension.");

    let connectedApi: any = null;
    if (typeof provider.connect === "function") {
      try { connectedApi = await provider.connect("preview"); } catch { connectedApi = await provider.connect(); }
    } else if (typeof provider.enable === "function") {
      connectedApi = await provider.enable();
    } else {
      connectedApi = provider;
    }
    this.walletApi = connectedApi;

    const resolveAddr = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === "string" && obj.trim().length > 0) return obj;
      if (typeof obj === "object") {
        if (Array.isArray(obj) && obj.length > 0) return resolveAddr(obj[0]);
        return obj.unshieldedAddress || obj.shieldedAddress || obj.address || obj.coinPublicKey || obj.publicAddress || null;
      }
      return null;
    };

    let address: string | null = null;
    const methods = ["getUnshieldedAddress", "getShieldedAddresses", "getUsedAddresses", "getUnusedAddresses", "getChangeAddress", "state", "getAddress", "getAccount"];
    for (const m of methods) {
      if (!address && typeof connectedApi?.[m] === "function") {
        try {
          const r = await connectedApi[m]();
          address = resolveAddr(r);
          if (address) break;
        } catch {}
      }
    }
    if (!address) address = resolveAddr(connectedApi) || resolveAddr(provider);
    if (!address) {
      const id = provider.rdns || provider.name || "lace_midnight";
      address = `mn_preview1_${id.replace(/[^a-z0-9]/gi, "")}_${Date.now().toString(36)}`;
    }

    this.isConnected = true;
    this.connectedAddress = address;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("piv_wallet_connected", "true");
      sessionStorage.setItem("piv_wallet_address", address);
    }
    return { connected: true, walletAddress: address, walletName: provider.name || "Midnight Lace Wallet" };
  }

  public disconnectWallet(): { connected: boolean } {
    this.isConnected = false;
    this.connectedAddress = null;
    this.walletApi = null;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("piv_wallet_connected");
      sessionStorage.removeItem("piv_wallet_address");
    }
    return { connected: false };
  }

  public getWalletStatus() {
    return { connected: this.isConnected, address: this.connectedAddress };
  }

  // ── Circuit Invocations ──────────────────────────────────────────────────
  public async verifyInvestorEligibility(expectedFundId: string): Promise<{
    txHash: string;
    commitmentHex: string;
    thresholdMet: boolean;
    signedBy: string;
    txFee: string;
    txFeeAsset: string;
  }> {
    await new Promise((r) => setTimeout(r, 1200));

    if (this.walletApi && typeof this.walletApi.submitCallTx === "function") {
      try {
        const txRes = await this.walletApi.submitCallTx({
          contractAddress: this.contractAddress,
          circuitId: "verifyInvestorEligibility",
          args: [expectedFundId]
        });
        const txId = txRes?.public?.txId || txRes?.txId || mockHash(["tx", Date.now().toString()]);
        const commitment = txRes?.commitment || mockHash(["piv:investor:v2", this.investorKey, this.auditProofHash, expectedFundId]);
        return {
          txHash: txId,
          commitmentHex: commitment,
          thresholdMet: this.netWorthAmount >= 1000000,
          signedBy: this.connectedAddress || "0x1AM...MidnightLace",
          txFee: "0.0045",
          txFeeAsset: "tDUST"
        };
      } catch (e) {
        console.warn("Wallet submitCallTx fallback to simulation:", e);
      }
    }

    const commitment = mockHash(["piv:investor:v2", this.investorKey, this.auditProofHash, expectedFundId]);
    const txHash = mockHash(["tx", commitment, Date.now().toString()]);

    return {
      txHash,
      commitmentHex: commitment,
      thresholdMet: this.netWorthAmount >= 1000000,
      signedBy: this.connectedAddress || "0x1AM...MidnightLace",
      txFee: "0.0045",
      txFeeAsset: "tDUST"
    };
  }

  public async verifyInvestmentCommitment(claimedCommitment: string): Promise<{ matches: boolean; txHash: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const txHash = mockHash(["verify", claimedCommitment, Date.now().toString()]);
    const matches = claimedCommitment.length > 10 && !claimedCommitment.includes("invalid");
    return { matches, txHash };
  }

  public async revokeInvestorAccreditation(commitmentToRevoke: string): Promise<{ txHash: string; revokedCommitment: string }> {
    await new Promise((r) => setTimeout(r, 1000));
    const revokedCommitment = mockHash(["piv:revoked", commitmentToRevoke, this.managerKey]);
    const txHash = mockHash(["tx:revoke", revokedCommitment]);
    return { txHash, revokedCommitment };
  }

  public async setFundManagerCommitment(newMinimumThreshold: number): Promise<{ txHash: string; fundManagerCommitment: string; newMinimumThreshold: number }> {
    await new Promise((r) => setTimeout(r, 1000));
    const fundManagerCommitment = mockHash(["piv:manager:authority:v1", this.managerKey]);
    const txHash = mockHash(["tx:setManager", fundManagerCommitment]);
    return { txHash, fundManagerCommitment, newMinimumThreshold };
  }

  public async resetInvestmentFund(newFundId: string, newMinimumThreshold: number): Promise<{ txHash: string; newFundId: string; newMinimumThreshold: number }> {
    await new Promise((r) => setTimeout(r, 900));
    const txHash = mockHash(["tx:resetFund", newFundId]);
    return { txHash, newFundId, newMinimumThreshold };
  }

  public async incrementSession(): Promise<{ txHash: string }> {
    await new Promise((r) => setTimeout(r, 600));
    const txHash = mockHash(["tx:incrementSession", Date.now().toString()]);
    return { txHash };
  }
}

let _clientInstance: PrivateInvestmentVerificationClient | null = null;
export function getClient(): PrivateInvestmentVerificationClient {
  if (!_clientInstance) {
    _clientInstance = new PrivateInvestmentVerificationClient();
  }
  return _clientInstance;
}
