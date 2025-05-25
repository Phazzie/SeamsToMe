// Test exact path matching like the real test
const path = require("path");
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function testExactPaths() {
  const agent = new MVPSddScaffolderAgent();
  const componentName = "MyNewComponent";
  const targetDirectory = "./src/sandbox";

  const request = {
    requestingAgentId: "mock-requesting-agent",
    componentName: componentName,
    sddComponentType: SddComponentType.AGENT,
    targetDirectory: targetDirectory,
    templateVariables: { customVar: "testValue" },
  };

  const result = await agent.generateSddScaffold(request);

  if (result.success) {
    // Replicate test logic exactly
    const expectedComponentDir = path.join(
      targetDirectory,
      componentName.toLowerCase()
    );
    const expectedAgentFilePath = path.join(
      expectedComponentDir,
      `${componentName}.agent.ts`
    );
    const expectedContractFilePath = path.join(
      expectedComponentDir,
      `${componentName}.contract.ts`
    );

    console.log("=== EXPECTED (from test logic) ===");
    console.log("expectedComponentDir:", expectedComponentDir);
    console.log("expectedAgentFilePath:", expectedAgentFilePath);
    console.log("expectedContractFilePath:", expectedContractFilePath);

    console.log("\n=== ACTUAL (from our agent) ===");
    console.log("generatedFiles:", result.result.generatedFiles);

    console.log("\n=== MATCHES ===");
    console.log(
      "Agent path matches:",
      result.result.generatedFiles.includes(expectedAgentFilePath)
    );
    console.log(
      "Contract path matches:",
      result.result.generatedFiles.includes(expectedContractFilePath)
    );
  }
}

testExactPaths().catch(console.error);
