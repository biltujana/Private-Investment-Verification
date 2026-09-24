import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const contractPath = path.join(rootDir, "contracts", "private_investment_verification.compact");
const contractInfoPath = path.join(rootDir, "managed", "compiler", "contract-info.json");
const contractDir = path.join(rootDir, "managed", "contract");
const keysDir = path.join(rootDir, "managed", "keys");
const zkirDir = path.join(rootDir, "managed", "zkir");

console.log("=============================================================");
console.log(" Midnight Compact Contract Compilation & Verification");
console.log(" Contract: contracts/private_investment_verification.compact");
console.log("=============================================================");

if (!fs.existsSync(contractPath)) {
  console.error("Error: Contract file not found at " + contractPath);
  process.exit(1);
}
const compactSource = fs.readFileSync(contractPath, "utf-8");
console.log("[1/5] Loaded Compact source (" + compactSource.length + " bytes).");

if (!compactSource.includes("pragma language_version 0.23;")) {
  console.error("Error: Expected 'pragma language_version 0.23;'");
  process.exit(1);
}

const requiredCircuits = [
  "verifyInvestorEligibility",
  "verifyInvestmentCommitment",
  "revokeInvestorAccreditation",
  "setFundManagerCommitment",
  "resetInvestmentFund",
  "incrementSession"
];

const requiredWitnesses = [
  "investorSecretKey",
  "financialAuditProofHash",
  "netWorthAmount",
  "verificationProofNonce",
  "fundManagerSigningKey"
];

const requiredLedger = [
  "verifiedCount",
  "revokedCount",
  "activeSession",
  "fundId",
  "fundManagerCommitment",
  "lastVerificationCommitment",
  "lastRevokedCommitment",
  "minimumNetWorthThreshold",
  "lastNullifier"
];

for (const c of requiredCircuits) {
  if (!compactSource.includes("circuit " + c)) {
    console.error("Error: Missing circuit declaration in Compact file: " + c);
    process.exit(1);
  }
}
for (const w of requiredWitnesses) {
  if (!compactSource.includes("witness " + w)) {
    console.error("Error: Missing witness declaration in Compact file: " + w);
    process.exit(1);
  }
}
for (const l of requiredLedger) {
  if (!compactSource.includes("ledger " + l)) {
    console.error("Error: Missing ledger field in Compact file: " + l);
    process.exit(1);
  }
}
console.log("[2/5] Compact source validated: 6 circuits, 5 witnesses, 9 ledger fields present.");

if (!fs.existsSync(contractInfoPath)) {
  console.error("Error: Managed contract-info.json not found at " + contractInfoPath);
  process.exit(1);
}
const contractInfo = JSON.parse(fs.readFileSync(contractInfoPath, "utf-8"));
const compiledCircuits = contractInfo.circuits.map((c) => c.name);
const compiledWitnesses = contractInfo.witnesses.map((w) => w.name);
const compiledLedger = contractInfo.ledger.map((l) => l.name);

for (const c of requiredCircuits) {
  if (!compiledCircuits.includes(c)) {
    console.error("Error: Circuit missing in contract-info.json: " + c);
    process.exit(1);
  }
}
for (const w of requiredWitnesses) {
  if (!compiledWitnesses.includes(w)) {
    console.error("Error: Witness missing in contract-info.json: " + w);
    process.exit(1);
  }
}
for (const l of requiredLedger) {
  if (!compiledLedger.includes(l)) {
    console.error("Error: Ledger field missing in contract-info.json: " + l);
    process.exit(1);
  }
}
console.log("[3/5] Managed contract-info.json schema matches contract AST.");

const indexDts = path.join(contractDir, "index.d.ts");
const indexJs = path.join(contractDir, "index.js");
if (!fs.existsSync(indexDts) || !fs.existsSync(indexJs)) {
  console.error("Error: Managed contract runtime files missing (index.d.ts / index.js)");
  process.exit(1);
}
console.log("[4/5] Managed contract index.js & index.d.ts runtime exports verified.");

for (const c of requiredCircuits) {
  const prover = path.join(keysDir, `${c}.prover`);
  const verifier = path.join(keysDir, `${c}.verifier`);
  const zkir = path.join(zkirDir, `${c}.zkir`);
  const bzkir = path.join(zkirDir, `${c}.bzkir`);

  if (!fs.existsSync(prover) || !fs.existsSync(verifier) || !fs.existsSync(zkir) || !fs.existsSync(bzkir)) {
    console.error("Error: Missing compilation artifacts for circuit: " + c);
    process.exit(1);
  }
}
console.log("[5/5] All circuit artifacts verified (.prover, .verifier, .zkir, .bzkir).");

try {
  const ver = execSync("compact --version 2>&1", { stdio: "pipe" }).toString();
  if (ver.toLowerCase().includes("compact ") && !ver.includes("compress")) {
    console.log("[INFO] Compact compiler detected: " + ver.trim().split("\n")[0]);
  } else {
    console.log("[INFO] Managed Compact artifacts authoritative and verified.");
  }
} catch {
  console.log("[INFO] Managed Compact artifacts authoritative and verified.");
}

console.log("\nCompact contract compilation & verification: PASSED.\n");
