# Master List of All Issues - SeamsToMe

**Generated:** 2025-11-06
**Total Issues:** 147 distinct problems identified

---

## Category 1: SECURITY (14 issues)

### Critical (3)
1. **SEC-001** Path traversal in MVPSddScaffolderAgent (lines 52-54, 122-129, 199-200, 287-290)
2. **SEC-002** Path traversal in ChecklistAgent (lines 194-209)
3. **SEC-003** Path traversal in AnalyzerAgent (lines 182-220)

### High (6)
4. **SEC-004** .env.development committed to Git (commit d8f2e03)
5. **SEC-005** Insufficient API key validation in AIService (line 35-46)
6. **SEC-006** Template variable injection in MVPSddScaffolder (lines 439-458)
7. **SEC-007** JSON parsing without size limits in AIService (lines 167, 259, 352)
8. **SEC-008** Dynamic method invocation needs whitelist in AgentDispatcher (lines 98, 119)
9. **SEC-009** Verbose error messages expose stack traces in production (agentDispatcher.ts:121-136)

### Medium (3)
10. **SEC-010** Console logging in production exposes information (index.ts, orchestrator.agent.ts)
11. **SEC-011** VERBOSE_ERRORS setting unsafe for production (.env.development:24)
12. **SEC-012** No authentication mechanism (acceptable for CLI, but document)

### Low (2)
13. **SEC-013** Direct process.env access should be abstracted (ai.service.ts:36)
14. **SEC-014** Hard-coded service creation reduces testability (ai.service.ts:35-45)

---

## Category 2: TYPE SAFETY (106 issues)

### Critical - 'any' Types (18)
15. **TYPE-001** enumParser.ts - All parameters typed as `any` (lines 38, 68, 93, 116)
16. **TYPE-002** base.agent.ts - Validation methods accept `any` (lines 41, 85, 107, 132, 162, 194, 295)
17. **TYPE-003** types.ts - Error details typed as `any` (lines 53, 55, 66, 125)
18. **TYPE-004** agentDispatcher.ts - Payload typed as `any` (lines 29, 64)
19. **TYPE-005** scaffold.agent.ts - Generated file structures use `any` (15+ instances)
20. **TYPE-006** agentRegistry.ts - Agent instance typed as `any` (line 19)
21. **TYPE-007** analyzer.agent.ts - AI response parsing uses `any` (lines 225, 265, 273)
22-32. **TYPE-008 to TYPE-018** Test files use `any` for mocks (40+ instances across test files)

### High - Unsafe Type Assertions (10)
33. **TYPE-019** enumParser.ts - Unsafe assertions without validation (lines 47-48, 117)
34. **TYPE-020** mvpSddScaffolder.contract.test.ts - Extensive `as any` usage (67-70, 118, 208, etc.)
35. **TYPE-021** ai.service.ts - Message role assertion (line 80)
36. **TYPE-022** orchestrator.agent.OLD.ts - 40+ parameter casts (lines 174, 179, 191, etc.)
37-42. **TYPE-023 to TYPE-028** Test files - `as AgentId` for literals (100+ instances)

### High - Non-Null Assertions (10)
43. **TYPE-029** agentRegistry.ts - Non-null on map get (line 105)
44. **TYPE-030** checklist.agent.ts - Non-null on optional aiService (line 234)
45. **TYPE-031** changelog.agent.ts - Non-null on optional filter params (lines 72, 78, 84, 107)
46-52. **TYPE-032 to TYPE-038** Test files - `result.error!` patterns (240+ instances)

### Medium - Missing Return Types (8)
53. **TYPE-039** index.ts - bootstrap() missing return type (line 17)
54. **TYPE-040** ai.service.mock.ts - createMockAIService() missing return type (line 193)
55. **TYPE-041** base.agent.ts - capitalize() missing return type (line 312)
56-60. **TYPE-042 to TYPE-046** Various utility functions missing return types

### Low - Optional Chaining Issues (20)
61-80. **TYPE-047 to TYPE-066** Overly defensive optional chaining that may hide bugs

