import Link from "next/link";
import type { Metadata } from "next";
import { CONTRACT_ADDRESS, VERIFIED_DEPLOYMENT } from "@/lib/constants";
import dynamic from "next/dynamic";

// Load Three.js scene only client-side
const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

export const metadata: Metadata = {
  title: "PIV — Private Investment Verification | Midnight Network ZK dApp",
  description: "Prove accredited investor eligibility using zero-knowledge proofs on Midnight Network. No PII disclosed on-chain.",
};

export default function HomePage() {
  return (
    <div>
      {/* ── HERO ────────────────────────────────────── */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "calc(100vh - 64px)",
        borderBottom: "1px solid var(--border)",
      }}>
        {/* Left: typography */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "5rem 3.5rem 5rem 5rem",
          borderRight: "1px solid var(--border)",
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="badge badge-black" style={{ marginBottom: "1.2rem" }}>
              LIVE · Midnight Preview Testnet
            </span>
          </div>

          <h1 className="hero-display" style={{ marginBottom: "1.5rem" }}>
            PRIVATE.<br />
            ZERO-<br />
            KNOWLEDGE.<br />
            VERIFIED.
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--fg-2)",
            lineHeight: 1.65,
            maxWidth: 460,
            marginBottom: "2.5rem",
          }}>
            Prove accredited investor eligibility mathematically — without
            disclosing net worth, bank balances, or identity on-chain.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/verify" className="btn-primary" style={{ fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}>
              Verify Accreditation
            </Link>
            <Link href="/explorer" className="btn-outline" style={{ fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}>
              Contract Explorer
            </Link>
          </div>
        </div>

        {/* Right: Three.js 3D */}
        <div style={{ position: "relative", background: "var(--bg)" }}>
          <ThreeScene />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="stats-grid" style={{ borderRadius: 0, border: "none", borderBottom: "none" }}>
          {[
            { value: "6",    label: "ZK Circuits",       sub: "Compact v0.23" },
            { value: "9",    label: "Ledger Fields",      sub: "Public on-chain" },
            { value: "34",   label: "Tests Passing",      sub: "Vitest suite" },
            { value: "100%", label: "ZK Privacy",         sub: "Zero PII disclosed" },
          ].map(({ value, label, sub }) => (
            <div className="stat-card" key={label} style={{ borderRight: "1px solid var(--border)" }}>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ON-CHAIN DEPLOYMENT ─────────────────────── */}
      <section style={{ padding: "5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
          <div>
            <span className="badge" style={{ marginBottom: "0.75rem" }}>VERIFIED ON-CHAIN</span>
            <h2 className="section-title">Active Midnight<br />Preview Contract</h2>
          </div>
          <a
            href={VERIFIED_DEPLOYMENT.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
            style={{ marginTop: "0.5rem", whiteSpace: "nowrap" }}
          >
            View on Explorer ↗
          </a>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px",
          background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          overflow: "hidden",
        }}>
          {[
            { label: "Contract Address",      value: CONTRACT_ADDRESS },
            { label: "Deployment Tx Hash",    value: VERIFIED_DEPLOYMENT.transactionHash },
            { label: "Confirmed Block",       value: `Block #${VERIFIED_DEPLOYMENT.blockHeight} (ID #${VERIFIED_DEPLOYMENT.transactionId})` },
            { label: "Network",               value: "Midnight Preview Testnet" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--card)", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                {label}
              </div>
              <code className="mono-text" style={{ fontSize: "0.8rem" }}>{value}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section style={{ padding: "5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: "3rem" }}>
          <span className="badge" style={{ marginBottom: "0.75rem" }}>HOW IT WORKS</span>
          <h2 className="section-title">Privacy Architecture</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)" }}>
          {[
            {
              num: "01",
              title: "ZK Net Worth Proof",
              desc: "Proves investor meets SEC accredited threshold (≥ $2.5M USD) without publishing financial balances or CPA documents on-chain.",
            },
            {
              num: "02",
              title: "Nullifier Replay Prevention",
              desc: "Session-bound nullifier prevents proof reuse within funding epochs. lastNullifier tracked on-chain to eliminate double-spend.",
            },
            {
              num: "03",
              title: "Protected Fund Authority",
              desc: "General Partner authority anchored with ZK signing key witnesses. Fund resets and accreditation changes are cryptographically gated.",
            },
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ background: "var(--card)", padding: "2.5rem 2rem" }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: "4rem",
                fontWeight: 900, color: "var(--bg-alt)", lineHeight: 1, marginBottom: "1rem",
              }}>
                {num}
              </div>
              <h3 style={{
                fontFamily: "var(--font-display)", fontSize: "1.4rem",
                fontWeight: 800, textTransform: "uppercase", marginBottom: "0.75rem",
              }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--fg-3)", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTAL LINKS ────────────────────────────── */}
      <section style={{ padding: "5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {[
            { href: "/verify",   label: "Accreditation Portal", desc: "Submit ZK investor eligibility proofs", tag: "ZK Circuits 1 & 2" },
            { href: "/manager",  label: "Fund Manager Console", desc: "Anchor authority, revoke, rotate fund",   tag: "ZK Circuits 3–5" },
            { href: "/explorer", label: "Contract Explorer",    desc: "Live on-chain state via GraphQL Indexer", tag: "Live Indexer API" },
          ].map(({ href, label, desc, tag }) => (
            <Link key={href} href={href} style={{ background: "var(--card)", padding: "2rem", display: "block", borderRight: "1px solid var(--border)", transition: "background 0.15s" }}>
              <span className="badge" style={{ marginBottom: "1rem" }}>{tag}</span>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                {label}
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--fg-3)" }}>{desc}</p>
              <div style={{ marginTop: "1.25rem", fontSize: "0.85rem", fontWeight: 600 }}>Open →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}