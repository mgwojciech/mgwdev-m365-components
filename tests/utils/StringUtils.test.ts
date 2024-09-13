import { vitest, describe, test, expect } from 'vitest';
import { camelCase } from '../../src/utils';

describe("camelCase", () => {
    test("should return a camelCase string", () => {
        const value = "camel-case-string";
        const result = camelCase(value);
        expect(result).toBe("camelCaseString");
    });
});