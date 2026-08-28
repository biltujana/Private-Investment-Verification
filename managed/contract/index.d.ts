import type * as __compactRuntime from "@midnight-ntwrk/compact-runtime";

export enum StateValue {
  vacant = 0,
  occupied = 1
}

export type Witnesses<T> = {
  investorSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  financialAuditProofHash(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  netWorthAmount(context: __compactRuntime.WitnessContext<Ledger, T>): [T, number];
  verificationProofNonce(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  fundManagerSigningKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  verifyInvestorEligibility(context: __compactRuntime.CircuitContext<T>, expectedFundId: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyInvestmentCommitment(context: __compactRuntime.CircuitContext<T>, claimedCommitment: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
  revokeInvestorAccreditation(context: __compactRuntime.CircuitContext<T>, commitmentToRevoke: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  setFundManagerCommitment(context: __compactRuntime.CircuitContext<T>, newMinimumThreshold: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  resetInvestmentFund(context: __compactRuntime.CircuitContext<T>, newFundId: Uint8Array, newMinimumThreshold: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  incrementSession(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {}

export type Circuits<T> = {
  verifyInvestorEligibility(context: __compactRuntime.CircuitContext<T>, expectedFundId: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  verifyInvestmentCommitment(context: __compactRuntime.CircuitContext<T>, claimedCommitment: Uint8Array): __compactRuntime.CircuitResults<T, boolean>;
  revokeInvestorAccreditation(context: __compactRuntime.CircuitContext<T>, commitmentToRevoke: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  setFundManagerCommitment(context: __compactRuntime.CircuitContext<T>, newMinimumThreshold: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  resetInvestmentFund(context: __compactRuntime.CircuitContext<T>, newFundId: Uint8Array, newMinimumThreshold: number): __compactRuntime.CircuitResults<T, Uint8Array>;
  incrementSession(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly verifiedCount: bigint;
  readonly revokedCount: bigint;
  readonly activeSession: bigint;
  readonly fundId: Uint8Array;
  readonly fundManagerCommitment: Uint8Array;
  readonly lastVerificationCommitment: Uint8Array;
  readonly lastRevokedCommitment: Uint8Array;
  readonly minimumNetWorthThreshold: number;
}

export type ContractReferenceLocations = {}

export declare const contractReferenceLocations: ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> implements __compactRuntime.Contract<T, StateValue> {
  witnesses: W;
  circuits: Circuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
