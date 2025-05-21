# SeemsToMe FAQ & Troubleshooting

## Common SDD Questions

### General SDD Questions

**Q: Why use Seam-Driven Development?**  
A: SDD makes all integration points explicit, testable, and AI-friendly. It prevents the "70% wall" problem where code generation works for isolated components but fails at integration.

**Q: What's the difference between SDD and other methodologies?**  
A: SDD is specifically contract-first and integration-first. Unlike TDD or DDD, SDD focuses primarily on the seams/interfaces between components, making it ideal for AI collaboration.

### Process Questions

**Q: How do I know if I've identified all the seams?**  
A: Use the Seam Analyzer agent, which helps identify all integration points. Look for data handoffs, component communication, and potential areas of change.

**Q: When should I update a contract vs. create a new version?**  
A: Create a new version when changes would break existing consumers. Update in place only for non-breaking changes, documentation improvements, or clarifications.

**Q: How do I handle evolving contracts?**  
A: Use explicit versioning, adapters for backward compatibility, and notify all consumers through the Knowledge agent.

## Troubleshooting

### Contract Issues

**Problem: Contracts are ambiguous**  
**Solution:** Use more specific types, add detailed blueprint comments, and include examples of valid/invalid data.

**Problem: Tight coupling between agents**  
**Solution:** Refactor to introduce intermediate contracts or adapters, reducing direct dependencies.

**Problem: Too many contract versions**  
**Solution:** Consider consolidating or deprecating old versions, using the Refactoring Assistant.

### Implementation Issues

**Problem: Logic leaking across seam boundaries**  
**Solution:** Ensure strict adherence to contracts; move logic to appropriate side of seam.

**Problem: Tests passing but integration failing**  
**Solution:** Improve contract conformance tests; ensure they cover edge cases and error scenarios.

**Problem: Difficulty implementing against a contract**  
**Solution:** Review contract for clarity; consider adding more specific types or examples.

## Collaboration Tips

- Use Better Comments consistently for TODO items and questions
- Reference the agent catalog when discussing changes
- Keep the seam visualization up to date
- Document contract rationale and design decisions

## Still Stuck?

Check the SDD Manifesto or consult the orchestrator agent owner for guidance.
