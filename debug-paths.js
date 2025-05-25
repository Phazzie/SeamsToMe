// Debug the path issue
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function debugPaths() {
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
    console.log("Generated files:");
    result.result.generatedFiles.forEach((f) => console.log(`  "${f}"`));

    console.log("\nExpected paths:");
    console.log(
      `  "${targetDirectory}\\${componentName.toLowerCase()}\\${componentName}.agent.ts"`
    );
    console.log(
      `  "${targetDirectory}\\${componentName.toLowerCase()}\\${componentName}.contract.ts"`
    );

    console.log("\nExpected paths (forward slash):");
    console.log(
      `  "${targetDirectory}/${componentName.toLowerCase()}/${componentName}.agent.ts"`
    );
    console.log(
      `  "${targetDirectory}/${componentName.toLowerCase()}/${componentName}.contract.ts"`
    );
  }
}

debugPaths().catch(console.error);