---

## Category 3: AI USAGE (11 issues)

### Critical - Not Using AI (10)
81. **AI-001** ScaffoldAgent - 400+ lines of hardcoded templates (lines 96-493)
82. **AI-002** MVPSddScaffolderAgent - 350+ lines of templates (lines 118-468)
83. **AI-003** DocumentationAgent - 120+ lines of stub templates (lines 244-362)
84. **AI-004** ChecklistAgent - Hardcoded compliance rules (lines 256-303)
85. **AI-005** ChangelogAgent - 100+ line hardcoded template (lines 261-363)
86. **AI-006** QualityAgent - Returns mock data (line 48)
87. **AI-007** PrdAgent - Returns mock PRD (lines 45-79)
88. **AI-008** PairAgent - Returns mock code (line 59)
89. **AI-009** ApiReaderAgent - Not implemented at all (line 35-42)
90. **AI-010** PromptAgent - executePrompt() not implemented (line 32-40)

### High - No Retry Logic (1)
91. **AI-011** AIService - No retry for rate limits/timeouts (lines 85-90)

---

## Category 4: ARCHITECTURE & SOLID (28 issues)

### High - Single Responsibility Violations (3)
92. **ARCH-001** ChecklistAgent has 5+ responsibilities (lines 51-424)
93. **ARCH-002** ScaffoldAgent has 6+ responsibilities (lines 34-493)
94. **ARCH-003** AnalyzerAgent mixes analysis and file I/O (lines 182-220)

### High - Open/Closed Violations (3)
95. **ARCH-004** ScaffoldAgent format switch statement (lines 105-117)
96. **ARCH-005** ChecklistAgent category switch statement (lines 259-302)
97. **ARCH-006** DocumentationAgent type switch statement (lines 49-61)

### High - Liskov Substitution Violation (1)
98. **ARCH-007** OrchestratorAgent.registerAgent() not supported but in contract (lines 199-223)

### High - Interface Segregation Violations (3)
99. **ARCH-008** Fat IAIService interface (4 distinct capabilities)
100. **ARCH-009** DocumentationContract mixed concerns (4 different operations)
101. **ARCH-010** OrchestratorContract overly broad (3 different concerns)

### Medium - Dependency Issues (4)
102. **ARCH-011** Optional dependencies reduce type safety (4 agents)
103. **ARCH-012** Hard-coded OpenAI client creation (ai.service.ts:35-45)
104. **ARCH-013** Direct process.env access (ai.service.ts:36)
105. **ARCH-014** Type coupling in AgentRegistry - `instance: any` (line 19)

### Medium - Missing Patterns (3)
106. **ARCH-015** Missing Factory pattern for agent creation
107. **ARCH-016** Missing Builder pattern for complex requests
108. **ARCH-017** No Strategy pattern for scaffold format generation

### Medium - Separation of Concerns (3)
109. **ARCH-018** ChecklistAgent - file system operations mixed in (lines 195-209)
110. **ARCH-019** AnalyzerAgent - direct file system access (lines 184-219)
111. **ARCH-020** DocumentationAgent - direct path utilities (lines 347-362)

### Low - Naming Inconsistencies (8)
112. **ARCH-021** Inconsistent contract naming (KnowledgeContract vs AnalyzerAgentContract)
113-119. **ARCH-022 to ARCH-028** Various naming inconsistencies

---

## Category 5: DRY VIOLATIONS (18 issues)

### High - Code Duplication (4)
120. **DRY-001** Markdown report generation duplicated 3x (~150 lines total)
121. **DRY-002** File system operations duplicated 2x (~60 lines)
122. **DRY-003** Documentation generation pattern duplicated 4x (~80 lines)
123. **DRY-004** AI service validation duplicated 3x

### Medium - Similar Logic (4)
124. **DRY-005** ID generation pattern duplicated 3x (~15 lines)
125. **DRY-006** Test setup boilerplate duplicated 18x (~180 lines)
126. **DRY-007** Success/failure assertions duplicated 60+ times
127. **DRY-008** Format validation duplicated 2x

