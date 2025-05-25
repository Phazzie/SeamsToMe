# MVPSddScaffolder Contract Test Fix Plan

## OBJECTIVE

Fix all 23 failing MVPSddScaffolder contract tests to achieve 100% passing rate, focusing on contract compliance rather than business logic implementation.

## ANALYSIS OF TEST FAILURES

### Category 1: ErrorCategory Mismatches

**Issue**: Tests expect `ErrorCategory.FILE_SYSTEM_ERROR` but agent returns `ErrorCategory.OPERATION_FAILED` for file collision scenarios.

**Affected Tests**:

- OverwritePolicy.ERROR_IF_EXISTS tests (3 tests)
- Default OverwritePolicy tests (2 tests)

**Root Cause**: File collision errors are incorrectly categorized as operation failures instead of file system errors.

### Category 2: Validation Message Format Mismatches

**Issue**: Tests expect specific validation error messages but agent returns generic messages.

**Affected Tests**:

- Empty componentName validation
- Empty targetDirectory validation
- Unknown sddComponentType validation

**Expected vs Actual**:

- Expected: "Component name cannot be empty" → Actual: "componentName and targetDirectory are required"
- Expected: "Target directory cannot be empty" → Actual: "componentName and targetDirectory are required"
- Expected: "Unknown SDD component type: unknown-type" → Actual: "Unsupported component type: unknown-type"

### Category 3: Summary Message Format Issues

**Issue**: Tests expect lowercase "successfully scaffolded" but agent returns "Successfully scaffolded" (uppercase S).

**Affected Tests**: All OverwritePolicy.OVERWRITE tests (3 tests)

### Category 4: File Path Structure Issues

**Issue**: Tests expect files in component-specific subdirectories but agent creates them in standard type directories.

**Example**:

- Expected: `src\sandbox-overwrite\overwritetestcomponent\OverwriteTestComponent.agent.ts`
- Actual: `src\sandbox-overwrite\agents\OverwriteTestComponent.agent.ts`

**Affected Tests**: Most OverwritePolicy tests

### Category 5: OverwritePolicy.SKIP Implementation Missing

**Issue**: Agent doesn't properly implement SKIP policy - creates empty results instead of detailed summary messages.

**Affected Tests**: All OverwritePolicy.SKIP tests (4 tests)

**Expected Behavior**: Should skip existing files and provide detailed summary messages about what was skipped vs created.

### Category 6: File Naming Convention Issues

**Issue**: Inconsistent use of camelCase vs PascalCase for file naming.

**Analysis Needed**: Determine correct convention from test expectations.

### Category 7: File Collision Cleanup

**Issue**: Previous test runs left files that interfere with current tests.

**Solution**: Proper test cleanup or agent should handle existing files per policy.

## EXECUTION PLAN

### Phase 1: Analysis & Setup (5 minutes)

1. **Clean Test Environment**

   - Remove all sandbox directories from previous test runs
   - Ensure clean state for testing

2. **Understand Test Expectations**
   - Read contract test file to understand exact expectations
   - Map test expectations to agent behavior requirements

### Phase 2: Core Logic Fixes (15 minutes)

3. **Fix ErrorCategory Classifications**

   - Change file collision errors from `OPERATION_FAILED` to `FILE_SYSTEM_ERROR`
   - Update error message format to match test expectations

4. **Fix Validation Message Formats**

   - Implement specific validation messages instead of generic ones
   - Match exact wording expected by tests

5. **Fix Summary Message Capitalization**
   - Change "Successfully scaffolded" to "successfully scaffolded"

### Phase 3: File Handling Logic (20 minutes)

6. **Analyze File Path Structure Requirements**

   - Determine correct directory structure from tests
   - Implement proper path generation logic

7. **Implement Proper OverwritePolicy.SKIP Logic**

   - Add skip detection and tracking
   - Generate detailed summary messages for skipped vs created files
   - Ensure no files are written when skipping

8. **Fix File Naming Convention**
   - Standardize on correct case convention (likely PascalCase based on test expectations)

### Phase 4: Integration & Testing (10 minutes)

9. **Implement Error Handling for File Collisions**

   - Wrap file operations in proper try-catch
   - Return appropriate error categories and messages

10. **Run Progressive Tests**
    - Test after each major fix
    - Validate fix doesn't break other tests
    - Track progress toward 0/23 failing tests

### Phase 5: Validation (5 minutes)

11. **Final Test Run**

    - Run all MVPSddScaffolder contract tests
    - Verify 23/23 tests passing
    - Document any remaining issues

12. **Integration Verification**
    - Run full test suite to ensure no regressions
    - Verify system integration tests still pass

## SUCCESS CRITERIA

- [ ] All 23 MVPSddScaffolder contract tests pass
- [ ] No regressions in other test suites
- [ ] Agent properly handles all OverwritePolicy scenarios
- [ ] Error messages match test expectations exactly
- [ ] File path structure matches test expectations
- [ ] Summary messages provide appropriate detail level

## QUALITY CHECKPOINTS

1. After each category fix, run targeted tests to verify progress
2. Ensure error categories align with SDD error handling patterns
3. Verify file operations are atomic and handle edge cases
4. Confirm message formats are consistent with contract expectations

## ESTIMATED TIME: 55 minutes

## DEPENDENCIES

- Clean test environment
- Understanding of exact test expectations
- Access to test failure details for validation

---

_This plan follows SDD methodology by understanding root causes before implementing fixes, focusing on contract compliance over feature implementation._
