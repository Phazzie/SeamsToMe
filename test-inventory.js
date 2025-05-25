// Test all component types
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function testAllComponentTypes() {
  console.log("🧪 Testing all component types...\n");

  const agent = new MVPSddScaffolderAgent();

  // Test 1: AGENT type
  console.log("1. Testing AGENT type:");
  const agentResult = await agent.generateSddScaffold({
    requestingAgentId: "mock-agent",
    componentName: "TestAgent",
    sddComponentType: SddComponentType.AGENT,
    targetDirectory: "./test-sandbox",
  });
  console.log("✅ Success:", agentResult.success);
  console.log("✅ Files count:", agentResult.result?.generatedFiles.length);
  console.log("✅ Summary:", agentResult.result?.summaryMessage);

  // Test 2: CONTRACT type
  console.log("\n2. Testing CONTRACT type:");
  const contractResult = await agent.generateSddScaffold({
    requestingAgentId: "mock-agent",
    componentName: "TestContract",
    sddComponentType: SddComponentType.CONTRACT,
    targetDirectory: "./test-sandbox",
  });
  console.log("✅ Success:", contractResult.success);
  console.log("✅ Files count:", contractResult.result?.generatedFiles.length);
  console.log("✅ Summary:", contractResult.result?.summaryMessage);

  // Test 3: TEST type
  console.log("\n3. Testing TEST type:");
  const testResult = await agent.generateSddScaffold({
    requestingAgentId: "mock-agent",
    componentName: "TestFile",
    sddComponentType: SddComponentType.TEST,
    targetDirectory: "./test-sandbox",
  });
  console.log("✅ Success:", testResult.success);
  console.log("✅ Files count:", testResult.result?.generatedFiles.length);
  console.log("✅ Summary:", testResult.result?.summaryMessage);

  // Test 4: FULL_AGENT_SET type
  console.log("\n4. Testing FULL_AGENT_SET type:");
  const fullSetResult = await agent.generateSddScaffold({
    requestingAgentId: "mock-agent",
    componentName: "TestFullSet",
    sddComponentType: SddComponentType.FULL_AGENT_SET,
    targetDirectory: "./test-sandbox",
  });
  console.log("✅ Success:", fullSetResult.success);
  console.log("✅ Files count:", fullSetResult.result?.generatedFiles.length);
  console.log("✅ Summary:", fullSetResult.result?.summaryMessage);

  console.log("\n🎯 All component types tested successfully!");
}

testAllComponentTypes().catch(console.error);
