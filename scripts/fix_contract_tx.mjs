import fs from "fs";

let code = fs.readFileSync("src/lib/contract.ts", "utf8");

const oldLine = `    const txHash = rawTxResult?.public?.txHash || rawTxResult?.txHash || rawTxResult?.hash || CANONICAL_DEPLOYMENT.txHash;`;
const newLine = `    const txHash = rawTxResult?.public?.txHash || rawTxResult?.txHash || rawTxResult?.hash || rawTxResult?.txId || rawTxResult?.public?.txId || CANONICAL_DEPLOYMENT.txHash;`;

code = code.replace(oldLine, newLine);
fs.writeFileSync("src/lib/contract.ts", code, "utf8");
console.log("src/lib/contract.ts fixed");
