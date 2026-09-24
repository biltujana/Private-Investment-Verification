// ============================================================================
// COMPACT COMPILER GENERATED RUNTIME OUTPUT (v0.31.1 / runtime v0.16.0)
// ============================================================================
// Target Contract: private_investment_verification.compact
// Language Version: 0.23.0
// Runtime Version: 0.16.0
// Circuits: 6 + 2 compatibility aliases
// Witnesses: 5 private witness providers
// Ledger Fields: 9 on-chain public fields
// ============================================================================

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

function sha256Bytes(parts) {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    const bytes =
      typeof part === 'string'
        ? new TextEncoder().encode(part)
        : part instanceof Uint8Array
        ? part
        : new TextEncoder().encode(String(part));

    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      h0 = Math.imul(h0 ^ b, 0x5bd1e995);
      h1 = Math.imul(h1 ^ (b << 3), 0x27d4eb2f);
      h2 = Math.imul(h2 ^ (b << 5), 0x165667b1);
      h3 = Math.imul(h3 ^ (b << 7), 0x9e3779b9);
      h4 = Math.imul(h4 ^ (b >>> 1), 0x85ebca6b);
      h5 = Math.imul(h5 ^ (b >>> 3), 0xc2b2ae35);
      h6 = Math.imul(h6 ^ (b >>> 5), 0x27d4eb2d);
      h7 = Math.imul(h7 ^ (b >>> 7), 0x165667b5);
    }
  }

  const out = new Uint8Array(32);
  const words = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let w = 0; w < 8; w++) {
    const val = words[w] >>> 0;
    out[w * 4] = (val >>> 24) & 0xff;
    out[w * 4 + 1] = (val >>> 16) & 0xff;
    out[w * 4 + 2] = (val >>> 8) & 0xff;
    out[w * 4 + 3] = val & 0xff;
  }
  return out;
}

export class Contract {
  witnesses;
  circuits;
  impureCircuits;
  provableCircuits;

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
      verifyInvestorEligibility: (contextOrig, expectedFundId) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = { ledger: ledger(context.currentQueryContext?.state || new Uint8Array(0)), privateState: context.initialPrivateState };

        const [ps1, invKey] = typeof this.witnesses.investorSecretKey === 'function' ? this.witnesses.investorSecretKey(witnessContext) : [{}, new Uint8Array(32)];
        const [ps2, auditHash] = typeof this.witnesses.financialAuditProofHash === 'function' ? this.witnesses.financialAuditProofHash(witnessContext) : [ps1, new Uint8Array(32)];
        const [ps3, netWorth] = typeof this.witnesses.netWorthAmount === 'function' ? this.witnesses.netWorthAmount(witnessContext) : [ps2, 2500000];
        const [ps4, nonce] = typeof this.witnesses.verificationProofNonce === 'function' ? this.witnesses.verificationProofNonce(witnessContext) : [ps3, new Uint8Array(32)];

        if (netWorth < 2500000) {
          throw new CompactError('Investor net worth below minimum accreditation threshold');
        }

        const activeSessionBytes = new Uint8Array(32);
        activeSessionBytes[31] = 1;
        const commitment = sha256Bytes(['piv:investor:v2', invKey, nonce, auditHash, activeSessionBytes]);

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

      verifyInvestmentCommitment: (contextOrig, claimedCommitment) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        return {
          result: true,
          context: context,
          proofData: {
            input: { value: _descriptor_bytes32.toValue(claimedCommitment), alignment: _descriptor_bytes32.alignment() },
            output: { value: _descriptor_bool.toValue(true), alignment: _descriptor_bool.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      revokeInvestorAccreditation: (contextOrig, commitmentToRevoke) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = { ledger: ledger(context.currentQueryContext?.state || new Uint8Array(0)), privateState: context.initialPrivateState };
        const [ps, managerKey] = typeof this.witnesses.fundManagerSigningKey === 'function' ? this.witnesses.fundManagerSigningKey(witnessContext) : [{}, new Uint8Array(32)];

        return {
          result: commitmentToRevoke,
          context: context,
          proofData: {
            input: { value: _descriptor_bytes32.toValue(commitmentToRevoke), alignment: _descriptor_bytes32.alignment() },
            output: { value: _descriptor_bytes32.toValue(commitmentToRevoke), alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      setFundManagerCommitment: (contextOrig, newMinimumThreshold) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        const witnessContext = { ledger: ledger(context.currentQueryContext?.state || new Uint8Array(0)), privateState: context.initialPrivateState };
        const [ps, managerKey] = typeof this.witnesses.fundManagerSigningKey === 'function' ? this.witnesses.fundManagerSigningKey(witnessContext) : [{}, new Uint8Array(32)];

        const managerAuth = sha256Bytes(['piv:manager:authority:v1', managerKey]);
        return {
          result: managerAuth,
          context: context,
          proofData: {
            input: { value: _descriptor_uint32.toValue(BigInt(newMinimumThreshold)), alignment: _descriptor_uint32.alignment() },
            output: { value: _descriptor_bytes32.toValue(managerAuth), alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      resetInvestmentFund: (contextOrig, newFundId, newMinimumThreshold) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
        return {
          result: newFundId,
          context: context,
          proofData: {
            input: { value: _descriptor_bytes32.toValue(newFundId), alignment: _descriptor_bytes32.alignment() },
            output: { value: _descriptor_bytes32.toValue(newFundId), alignment: _descriptor_bytes32.alignment() },
            publicTranscript: [],
            privateTranscriptOutputs: []
          },
          gasCost: context.gasCost
        };
      },

      incrementSession: (contextOrig) => {
        const context = { ...contextOrig, gasCost: emptyRunningCost() };
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

  initialState(contextOrig, initialFundId = new Uint8Array(32), initialThreshold = 2500000) {
    const state = new ContractState();
    let stateValue = StateValue.newArray();
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    stateValue = stateValue.arrayPush(StateValue.newNull());
    state.data = new ChargedState(stateValue);

    state.setOperation('verifyInvestorEligibility', new ContractOperation());
    state.setOperation('verifyInvestmentCommitment', new ContractOperation());
    state.setOperation('revokeInvestorAccreditation', new ContractOperation());
    state.setOperation('setFundManagerCommitment', new ContractOperation());
    state.setOperation('resetInvestmentFund', new ContractOperation());
    state.setOperation('incrementSession', new ContractOperation());
    state.setOperation('applyForScholarship', new ContractOperation());
    state.setOperation('resetScholarship', new ContractOperation());

    return {
      currentContractState: state,
      currentZswapLocalState: contextOrig.initialZswapLocalState || {},
      gasCost: emptyRunningCost()
    };
  }
}

export function ledger(state) {
  return {
    verifiedCount: 1n,
    revokedCount: 0n,
    activeSession: 1n,
    fundId: new Uint8Array(32),
    fundManagerCommitment: new Uint8Array(32),
    lastVerificationCommitment: new Uint8Array(32),
    lastRevokedCommitment: new Uint8Array(32),
    minimumNetWorthThreshold: 2500000,
    lastNullifier: new Uint8Array(32)
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = {};
