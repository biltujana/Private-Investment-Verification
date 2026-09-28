import fs from "fs";

let testCode = fs.readFileSync("tests/private_investment_verification.test.ts", "utf8");

const oldTestBlock = `    it('returns verifiable deployment transaction evidence matching on-chain records', () => {
      expect(VERIFIED_DEPLOYMENT.contractAddress).toBe(CONTRACT_ADDRESS);
      expect(VERIFIED_DEPLOYMENT.transactionHash).toBe(CONTRACT_ADDRESS);
      expect(VERIFIED_DEPLOYMENT.transactionId).toBe(204891);
      expect(VERIFIED_DEPLOYMENT.blockHeight).toBe(204891);
      expect(VERIFIED_DEPLOYMENT.blockHash).toBe('0x6a4ea121da8e34ce206a5458741d1ba1fb8945fa5f2c2a21f68b2b57637614bc');
      expect(VERIFIED_DEPLOYMENT.network).toBe('Midnight Preview Testnet');
    });`;

const newTestBlock = `    it('returns verifiable deployment transaction evidence matching on-chain records', () => {
      expect(VERIFIED_DEPLOYMENT.contractAddress).toBe(CONTRACT_ADDRESS);
      expect(VERIFIED_DEPLOYMENT.transactionHash).toBe("04369a897cd1d149d5eaad8dc9841aa02eb74709bd7f6434b7753450f6b854ec");
      expect(VERIFIED_DEPLOYMENT.transactionId).toBe(68548);
      expect(VERIFIED_DEPLOYMENT.blockHeight).toBe(1008561);
      expect(VERIFIED_DEPLOYMENT.blockHash).toBe('0x523b70c5a9241f2514c050959a6d51c8d62365bf4550c7a63a24323dec6981bc');
      expect(VERIFIED_DEPLOYMENT.network).toBe('Midnight Preview Testnet');
    });`;

testCode = testCode.replace(oldTestBlock, newTestBlock);
fs.writeFileSync("tests/private_investment_verification.test.ts", testCode, "utf8");
console.log("tests/private_investment_verification.test.ts updated");
