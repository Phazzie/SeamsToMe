/**
 * Comprehensive test suite for enumParser utility functions
 * Tests type safety, edge cases, and proper handling of unknown types
 */

import {
  parseEnum,
  parseEnumSnakeCase,
  parseEnumKebabCase,
  isValidEnum
} from "../utils/enumParser";

enum TestEnum {
  VALUE_ONE = "VALUE_ONE",
  VALUE_TWO = "VALUE_TWO",
  KEBAB_CASE = "KEBAB-CASE",
}

enum NumericEnum {
  ZERO = 0,
  ONE = 1,
  TWO = 2,
}

// Helper to get only numeric values from numeric enum
function getNumericEnumValues(enumObj: any): number[] {
  return Object.values(enumObj).filter(v => typeof v === 'number') as number[];
}

describe("enumParser", () => {
  describe("parseEnum", () => {
    test("should parse valid uppercase string", () => {
      const result = parseEnum(
        "VALUE_ONE",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should parse lowercase string with normalization", () => {
      const result = parseEnum(
        "value_one",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should parse mixed case string", () => {
      const result = parseEnum(
        "VaLuE_OnE",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should return default for invalid value", () => {
      const result = parseEnum(
        "INVALID",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle null", () => {
      const result = parseEnum(
        null,
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle undefined", () => {
      const result = parseEnum(
        undefined,
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle number 0", () => {
      const numericValues = getNumericEnumValues(NumericEnum);
      const result = parseEnum(
        0,
        numericValues,
        NumericEnum.ONE
      );
      expect(result).toBe(NumericEnum.ZERO);
    });

    test("should handle number 1", () => {
      const numericValues = getNumericEnumValues(NumericEnum);
      const result = parseEnum(
        1,
        numericValues,
        NumericEnum.ZERO
      );
      expect(result).toBe(NumericEnum.ONE);
    });

    test("should handle empty string", () => {
      const result = parseEnum(
        "",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle objects (return default)", () => {
      const result = parseEnum(
        { invalid: true },
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle arrays (return default)", () => {
      const result = parseEnum(
        ["invalid"],
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle functions (return default)", () => {
      const result = parseEnum(
        () => "test",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should use custom normalizer", () => {
      const customNormalizer = (input: string) => input.toLowerCase();
      const result = parseEnum(
        "VALUE_ONE",
        ["value_one", "value_two"],
        "value_two",
        customNormalizer
      );
      expect(result).toBe("value_one");
    });

    test("should handle custom normalizer with underscores", () => {
      const customNormalizer = (input: string) =>
        input.toUpperCase().replace(/\s+/g, "_");
      const result = parseEnum(
        "value one",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO,
        customNormalizer
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should handle kebab-case with custom normalizer", () => {
      const result = parseEnum(
        "kebab-case",
        Object.values(TestEnum),
        TestEnum.VALUE_ONE,
        (s) => s.toUpperCase()
      );
      expect(result).toBe(TestEnum.KEBAB_CASE);
    });

    test("should handle boolean true", () => {
      const result = parseEnum(
        true,
        ["TRUE", "FALSE"],
        "FALSE"
      );
      expect(result).toBe("TRUE");
    });

    test("should handle boolean false", () => {
      const result = parseEnum(
        false,
        ["TRUE", "FALSE"],
        "TRUE"
      );
      expect(result).toBe("FALSE");
    });

    test("should handle NaN (return default)", () => {
      const result = parseEnum(
        NaN,
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle Symbol (return default)", () => {
      const result = parseEnum(
        Symbol("test"),
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });
  });

  describe("parseEnumSnakeCase", () => {
    test("should parse snake_case string", () => {
      const result = parseEnumSnakeCase(
        "value one",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should parse string with spaces", () => {
      const result = parseEnumSnakeCase(
        "value   one",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should parse string with tabs", () => {
      const result = parseEnumSnakeCase(
        "value\tone",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should parse string with newlines", () => {
      const result = parseEnumSnakeCase(
        "value\none",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should handle null", () => {
      const result = parseEnumSnakeCase(
        null,
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle undefined", () => {
      const result = parseEnumSnakeCase(
        undefined,
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should return default for invalid", () => {
      const result = parseEnumSnakeCase(
        "invalid value",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle already snake_case string", () => {
      const result = parseEnumSnakeCase(
        "value_one",
        Object.values(TestEnum),
        TestEnum.VALUE_TWO
      );
      expect(result).toBe(TestEnum.VALUE_ONE);
    });

    test("should handle lowercase input", () => {
      const result = parseEnumSnakeCase(
        "value two",
        Object.values(TestEnum),
        TestEnum.VALUE_ONE
      );
      expect(result).toBe(TestEnum.VALUE_TWO);
    });

    test("should handle number input", () => {
      const result = parseEnumSnakeCase(
        123,
        ["123", "456"],
        "456"
      );
      expect(result).toBe("123");
    });
  });

  describe("parseEnumKebabCase", () => {
    // Use lowercase enum for kebab-case tests
    const lowerEnum = ["kebab-case", "value-one", "value-two"];

    test("should parse kebab-case string", () => {
      const result = parseEnumKebabCase(
        "kebab case",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });

    test("should parse with multiple spaces", () => {
      const result = parseEnumKebabCase(
        "kebab   case",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });

    test("should parse with tabs", () => {
      const result = parseEnumKebabCase(
        "kebab\tcase",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });

    test("should handle null", () => {
      const result = parseEnumKebabCase(
        null,
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("value-one");
    });

    test("should handle undefined", () => {
      const result = parseEnumKebabCase(
        undefined,
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("value-one");
    });

    test("should return default for invalid", () => {
      const result = parseEnumKebabCase(
        "invalid value",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("value-one");
    });

    test("should handle already kebab-case string", () => {
      const result = parseEnumKebabCase(
        "kebab-case",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });

    test("should handle uppercase input", () => {
      const result = parseEnumKebabCase(
        "KEBAB CASE",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });

    test("should handle mixed case input", () => {
      const result = parseEnumKebabCase(
        "KeBaB CaSe",
        lowerEnum,
        "value-one"
      );
      expect(result).toBe("kebab-case");
    });
  });

  describe("isValidEnum", () => {
    test("should return true for valid enum value", () => {
      const result = isValidEnum("VALUE_ONE", Object.values(TestEnum));
      expect(result).toBe(true);
    });

    test("should return false for invalid value", () => {
      const result = isValidEnum("INVALID", Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for null", () => {
      const result = isValidEnum(null, Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for undefined", () => {
      const result = isValidEnum(undefined, Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for objects", () => {
      const result = isValidEnum({ test: true }, Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for arrays", () => {
      const result = isValidEnum(["VALUE_ONE"], Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for functions", () => {
      const result = isValidEnum(() => "test", Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return true for valid number enum", () => {
      const numericValues = getNumericEnumValues(NumericEnum);
      const result = isValidEnum(0, numericValues);
      expect(result).toBe(true);
    });

    test("should return false for invalid number", () => {
      const numericValues = getNumericEnumValues(NumericEnum);
      const result = isValidEnum(99, numericValues);
      expect(result).toBe(false);
    });

    test("should return true for boolean enum value", () => {
      const result = isValidEnum(true, [true, false]);
      expect(result).toBe(true);
    });

    test("should return false for empty string when not in enum", () => {
      const result = isValidEnum("", Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return false for Symbol", () => {
      const result = isValidEnum(Symbol("test"), Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should handle case-sensitive comparison", () => {
      const result = isValidEnum("value_one", Object.values(TestEnum));
      expect(result).toBe(false);
    });

    test("should return true when exact match exists", () => {
      const result = isValidEnum("KEBAB-CASE", Object.values(TestEnum));
      expect(result).toBe(true);
    });
  });
});
