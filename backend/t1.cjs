const path = require("path");

// Ensure the project .env does NOT leak into this test.
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env.does-not-exist") });

process.env.MONGODB_URI = "";
process.env.USE_MEMORY_DB = "";

const { connectDB, describeMongoUri, maskMongoUri } = require("./dist/config/db.js");

(async () => {
  // 1. Missing MONGODB_URI must fail loudly.
  try {
    await connectDB();
    console.log("FAIL: connectDB resolved without MONGODB_URI");
    process.exitCode = 1;
  } catch (err) {
    console.log("OK  : missing MONGODB_URI ->", err.message.slice(0, 90) + "...");
  }

  // 2. describeMongoUri / maskMongoUri sanity checks.
  const srv = "mongodb+srv://user:pass@cluster.example.net/xaviour?retryWrites=true&w=majority";
  const local = "mongodb://127.0.0.1:27017/xaviourbeautystore";
  const noDb = "mongodb://127.0.0.1:27017";

  console.log("OK  : atlas  ->", JSON.stringify(describeMongoUri(srv)));
  console.log("OK  : local  ->", JSON.stringify(describeMongoUri(local)));
  console.log("OK  : no-db  ->", JSON.stringify(describeMongoUri(noDb)));
  console.log("OK  : mask   ->", maskMongoUri(srv));
  console.log("OK  : mask-no-creds ->", maskMongoUri(local));

  const checks = [
    [describeMongoUri(srv).database === "xaviour", "atlas db name"],
    [describeMongoUri(srv).host === "cluster.example.net", "atlas host"],
    [describeMongoUri(srv).source === "MongoDB Atlas (SRV)", "atlas source"],
    [describeMongoUri(local).database === "xaviourbeautystore", "local db name"],
    [describeMongoUri(local).source === "Local MongoDB", "local source"],
    [describeMongoUri(noDb).database === "(default)", "missing db name"],
    [!maskMongoUri(srv).includes("pass"), "mask removes password"],
    [!maskMongoUri(srv).includes("user"), "mask removes username"],
    [maskMongoUri(local) === local, "mask leaves credentialless uri intact"],
  ];
  let failed = 0;
  for (const [ok, label] of checks) {
    if (!ok) {
      failed++;
      console.log("FAIL:", label);
    }
  }
  console.log(failed === 0 ? "ALL PARSER CHECKS PASSED" : `${failed} CHECK(S) FAILED`);
  process.exitCode = failed === 0 ? 0 : 1;
})();
