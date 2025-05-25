// Simple test to verify MVPSddScaffolderAgent is working
async function testAgent() {
  try {
    console.log("Checking if TypeScript compiles...");
    const { execSync } = require("child_process");
    execSync("npx tsc --noEmit src/agents/mvpSddScaffolder.agent.ts", {
      cwd: process.cwd(),
    });
    console.log("✅ TypeScript compilation successful");

    console.log("Test passed: Agent file is syntactically valid");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testAgent();
