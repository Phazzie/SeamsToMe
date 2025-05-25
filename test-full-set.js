// Test FULL_AGENT_SET functionality
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function testFullAgentSet() {
  console.log("🧪 Testing FULL_AGENT_SET functionality...");

  const agent = new MVPSddScaffolderAgent();
  const componentName = "MyFullSetComponent";
  const targetDirectory = "./src/sandbox-full";

  const request = {
    requestingAgentId: "mock-requesting-agent",
    componentName: componentName,
    sddComponentType: SddComponentType.FULL_AGENT_SET,
    targetDirectory: targetDirectory,
  };

  const result = await agent.generateSddScaffold(request);

  console.log("✅ Test result:", result.success);

  if (result.success) {
    const output = result.result;

    console.log("✅ Generated files count:", output.generatedFiles?.length);
    console.log("Generated files:");
    output.generatedFiles?.forEach((f) => console.log(`  - ${f}`));

    console.log("\nGenerated file contents:");
    output.generatedFileContents?.forEach((f) => {
      console.log(`\n=== ${f.filePath} ===`);
      console.log(f.content.substring(0, 200) + "...");
    });
  } else {
    console.log("❌ Test failed:", result.error);
  }
}

testFullAgentSet().catch(console.error);
