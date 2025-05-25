// Direct contract validation without Jest
const fs = require("fs");
const path = require("path");

// Import the agent
const {
  MVPSddScaffolderAgent,
} = require("./src/agents/mvpSddScaffolder.agent.ts");

async function validateContracts() {
  console.log("=== MVPSddScaffolder Contract Validation ===\n");

  const agent = new MVPSddScaffolderAgent();
  let passCount = 0;
  let failCount = 0;

  // Test cases that mirror the contract tests
  const tests = [
    {
      name: "AGENT type generates agent and contract files",
      test: async () => {
        const request = {
          componentName: "TestAgent",
          componentType: "AGENT",
          outputPath: "./sandbox",
          customVariables: {},
        };

        const result = await agent.processRequest(request);

        // Check files were created
        const agentPath = path.join("./sandbox", "testAgent.agent.ts");
        const contractPath = path.join("./sandbox", "testAgent.contract.ts");

        const agentExists = fs.existsSync(agentPath);
        const contractExists = fs.existsSync(contractPath);

        if (!agentExists) throw new Error("Agent file not created");
        if (!contractExists) throw new Error("Contract file not created");

        // Check content
        const agentContent = fs.readFileSync(agentPath, "utf8");
        const contractContent = fs.readFileSync(contractPath, "utf8");

        if (!agentContent.includes("export class TestAgentAgent")) {
          throw new Error("Agent class not found in agent file");
        }
        if (!contractContent.includes("export interface ITestAgentAgent")) {
          throw new Error("Interface not found in contract file");
        }

        console.log("✓ AGENT type test passed");
        return true;
      },
    },
    {
      name: "FULL_AGENT_SET type generates all files",
      test: async () => {
        const request = {
          componentName: "FullAgent",
          componentType: "FULL_AGENT_SET",
          outputPath: "./sandbox",
          customVariables: {},
        };

        const result = await agent.processRequest(request);

        // Check all files were created
        const agentPath = path.join("./sandbox", "fullAgent.agent.ts");
        const contractPath = path.join("./sandbox", "fullAgent.contract.ts");
        const testPath = path.join("./sandbox", "fullAgent.contract.test.ts");

        const agentExists = fs.existsSync(agentPath);
        const contractExists = fs.existsSync(contractPath);
        const testExists = fs.existsSync(testPath);

        if (!agentExists) throw new Error("Agent file not created");
        if (!contractExists) throw new Error("Contract file not created");
        if (!testExists) throw new Error("Test file not created");

        console.log("✓ FULL_AGENT_SET type test passed");
        return true;
      },
    },
    {
      name: "CONTRACT type generates only contract file",
      test: async () => {
        const request = {
          componentName: "OnlyContract",
          componentType: "CONTRACT",
          outputPath: "./sandbox",
          customVariables: {},
        };

        const result = await agent.processRequest(request);

        // Check only contract file was created
        const contractPath = path.join("./sandbox", "onlyContract.contract.ts");
        const agentPath = path.join("./sandbox", "onlyContract.agent.ts");

        const contractExists = fs.existsSync(contractPath);
        const agentExists = fs.existsSync(agentPath);

        if (!contractExists) throw new Error("Contract file not created");
        if (agentExists)
          throw new Error("Agent file should not be created for CONTRACT type");

        console.log("✓ CONTRACT type test passed");
        return true;
      },
    },
    {
      name: "TEST type generates only test file",
      test: async () => {
        const request = {
          componentName: "OnlyTest",
          componentType: "TEST",
          outputPath: "./sandbox",
          customVariables: {},
        };

        const result = await agent.processRequest(request);

        // Check only test file was created
        const testPath = path.join("./sandbox", "onlyTest.contract.test.ts");
        const agentPath = path.join("./sandbox", "onlyTest.agent.ts");

        const testExists = fs.existsSync(testPath);
        const agentExists = fs.existsSync(agentPath);

        if (!testExists) throw new Error("Test file not created");
        if (agentExists)
          throw new Error("Agent file should not be created for TEST type");

        console.log("✓ TEST type test passed");
        return true;
      },
    },
    {
      name: "Custom variables are substituted",
      test: async () => {
        const request = {
          componentName: "CustomVar",
          componentType: "AGENT",
          outputPath: "./sandbox",
          customVariables: { testVar: "customValue" },
        };

        const result = await agent.processRequest(request);

        const agentPath = path.join("./sandbox", "customVar.agent.ts");
        const content = fs.readFileSync(agentPath, "utf8");

        if (content.includes("{{testVar}}")) {
          throw new Error("Custom variable not substituted");
        }

        console.log("✓ Custom variables test passed");
        return true;
      },
    },
  ];

  // Create sandbox directory
  if (!fs.existsSync("./sandbox")) {
    fs.mkdirSync("./sandbox", { recursive: true });
  }

  // Run tests
  for (const test of tests) {
    try {
      await test.test();
      passCount++;
    } catch (error) {
      console.log(`✗ ${test.name}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${passCount + failCount}`);

  if (failCount === 0) {
    console.log("\n🎉 All contract validations passed!");
  } else {
    console.log(`\n❌ ${failCount} contract validations failed.`);
  }
}

validateContracts().catch(console.error);
