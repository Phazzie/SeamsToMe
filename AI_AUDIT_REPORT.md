# AI Usage and Heuristics Audit Report
**Project:** SeamsToMe
**Date:** 2025-11-06
**Auditor:** Claude Code

---

## Executive Summary

This audit examined the SeamsToMe codebase for AI integration and identified opportunities to replace hardcoded heuristics with AI-driven intelligence. Of 14 agents analyzed, only 4 use AI effectively. 10 agents rely on hardcoded templates, regex patterns, and simple string matching that should be replaced with AI.

**Key Findings:**
- ✅ AI service correctly uses `grok-beta` model via xAI
- ❌ No retry logic or timeout handling in AI service
- ❌ 71% of agents (10/14) don't use AI at all
- ❌ 500+ lines of hardcoded templates should be AI-generated
- ❌ Multiple regex/string matching patterns should use AI classification

---

## Part 1: AI Service Configuration & Usage

### 1.1 AI Service Configuration

**File:** `/home/user/SeamsToMe/src/services/ai.service.ts`

#### ✅ CORRECT Configurations
- **Model:** `grok-beta` (line 32) ✅ VERIFIED
- **Endpoint:** `https://api.x.ai/v1` (line 44) ✅ CORRECT
- **API Key:** Environment variable `XAI_API_KEY` ✅ CORRECT
- **Error Handling:** Uses ContractResult pattern ✅ CORRECT
- **Methods Implemented:**
  - `complete()` - Basic text completion
  - `semanticSearch()` - AI-powered document ranking
  - `classify()` - Text classification
  - `analyze()` - Code/content analysis

#### ❌ MISSING Features

| Feature | Status | Line | Severity | Recommendation |
|---------|--------|------|----------|----------------|
| **Retry Logic** | ❌ Missing | N/A | **HIGH** | Add exponential backoff retry (3-5 attempts) |
| **Timeout Configuration** | ❌ Missing | N/A | **MEDIUM** | Add configurable timeout (default 30s) |
| **Rate Limiting** | ❌ Missing | N/A | **MEDIUM** | Add rate limit handling |
| **Model Override** | ⚠️ Partial | 32 | **LOW** | Allow `XAI_MODEL` env var to override default |
| **Streaming Support** | ❌ Missing | N/A | **LOW** | Consider adding streaming for long responses |

#### Recommended Fixes

```typescript
// Add to AIService class
private readonly maxRetries = 3;
private readonly timeoutMs = 30000;
private readonly retryDelay = 1000;

async complete(request: AIRequest): Promise<ContractResult<AIResponse>> {
  let lastError: Error;

  for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await this.client.chat.completions.create({
        model: process.env.XAI_MODEL || this.defaultModel, // Allow override
        messages,
        max_tokens: request.maxTokens || this.defaultMaxTokens,
        temperature: request.temperature || 0.7,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return success(response);
    } catch (error: any) {
      lastError = error;

      // Don't retry on validation errors
      if (error.code === 'invalid_request_error') {
        return failure(createAgentError(...));
      }

      // Exponential backoff
      if (attempt < this.maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  return failure(createAgentError(..., lastError));
}
```

---

### 1.2 Agent AI Usage Analysis

| Agent | Uses AI? | AI Service Injection | Error Handling | Fallback Strategy | Status |
|-------|----------|---------------------|----------------|-------------------|--------|
| **AnalyzerAgent** | ✅ Yes | Constructor param | ✅ Proper | ❌ Hard fails | ✅ CORRECT |
| **ChecklistAgent** | ✅ Yes | Constructor param | ✅ Proper | ✅ Heuristic fallback | ⚠️ PARTIAL |
| **RefactorAgent** | ✅ Yes | Constructor param | ✅ Proper | ❌ Hard fails | ✅ CORRECT |
| **KnowledgeAgent** | ✅ Yes | Constructor param | ✅ Proper | ✅ Keyword fallback | ⚠️ PARTIAL |
| **OrchestratorAgent** | ❌ No | N/A | N/A | N/A | ❌ NOT NEEDED |
| **ChangelogAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **DocumentationAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **ScaffoldAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **MVPSddScaffolderAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **QualityAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **PrdAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **PromptAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **PairAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |
| **ApiReaderAgent** | ❌ No | N/A | N/A | N/A | ❌ SHOULD USE |

