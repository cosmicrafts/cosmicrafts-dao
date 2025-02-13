import { createAgent as createAgentUtils } from "@dfinity/utils";
import { HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { LedgerCanister, AccountIdentifier } from "@dfinity/ledger-icp";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ✅ Load Secrets from `.env`
const MINTER_PUBLIC_KEY = process.env.MINTER_PUBLIC_KEY;
const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY;
const RECIPIENT_ACCOUNT_ID = process.env.RECIPIENT_ACCOUNT_ID;
const ICP_AMOUNT = BigInt(process.env.ICP_AMOUNT) || 500n;
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Mainnet Ledger Canister
const HOST = "http://127.0.0.1:8080"; // Change if using a testnet

// ✅ Convert Base64 Key to Uint8Array
const base64ToUInt8Array = (base64String) => {
  return Uint8Array.from(Buffer.from(base64String, "base64"));
};

// ✅ Create Identity from Key Pair
const getMinterAgent = async () => {
  const identity = Ed25519KeyIdentity.fromKeyPair(
    base64ToUInt8Array(MINTER_PUBLIC_KEY),
    base64ToUInt8Array(MINTER_PRIVATE_KEY)
  );

  return await createAgentUtils({
    host: HOST,
    identity,
    fetchRootKey: true,
  });
};

// ✅ Get Minter Account Balance
export const getMinterIcpBalance = async () => {
  const agent = await getMinterAgent();
  const ledgerCanister = LedgerCanister.create({ agent });

  const minterPrincipal = agent.identity.getPrincipal();
  const minterAccountId = AccountIdentifier.fromPrincipal(minterPrincipal).toHex();

  return ledgerCanister.accountBalance({
    accountIdentifier: AccountIdentifier.fromHex(minterAccountId),
    certified: false,
  });
};

// ✅ Send ICP Transfer
export const sendIcp = async () => {
  try {
    const agent = await getMinterAgent();
    const ledgerCanister = LedgerCanister.create({ agent });

    const amountE8s = ICP_AMOUNT * BigInt(10 ** 8);

    console.log(`🔄 Sending ${ICP_AMOUNT} ICP (${amountE8s} e8s) to ${RECIPIENT_ACCOUNT_ID}...`);

    const transferResult = await ledgerCanister.transfer({
      to: AccountIdentifier.fromHex(RECIPIENT_ACCOUNT_ID),
      amount: amountE8s,
    });

    console.log("✅ ICP Transfer Successful! Transaction Block Height:", transferResult);
  } catch (error) {
    console.error("❌ Error sending ICP:", error);
  }
};

// ✅ Run the Transfer
sendIcp();
