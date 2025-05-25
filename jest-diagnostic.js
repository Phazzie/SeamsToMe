// Quick Jest diagnostic
const { execSync } = require("child_process");

console.log("🔍 Jest Environment Diagnostic");

try {
  console.log("1. Node.js version:", process.version);

  console.log("2. Checking npm packages...");
  const packageJson = require("./package.json");
  console.log(
    "   Jest version:",
    packageJson.devDependencies?.jest || "Not found"
  );
  console.log(
    "   TypeScript:",
    packageJson.devDependencies?.typescript || "Not found"
  );

  console.log("3. Checking Jest config...");
  try {
    const jestConfig = require("./jest.config.js");
    console.log("   Config loaded successfully");
    console.log("   Transform:", jestConfig.transform ? "Yes" : "No");
  } catch (e) {
    console.log("   Jest config error:", e.message);
  }

  console.log("4. Testing simple require...");
  console.log("   Path module:", require("path") ? "OK" : "Failed");
  console.log("   FS module:", require("fs") ? "OK" : "Failed");

  console.log("✅ Basic environment check complete");
} catch (error) {
  console.error("❌ Environment check failed:", error.message);
}
