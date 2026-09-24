# Project Proposal: Private Investment Verification (PIV)
> A Privacy-Preserving Zero-Knowledge Accredited Investor & Private Placement Attestation Protocol on Midnight Network

---

## Live Demo Video

[![PIV Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Live%20Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/OisJFvKPM98)

**Watch on YouTube**: [https://youtu.be/OisJFvKPM98](https://youtu.be/OisJFvKPM98)

---

## Question 1: What is the application?

**Private Investment Verification (PIV)** is a decentralized, privacy-preserving accredited investor qualification and capital allocation attestation dApp built on the Midnight Network using Compact zero-knowledge smart contracts and the **Midnight.js SDK** (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/midnight-js-contracts`, `@midnight-ntwrk/compact-runtime`).

It allows high-net-worth investors and institutions to prove regulatory accreditation (**net worth &ge; $2,500,000 USD** and valid CPA audit attestation) **without revealing their name, home address, bank accounts, brokerage portfolios, tax filings, or entity ownership structure** to venture capital funds, private equity GPs, placement agents, or public observers.

Through local ZK proof generation on the investor's client device:
1. **Investors** prove accreditation without exposing sensitive wealth or personal identity data.
2. **Fund Managers (GPs)** anchor fund offering parameters on-chain, configure minimum investment thresholds, and verify investor eligibility without taking on the regulatory liability of holding toxic investor PII.
3. **Regulators & Auditors** verify cryptographic compliance proofs on the Midnight public ledger with mathematical certainty.

---

## Question 2: What problem does it solve?

Private placement offerings (e.g. SEC Regulation D, Rule 506(c)) mandate that fund sponsors verify the accredited investor status of all participants. Currently, this process suffers from two critical vulnerabilities:

1. **Severe Financial Privacy Intrusion**: Investors must email unencrypted tax returns, bank statements, asset deeds, and W-2s to multiple third-party verification services or fund managers, creating centralized honey pots vulnerable to cyberattacks, identity theft, and extortion.
2. **Regulatory & Compliance Burden**: Fund managers who collect investor financial documents bear massive GDPR/CCPA data custody liabilities and high administrative verification costs.

### How PIV Solves This via Zero-Knowledge Proofs:
- **Net Worth Verification in Zero-Knowledge**: The `verifyInvestorEligibility` circuit verifies that the investor holds a valid CPA audit hash (`financialAuditProofHash`) and satisfies the net worth threshold (`assert(netWorth >= minimumNetWorthThreshold)`) in ZK without publishing the raw net worth amount or document contents.
- **Nullifier Replay Prevention**: Derives an on-chain nullifier (`lastNullifier`) bound to the investor secret key and `activeSession` preventing double-submission in the same funding epoch.
- **Protected Manager Authority**: General Partner authority is anchored on-chain with cryptographic keys; subsequent policy changes or fund resets require proof of the existing manager signing key.
- **Dynamic Session Binding**: Epoch sessions are converted via `activeSession as Field as Bytes<32>` and bound directly into proofs.

---

## Question 3: How is it designed using Midnight?

PIV utilizes Midnight's hybrid dual-state architecture:

### 1. Private State & Local Witnesses (Computed inside client browser)
- `witness investorSecretKey(): Bytes<32>`: Private investor identity key, never transmitted over the network.
- `witness financialAuditProofHash(): Bytes<32>`: Cryptographic hash of third-party CPA financial audit.
- `witness netWorthAmount(): Uint<32>`: Raw investor net worth in USD evaluated inside local ZK circuit.
- `witness verificationProofNonce(): Bytes<32>`: Cryptographic blinding entropy.
- `witness fundManagerSigningKey(): Bytes<32>`: Private signing key used by GP to anchor authority.

### 2. Public Ledger State (9 Fields)
- `verifiedCount: Counter`: Total verified accredited commitments.
- `revokedCount: Counter`: Total disqualified claims.
- `activeSession: Counter`: Current epoch session counter.
- `fundId: Bytes<32>`: Active fund offering identifier.
- `fundManagerCommitment: Bytes<32>`: General Partner authority anchor.
- `lastVerificationCommitment: Bytes<32>`: Most recent verified commitment hash.
- `lastRevokedCommitment: Bytes<32>`: Most recent revoked hash.
- `minimumNetWorthThreshold: Uint<32>`: Accreditation net worth threshold ($2,500,000 USD).
- `lastNullifier: Bytes<32>`: Replay-prevention nullifier.

---

## Question 4: Deployment & Verification Details

- **Contract Address**: `0x443a1a8b3dfcca0bc809e15fbee0160bfc3e9eb375cfee4f8383b8a3b2fcbaa2`
- **Deployment Transaction Hash**: `0x2c09c04b9bf87ff1476b0433b86bb6697b53cd7d2b437e257c47c028ef19fbab`
- **Confirmed Transaction ID**: `#67494`
- **Confirmed Block Height**: `Block #932658`
- **Confirmed Block Hash**: `0x8cbbdfd523d7924d82212fcf917536a34b325cd9f7479670ba3f4537d4d16393`
- **Midnight Explorer**: [https://preview.midnightexplorer.com/contracts/0x443a1a8b3dfcca0bc809e15fbee0160bfc3e9eb375cfee4f8383b8a3b2fcbaa2](https://preview.midnightexplorer.com/contracts/0x443a1a8b3dfcca0bc809e15fbee0160bfc3e9eb375cfee4f8383b8a3b2fcbaa2)
- **Target Network**: Midnight Preview Testnet
- **Network RPC**: `https://rpc.preview.midnight.network`
- **GraphQL Indexer**: `https://indexer.preview.midnight.network/api/v4/graphql`
- **Test Suite**: 34 / 34 Tests Passing (`npm test`)
- **Web Platform Build**: Next.js 14 App Router (0 Build Errors)
