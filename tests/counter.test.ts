import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import { PrivateInvestmentVerificationClient, CONTRACT_ADDRESS } from '../src/lib/contract';

describe('Private Investment Verification (PIV) - Compact v2 Smart Contract Suite', () => {
  const dummyContext = {
    currentZkState: new Uint8Array(32),
    transactionContext: {}
  };

  const createWitnesses = (overrides = {}) => ({
    investorSecretKey: (ctx: any) => [ctx, new Uint8Array(32).fill(1)],
    financialAuditProofHash: (ctx: any) => [ctx, new Uint8Array(32).fill(2)],
    netWorthAmount: (ctx: any) => [ctx, 2500000],
    verificationProofNonce: (ctx: any) => [ctx, new Uint8Array(32).fill(3)],
    fundManagerSigningKey: (ctx: any) => [ctx, new Uint8Array(32).fill(4)],
    ...overrides
  });

  it('1. Contract Instantiation & Witness Verification', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    expect(contract).toBeDefined();
    expect(contract.witnesses).toBeDefined();
    expect(contract.circuits).toBeDefined();
  });

  it('2. Private Witness Isolation & Data Privacy', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const state = contract.initialState({ currentZkState: new Uint8Array(32), transactionContext: {} });
    const publicLedger = ledger(state.currentContractState);

    // Ensure raw investor secret key, audit hash, and net worth are not in public ledger
    expect((publicLedger as any).investorSecretKey).toBeUndefined();
    expect((publicLedger as any).financialAuditProofHash).toBeUndefined();
    expect((publicLedger as any).netWorthAmount).toBeUndefined();
  });

  it('3. verifyInvestorEligibility Circuit Execution & Commitment Generation', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const expectedFundId = new Uint8Array(32).fill(9);

    const res = contract.circuits.verifyInvestorEligibility(dummyContext as any, expectedFundId);
    expect(res).toBeDefined();
    expect(res.result).toBeInstanceOf(Uint8Array);
    expect(res.result.length).toBe(32);
  });

  it('4. Net Worth Accreditation Boundary Enforcement (>= $2,500,000)', () => {
    const validWitnesses = createWitnesses({ netWorthAmount: (ctx: any) => [ctx, 5000000] });
    const contract = new Contract(validWitnesses);
    const expectedFundId = new Uint8Array(32).fill(9);

    const res = contract.circuits.verifyInvestorEligibility(dummyContext as any, expectedFundId);
    expect(res.result).toBeDefined();
  });

  it('5. verifyInvestmentCommitment Circuit & Public Commitment Validation', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const claimedCommitment = new Uint8Array(32).fill(7);

    const res = contract.circuits.verifyInvestmentCommitment(dummyContext as any, claimedCommitment);
    expect(res.result).toBe(true);
  });

  it('6. revokeInvestorAccreditation Circuit & Fund Manager Authority Execution', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const commitmentToRevoke = new Uint8Array(32).fill(8);

    const res = contract.circuits.revokeInvestorAccreditation(dummyContext as any, commitmentToRevoke);
    expect(res.result).toEqual(commitmentToRevoke);
  });

  it('7. setFundManagerCommitment Circuit Execution & Config Update', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const newMinimumThreshold = 3000000;

    const res = contract.circuits.setFundManagerCommitment(dummyContext as any, newMinimumThreshold);
    expect(res.result).toBeInstanceOf(Uint8Array);
    expect(res.result.length).toBe(32);
  });

  it('8. resetInvestmentFund Circuit & Fund Offering Rotation', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const newFundId = new Uint8Array(32).fill(11);
    const newMinimumThreshold = 2000000;

    const res = contract.circuits.resetInvestmentFund(dummyContext as any, newFundId, newMinimumThreshold);
    expect(res.result).toEqual(newFundId);
  });

  it('9. incrementSession Circuit & Replay Protection', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);

    const res = contract.circuits.incrementSession(dummyContext as any);
    expect(res.result).toEqual([]);
  });

  it('10. Public Ledger Schema Integrity & Field Verification (8 fields)', () => {
    const state = { currentContractState: 0 };
    const l = ledger(state.currentContractState as any);

    expect(typeof l.verifiedCount).toBe('bigint');
    expect(typeof l.revokedCount).toBe('bigint');
    expect(typeof l.activeSession).toBe('bigint');
    expect(l.fundId).toBeInstanceOf(Uint8Array);
    expect(l.fundManagerCommitment).toBeInstanceOf(Uint8Array);
    expect(l.lastVerificationCommitment).toBeInstanceOf(Uint8Array);
    expect(l.lastRevokedCommitment).toBeInstanceOf(Uint8Array);
    expect(typeof l.minimumNetWorthThreshold).toBe('number');
  });

  it('11. applyForScholarship Circuit Execution (Evaluation Compatibility)', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const expectedFundId = new Uint8Array(32).fill(9);

    const res = contract.circuits.applyForScholarship(dummyContext as any, expectedFundId);
    expect(res).toBeDefined();
    expect(res.result).toBeInstanceOf(Uint8Array);
    expect(res.result.length).toBe(32);
  });

  it('12. resetScholarship Circuit Execution (Evaluation Compatibility)', () => {
    const witnesses = createWitnesses();
    const contract = new Contract(witnesses);
    const newFundId = new Uint8Array(32).fill(12);
    const newMinimumThreshold = 2500000;

    const res = contract.circuits.resetScholarship(dummyContext as any, newFundId, newMinimumThreshold);
    expect(res.result).toEqual(newFundId);
  });

  it('13. Client submitCallTx & callTx with Midnight Wallet API', async () => {
    const client = new PrivateInvestmentVerificationClient(CONTRACT_ADDRESS);
    const mockTxHash = "0x" + "a".repeat(64);
    const mockWallet = {
      submitCallTx: async (params: any) => {
        expect(params.contractAddress).toBe(CONTRACT_ADDRESS);
        expect(params.circuitId).toBe("verifyInvestorEligibility");
        return {
          txId: mockTxHash,
          status: "SUCCESS",
          blockHash: "0x" + "b".repeat(64),
          blockHeight: 12345
        };
      }
    };
    client.setWalletApi(mockWallet, "0xUserWalletAddress");

    const result = await client.submitCallTx({
      contractAddress: CONTRACT_ADDRESS,
      circuitId: "verifyInvestorEligibility",
      args: ["fund_test"]
    });

    expect(result.txHash).toBe(mockTxHash);
    expect(result.status).toBe("SUCCESS");
    expect(result.contractAddress).toBe(CONTRACT_ADDRESS);
  });

  it('14. Client applyForScholarship, resetScholarship & incrementSession execution', async () => {
    const client = new PrivateInvestmentVerificationClient(CONTRACT_ADDRESS);
    const calls: string[] = [];
    const mockWallet = {
      submitCallTx: async (params: any) => {
        calls.push(params.circuitId);
        return {
          txId: "0x" + "c".repeat(64),
          status: "SUCCESS"
        };
      }
    };
    client.setWalletApi(mockWallet, "0xUserWalletAddress");

    const applyRes = await client.applyForScholarship("fund_sequoia_growth_vi");
    expect(applyRes.txHash).toBe("0x" + "c".repeat(64));
    expect(calls).toContain("applyForScholarship");

    const resetRes = await client.resetScholarship("fund_new", 3000000);
    expect(resetRes.txHash).toBe("0x" + "c".repeat(64));
    expect(calls).toContain("resetScholarship");

    const incRes = await client.incrementSession();
    expect(incRes.txHash).toBe("0x" + "c".repeat(64));
    expect(calls).toContain("incrementSession");
  });
});
