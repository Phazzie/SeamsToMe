import { validateComponentName, validateTargetDirectory, safePathJoin } from "../utils/pathValidation";
import { ErrorCategory } from "../contracts/types";

describe("pathValidation", () => {
  describe("validateComponentName", () => {
    test("should accept valid component names", () => {
      const result = validateComponentName("UserProfile");
      expect(result.success).toBe(true);
      expect(result.result).toBe("UserProfile");
    });

    test("should accept names with hyphens and underscores", () => {
      const result = validateComponentName("user-profile_component");
      expect(result.success).toBe(true);
    });

    test("should reject path traversal with ..", () => {
      const result = validateComponentName("../etc/passwd");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.category).toBe(ErrorCategory.VALIDATION_ERROR);
        expect(result.error.message).toContain("Path traversal");
      }
    });

    test("should reject absolute paths", () => {
      const result = validateComponentName("/etc/passwd");
      expect(result.success).toBe(false);
    });

    test("should reject special characters", () => {
      const result = validateComponentName("user@profile");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("alphanumeric");
      }
    });

    test("should reject empty names", () => {
      const result = validateComponentName("");
      expect(result.success).toBe(false);
    });
  });

  describe("validateTargetDirectory", () => {
    test("should accept absolute paths", () => {
      const result = validateTargetDirectory("/home/user/project");
      expect(result.success).toBe(true);
    });

    test("should accept safe relative paths", () => {
      const result = validateTargetDirectory("./relative/path");
      expect(result.success).toBe(true);
    });

    test("should reject relative paths with traversal attempts", () => {
      const result = validateTargetDirectory("../../etc/passwd");
      expect(result.success).toBe(false);
    });

    test("should reject relative paths when allowed roots specified", () => {
      const result = validateTargetDirectory(
        "./relative/path",
        ["/home/user/project"]
      );
      expect(result.success).toBe(false);
    });

    test("should enforce allowed roots", () => {
      const result = validateTargetDirectory(
        "/home/user/project",
        ["/home/user/project", "/tmp"]
      );
      expect(result.success).toBe(true);
    });

    test("should reject paths outside allowed roots", () => {
      const result = validateTargetDirectory(
        "/etc/passwd",
        ["/home/user/project"]
      );
      expect(result.success).toBe(false);
    });
  });

  describe("safePathJoin", () => {
    test("should safely join valid paths", () => {
      const result = safePathJoin("/home/user/project", "UserProfile");
      expect(result.success).toBe(true);
      expect(result.result).toContain("userprofile");
    });

    test("should prevent path traversal in join", () => {
      const result = safePathJoin("/home/user/project", "../../../etc/passwd");
      expect(result.success).toBe(false);
    });
  });
});
