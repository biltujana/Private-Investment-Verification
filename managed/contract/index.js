export class Contract {
  witnesses;
  circuits;

  constructor(witnesses) {
    this.witnesses = witnesses;
    this.circuits = {
      verifyInvestorEligibility: (context, expectedFundId) => {
        return {
          result: new Uint8Array(32),
          context: context
        };
      },
      verifyInvestmentCommitment: (context, claimedCommitment) => {
        return {
          result: true,
          context: context
        };
      },
      revokeInvestorAccreditation: (context, commitmentToRevoke) => {
        return {
          result: commitmentToRevoke,
          context: context
        };
      },
      setFundManagerCommitment: (context, newMinimumThreshold) => {
        return {
          result: new Uint8Array(32),
          context: context
        };
      },
      resetInvestmentFund: (context, newFundId, newMinimumThreshold) => {
        return {
          result: newFundId,
          context: context
        };
      },
      incrementSession: (context) => {
        return {
          result: [],
          context: context
        };
      }
    };
  }

  initialState(context) {
    return {
      currentContractState: 0,
      currentZkState: context.currentZkState,
      transactionContext: context.transactionContext
    };
  }
}

export function ledger(state) {
  return {
    verifiedCount: 0n,
    revokedCount: 0n,
    activeSession: 1n,
    fundId: new Uint8Array(32),
    fundManagerCommitment: new Uint8Array(32),
    lastVerificationCommitment: new Uint8Array(32),
    lastRevokedCommitment: new Uint8Array(32),
    minimumNetWorthThreshold: 2500000
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = {};
