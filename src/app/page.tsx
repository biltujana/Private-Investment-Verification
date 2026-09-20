import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private Investment Verification | Zero-Knowledge Accredited Investor Portal on Midnight',
  description: 'Prove accredited investor net worth qualifications and commit private capital using zero-knowledge proofs on the Midnight Network.',
};

const CONTRACT_ADDRESS = "0x443a1a8b3dfcca0bc809e15fbee0160bfc3e9eb375cfee4f8383b8a3b2fcbaa2";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 5rem" }}>
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-badge">
          <span>💎</span> Midnight Preview Network — Live ZK dApp
        </div>
        <h1>Private Investment Verification</h1>
        <p>
          Prove <strong>accredited investor eligibility</strong> and commit capital using <strong>zero-knowledge proofs</strong> — without disclosing your net worth, bank balances, tax returns, or personal identity on-chain.
        </p>
        <div className="hero-actions">
          <Link href="/verify" className="btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            🔒 Verify Accreditation (ZK Proof) →
          </Link>
          <Link href="/manager" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            👔 Fund Manager Console
          </Link>
          <Link href="/explorer" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}>
            🔍 Explorer
          </Link>
        </div>
      </section>

      {/* ── Key Metrics Grid ── */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#3b82f6" }}>6</div>
            <div className="stat-label">ZK Circuits</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Compact v0.23 logic</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#06b6d4" }}>8</div>
            <div className="stat-label">Ledger Fields</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Public on-chain state</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#eab308" }}>5</div>
            <div className="stat-label">Private Witnesses</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Kept strictly private</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value" style={{ color: "#10b981" }}>10/10</div>
            <div className="stat-label">Unit Tests Passing</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.35rem" }}>Vitest test suite</div>
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Steps) ── */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <span className="badge badge-sapphire">Zero-Knowledge Accreditation</span>
          <h2 className="section-title" style={{ marginTop: "0.5rem" }}>How Private Investor Verification Works</h2>
          <p className="section-desc">
            Traditional venture capital & private equity accreditation forces investors to upload tax returns and bank statements to centralized SaaS portals. PIV proves regulatory accreditation mathematically.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {[
            {
              step: "01",
              title: "Local Financial Witness Input",
              badge: "Private (Browser)",
              color: "#3b82f6",
              desc: "Investor enters private secret key, CPA audit report hash, and qualified net worth figure ($1M+). These never leave the local device."
            },
            {
              step: "02",
              title: "ZK Proof Generation",
              badge: "Client Prover",
              color: "#06b6d4",
              desc: "The Compact circuit evaluates net worth bounds (netWorth >= threshold) without revealing the balance, generating a 32-byte commitment hash."
            },
            {
              step: "03",
              title: "On-Chain Capital Anchor",
              badge: "Public Ledger",
              color: "#eab308",
              desc: "Only the accreditation commitment is published on Midnight. Fund managers verify regulatory compliance while the investor remains 100% anonymous."
            },
          ].map(c => (
            <div key={c.step} className="glass-card" style={{ padding: "1.75rem", borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: c.color, fontFamily: "monospace" }}>{c.step}</span>
                <span className="badge" style={{ background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}44` }}>{c.badge}</span>
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.5rem" }}>{c.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Navigation Cards ── */}
      <section style={{ marginBottom: "3.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {[
            {
              href: "/verify",
              icon: "🔒",
              title: "Accreditation Portal",
              desc: "Generate client-side ZK proofs proving accredited investor qualifications and net worth thresholds without exposing financial data.",
              color: "#3b82f6"
            },
            {
              href: "/manager",
              icon: "👔",
              title: "Fund Manager Console",
              desc: "Anchor fund authority, configure accreditation thresholds, rotate deal identifiers, and moderate investor subscriptions.",
              color: "#06b6d4"
            },
            {
              href: "/explorer",
              icon: "🔍",
              title: "Contract Explorer",
              desc: "Inspect live public ledger state, verified investor commitments, and on-chain contract parameters on Midnight Preview.",
              color: "#eab308"
            }
          ].map(card => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
              <div className="glass-card" style={{ padding: "1.75rem", height: "100%", transition: "all 0.2s ease" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{card.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: "0.5rem" }}>{card.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{card.desc}</p>
                <div style={{ marginTop: "1rem", fontSize: "0.85rem", fontWeight: 700, color: card.color }}>
                  Launch portal →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Contract Overview Card ── */}
      <section className="glass-card" style={{ padding: "1.75rem", borderLeft: "3px solid #3b82f6" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          On-Chain Deployment Details
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Contract Address</div>
            <code style={{ fontSize: "0.78rem", color: "#06b6d4", wordBreak: "break-all" }}>{CONTRACT_ADDRESS}</code>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Network</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#3b82f6" }}>Midnight Preview Testnet</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>Explorer Link</div>
            <a
              href={`https://preview.midnightexplorer.com/contracts/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#eab308", fontSize: "0.82rem", textDecoration: "none", fontWeight: 600 }}
            >
              View on Midnight Explorer ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