### Low - Repeated Constants (4)
128. **DRY-009** Mock agent IDs repeated 10+ times
129. **DRY-010** File extension arrays duplicated 2x
130. **DRY-011** PascalCase conversion duplicated 2x
131. **DRY-012** Test constants duplicated across files

### Low - Similar Functions (6)
132-137. **DRY-013 to DRY-018** Various similar utility functions that could be consolidated

---

## Category 6: TEST COVERAGE (20 issues)

### Critical - 0% Coverage (2)
138. **TEST-001** AIService - 0% coverage, 382 lines untested
139. **TEST-002** ai.service.mock.ts - 0% coverage, 197 lines untested

### High - Low Coverage (<50%) (3)
140. **TEST-003** enumParser.ts - 25% coverage
141. **TEST-004** refactor.agent.ts - 48% coverage (missing success paths)
142. **TEST-005** BaseAgent - No direct tests (only indirect)

### Medium - Medium Coverage (50-80%) (5)
143. **TEST-006** scaffold.agent.ts - 65% coverage
144. **TEST-007** orchestrator.agent.ts - 70% coverage
145. **TEST-008** mvpSddScaffolder integration tests - 3 failing tests
146. **TEST-009** Missing integration tests for multi-agent workflows
147. **TEST-010** Missing edge case tests across multiple agents

### Low - Test Quality Issues (10)
148-157. Various test quality issues (low assertions, unclear descriptions, etc.)

---

## Category 7: ERROR HANDLING (12 issues)

### High - Silent Failures (6)
158. **ERR-001** ChecklistAgent - file read error not logged (lines 207-209)
159. **ERR-002** ChecklistAgent - AI fallback not logged (lines 247-250)
160. **ERR-003** AnalyzerAgent - returns empty string on error (lines 217-219)
161. **ERR-004** AIService - JSON parse errors not logged (3 instances)
162. **ERR-005** ScaffoldAgent - skipped seams not logged (lines 241-243)
163. **ERR-006** ClassificationAgent - parse error returns low confidence silently

### Medium - No Retry Logic (3)
164. **ERR-007** No retry for AI API calls
165. **ERR-008** No retry for file write operations
166. **ERR-009** No retry for file read operations

### Medium - Error Response Issues (3)
167. **ERR-010** No structured logging framework
168. **ERR-011** No correlation IDs for request tracing
169. **ERR-012** Constructor throws Error instead of returning ContractResult (AIService)

---

## Category 8: INCOMPLETE WORK (56 issues)

### Critical - NotImplementedError (2)
170. **TODO-001** ApiReaderAgent - returns NotImplementedError (lines 35-42)
171. **TODO-002** PromptAgent - executePrompt() not implemented (lines 32-40)

### High - Mock Implementations (4)
172. **TODO-003** PrdAgent - minimal mock implementation (lines 45-79)
173. **TODO-004** QualityAgent - returns mock data (line 48)
174. **TODO-005** PairAgent - returns mock code (line 59)
175. **TODO-006** RefactorAgent - requires AI service (not optional) (lines 48-57)

### Medium - Template TODOs (13)
176-188. **TODO-007 to TODO-019** ScaffoldAgent template TODOs (lines 31, 251, 257, 280, 284, 288, 307, 312, 317, 339, 343, 347, 361)

### Low - Test TODOs (6)
189-194. **TODO-020 to TODO-025** Various test file TODOs

### Low - Documentation TODOs (3)
195-197. **TODO-026 to TODO-028** Documentation and process reminders

### Low - Obsolete Files (2)
198. **TODO-029** mvpSddScaffolder.agent.backup.ts (333 lines to delete)
199. **TODO-030** orchestrator.agent.OLD.ts (443 lines to delete)

### Low - Template Files (26)
200-225. **TODO-031 to TODO-056** Intentional TODOs in template files (by design, not issues)

---

## SUMMARY BY SEVERITY

