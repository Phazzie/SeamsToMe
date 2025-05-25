# 🤖 SeemsToMe AI Assistant Helper Prompt

**Purpose**: This document reinforces and enhances AI assistant behavior for optimal effectiveness on the SeemsToMe project. Use this as context when starting new chat sessions.

---

## 🎯 PROJECT-SPECIFIC BEHAVIORAL GUIDELINES

### **PROVEN SUCCESS PATTERNS - Always Follow These**

1. **Contract-First Development**:
   - ALWAYS read the contract interface before implementing
   - Implement exactly what the contract expects, not what seems logical
   - Test expectations are the ultimate source of truth

2. **MVPSddScaffolder Methodology**:
   - Start simple, add complexity incrementally
   - Fresh rewrites often succeed where complex fixes fail
   - Manual testing validates logic independent of Jest issues
   - Zero TypeScript compilation errors is non-negotiable

3. **Validation-Driven Approach**:
   - Run `npx tsc --noEmit` after every significant change
   - Create manual test suites for logic validation
   - Document everything in real-time as you work

### **PROJECT-SPECIFIC DO'S AND DON'TS**

#### ✅ **ALWAYS DO**:
- Read contract files before implementing agents
- Use the `ContractResult<T>` pattern for all agent methods
- Follow the KnowledgeAgent as reference implementation pattern
- Create comprehensive manual test suites (like `test-checklist-agent.js`)
- Update documentation immediately after completing work
- Commit frequently with descriptive commit messages
- Validate TypeScript compilation before considering work complete

#### ❌ **NEVER DO**:
- Skip contract compliance validation
- Implement complex solutions when simple ones work
- Ignore TypeScript compilation errors
- Skip manual testing validation
- Leave documentation outdated
- Break existing seam tests
- Assume Jest issues are blocking (use manual tests instead)

---

## 🛠️ TECHNICAL CONTEXT REINFORCEMENT

### **Architecture Understanding**:
- This is a **Seam-Driven Development (SDD)** project
- Agents are independent modules with strict contracts
- OrchestratorAgent coordinates between all agents
- Each agent must implement their contract interface exactly
- Error handling uses the `ContractResult<T>` pattern

### **File Structure Patterns**:
```
src/agents/[name].agent.ts          - Implementation
src/contracts/[name].contract.ts    - Interface definition  
src/tests/[name].contract.test.ts   - Jest test expectations
test-[name]-agent.js                - Manual validation tests
```

### **Implementation Reference**:
- **KnowledgeAgent**: Perfect CRUD implementation pattern
- **ChecklistAgent**: Complete business logic example
- **ScaffoldAgent**: Template generation and validation example

---

## 🎯 PROJECT SUCCESS CRITERIA

### **Agent Implementation Checklist**:
- [ ] Contract interface fully implemented
- [ ] All methods return proper `ContractResult<T>` types
- [ ] Comprehensive error handling implemented
- [ ] Manual test suite created and passing
- [ ] Zero TypeScript compilation errors
- [ ] Documentation updated with completion status

### **Quality Gates**:
1. **TypeScript Compilation**: `npx tsc --noEmit` must pass
2. **Manual Testing**: Logic validation test suite must pass 100%
3. **Contract Compliance**: All interface methods implemented exactly
4. **Integration Ready**: Agent can be instantiated without errors

---

## 🧠 BEHAVIORAL REINFORCEMENT

### **Problem-Solving Approach**:
1. **Understand the contract first** - Read interface and test expectations
2. **Start minimal** - Get basic structure working with compilation
3. **Add logic incrementally** - One method at a time with validation
4. **Test frequently** - Manual tests prove logic correctness
5. **Document progress** - Real-time updates prevent knowledge loss

### **When Stuck**:
- Reference working agents (Knowledge, Checklist, Scaffold) for patterns
- Create simple manual tests to isolate and verify logic
- Focus on contract compliance over elegant architecture
- Use fresh rewrites rather than complex debugging

### **Communication Style**:
- Be specific about what you're implementing and why
- Explain your validation approach (manual tests, TypeScript checks)
- Document insights and lessons learned for future reference
- Focus on actionable next steps and clear success criteria

---

## 📚 ESSENTIAL REFERENCE DOCUMENTS

### **Start Here**:
- `TURNOVER-MESSAGE.md` - Complete project status and next steps
- `docs/implementation-plan.md` - Master roadmap and completion tracking
- `docs/agent-catalog.md` - All 15 agents with complexity ratings

### **Technical Reference**:
- `src/agents/knowledge.agent.ts` - Perfect CRUD implementation pattern
- `src/agents/checklist.agent.ts` - Complete business logic example
- `test-checklist-agent.js` - Manual testing pattern to follow

### **Understanding Context**:
- `CHANGELOG.md` - Detailed history of what works and why
- `docs/sdd-manifesto.md` - Core philosophy and principles
- `ONBOARDING.md` - Project context and setup

---

## 🚀 SUCCESS MINDSET

### **Core Principles**:
- **Simple beats complex** - Minimal implementations often work better
- **Tests don't lie** - Implement exactly what tests expect
- **Fresh starts work** - Don't be afraid to rewrite if stuck
- **Document everything** - Future you will thank present you
- **Validate continuously** - Catch issues early and often

### **Project Momentum**:
- Build on proven successes (3 agents already complete and working)
- Follow established patterns rather than inventing new approaches
- Focus on rapid, reliable delivery using known methodologies
- Maintain quality gates while moving quickly

---

**This helper prompt should be used alongside the TURNOVER-MESSAGE.md to ensure optimal AI assistant performance on the SeemsToMe project.**

*Generated: May 25, 2025 | Project: SeemsToMe | Purpose: AI Assistant Behavioral Enhancement*
