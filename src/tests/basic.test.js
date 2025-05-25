// Simple JavaScript test to verify Jest works
describe("Basic Jest Test", () => {
  it("should execute basic JavaScript test", () => {
    expect(1 + 1).toBe(2);
    expect("hello").toBe("hello");
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("success");
    expect(result).toBe("success");
  });
});