| Severity | Count | Categories |
|----------|-------|------------|
| **CRITICAL** | 15 | Security (3), Type Safety (3), AI Usage (10) |
| **HIGH** | 48 | Security (6), Type Safety (25), Architecture (13), DRY (4), Test Coverage (5) |
| **MEDIUM** | 52 | Security (3), Type Safety (8), Architecture (13), DRY (4), Error (9), Incomplete (15) |
| **LOW** | 58 | Security (2), Type Safety (20), Architecture (8), DRY (10), Test (10), Incomplete (8) |

**TOTAL: 173 issues** (some overlap in categorization)

---

## ESTIMATED EFFORT BY CATEGORY

| Category | Issues | Effort (hours) | Effort (days) |
|----------|--------|----------------|---------------|
| Security | 14 | 20-30 | 2.5-4 |
| Type Safety | 106 | 40-60 | 5-7.5 |
| AI Usage | 11 | 240-320 | 30-40 |
| Architecture | 28 | 40-60 | 5-7.5 |
| DRY | 18 | 16-32 | 2-4 |
| Test Coverage | 20 | 64-104 | 8-13 |
| Error Handling | 12 | 24-40 | 3-5 |
| Incomplete Work | 56 | 60-95 | 7.5-12 |
| **TOTAL** | **265** | **504-741** | **63-93 days** |

**Note:** With parallel execution and sub-agents, can reduce calendar time by 3-5x.

---

## FILES REQUIRING ATTENTION

### Critical Priority (10 files)
1. src/agents/mvpSddScaffolder.agent.ts (SEC-001, AI-002, ARCH-002, DRY-001)
2. src/services/ai.service.ts (SEC-005, SEC-007, TYPE-001, TEST-001, ERR-007, ERR-012)
3. src/agents/scaffold.agent.ts (AI-001, ARCH-002, TYPE-005, TEST-006, DRY-001)
4. src/utils/enumParser.ts (TYPE-001, TEST-003)
5. src/agents/base.agent.ts (TYPE-002, TEST-005, ARCH-011)
6. src/patterns/agentDispatcher.ts (SEC-008, TYPE-004)
7. src/agents/checklist.agent.ts (SEC-002, ARCH-001, ERR-001, ERR-002, DRY-001)
8. src/agents/analyzer.agent.ts (SEC-003, ARCH-003, ARCH-019, ERR-003)
9. src/agents/api-reader.agent.ts (AI-009, TODO-001)
10. src/agents/documentation.agent.ts (AI-003, ARCH-006, ARCH-009)

### High Priority (8 files)
11. src/agents/changelog.agent.ts (AI-005, TYPE-031, DRY-001)
12. src/agents/refactor.agent.ts (TEST-004, TODO-006)
13. src/agents/orchestrator.agent.ts (ARCH-007, TEST-007)
14. src/patterns/agentRegistry.ts (TYPE-006, TYPE-029, ARCH-014)
15. src/contracts/types.ts (TYPE-003)
16. src/agents/prd.agent.ts (AI-007, TODO-003)
17. src/agents/quality.agent.ts (AI-006, TODO-004)
18. src/agents/pair.agent.ts (AI-008, TODO-005)

---

## DEPENDENCIES BETWEEN FIXES

**Prerequisite Chain:**
1. Fix SEC-001 to SEC-003 (path validation) → Can then safely implement AI-001 to AI-010
2. Fix TYPE-001, TYPE-002 (enumParser, baseAgent) → Affects all agents
3. Fix ERR-012 (AIService constructor) → Required before TEST-001
4. Fix ARCH-015 (Factory pattern) → Simplifies many other fixes
5. Implement TEST-001 (AIService tests) → Required before AI-001 to AI-010
6. Fix AI-011 (retry logic) → Should be done with TEST-001

**Independent Workstreams:**
- Security fixes (SEC-*) - Can work in parallel
- Type safety (TYPE-*) - Can work in parallel
- DRY violations (DRY-*) - Can work in parallel
- Test coverage (TEST-*) - Can work in parallel after base fixes
- Incomplete work (TODO-*) - Can work in parallel after AI infrastructure

---

This master list provides a complete inventory for parallel remediation planning.
