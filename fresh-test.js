// Simple test runner to bypass Jest hanging issues
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function runBasicTest() {
  console.log("🧪 Testing fresh MVPSddScaffolderAgent implementation...");

  const agent = new MVPSddScaffolderAgent();

  const request = {
    requestingAgentId: "test-agent",
    componentName: "TestComponent",
    sddComponentType: SddComponentType.AGENT,
    targetDirectory: "./test-sandbox",
    templateVariables: { customVar: "testValue" },
  };

  try {
    const result = await agent.generateSddScaffold(request);

    console.log("✅ Test completed successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("🎉 Success case working!");
      console.log("Generated files:", result.result?.generatedFiles);
      console.log("Summary:", result.result?.summaryMessage);
    } else {
      console.log("❌ Unexpected failure:", result.error?.message);
    }
  } catch (error) {
    console.error("💥 Exception thrown:", error);
  }
}

runBasicTest().catch(console.error);
