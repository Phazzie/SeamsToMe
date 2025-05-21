# SDD Code Review Checklist

This checklist helps ensure all contributions follow SDD principles.

## Contract Checks

- [ ] All seams have explicit contracts (\*.contract.[ext] files)
- [ ] Contracts include complete type definitions
- [ ] Contracts include error types and handling expectations
- [ ] Blueprint comments document purpose, data flow, and integrations
- [ ] Contract versioning is explicit and backward compatible where possible

## Stub Checks

- [ ] All contracts have corresponding stubs
- [ ] Stubs contain minimal/no internal logic
- [ ] Stubs raise appropriate errors or return placeholder values
- [ ] Blueprint comments match contract documentation

## Test Checks

- [ ] Contract conformance tests exist for all seams
- [ ] Tests verify behavior under normal and error conditions
- [ ] Tests mock dependencies to isolate seam behavior
- [ ] Tests verify type conformance

## Implementation Checks

- [ ] Implementation strictly adheres to contract definitions
- [ ] All external dependencies are explicitly injected
- [ ] No hidden global state
- [ ] Single Responsibility Principle is followed
- [ ] Code is functional and uses immutable data where possible
- [ ] Error handling follows contract specifications

## Documentation Checks

- [ ] Agent catalog is updated for new/modified agents
- [ ] Seam visualization is current
- [ ] Contract changes are documented and versioned
- [ ] Strategic comments explain WHY, not just WHAT

## SDD Anti-Pattern Checks

- [ ] No implicit/undocumented contracts
- [ ] No tight coupling between agent internals
- [ ] No "God Agent" implementations
- [ ] No implementation without contracts and tests
- [ ] No contract changes without version control

## Performance & Security Checks

- [ ] Input validation at all boundaries
- [ ] Appropriate error handling for all edge cases
- [ ] Performance considerations documented for costly operations
- [ ] Security implications considered and documented

---

_Use this checklist for self-review or during code review to ensure SDD compliance._
