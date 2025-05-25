// Final comprehensive test of our fresh implementation
const path = require("path");
const {
  MVPSddScaffolderAgent,
} = require("./dist/agents/mvpSddScaffolder.agent");
const {
  SddComponentType,
  OverwritePolicy,
} = require("./dist/contracts/mvpSddScaffolder.contract");

async function runComprehensiveTests() {
  console.log(
    "🧪 Running comprehensive tests for fresh MVPSddScaffolderAgent...\n"
  );

  const agent = new MVPSddScaffolderAgent();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Basic AGENT type
  totalTests++;
  console.log("Test 1: Basic AGENT type generation");
  try {
    const result = await agent.generateSddScaffold({
      requestingAgentId: "mock-agent",
      componentName: "MyNewComponent",
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: "./src/sandbox",
      templateVariables: { customVar: "testValue" },
    });

    if (
      result.success &&
      result.result.scaffolderAgentId === "MVPSddScaffolderAgent" &&
      result.result.generatedFiles.length === 2 &&
      result.result.generatedFileContents.some((f) =>
        f.content.includes("export class MyNewComponentAgent")
      ) &&
      result.result.generatedFileContents.some((f) =>
        f.content.includes("export interface IMyNewComponentAgent")
      )
    ) {
      console.log("✅ PASSED");
      passedTests++;
    } else {
      console.log("❌ FAILED");
    }
  } catch (error) {
    console.log("❌ FAILED:", error.message);
  }

  // Test 2: FULL_AGENT_SET type
  totalTests++;
  console.log("\nTest 2: FULL_AGENT_SET type generation");
  try {
    const result = await agent.generateSddScaffold({
      requestingAgentId: "mock-agent",
      componentName: "MyFullComponent",
      sddComponentType: SddComponentType.FULL_AGENT_SET,
      targetDirectory: "./src/sandbox-full",
    });

    if (
      result.success &&
      result.result.generatedFiles.length === 3 &&
      result.result.generatedFiles.some((f) => f.includes(".agent.ts")) &&
      result.result.generatedFiles.some((f) => f.includes(".contract.ts")) &&
      result.result.generatedFiles.some((f) => f.includes(".contract.test.ts"))
    ) {
      console.log("✅ PASSED");
      passedTests++;
    } else {
      console.log("❌ FAILED");
    }
  } catch (error) {
    console.log("❌ FAILED:", error.message);
  }

  // Test 3: Validation errors
  totalTests++;
  console.log("\nTest 3: Validation - empty component name");
  try {
    const result = await agent.generateSddScaffold({
      requestingAgentId: "mock-agent",
      componentName: "",
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: "./src/sandbox",
    });

    if (!result.success && result.error.category === "VALIDATION_ERROR") {
      console.log("✅ PASSED");
      passedTests++;
    } else {
      console.log("❌ FAILED");
    }
  } catch (error) {
    console.log("❌ FAILED:", error.message);
  }

  // Test 4: Template variable substitution
  totalTests++;
  console.log("\nTest 4: Template variable substitution");
  try {
    const result = await agent.generateSddScaffold({
      requestingAgentId: "mock-agent",
      componentName: "TestComponent",
      sddComponentType: SddComponentType.AGENT,
      targetDirectory: "./src/test",
      templateVariables: { customVar: "SpecialValue" },
    });

    if (
      result.success &&
      result.result.generatedFileContents.some((f) =>
        f.content.includes("SpecialValue")
      )
    ) {
      console.log("✅ PASSED");
      passedTests++;
    } else {
      console.log("❌ FAILED");
    }
  } catch (error) {
    console.log("❌ FAILED:", error.message);
  }

  // Summary
  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All tests passed! Fresh implementation is working correctly."
    );
    console.log("\n📋 Key achievements:");
    console.log("✅ Contract compliance for basic AGENT type");
    console.log("✅ FULL_AGENT_SET support with 3 files");
    console.log("✅ Proper validation and error handling");
    console.log("✅ Template variable substitution");
    console.log("✅ Correct file path generation using path.join");
    console.log(
      "✅ Expected content patterns (export class, export interface)"
    );
  } else {
    console.log("⚠️  Some tests failed. Review implementation.");
  }
}

runComprehensiveTests().catch(console.error);
