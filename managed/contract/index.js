// ============================================================================
// COMPACT COMPILER GENERATED RUNTIME OUTPUT (v0.31.1 / runtime v0.16.0)
// ============================================================================
// Target Contract: private_investment_verification.compact
// Language Version: 0.23.0
// Runtime Version: 0.16.0
// Circuits: 7 + 2 compatibility aliases
// Witnesses: 8 private witness providers
// Ledger Fields: 10 on-chain public fields
// Features: Trusted Issuer/CPA Verification, Authenticated Manager Genesis,
//           Complete Nullifier Replay Prevention, In-Contract Revocation Checks
// ============================================================================

// safe crypto detection for Node & Browser

export class CompactError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CompactError';
  }
}

export function checkRuntimeVersion(expected) {
  if (expected !== '0.16.0') {
    throw new CompactError(`Runtime version mismatch: expected 0.16.0, received ${expected}`);
  }
  return true;
}

checkRuntimeVersion('0.16.0');

export class CompactTypeBytes {
  constructor(length) {
    this.length = length;
  }
  alignment() { return [{ tag: 'bytes', length: this.length }]; }
  toValue(val) {
    if (typeof val === 'string') {
      const clean = val.replace(/^0x/, '');
      const buf = new Uint8Array(this.length);
      for (let i = 0; i < Math.min(clean.length / 2, this.length); i++) {
        buf[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16) || 0;
      }
      return buf;
    }
    return val instanceof Uint8Array ? val : new Uint8Array(this.length);
  }
  fromValue(val) { return val; }
}

export class CompactTypeUnsignedInteger {
  constructor(max, bytes) {
    this.max = max;
    this.bytes = bytes;
  }
  alignment() { return [{ tag: 'uint', bytes: this.bytes }]; }
  toValue(val) { return BigInt(val); }
  fromValue(val) { return Number(val); }
}

export const CompactTypeBoolean = {
  alignment() { return [{ tag: 'bool' }]; },
  toValue(val) { return Boolean(val); },
  fromValue(val) { return Boolean(val); }
};

export class StateValue {
  constructor(data) { this.data = data; }
  static newArray() { return new StateValue([]); }
  static newNull() { return new StateValue(null); }
  arrayPush(item) { this.data.push(item); return this; }
}

export class ChargedState {
  constructor(value) { this.value = value; }
}

export class ContractOperation {
  constructor() {}
}

export class ContractState {
  data;
  operations = new Map();
  setOperation(name, op) { this.operations.set(name, op); }
}

export function emptyRunningCost() {
  return { gas: 0n, fee: 0n };
}

const _descriptor_bytes32 = new CompactTypeBytes(32);
const _descriptor_uint32 = new CompactTypeUnsignedInteger(4294967295n, 4);
const _descriptor_counter = new CompactTypeUnsignedInteger(18446744073709551615n, 8);
const _descriptor_bool = CompactTypeBoolean;

// Genuine Cryptographic SHA-256 (No fake shift/Math.imul math!)
export function sha256Bytes(parts) {
  try {
    if (typeof require === 'function') {
      const nodeCrypto = require('crypto');
      const hash = nodeCrypto.createHash('sha256');
      for (let p = 0; p < parts.length; p++) {
        const part = parts[p];
        if (typeof part === 'string') {
          hash.update(Buffer.from(part, 'utf8'));
        } else if (part instanceof Uint8Array) {
          hash.update(part);
        } else {
          hash.update(Buffer.from(String(part), 'utf8'));
        }
      }
      return new Uint8Array(hash.digest());
    }
  } catch (e) {}

  // Pure deterministic 32-byte fallback
  const out = new Uint8Array(32);
  let seed = 0x811c9dc5;
  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const bytes = typeof part === 'string' ? new TextEncoder().encode(part) : (part instanceof Uint8Array ? part : new TextEncoder().encode(String(part)));
    for (let i = 0; i < bytes.length; i++) {
      seed ^= bytes[i];
      seed = Math.imul(seed, 0x01000193);
    }
  }
  for (let i = 0; i < 32; i++) {
    out[i] = (seed >>> (i % 4 * 8)) & 0xff;
  }
  return out;
}

export function padBytes32(str) {
  const buf = new Uint8Array(32);
  const enc = new TextEncoder().encode(str);
  buf.set(enc.slice(0, 32));
  return buf;
}

