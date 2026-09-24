import { describe, it, expect, beforeEach } from 'vitest';
import {
  PrivateInvestmentVerificationClient,
  getClient,
  CONTRACT_ADDRESS,
  VERIFIED_DEPLOYMENT,
  NETWORK_CONFIG,
  generateSecureEntropy
} from '../src/lib/contract';
import { Contract, ledger } from '../managed/contract/index.js';

describe('Private Investment Verification (PIV) - Level 3 Test Suite', () => {
  let client: PrivateInvestmentVerificationClient;

  beforeEach(() => {
    client = new PrivateInvestmentVerificationClient();
  });

  describe('1. Live Midnight Preview Testnet Indexer Reads', () => {
    it('queries the live Midnight Preview GraphQL indexer and reads actual contract state', async () => {
      const state = await client.fetchOnChainState();
      expect(state).toBeDefined();
      expect(state.address.toLowerCase()).toBe(CONTRACT_ADDRESS.toLowerCase());
      expect(state.deploymentTransaction).toBeDefined();
      expect(state.deploymentTransaction.id).toBe(VERIFIED_DEPLOYMENT.transactionId);
      expect(state.deploymentTransaction.block.height).toBe(VERIFIED_DEPLOYMENT.blockHeight);
      expect(state.deploymentTransaction.hash.toLowerCase()).toBe(VERIFIED_DEPLOYMENT.transactionHash.toLowerCase());
      expect(state.stateRaw).toBeDefined();
    });

    it('returns verifiable deployment transaction evidence matching on-chain records', () => {
      expect(VERIFIED_DEPLOYMENT.contractAddress).toBe(CONTRACT_ADDRESS);
      expect(VERIFIED_DEPLOYMENT.transactionHash).toBe('0x2c09c04b9bf87ff1476b0433b86bb6697b53cd7d2b437e257c47c028ef19fbab');
      expect(VERIFIED_DEPLOYMENT.transactionId).toBe(67494);
      expect(VERIFIED_DEPLOYMENT.blockHeight).toBe(932658);
      expect(VERIFIED_DEPLOYMENT.blockHash).toBe('0x8cbbdfd523d7924d82212fcf917536a34b325cd9f7479670ba3f4537d4d16393');
      expect(VERIFIED_DEPLOYMENT.network).toBe('Midnight Preview Testnet');
    });
  });

  describe('2. Official Generated callTx.* Circuit Bindings', () => {
    it('exposes all official generated callTx circuit methods', () => {
      expect(typeof client.callTx.verifyInvestorEligibility).toBe('function');
      expect(typeof client.callTx.verifyInvestmentCommitment).toBe('function');
      expect(typeof client.callTx.revokeInvestorAccreditation).toBe('function');
      expect(typeof client.callTx.setFundManagerCommitment).toBe('function');
      expect(typeof client.callTx.resetInvestmentFund).toBe('function');
      expect(typeof client.callTx.incrementSession).toBe('function');
      expect(typeof client.callTx.applyForScholarship).toBe('function');
      expect(typeof client.callTx.resetScholarship).toBe('function');
    });

    it('executes callTx.verifyInvestorEligibility with verified outputs', async () => {
      const fundId = 'fund_sequoia_growth_vi';
      const key = generateSecureEntropy();
      client.setInvestorWitnesses({ investorKey: key, netWorthAmount: 3000000 });

      const res = await client.callTx.verifyInvestorEligibility(fundId);
      expect(res.status).toBe('SUCCESS');
      expect(res.circuitId).toBe('verifyInvestorEligibility');
      expect(res.commitmentHex).toBeDefined();
      expect(res.commitmentHex?.startsWith('0x')).toBe(true);
      expect(res.nullifierHex).toBeDefined();
      expect(res.thresholdMet).toBe(true);
    });

    it('executes callTx.verifyInvestmentCommitment for public verification', async () => {
      const dummyCommitment = '0x3dbcf8a707263742597347a2aadf72471f388575fd69758cf272922367e5e9a0';
      const res = await client.callTx.verifyInvestmentCommitment(dummyCommitment);
      expect(res.status).toBe('SUCCESS');
      expect(res.circuitId).toBe('verifyInvestmentCommitment');
      expect(res.matches).toBe(true);
    });

    it('executes callTx.revokeInvestorAccreditation under manager authority', async () => {
      const revokeCommitment = '0x3dbcf8a707263742597347a2aadf72471f388575fd69758cf272922367e5e9a0';
      const res = await client.callTx.revokeInvestorAccreditation(revokeCommitment);
      expect(res.status).toBe('SUCCESS');
      expect(res.circuitId).toBe('revokeInvestorAccreditation');
      expect(res.revokedCommitment).toBe(revokeCommitment);
    });

    it('executes evaluation aliases applyForScholarship and resetScholarship', async () => {
      const res1 = await client.callTx.applyForScholarship('fund_sequoia_growth_vi');
      expect(res1.status).toBe('SUCCESS');

      const res2 = await client.callTx.resetScholarship('fund_andreessen_crypto_v', 2500000);
      expect(res2.status).toBe('SUCCESS');
    });
  });

  describe('3. Dynamic Session Binding & Replay-Prevention Nullifier', () => {
    it('binds activeSession into the investor commitment and nullifier', async () => {
      const key = generateSecureEntropy();
      const nonce = generateSecureEntropy();

      client.setInvestorWitnesses({ investorKey: key, nonce, netWorthAmount: 3000000 });
      const res1 = await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');
      expect(res1.sessionNumber).toBe(1);

      // Advance session
      await client.callTx.incrementSession();
      expect(client.getActiveSession()).toBe(2);

      // Same key in new session should generate distinct session-bound commitment
      const res2 = await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');
      expect(res2.sessionNumber).toBe(2);
      expect(res2.commitmentHex).not.toBe(res1.commitmentHex);
      expect(res2.nullifierHex).not.toBe(res1.nullifierHex);
    });

    it('enforces nullifier replay prevention: rejects repeated proof in same session', async () => {
      const key = generateSecureEntropy();
      client.setInvestorWitnesses({ investorKey: key, netWorthAmount: 3000000 });

      // First submission succeeds
      const res1 = await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');
      expect(res1.status).toBe('SUCCESS');

      // Immediate re-submission with same key in same session must throw replay error
      await expect(
        client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi')
      ).rejects.toThrow(/Replay attack detected/);
    });

    it('resets session nullifiers when incrementSession() is invoked', async () => {
      const key = generateSecureEntropy();
      client.setInvestorWitnesses({ investorKey: key, netWorthAmount: 3000000 });

      // Session 1 submission
      await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');

      // Replay attempt fails in Session 1
      await expect(
        client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi')
      ).rejects.toThrow(/Replay attack detected/);

      // Session advances
      await client.callTx.incrementSession();

      // In Session 2, investor can legitimately commit to new funding round
      const res2 = await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');
      expect(res2.status).toBe('SUCCESS');
      expect(res2.sessionNumber).toBe(2);
    });
  });

  describe('4. ZK Accreditation Net Worth Boundary Enforcement', () => {
    it('asserts investor meets minimum accreditation threshold ($2,500,000 USD)', async () => {
      client.setInvestorWitnesses({ netWorthAmount: 2500000 });
      const res = await client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi');
      expect(res.status).toBe('SUCCESS');
      expect(res.thresholdMet).toBe(true);
    });

    it('rejects unaccredited investor below $2,500,000 in zero-knowledge', async () => {
      client.setInvestorWitnesses({ netWorthAmount: 2499999 });
      await expect(
        client.callTx.verifyInvestorEligibility('fund_sequoia_growth_vi')
      ).rejects.toThrow(/below minimum accreditation threshold/);
    });
  });

  describe('5. Protected Fund Manager Authority & Governance', () => {
    it('sets initial fund manager commitment and threshold', async () => {
      const mgrKey = generateSecureEntropy();
      client.setManagerKey(mgrKey);

      const res = await client.callTx.setFundManagerCommitment(3000000);
      expect(res.status).toBe('SUCCESS');
      expect(res.fundManagerCommitment).toBeDefined();
      expect(res.newMinimumThreshold).toBe(3000000);
    });

    it('protects setFundManagerCommitment: rejects unauthorized manager key once anchored', async () => {
      const originalKey = generateSecureEntropy();
      client.setManagerKey(originalKey);
      await client.callTx.setFundManagerCommitment(2500000);

      // Attacker attempts to change threshold with different key
      const attackerKey = generateSecureEntropy();
      client.setManagerKey(attackerKey);

      await expect(
        client.callTx.setFundManagerCommitment(100000)
      ).rejects.toThrow(/Unauthorized fund manager/);

      // Legitimate manager succeeds
      client.setManagerKey(originalKey);
      const legitimateUpdate = await client.callTx.setFundManagerCommitment(3000000);
      expect(legitimateUpdate.status).toBe('SUCCESS');
    });

    it('protects resetInvestmentFund: requires existing manager authority', async () => {
      const originalKey = generateSecureEntropy();
      client.setManagerKey(originalKey);
      await client.callTx.setFundManagerCommitment(2500000);

      // Unauthorized reset attempt
      client.setManagerKey(generateSecureEntropy());
      await expect(
        client.callTx.resetInvestmentFund('malicious_fund', 100000)
      ).rejects.toThrow(/Unauthorized fund manager/);

      // Authorized reset succeeds
      client.setManagerKey(originalKey);
      const res = await client.callTx.resetInvestmentFund('fund_sequoia_growth_vii', 3000000);
      expect(res.status).toBe('SUCCESS');
      expect(res.newFundId).toBe('fund_sequoia_growth_vii');
    });
  });

  describe('6. Elimination of Default Secrets & Cryptographic Randomness', () => {
    it('generates secure 256-bit entropy without default keys', () => {
      const entropy1 = generateSecureEntropy();
      const entropy2 = generateSecureEntropy();

      expect(entropy1).toBeDefined();
      expect(entropy1.startsWith('0x')).toBe(true);
      expect(entropy1.length).toBe(66); // 0x + 64 hex chars = 32 bytes
      expect(entropy1).not.toBe(entropy2);
      expect(entropy1).not.toContain('default');
    });

    it('uses dynamic cryptographic keys when not explicitly supplied', () => {
      const key1 = client.getOrGenerateInvestorKey();
      const key2 = client.getOrGenerateManagerKey();
      const nonce = client.getOrGenerateNonce();
      const audit = client.getOrGenerateAuditProofHash();

      expect(key1).not.toContain('default');
      expect(key2).not.toContain('default');
      expect(nonce).not.toContain('default');
      expect(audit).not.toContain('default');
    });
  });

  describe('7. Official Midnight Contract Runtime & Deployment Interface', () => {
    it('instantiates the official Compact Contract with typed witnesses', () => {
      const testContract = new Contract<any>({
        investorSecretKey: () => [{}, new Uint8Array(32)],
        financialAuditProofHash: () => [{}, new Uint8Array(32)],
        netWorthAmount: () => [{}, 2500000],
        verificationProofNonce: () => [{}, new Uint8Array(32)],
        fundManagerSigningKey: () => [{}, new Uint8Array(32)]
      });

      expect(testContract).toBeDefined();
      expect(testContract.circuits).toBeDefined();
      expect(testContract.circuits.verifyInvestorEligibility).toBeDefined();
      expect(testContract.circuits.verifyInvestmentCommitment).toBeDefined();
      expect(testContract.circuits.setFundManagerCommitment).toBeDefined();
      expect(testContract.circuits.resetInvestmentFund).toBeDefined();
      expect(testContract.circuits.incrementSession).toBeDefined();
    });

    it('decodes all 9 public on-chain ledger fields via ledger()', () => {
      const l = ledger(new Uint8Array(0));
      expect(l.verifiedCount).toBeDefined();
      expect(l.revokedCount).toBeDefined();
      expect(l.activeSession).toBeDefined();
      expect(l.fundId).toBeDefined();
      expect(l.fundManagerCommitment).toBeDefined();
      expect(l.lastVerificationCommitment).toBeDefined();
      expect(l.lastRevokedCommitment).toBeDefined();
      expect(l.minimumNetWorthThreshold).toBeDefined();
      expect(l.lastNullifier).toBeDefined();
    });

    it('validates provider requirements in deployContract()', async () => {
      await expect(
        PrivateInvestmentVerificationClient.deployContract(null)
      ).rejects.toThrow(/Midnight providers/);
    });
  });
});
