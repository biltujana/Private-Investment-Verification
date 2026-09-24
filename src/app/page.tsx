import Link from 'next/link';
import type { Metadata } from 'next';
import { CONTRACT_ADDRESS, VERIFIED_DEPLOYMENT } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Private Investment Verification | Zero-Knowledge Accredited Investor Portal on Midnight',
  description: 'Prove accredited investor net worth qualifications and commit private capital using zero-knowledge proofs on the Midnight Network.',
};

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">
          <span>LIVE</span> Midnight Preview Testnet &bull; Level 3 Verified
        </div>
        <h1>Private Investment Verification</h1>
        <p>
          Prove <strong>accredited investor eligibility</strong> and commit capital using <strong>zero-knowledge proofs</strong> &mdash; without disclosing your net worth, bank balances, tax returns, or personal identity on-chain.
        </p>
        <div className="hero-actions">
          <Link href="/verify" className="btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Verify Accreditation (ZK Proof)
          </Link>
          <Link href="/manager" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Fund Manager Console
          </Link>
          <Link href="/explorer" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            Contract Explorer
          </Link>
        </div>
      </section>

      {/* Key Metrics Grid */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#3b82f6" }}>6</div>
            <div className="stat-label">ZK Circuits</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Compact v0.23 logic</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#06b6d4" }}>9</div>
            <div className="stat-label">Ledger Fields</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Public on-chain state</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#eab308" }}>5</div>
            <div className="stat-label">Private Witnesses</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Client-side proving</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#10b981" }}>100%</div>
            <div className="stat-label">ZK Privacy</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Zero PII disclosure</div>
          </div>
        </div>
      </section>

      {/* Verified On-Chain Deployment Card */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div className="glass-card" style={{ padding: "2rem", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: "0.5rem" }}>VERIFIED DEPLOYMENT</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f8fafc" }}>
                Active On-Chain Midnight Preview Contract
              </h3>
            </div>
            <a
              href={VERIFIED_DEPLOYMENT.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: "0.85rem" }}
            >
              View on Midnight Explorer
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem", marginTop: "1rem" }}>
            <div>
              <span style={{ color: "#64748b" }}>Contract Address:</span>
              <code style={{ color: "#06b6d4", display: "block", marginTop: "0.25rem", wordBreak: "break-all" }}>
                {CONTRACT_ADDRESS}
              </code>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Deployment Transaction:</span>
              <code style={{ color: "#818cf8", display: "block", marginTop: "0.25rem", wordBreak: "break-all" }}>
                {VERIFIED_DEPLOYMENT.transactionHash}
              </code>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Confirmed Block:</span>
              <span style={{ color: "#f8fafc", display: "block", marginTop: "0.25rem", fontWeight: 600 }}>
                Block #{VERIFIED_DEPLOYMENT.blockHeight} (ID #{VERIFIED_DEPLOYMENT.transactionId})
              </span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Network Target:</span>
              <span style={{ color: "#10b981", display: "block", marginTop: "0.25rem", fontWeight: 600 }}>
                Midnight Preview Testnet (RPC + GraphQL Indexer)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Features */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem", color: "#f8fafc" }}>
          Privacy Architecture & Cryptographic Guarantees
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#10b981", marginBottom: "0.75rem" }}>
              1. ZK Net Worth Boundary Enforcement
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>
              Proves in zero-knowledge that the investor meets the SEC accredited investor threshold (&ge; $2,500,000 USD) without publishing financial balances or CPA audit files.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem" }}>
              2. Nullifier Replay-Prevention & Session Binding
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>
              Derives a session-bound nullifier (<code style={{ color: "#eab308" }}>lastNullifier</code>) that prevents proof reuse within the same funding epoch while allowing legitimate multi-round commitments.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#6366f1", marginBottom: "0.75rem" }}>
              3. Protected Fund Manager Authority
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>
              General Partner authority is anchored on-chain with ZK signature witnesses. Unauthorized parties cannot reset funds or alter accreditation policies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
