// Direct Jest test execution
const jest = require("jest");

console.log("🧪 Attempting direct Jest execution...");

// Simple test configuration
const config = {
  testMatch: ["**/minimal-test.test.js"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};

jest
  .runCLI(config, [process.cwd()])
  .then((results) => {
    console.log("✅ Jest execution completed");
    console.log("Results:", results);
  })
  .catch((error) => {
    console.error("❌ Jest execution failed:", error.message);
  });