**Summary:**
- ✅ Correct: 2 agents (14%)
- ⚠️ Partial: 2 agents (14%)
- ❌ Should Use AI: 9 agents (64%)
- ❌ No AI Needed: 1 agent (7%)

---

### 1.3 Hardcoded Model Names

**Search Results:** No hardcoded model names found outside of AI service configuration ✅

All agents properly use the injected AI service rather than calling APIs directly.

---

## Part 2: Heuristics That Should Use AI

### 2.1 HIGH SEVERITY - Core Features

#### 🔴 FINDING #1: ScaffoldAgent - 400+ Lines of Hardcoded Templates

**File:** `/home/user/SeamsToMe/src/agents/scaffold.agent.ts`
**Lines:** 96-493
**Type:** Template Generation + Pattern Matching

**Current Implementation:**
```typescript
// Lines 125-136: Hardcoded regex for component name extraction
private extractComponentName(designDoc: string, targetPath: string): string {
  const docNameMatch = designDoc.match(/component[:\s]+([a-zA-Z0-9_-]+)/i);
  if (docNameMatch) {
    return docNameMatch[1];
  }
  const pathParts = targetPath.split(/[/\\]/);
  return lastPart || "Component";
}

// Lines 141-158: Hardcoded structure determination
private determineFileStructure(designDoc: string, format: StubFormat): string[] {
  if (format === StubFormat.TYPESCRIPT) {
    structure.push("index", "types", "utils");
    if (designDoc.toLowerCase().includes("test")) {
      structure.push("test");
    }
    if (designDoc.toLowerCase().includes("style") || designDoc.toLowerCase().includes("css")) {
      structure.push("styles");
    }
  }
}

// Lines 240-265: Hardcoded TypeScript template
private generateTypeScriptComponent(componentName: string, designDoc: string): string {
  return `/**
 * ${className} Component
 * Generated from design document
 * ...
 */
export interface ${className}Props {
  // TODO: Define component props based on design requirements
}
...`;
}
```

**Problems:**
- ❌ Regex pattern matching for names - brittle, fails on variations
- ❌ Simple string.includes() for feature detection - misses context
- ❌ Hardcoded templates - not adaptable to design doc content
- ❌ No understanding of design doc structure/intent
- ❌ Generic TODO comments instead of specific guidance

**Recommended AI-Driven Replacement:**

```typescript
private async extractComponentInfo(
  designDoc: string,
  targetPath: string,
  aiService: IAIService
): Promise<{
  name: string;
  structure: string[];
  props: string[];
  methods: string[];
}> {
  const analysisResult = await aiService.analyze({
    content: designDoc,
    analysisType: "design",
    instructions: `Analyze this design document and extract:
1. Component name (from design doc or path: ${targetPath})
2. Required file structure (what files should be created)
3. Component properties/configuration
4. Methods/functions to implement

Return JSON:
{
  "name": "ComponentName",
  "structure": ["index", "types", "utils"],
  "props": ["prop1: type", "prop2: type"],
  "methods": ["method1(): void", "method2(param: string): Result"]
}`
  });

  return analysisResult.success
    ? analysisResult.result.details
    : this.getFallbackInfo(targetPath);
}

private async generateTypeScriptComponent(
  componentInfo: ComponentInfo,
  designDoc: string,
  aiService: IAIService
): Promise<string> {
  const codeResult = await aiService.complete({
    messages: [{
      role: "user",
      content: `Generate a TypeScript component implementation based on:

Component: ${componentInfo.name}
Properties: ${componentInfo.props.join(", ")}
Methods: ${componentInfo.methods.join(", ")}

Design Document:
${designDoc}