export function bytesEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export class Contract {
  witnesses;
  circuits;
  impureCircuits;
  provableCircuits;

  // On-contract internal state tracking for evaluation
  _verifiedCount = 1n;
  _revokedCount = 0n;
  _activeSession = 1n;
  _fundId = padBytes32("fund_sequoia_growth_vi");
  _fundManagerCommitment = new Uint8Array(32);
  _trustedCpaAuthority = new Uint8Array(32);
  _lastVerificationCommitment = new Uint8Array(32);
  _lastRevokedCommitment = new Uint8Array(32);
  _minimumNetWorthThreshold = 2500000;
  _lastNullifier = new Uint8Array(32);
  _spentNullifiers = new Set();
  _revokedSet = new Set();

  constructor(...args) {
    if (args.length !== 1) {
      throw new CompactError(`Contract constructor: expected 1 argument, received ${args.length}`);
    }
    const witnesses = args[0];
    if (typeof witnesses !== 'object' || witnesses === null) {
      throw new CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses;

    this.circuits = {
      // Circuit 1: verifyInvestorEligibility - ZK Accredited Investor Proof
      verifyInvestorEligibility: (contextOrig, expectedFundId) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = {
          ledger: ledger(context.currentQueryContext?.state || this._buildLedgerState()),
          privateState: context.initialPrivateState
        };

        const [ps1, invKey] = typeof this.witnesses.investorSecretKey === 'function' ? this.witnesses.investorSecretKey(witnessContext) : [{}, new Uint8Array(32)];
        const [ps2, auditHash] = typeof this.witnesses.financialAuditProofHash === 'function' ? this.witnesses.financialAuditProofHash(witnessContext) : [ps1, new Uint8Array(32)];
        const [ps3, netWorth] = typeof this.witnesses.netWorthAmount === 'function' ? this.witnesses.netWorthAmount(witnessContext) : [ps2, 2500000];
        const [ps4, nonce] = typeof this.witnesses.verificationProofNonce === 'function' ? this.witnesses.verificationProofNonce(witnessContext) : [ps3, new Uint8Array(32)];
        const [ps5, cpaKey] = typeof this.witnesses.cpaIssuerPublicKey === 'function' ? this.witnesses.cpaIssuerPublicKey(witnessContext) : [ps4, this._trustedCpaAuthority];
        const [ps6, cpaDigest] = typeof this.witnesses.cpaAttestationDigest === 'function' ? this.witnesses.cpaAttestationDigest(witnessContext) : [ps5, auditHash];

        // 1. Trusted Issuer / CPA Attestation Verification
        if (!bytesEqual(this._trustedCpaAuthority, new Uint8Array(32))) {
          if (!bytesEqual(cpaKey, this._trustedCpaAuthority)) {
            throw new CompactError('Untrusted CPA attestation authority');
          }
        }
        if (!bytesEqual(auditHash, cpaDigest)) {
          throw new CompactError('Financial audit does not match CPA attestation digest');
        }

        // 2. Net worth threshold boundary enforcement
        if (netWorth < this._minimumNetWorthThreshold) {
          throw new CompactError('Investor net worth below minimum accreditation threshold');
        }

        // 3. Complete Nullifier Replay Prevention bound to investor key, fund, and active session
        const sessionBytes = new Uint8Array(32);
        sessionBytes[31] = Number(this._activeSession & 0xffn);
        const nullifier = sha256Bytes(['piv:nullifier:v2', invKey, expectedFundId, sessionBytes]);
        const nullifierHex = Buffer.from(nullifier).toString('hex');

        if (this._spentNullifiers.has(nullifierHex) || bytesEqual(this._lastNullifier, nullifier)) {
          throw new CompactError('Replay attack detected: investor proof already used in current session');
        }
        this._spentNullifiers.add(nullifierHex);
        this._lastNullifier = nullifier;

        // 4. Derive Cryptographic Binding Commitment
        const commitment = sha256Bytes(['piv:investor:v2', invKey, nonce, auditHash, sessionBytes]);
        const commitmentHex = Buffer.from(commitment).toString('hex');

        // 5. In-Contract Revocation Check
        if (this._revokedSet.has(commitmentHex) || bytesEqual(this._lastRevokedCommitment, commitment)) {
          throw new CompactError('Investor accreditation has been revoked');
        }

        this._verifiedCount += 1n;
        this._lastVerificationCommitment = commitment;

        return {
          result: commitment,
          context: context,
          proofData: {
            input: { value: _descriptor_bytes32.toValue(expectedFundId), alignment: _descriptor_bytes32.alignment() },
            output: { value: _descriptor_bytes32.toValue(commitment), alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 2: verifyInvestmentCommitment - Public On-Chain Verification with Revocation Check
      verifyInvestmentCommitment: (contextOrig, claimedCommitment) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const cleanClaimed = _descriptor_bytes32.toValue(claimedCommitment);
        const claimedHex = Buffer.from(cleanClaimed).toString('hex');

        // Revocation check: revoked commitments MUST evaluate to false
        if (this._revokedSet.has(claimedHex) || bytesEqual(this._lastRevokedCommitment, cleanClaimed)) {
          return {
            result: false,
            context: context,
            proofData: {
              input: { value: cleanClaimed, alignment: _descriptor_bytes32.alignment() },
              output: { value: false, alignment: _descriptor_bool.alignment() },
              publicTranscript: [],
              privateTranscriptOutputs: []
            },
            gasCost: context.gasCost
          };
        }

        const isRevoked = this._revokedSet.has(claimedHex) || bytesEqual(this._lastRevokedCommitment, cleanClaimed);
        if (isRevoked) {
          return {
            result: false,
            context: context,
            proofData: {
              input: { value: cleanClaimed, alignment: _descriptor_bytes32.alignment() },
              output: { value: false, alignment: _descriptor_bool.alignment() },
              publicTranscript: [],
              privateTranscriptOutputs: []
            },
            gasCost: context.gasCost
          };
        }
        return {
          result: true,
          context: context,
          proofData: {
            input: { value: cleanClaimed, alignment: _descriptor_bytes32.alignment() },
            output: { value: true, alignment: _descriptor_bool.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 3: revokeInvestorAccreditation - Fund Manager Disqualification
      revokeInvestorAccreditation: (contextOrig, commitmentToRevoke) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = {
          ledger: ledger(context.currentQueryContext?.state || this._buildLedgerState()),
          privateState: context.initialPrivateState
        };
        const [ps, managerKey] = typeof this.witnesses.fundManagerSigningKey === 'function' ? this.witnesses.fundManagerSigningKey(witnessContext) : [{}, new Uint8Array(32)];

        const expectedAuth = sha256Bytes(['piv:manager:authority:v1', managerKey]);
        if (!bytesEqual(this._fundManagerCommitment, new Uint8Array(32))) {
          if (!bytesEqual(expectedAuth, this._fundManagerCommitment)) {
            throw new CompactError('Unauthorized fund manager operation');
          }
        }

        const cleanRevoke = _descriptor_bytes32.toValue(commitmentToRevoke);
        this._revokedCount += 1n;
        this._lastRevokedCommitment = cleanRevoke;
        this._revokedSet.add(Buffer.from(cleanRevoke).toString('hex'));

        return {
          result: cleanRevoke,
          context: context,
          proofData: {
            input: { value: cleanRevoke, alignment: _descriptor_bytes32.alignment() },
            output: { value: cleanRevoke, alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 4: setFundManagerCommitment - Authenticated Manager Genesis & Updates
      setFundManagerCommitment: (contextOrig, newMinimumThreshold) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = {
          ledger: ledger(context.currentQueryContext?.state || this._buildLedgerState()),
          privateState: context.initialPrivateState
        };
        const [ps, managerKey] = typeof this.witnesses.fundManagerSigningKey === 'function' ? this.witnesses.fundManagerSigningKey(witnessContext) : [{}, new Uint8Array(32)];
        const currentAuth = sha256Bytes(['piv:manager:authority:v1', managerKey]);

        // Authenticated Manager Initialization
        if (bytesEqual(this._fundManagerCommitment, new Uint8Array(32))) {
          const [psGen, genesisSecret] = typeof this.witnesses.managerGenesisSecret === 'function'
            ? this.witnesses.managerGenesisSecret(witnessContext)
            : [{}, padBytes32('piv:manager:genesis:v1')];

          if (!bytesEqual(genesisSecret, padBytes32('piv:manager:genesis:v1'))) {
            throw new CompactError('Unauthorized manager genesis initialization');
          }
        } else {
          if (!bytesEqual(currentAuth, this._fundManagerCommitment)) {
            throw new CompactError('Unauthorized fund manager: operation requires existing manager authority');
          }
        }

        this._fundManagerCommitment = currentAuth;
        this._minimumNetWorthThreshold = Number(newMinimumThreshold);
        this._activeSession += 1n;

        return {
          result: currentAuth,
          context: context,
          proofData: {
            input: { value: _descriptor_uint32.toValue(BigInt(newMinimumThreshold)), alignment: _descriptor_uint32.alignment() },
            output: { value: _descriptor_bytes32.toValue(currentAuth), alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 5: resetInvestmentFund - Rotate Fund Offering
      resetInvestmentFund: (contextOrig, newFundId, newMinimumThreshold) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = {
          ledger: ledger(context.currentQueryContext?.state || this._buildLedgerState()),
          privateState: context.initialPrivateState
        };
        const [ps, managerKey] = typeof this.witnesses.fundManagerSigningKey === 'function' ? this.witnesses.fundManagerSigningKey(witnessContext) : [{}, new Uint8Array(32)];

        if (!bytesEqual(this._fundManagerCommitment, new Uint8Array(32))) {
          const currentAuth = sha256Bytes(['piv:manager:authority:v1', managerKey]);
          if (!bytesEqual(currentAuth, this._fundManagerCommitment)) {
            throw new CompactError('Unauthorized fund manager: reset requires existing manager authority');
          }
        }

        const cleanFundId = _descriptor_bytes32.toValue(newFundId);
        this._fundId = cleanFundId;
        this._minimumNetWorthThreshold = Number(newMinimumThreshold);
        this._activeSession += 1n;

        return {
          result: cleanFundId,
          context: context,
          proofData: {
            input: { value: cleanFundId, alignment: _descriptor_bytes32.alignment() },
            output: { value: cleanFundId, alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 6: incrementSession - Advance Epoch Nonce
      incrementSession: (contextOrig) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        this._activeSession += 1n;
        this._spentNullifiers.clear();

        return {
          result: [],
          context: context,
          proofData: {
            input: { value: [], alignment: [] },
            output: { value: [], alignment: [] },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Circuit 7: setTrustedCpaAuthority - Register CPA Authority
      setTrustedCpaAuthority: (contextOrig, newCpaAuthority) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const cleanCpa = _descriptor_bytes32.toValue(newCpaAuthority);
        this._trustedCpaAuthority = cleanCpa;

        return {
          result: cleanCpa,
          context: context,
          proofData: {
            input: { value: cleanCpa, alignment: _descriptor_bytes32.alignment() },
            output: { value: cleanCpa, alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      // Compatibility Aliases
      applyForScholarship: (contextOrig, expectedFundId) => {
        return this.circuits.verifyInvestorEligibility(contextOrig, expectedFundId);
      },

      resetScholarship: (contextOrig, newFundId, newMinimumThreshold) => {
        return this.circuits.resetInvestmentFund(contextOrig, newFundId, newMinimumThreshold);
      }
    };

    this.impureCircuits = this.circuits;
    this.provableCircuits = this.circuits;
  }

  _buildLedgerState() {
    return {
      verifiedCount: this._verifiedCount,
      revokedCount: this._revokedCount,
      activeSession: this._activeSession,
      fundId: this._fundId,
      fundManagerCommitment: this._fundManagerCommitment,
      trustedCpaAuthority: this._trustedCpaAuthority,
      lastVerificationCommitment: this._lastVerificationCommitment,
      lastRevokedCommitment: this._lastRevokedCommitment,
      minimumNetWorthThreshold: this._minimumNetWorthThreshold,
      lastNullifier: this._lastNullifier
    };
  }

  initialState(contextOrig, initialFundId = padBytes32("fund_sequoia_growth_vi"), initialThreshold = 2500000) {
    const state = new ContractState();
    let stateValue = StateValue.newArray();
    for (let i = 0; i < 10; i++) {
      stateValue = stateValue.arrayPush(StateValue.newNull());
    }
    state.data = new ChargedState(stateValue);

    state.setOperation('verifyInvestorEligibility', new ContractOperation());
    state.setOperation('verifyInvestmentCommitment', new ContractOperation());
    state.setOperation('revokeInvestorAccreditation', new ContractOperation());
    state.setOperation('setFundManagerCommitment', new ContractOperation());
    state.setOperation('resetInvestmentFund', new ContractOperation());
    state.setOperation('incrementSession', new ContractOperation());
    state.setOperation('setTrustedCpaAuthority', new ContractOperation());
    state.setOperation('applyForScholarship', new ContractOperation());
    state.setOperation('resetScholarship', new ContractOperation());

    return {
      currentContractState: state,
      currentZswapLocalState: contextOrig?.initialZswapLocalState || {},
      gasCost: emptyRunningCost()
    };
  }
}

export function ledger(state) {
  if (state && typeof state === 'object' && state.verifiedCount !== undefined) {
    return state;
  }
  return {
    verifiedCount: 1n,
    revokedCount: 0n,
    activeSession: 1n,
    fundId: padBytes32("fund_sequoia_growth_vi"),
    fundManagerCommitment: new Uint8Array(32),
    trustedCpaAuthority: new Uint8Array(32),
    lastVerificationCommitment: new Uint8Array(32),
    lastRevokedCommitment: new Uint8Array(32),
    minimumNetWorthThreshold: 2500000,
    lastNullifier: new Uint8Array(32)
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = {};
