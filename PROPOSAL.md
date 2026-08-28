# Project Proposal: Private Investment Verification (PIV)
> A Privacy-Preserving Zero-Knowledge Accredited Investor & Private Placement Attestation Protocol on Midnight Network

---

## 🎥 Live Demo Video

[![PIV Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Live%20Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/V6r9VZ2xhIM)

📺 **Watch on YouTube**: [https://youtu.be/V6r9VZ2xhIM](https://youtu.be/V6r9VZ2xhIM)

---

## ❓ Question 1: What is the application?

**Private Investment Verification (PIV)** is a decentralized, privacy-preserving accredited investor qualification and capital allocation attestation dApp built on the Midnight Network using Compact zero-knowledge smart contracts and the **Midnight.js SDK** (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/compact-runtime`).

It allows high-net-worth investors and institutions to prove regulatory accreditation (**net worth ≥ $2,500,000 USD** and valid CPA audit attestation) **without revealing their name, home address, bank accounts, brokerage portfolios, tax filings, or entity ownership structure** to venture capital funds, private equity GPs, placement agents, or public observers.

Through local ZK proof generation on the investor's client device:
1. **Investors** prove accreditation without exposing sensitive wealth or personal identity data.
2. **Fund Managers (GPs)** anchor fund offering parameters on-chain, configure minimum investment thresholds, and verify investor eligibility without taking on the regulatory liability of holding toxic investor PII.
3. **Regulators & Auditors** verify cryptographic compliance proofs on the Midnight public ledger with mathematical certainty.

---

## ❓ Question 2: What problem does it solve?

Private placement offerings (e.g. SEC Regulation D, Rule 506(c)) mandate that fund sponsors verify the accredited investor status of all participants. Currently, this process suffers from two critical vulnerabilities:

1. **Severe Financial Privacy Intrusion**: Investors must email unencrypted tax returns, bank statements, asset deeds, and W-2s to multiple third-party verification services or fund managers, creating centralized honey pots vulnerable to cyberattacks, identity theft, and extortion.
2. **Regulatory & Compliance Burden**: Fund managers who collect investor financial documents bear massive GDPR/CCPA data custody liabilities and high administrative verification costs.

### How PIV Solves This via Zero-Knowledge Proofs:
- **Net Worth Verification in Zero-Knowledge**: The `verifyInvestorEligibility` circuit verifies that the investor holds a valid CPA audit hash (`financialAuditProofHash`) and satisfies the net worth threshold (`assert(netWorth >= minimumNetWorthThreshold)`) in ZK without publishing the raw net worth amount or document contents.
- **Complete Investor Anonymity**: Only a one-way Pedersen/Poseidon commitment hash binding the investor secret key and audit hash is published on Midnight.
- **Replay & Sybil Protection**: Each commitment binds the specific fund ID and session epoch, preventing proof replay across different fund vintages or capital calls.

---

## ❓ Question 3: How is Midnight used?

PIV leverages Midnight's dual-state hybrid architecture, combining private off-chain witness execution with public on-chain ledger state and Midnight.js SDK integration.

### 1. Midnight.js SDK & DApp Connector
- **`@midnight-ntwrk/dapp-connector-api`**: Standard browser wallet connector types (`DAppConnectorAPI`, `ConnectedAPI`, `InitialAPI`) to interact with Midnight Lace / 1AM extensions with approval popups and account resolution.
- **`@midnight-ntwrk/midnight-js-network-id`**: Configures connections to the Midnight Preview Testnet.
- **`@midnight-ntwrk/compact-runtime` & `@midnight-ntwrk/midnight-js-contracts`**: Manages on-chain circuit calls (`verifyInvestorEligibility`, `verifyInvestmentCommitment`, `revokeInvestorAccreditation`, `setFundManagerCommitment`, `resetInvestmentFund`, `incrementSession`).

### 2. Compact Smart Contract Circuits (6 Circuits)
- **`verifyInvestorEligibility(expectedFundId: Bytes<32>)`**: Private investor execution circuit. Asserts fund ID match, validates net worth ≥ threshold ($2.5M) in ZK, generates the 256-bit accreditation commitment, and increments `verifiedCount`.
- **`verifyInvestmentCommitment(claimedCommitment: Bytes<32>)`**: Public verification circuit asserting the on-chain validity of a published accreditation commitment.
- **`revokeInvestorAccreditation(commitmentToRevoke: Bytes<32>)`**: Fund manager moderation circuit. Requires the GP's private signing key witness to verify authorized authority before revoking accreditation or disqualifying bad actors.
- **`setFundManagerCommitment(newMinimumThreshold: Uint<32>)`**: Anchors GP authority commitment on-chain and configures the minimum net worth accreditation threshold.
- **`resetInvestmentFund(newFundId: Bytes<32>, newMinimumThreshold: Uint<32>)`**: Rotates investment fund offering identifier and initiates a fresh capital allocation epoch.
- **`incrementSession()`**: Increments the active session counter to prevent application replay attacks across capital calls.

### 3. Public Ledger State (8 Fields)
- `verifiedCount: Counter` — Total verified accredited investor commitments.
- `revokedCount: Counter` — Total disqualified / revoked investor claims.
- `activeSession: Counter` — Epoch nonce for capital call replay attack prevention.
- `fundId: Bytes<32>` — Active investment fund offering identifier.
- `fundManagerCommitment: Bytes<32>` — Public authority anchor derived from manager key.
- `lastVerificationCommitment: Bytes<32>` — Most recent ZK accreditation claim commitment hash.
- `lastRevokedCommitment: Bytes<32>` — Most recent revoked investor hash.
- `minimumNetWorthThreshold: Uint<32>` — Minimum accredited net worth threshold ($2,500,000 USD).

### 4. Private Witnesses (5 Witnesses)
- `investorSecretKey(): Bytes<32>` — Investor private cryptographic key (never leaves local browser).
- `financialAuditProofHash(): Bytes<32>` — SHA-256 hash of CPA audit report / accredited certification.
- `netWorthAmount(): Uint<32>` — Private net worth amount evaluated in ZK circuit bounds.
- `verificationProofNonce(): Bytes<32>` — Cryptographic salt for commitment hiding.
- `fundManagerSigningKey(): Bytes<32>` — Fund manager private key for authorized governance.

---

## ❓ Question 4: What are the privacy guarantees?

### Privacy Guarantee Matrix

| Information Item | Visibility | Guarantees Provided |
|---|---|---|
| Investor Identity & Name | **Strictly Hidden (Local)** | Generated locally in ZK witness; never leaves browser |
| Exact Net Worth Amount | **Strictly Hidden (Local)** | Proved ≥ $2.5M in ZK; exact dollar balance hidden |
| CPA Audit Statements & Tax Docs | **Strictly Hidden (Local)** | SHA-256 hashed locally; raw financial documents never exposed |
| Verification Entropy Nonce | **Strictly Hidden (Local)** | Salt prevents rainbow table and linkability attacks |
| Fund Manager Private Key | **Strictly Hidden (Local)** | Used solely to prove authority inside `revokeInvestorAccreditation` |
| Total Verified Investors | **Public Ledger** | On-chain counter incremented upon valid proof submission |
| Active Fund Offering ID | **Public Ledger** | Public fund identifier for transparency |
| Verification Commitment Hash | **Public Ledger** | One-way cryptographic hash for LP qualification verification |

---

## 🌐 Deployment & Infrastructure

- **Contract Address**: `0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a` ✅ **CONFIRMED**
- **Midnight Explorer**: [https://preview.midnightexplorer.com/contracts/0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a](https://preview.midnightexplorer.com/contracts/0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a)
- **YouTube Demo Video**: [https://youtu.be/V6r9VZ2xhIM](https://youtu.be/V6r9VZ2xhIM)
- **Network**: Midnight Preview Testnet
- **Preview RPC**: `https://rpc.preview.midnight.network`
- **Preview Indexer**: `https://indexer.preview.midnight.network/api/v4/graphql`
- **Framework**: Next.js 14 App Router + Compact v0.23 SDK + Midnight.js SDK

---

## 🗺️ Level 3 Compliance Checklist

- [x] **Substantive 4-Question Response**: Thorough answers detailing real-world problem, ZK architecture, witnesses, and privacy models.
- [x] **Smart Contract & Frontend Integration**: Clear smart contract function calls wired into Next.js UI with live ZK execution states.
- [x] **Midnight.js SDK Integration**: `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/compact-runtime` wired into client.
- [x] **100% Passing Test Suite**: 10/10 Vitest unit tests covering circuit execution and witness privacy.
- [x] **Interactive Next.js 14 Web dApp**: Full interactive UI with investor portal, fund manager console, and Midnight Lace wallet connection.
- [x] **Live On-Chain Deployment**: Deployed on Midnight Preview at `0x5292a220155624990f23cff1d979fe66137264e240982a2a32901b8060951d6a`.
- [x] **YouTube Live Demo Walkthrough**: [https://youtu.be/V6r9VZ2xhIM](https://youtu.be/V6r9VZ2xhIM).
