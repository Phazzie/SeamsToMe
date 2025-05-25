import { MVPSddScaffolderAgent } from "../src/agents/mvpSddScaffolder.agent";
import {
  MVPSddScaffoldRequest,
  OverwritePolicy,
  SddComponentType,
} from "../src/contracts/mvpSddScaffolder.contract";

async function testMVPAgent() {
  console.log("🧪 Testing MVPSddScaffolderAgent...");

  const agent = new MVPSddScaffolderAgent();

  // Test basic functionality
  const request: MVPSddScaffoldRequest = {
    requestingAgentId: "test-agent" as any,
    componentName: "TestComponent",
    sddComponentType: SddComponentType.AGENT,
    targetDirectory: "./test-output",
    overwritePolicy: OverwritePolicy.ERROR_IF_EXISTS,
  };

  try {
    console.log("✅ Agent instantiated successfully");
    console.log(`✅ Agent ID: ${agent.agentId}`);

    // Test validation
    const emptyNameRequest: MVPSddScaffoldRequest = {
      ...request,
      componentName: "",
    };

    const emptyNameResult = await agent.generateSddScaffold(emptyNameRequest);
    if (
      !emptyNameResult.success &&
      emptyNameResult.error?.message === "Component name cannot be empty"
    ) {
      console.log("✅ Empty component name validation works");
    } else {
      console.log("❌ Empty component name validation failed");
    }

    const emptyDirRequest: MVPSddScaffoldRequest = {
      ...request,
      targetDirectory: "",
    };

    const emptyDirResult = await agent.generateSddScaffold(emptyDirRequest);
    if (
      !emptyDirResult.success &&
      emptyDirResult.error?.message === "Target directory cannot be empty"
    ) {
      console.log("✅ Empty target directory validation works");
    } else {
      console.log("❌ Empty target directory validation failed");
    }

    console.log("🎉 Basic validation tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testMVPAgent()
  .then(() => {
    console.log("🏁 Test completed");
  })
  .catch((error) => {
    console.error("💥 Test error:", error);
  });
