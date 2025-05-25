// Create a simple test script that mimics what Jest would do
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function runSpecificTest() {
  console.log("🧪 Running specific test case...");

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

  // Check the specific test expectations
  console.log("✅ Test result:", result.success);

  if (result.success) {
    const output = result.result;

    // Check basic properties
    console.log(
      "✅ scaffolderAgentId:",
      output.scaffolderAgentId === "MVPSddScaffolderAgent"
    );
    console.log("✅ overallStatus:", output.overallStatus === "success");
    console.log(
      "✅ summaryMessage contains component name:",
      output.summaryMessage?.includes(componentName)
    );
    console.log(
      "✅ generatedFiles length:",
      output.generatedFiles?.length === 2
    );

    // Check file paths
    const expectedAgentPath = `${targetDirectory}\\${componentName.toLowerCase()}\\${componentName}.agent.ts`;
    const expectedContractPath = `${targetDirectory}\\${componentName.toLowerCase()}\\${componentName}.contract.ts`;

    console.log(
      "✅ Agent file path correct:",
      output.generatedFiles?.includes(expectedAgentPath.replace(/\\/g, "/"))
    );
    console.log(
      "✅ Contract file path correct:",
      output.generatedFiles?.includes(expectedContractPath.replace(/\\/g, "/"))
    );

    // Check content
    if (output.generatedFileContents) {
      const agentContent =
        output.generatedFileContents.find((f) =>
          f.filePath.includes(".agent.ts")
        )?.content || "";
      const contractContent =
        output.generatedFileContents.find((f) =>
          f.filePath.includes(".contract.ts")
        )?.content || "";

      console.log(
        "✅ Agent class export:",
        agentContent.includes(`export class ${componentName}Agent`)
      );
      console.log(
        "✅ Agent placeholder:",
        agentContent.includes(`// Placeholder for ${componentName}Agent`)
      );
      console.log(
        "✅ Agent contains component name:",
        agentContent.includes(componentName)
      );
      console.log(
        "✅ Agent contains custom var:",
        agentContent.includes("testValue")
      );

      console.log(
        "✅ Contract interface export:",
        contractContent.includes(`export interface I${componentName}Agent`)
      );
      console.log(
        "✅ Contract comment:",
        contractContent.includes(`// Contract for ${componentName}`)
      );
      console.log(
        "✅ Contract contains component name:",
        contractContent.includes(componentName)
      );
      console.log(
        "✅ Contract contains custom var:",
        contractContent.includes("testValue")
      );
    }
  } else {
    console.log("❌ Test failed:", result.error);
  }
}

runSpecificTest().catch(console.error);