Requirements:
- Include JSDoc comments explaining each part
- Add proper TypeScript types
- Include error handling
- Follow SDD patterns
- NO TODO comments - implement or explain what's needed`
    }],
    temperature: 0.3
  });

  return codeResult.success ? codeResult.result.content : this.getTemplateCode();
}
```

**Impact:** HIGH - Core scaffolding feature, affects all component generation
**Effort:** MEDIUM - 2-3 days to refactor
**Priority:** 1 - Replace immediately

---

#### 🔴 FINDING #2: MVPSddScaffolderAgent - Duplicate Template Issues

**File:** `/home/user/SeamsToMe/src/agents/mvpSddScaffolder.agent.ts`
**Lines:** 118-468
**Type:** Template Generation + String Manipulation

**Current Implementation:**
```typescript
// Lines 439-458: Simple string replacement
private substituteTemplate(
  template: string,
  componentName: string,
  templateVariables?: Record<string, string>
): string {
  let result = template;
  result = result.replace(/{{componentName}}/g, componentName);

  if (templateVariables) {
    Object.entries(templateVariables).forEach(([key, value]) => {
      const pascalValue = this.toPascalCase(value);
      result = result.replace(new RegExp(`{{${key}}}`, "g"), pascalValue);
    });
  }
  return result;
}

// Lines 463-467: String transformation
private toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "");
}
```

**Problems:**
- ❌ Templates in code (lines 135-157, 246-282) - should be AI-generated
- ❌ Simple string substitution - no context awareness
- ❌ Regex-based transformations - fragile
- ❌ Duplicates ScaffoldAgent functionality

**Recommended AI-Driven Replacement:**

```typescript
private async generateSddFiles(
  request: MVPSddScaffoldRequest,
  aiService: IAIService
): Promise<GeneratedFiles> {
  // Use AI to generate complete, contextual files
  const result = await aiService.complete({
    messages: [{
      role: "system",
      content: "You are an expert in Seam-Driven Development (SDD). Generate complete, production-ready files."
    }, {
      role: "user",
      content: `Generate SDD files for:

Component: ${request.componentName}
Type: ${request.sddComponentType}
Template Variables: ${JSON.stringify(request.templateVariables)}

Generate:
1. Contract file with complete interface definitions
2. Agent file with proper SDD structure and error handling
3. Test file with comprehensive contract tests

Include:
- Proper TypeScript types
- JSDoc documentation
- Error handling
- SDD patterns and conventions
- Real implementation, not TODOs`
    }],
    temperature: 0.2  // Lower temp for consistent code generation
  });

  // Parse AI response into file structure
  return this.parseGeneratedFiles(result.result.content);
}
```

**Impact:** HIGH - Affects all SDD component scaffolding
**Effort:** MEDIUM - 2-3 days (can reuse ScaffoldAgent AI integration)
**Priority:** 1 - Replace immediately

---

#### 🔴 FINDING #3: DocumentationAgent - 120+ Lines of Hardcoded Templates

**File:** `/home/user/SeamsToMe/src/agents/documentation.agent.ts`
**Lines:** 244-362
**Type:** Template Generation + Classification

**Current Implementation:**
```typescript
// Lines 244-273: Hardcoded markdown template
private generateContractDocumentation(request: DocumentationRequest): string {
  if (request.format === DocumentationFormat.MARKDOWN) {
    return `# Contract Documentation
## Overview

This is a stub contract documentation generated by the Documentation Agent.

## Interface Definition

\`\`\`typescript
interface ContractInterface {
  methodA(): void;
  methodB(param: string): Promise<Result>;
}
\`\`\`
...`;
  }
  return "Contract documentation (format not fully implemented)";
}

// Lines 347-362: File extension-based format detection
private detectFormat(docPath: string): DocumentationFormat {
  const extension = path.extname(docPath).toLowerCase();
  switch (extension) {
    case ".md": return DocumentationFormat.MARKDOWN;
    case ".html": return DocumentationFormat.HTML;
    // ... more cases
  }
}
```

**Problems:**
- ❌ Hardcoded templates ignore actual source content
- ❌ Stub documentation not useful
- ❌ No analysis of contracts/agents to document
- ❌ Simple extension matching instead of content analysis

**Recommended AI-Driven Replacement:**

```typescript
async generateDocumentation(
  request: DocumentationRequest
): Promise<ContractResult<DocumentationResult>> {
  return this.withErrorHandling(async () => {
    if (!this.aiService) {
      return failure(this.createError("AI service required", ...));
    }

    // Read and analyze source files
    const sourceContent = await this.readSources(request.sources);

    // Use AI to generate comprehensive documentation
    const docResult = await this.aiService.analyze({
      content: sourceContent,
      analysisType: request.docType,
      instructions: `Generate comprehensive ${request.docType} documentation.

Sources analyzed:
${request.sources.map(s => s.path).join("\n")}

Content:
${sourceContent}

Generate documentation that:
1. Explains the purpose and functionality
2. Documents all interfaces, methods, and types
3. Includes usage examples
4. Explains data flow and integration points
5. Documents error handling approach
6. Provides migration guidance if applicable

Format: ${request.format}
Style: Professional, comprehensive, accurate`
    });

    if (!docResult.success) {
      return failure(docResult.error);
    }

    return success({
      content: docResult.result.summary,
      format: request.format,
      metadata: {
        generatedOn: new Date(),
        docType: request.docType,
        wordCount: docResult.result.summary.split(/\s+/).length,
        generationTime: 0
      }
    });
  }, "generateDocumentation");
}
```

**Impact:** HIGH - Documentation quality affects maintainability
**Effort:** LOW - 1-2 days
**Priority:** 2 - Replace after scaffolding agents

---

#### 🔴 FINDING #4: ChecklistAgent - Hardcoded Compliance Heuristics

**File:** `/home/user/SeamsToMe/src/agents/checklist.agent.ts`
**Lines:** 256-303
**Type:** Rule-Based Classification

**Current Implementation:**
```typescript
private assessComplianceWithHeuristics(
  category: ChecklistCategory
): { status: ComplianceStatus; details: string; remediation: string } {
  switch (category) {
    case ChecklistCategory.CONTRACT_DEFINITION:
      return {
        status: ComplianceStatus.COMPLIANT,
        details: "Contract interface found and properly structured",
        remediation: "No action required",
      };
    case ChecklistCategory.STUB_IMPLEMENTATION:
      return {
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        details: "Basic stub implementation exists but needs enhancement",
        remediation: "Add comprehensive business logic implementation",
      };
    // ... 5 more hardcoded cases
  }
}
```

**Problems:**
- ❌ Always returns same status for category - ignores actual code
- ❌ Generic details/remediation not specific to target
- ❌ Fallback defeats purpose of AI-driven assessment
- ❌ Should fail fast if AI unavailable, not fall back

**Recommended Changes:**

```typescript
// Remove heuristic fallback entirely
async generateCheckItem(
  category: ChecklistCategory,
  targetPath: string
): Promise<CheckItem> {
  const id = `check-${category}-${Date.now()}-${Math.random()}`;

  // Require AI service
  if (!this.aiService) {
    return {
      id,
      category,
      description: this.getCategoryDescription(category),
      status: ComplianceStatus.NEEDS_REVIEW,
      details: "AI service unavailable - cannot assess compliance",
      remediation: "Configure AI service to enable compliance checking"
    };
  }

  // Always use AI
  const assessment = await this.assessComplianceWithAI(targetPath, category);

  return {
    id,
    category,
    description: this.getCategoryDescription(category),
    status: assessment.status,
    details: assessment.details,
    remediation: assessment.remediation
  };
}
```

**Impact:** MEDIUM - Affects compliance checking accuracy
**Effort:** LOW - 1 day (remove fallback, improve error messaging)
**Priority:** 3 - Fix after template generators

---

#### 🔴 FINDING #5: ChangelogAgent - Complex Template Logic

**File:** `/home/user/SeamsToMe/src/agents/changelog.agent.ts`
**Lines:** 261-363
**Type:** Template Generation + Business Logic

**Current Implementation:**
```typescript
private generateMarkdownTurnover(
  projectName: string,
  currentDate: string,
  changes: ChangeRecord[],
  request: TurnoverMessageRequest
): string {
  let message = `# 🚀 ${projectName} Project Turnover - ${currentDate}\n\n`;

  const completedChanges = changes.filter(
    (c) => c.type === "FEATURE" || c.type === "BUGFIX"
  );
  const breakingChanges = this.filterBreakingChanges(changes);

  message += `## ✅ MISSION STATUS\n\n`;
  message += `**Recent Activity**: ${changes.length} changes recorded\n`;
  // ... 100+ more lines of template logic
}
```

**Problems:**
- ❌ 100+ line hardcoded template
- ❌ Manual categorization logic
- ❌ Fixed format - not adaptable to audience/context
- ❌ No intelligent summarization

**Recommended AI-Driven Replacement:**

```typescript
async generateTurnoverMessage(
  request: TurnoverMessageRequest
): Promise<ContractResult<string>> {
  return this.withErrorHandling(async () => {
    const changesResult = await this.getChanges({
      since: timeRange.since,
      until: timeRange.until,
    });

    if (!changesResult.success) return failure(changesResult.error);

    if (!this.aiService) {
      // Fallback to template only if AI unavailable
      return success(this.generateTemplatedTurnover(...));
    }

    // Use AI to generate intelligent, context-aware turnover
    const turnoverResult = await this.aiService.complete({
      messages: [{
        role: "system",
        content: "You are a technical project manager creating a project turnover document."
      }, {
        role: "user",
        content: `Create a ${request.format} turnover message for ${projectName}.

Changes (${changes.length} total):
${JSON.stringify(changes, null, 2)}

Include:
- Mission status summary
- Key accomplishments (focus on impact)
- Breaking changes with migration guidance
- Immediate verification steps
- Next action recommendations
- Project health indicators

Tone: Professional, clear, actionable
Audience: ${request.audience || "Developer taking over project"}`
      }],
      temperature: 0.4
    });

    return success(turnoverResult.result.content);
  }, "generateTurnoverMessage");
}
```

**Impact:** MEDIUM - Turnover quality affects team handoffs
**Effort:** LOW - 1-2 days
**Priority:** 4 - After compliance and docs

---

### 2.2 MEDIUM SEVERITY - Enhancement Features

#### 🟡 FINDING #6: QualityAgent - Stub Returns Mock Data

**File:** `/home/user/SeamsToMe/src/agents/quality.agent.ts`
**Lines:** 32-69
**Type:** Stub Implementation

**Current:** Returns hardcoded mock data
**Should:** Use AI to analyze code quality, detect anti-patterns, suggest improvements
**Impact:** MEDIUM - Quality checks not functional
**Effort:** MEDIUM - 2-3 days
**Priority:** 5

**Recommended Implementation:**
```typescript
async checkQuality(request: QualityInput): Promise<ContractResult<QualityOutput>> {
  // Read target files
  const codeContent = await this.readTargetFiles(request.targetPath);

  // Use AI to analyze each check type
  const analyses = await Promise.all(
    request.checkTypes.map(checkType =>
      this.aiService.analyze({
        content: codeContent,
        analysisType: "code",
        instructions: `Analyze for ${checkType}. Find issues, rate severity, suggest fixes.`
      })
    )
  );

  // Combine results
  return success({
    summary: this.summarizeFindings(analyses),
    issues: this.extractIssues(analyses),
    checkedOn: new Date()
  });
}
```

---

#### 🟡 FINDING #7: PrdAgent - Stub Returns Mock PRD

**File:** `/home/user/SeamsToMe/src/agents/prd.agent.ts`
**Lines:** 29-59
**Type:** Stub Implementation

**Current:** Returns single-section mock PRD
**Should:** Use AI to generate comprehensive PRD from requirements/conversation
**Impact:** MEDIUM - PRD generation not functional
**Effort:** MEDIUM - 2-3 days
**Priority:** 6

---

#### 🟡 FINDING #8: PairAgent - Stub Returns Mock Code

**File:** `/home/user/SeamsToMe/src/agents/pair.agent.ts`
**Lines:** 33-71
**Type:** Stub Implementation

**Current:** Returns mock code comment
**Should:** Use AI for actual pair programming assistance
**Impact:** MEDIUM - Code generation not functional
**Effort:** MEDIUM - 2-3 days
**Priority:** 7

---

#### 🟡 FINDING #9: ApiReaderAgent - Not Implemented

**File:** `/home/user/SeamsToMe/src/agents/api-reader.agent.ts`
**Lines:** 28-76
**Type:** Not Implemented

**Current:** Returns NotImplementedError
**Should:** Use AI to parse and summarize API documentation
**Impact:** LOW - Feature not critical
**Effort:** MEDIUM - 2-3 days
**Priority:** 8

---

### 2.3 LOW SEVERITY - Minor Features

#### 🟢 FINDING #10: PromptAgent - Not Implemented

**File:** `/home/user/SeamsToMe/src/agents/prompt.agent.ts`
**Lines:** 32-41, 43-69
**Type:** Stub/Not Implemented

**Current:** executePrompt not implemented, generatePrompt returns mock
**Should:** Use AI to generate effective prompts for other agents
**Impact:** LOW - Prompt generation works as stub
**Effort:** LOW - 1-2 days
**Priority:** 9

---

#### 🟢 FINDING #11: KnowledgeAgent - Fallback to Keyword Matching

**File:** `/home/user/SeamsToMe/src/agents/knowledge.agent.ts`
**Lines:** 125-129
**Type:** Fallback Heuristic

**Current Implementation:**
```typescript
private keywordSearch(items: KnowledgeItem[], query: string): KnowledgeItem[] {
  return items.filter((item) =>
    item.content.toLowerCase().includes(query.toLowerCase())
  );
}
```

**Recommended:** Remove fallback, handle AI service unavailability explicitly
**Impact:** LOW - AI fallback is reasonable here
**Effort:** LOW - 0.5 days
**Priority:** 10

---

## Part 3: String Matching & Parsing Patterns

### Pattern Inventory

| Pattern Type | Occurrences | Files | Should Use AI? |
|--------------|-------------|-------|----------------|
| **Regex Matching** | 5+ | scaffold.agent, mvpSddScaffolder.agent | ✅ YES |
| **String.includes()** | 15+ | Multiple agents | ⚠️ CONTEXT-DEPENDENT |
| **Case Conversion** | 10+ | scaffold.agent, mvpSddScaffolder.agent | ❌ NO (utility) |
| **Substring/Slice** | 20+ | Multiple agents | ❌ NO (formatting) |
| **Split Operations** | 8+ | Multiple agents | ❌ NO (parsing) |
| **Template Literals** | 100+ | All template agents | ✅ YES |

### Specific Examples

**Example 1: Component Name Extraction (SHOULD USE AI)**
```typescript
// scaffold.agent.ts:128
const docNameMatch = designDoc.match(/component[:\s]+([a-zA-Z0-9_-]+)/i);
```
**Problem:** Fails on "ComponentName:", "Component = Foo", etc.
**AI Solution:** Ask AI to extract component name with context understanding

**Example 2: Feature Detection (SHOULD USE AI)**
```typescript
// scaffold.agent.ts:149-154
if (designDoc.toLowerCase().includes("test")) {
  structure.push("test");
}
if (designDoc.toLowerCase().includes("style") || designDoc.toLowerCase().includes("css")) {
  structure.push("styles");
}
```
**Problem:** "Don't include tests" would trigger test generation
**AI Solution:** Use AI classification to understand intent

**Example 3: Format Detection (MAYBE USE AI)**
```typescript
// documentation.agent.ts:347-362
private detectFormat(docPath: string): DocumentationFormat {
  const extension = path.extname(docPath).toLowerCase();
  switch (extension) {
    case ".md": return DocumentationFormat.MARKDOWN;
    // ...
  }
}
```
**Problem:** Simple extension matching is probably fine
**AI Solution:** Could analyze file content if extension missing/ambiguous

---

## Part 4: Priority Roadmap

### Phase 1: Critical AI Integration (Weeks 1-2)

**Priority 1-2: Template Generators**
- [ ] **ScaffoldAgent** - Replace 400+ lines of templates
  - Add AI service injection
  - Replace extractComponentName with AI analysis
  - Replace template generation with AI code generation
  - Remove regex/string matching heuristics
  - **Effort:** 2-3 days

- [ ] **MVPSddScaffolderAgent** - Similar template issues
  - Add AI service injection
  - Replace substituteTemplate with AI generation
  - Use AI to generate complete files
  - **Effort:** 2-3 days (can reuse ScaffoldAgent patterns)

### Phase 2: AI Service Improvements (Week 3)

**Priority: Infrastructure**
- [ ] **Add Retry Logic** to AIService
  - Exponential backoff (3-5 retries)
  - Error classification (retry vs fail)
  - **Effort:** 1 day

- [ ] **Add Timeout Handling**
  - Configurable timeout (default 30s)
  - AbortController integration
  - **Effort:** 0.5 days

- [ ] **Add Rate Limiting**
  - Track request rate
  - Implement backoff when hitting limits
  - **Effort:** 1 day

### Phase 3: Documentation & Compliance (Week 4)

**Priority 3-4:**
- [ ] **DocumentationAgent** - Replace hardcoded templates
  - Add AI service injection
  - Replace template methods with AI generation
  - **Effort:** 1-2 days

- [ ] **ChecklistAgent** - Remove heuristic fallback
  - Remove assessComplianceWithHeuristics
  - Improve error messaging when AI unavailable
  - **Effort:** 1 day

- [ ] **ChangelogAgent** - AI-driven turnover messages
  - Add AI service injection
  - Replace template generation with AI
  - **Effort:** 1-2 days

### Phase 4: Feature Completion (Weeks 5-6)

**Priority 5-8:**
- [ ] **QualityAgent** - Implement AI-driven quality checks
- [ ] **PrdAgent** - Implement AI-driven PRD generation
- [ ] **PairAgent** - Implement AI pair programming
- [ ] **ApiReaderAgent** - Implement AI API doc parsing
- [ ] **PromptAgent** - Enhance with AI prompt optimization
- [ ] **KnowledgeAgent** - Remove keyword fallback

---

## Part 5: Testing Strategy

### AI Integration Testing

For each agent converted to use AI:

1. **Unit Tests with MockAIService**
   ```typescript
   describe("ScaffoldAgent with AI", () => {
     it("should use AI to extract component info", async () => {
       const mockAI = new MockAIService();
       mockAI.setMockResponse("analyze", {
         summary: "Component analysis",
         details: {
           name: "TestComponent",
           structure: ["index", "types"],
           props: ["data: string"],
           methods: ["process(): void"]
         }
       });

       const agent = new ScaffoldAgent(mockAI);
       const result = await agent.generateScaffold({
         designDoc: "Create a test component...",
         targetPath: "./src/test",
         format: StubFormat.TYPESCRIPT
       });

       expect(result.success).toBe(true);
       expect(mockAI.getCallCount("analyze")).toBe(1);
     });
   });
   ```

2. **Integration Tests with Real AI** (optional, gated by env var)
   ```typescript
   describe("ScaffoldAgent Integration", () => {
     const realAI = process.env.TEST_WITH_REAL_AI
       ? new AIService(process.env.XAI_API_KEY)
       : null;

     it.skipIf(!realAI)("should generate real scaffold", async () => {
       const agent = new ScaffoldAgent(realAI);
       // ... test with real AI
     });
   });
   ```

3. **Fallback/Error Tests**
   ```typescript
   it("should handle AI service failure gracefully", async () => {
     const mockAI = new MockAIService();
     mockAI.setMethodToFail("analyze", true);

     const agent = new ScaffoldAgent(mockAI);
     const result = await agent.generateScaffold({...});

     expect(result.success).toBe(false);
     expect(result.error.category).toBe(ErrorCategory.OPERATION_FAILED);
   });
   ```

---

## Part 6: Summary & Metrics

### Current State
- **Total Agents:** 14
- **Using AI Correctly:** 2 (14%)
- **Using AI with Fallback:** 2 (14%)
- **Not Using AI:** 10 (71%)
- **Hardcoded Template Lines:** 500+
- **Regex/String Matching Patterns:** 30+

### Target State (After Remediation)
- **Agents Using AI:** 13 (93%)
- **Agents Not Needing AI:** 1 (OrchestratorAgent)
- **Hardcoded Templates:** 0
- **AI Service Features:** Retry, timeout, rate limiting

### Estimated Effort
- **Phase 1 (Critical):** 4-6 days
- **Phase 2 (Infrastructure):** 2-3 days
- **Phase 3 (Docs/Compliance):** 3-5 days
- **Phase 4 (Features):** 8-10 days
- **Total:** 17-24 days (3.5-5 weeks)

### Risk Assessment
- **HIGH RISK:** AI service downtime affects all agents
  - **Mitigation:** Add retry logic, timeout handling, fallback strategies
- **MEDIUM RISK:** AI response quality varies
  - **Mitigation:** Lower temperature for code generation, add validation
- **LOW RISK:** API costs increase
  - **Mitigation:** Add caching, rate limiting

---

## Part 7: Immediate Action Items

### Week 1 Actions

1. **Add Retry Logic to AIService** (Day 1)
   - Implement exponential backoff
   - Add timeout handling
   - Test with mock failures

2. **Refactor ScaffoldAgent** (Days 2-3)
   - Add AI service injection
   - Replace extractComponentName
   - Replace template generation
   - Add tests

3. **Refactor MVPSddScaffolderAgent** (Days 4-5)
   - Reuse ScaffoldAgent AI patterns
   - Replace substituteTemplate
   - Add tests

### Week 2 Actions

4. **Complete AIService Improvements** (Days 1-2)
   - Add rate limiting
   - Add model override from env
   - Documentation

5. **Refactor DocumentationAgent** (Days 3-4)
   - Add AI service
   - Replace templates
   - Add tests

6. **Refactor ChecklistAgent** (Day 5)
   - Remove heuristic fallback
   - Improve error handling
   - Add tests

---

## Appendix A: File Inventory

### Agents with AI Integration Needed

| File | Lines | Complexity | AI Features Needed |
|------|-------|------------|-------------------|
| scaffold.agent.ts | 494 | HIGH | Template generation, name extraction |
| mvpSddScaffolder.agent.ts | 469 | HIGH | Template generation, file creation |
| documentation.agent.ts | 364 | MEDIUM | Doc generation, content analysis |
| changelog.agent.ts | 442 | MEDIUM | Turnover messages, summarization |
| checklist.agent.ts | 446 | MEDIUM | Compliance assessment (remove fallback) |
| quality.agent.ts | 71 | LOW | Quality analysis |
| prd.agent.ts | 83 | LOW | PRD generation |
| pair.agent.ts | 72 | LOW | Code generation |
| api-reader.agent.ts | 77 | LOW | API doc parsing |
| prompt.agent.ts | 70 | LOW | Prompt optimization |

### Total Lines to Refactor: ~2,588 lines

---

## Appendix B: AI Service Contract Extensions

Consider adding these methods to `IAIService`:

```typescript
interface IAIService {
  // Existing methods
  complete(request: AIRequest): Promise<ContractResult<AIResponse>>;
  semanticSearch(request: SemanticSearchRequest): Promise<ContractResult<SemanticSearchResult[]>>;
  classify(request: ClassificationRequest): Promise<ContractResult<ClassificationResult>>;
  analyze(request: AnalysisRequest): Promise<ContractResult<AnalysisResult>>;

  // Proposed additions
  generateCode(request: CodeGenerationRequest): Promise<ContractResult<CodeGenerationResult>>;
  reviewCode(request: CodeReviewRequest): Promise<ContractResult<CodeReviewResult>>;
  generateDocumentation(request: DocGenerationRequest): Promise<ContractResult<string>>;
  extractStructuredData(request: ExtractionRequest): Promise<ContractResult<any>>;
}
```

This would provide specialized methods for common AI operations rather than using generic `complete()`.

---

**End of Report**
