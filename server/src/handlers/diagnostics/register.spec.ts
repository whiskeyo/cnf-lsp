import { validateRegisterEntries } from "./register";
import { BlockOfTextRange } from "../../utils/textUtils";

import { DiagnosticSeverity } from "vscode-languageserver/node";
import { allEncodingTypeStrings, textEncodingTypeStrings } from "../../utils/constants";

describe("validateRegisterEntries", () => {
  test("should return empty array if no lines are provided", () => {
    const lines: string[] = [];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if block of range is invalid", () => {
    const lines = ["#.REGISTER"];
    const blockOfTextRange: BlockOfTextRange = { start: -1, end: -1 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if no register entries are provided", () => {
    const lines = ["#.REGISTER"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if register entries are empty", () => {
    const lines = ["#.REGISTER", "", "", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 3 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if register entries are valid", () => {
    const lines = ["#.REGISTER", "REGISTER_ASN1 1 2"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 1 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test.each(textEncodingTypeStrings)(
    "returns diagnostics for wrong number of text encoding tokens: %s",
    (textEncodingType) => {
      const lines = ["#.REGISTER", `SomeParameter ${textEncodingType} blablabla`, ""];
      const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

      const result = validateRegisterEntries(lines, blockOfTextRange);

      expect(result).toEqual([
        {
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: 1, character: 0 },
            end: { line: 1, character: lines[1].length },
          },
          message: `Invalid number of arguments for encoding type ${textEncodingType}.`,
          source: "cnf-lsp",
        },
      ]);
    },
  );

  test.each(allEncodingTypeStrings)(
    "returns diagnostics for wrong number of tokens for encoding type: %s",
    (encodingType) => {
      const lines = ["#.REGISTER", `SomeParameter ${encodingType} 1 2 3`, ""];
      const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

      const result = validateRegisterEntries(lines, blockOfTextRange);

      expect(result).toEqual([
        {
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: 1, character: 0 },
            end: { line: 1, character: lines[1].length },
          },
          message: "Invalid register entry",
          source: "cnf-lsp",
        },
      ]);
    },
  );

  test("returns diagnostics for type starting with lowercase letter", () => {
    const lines = ["#.REGISTER", "someLowercaseType BER aaa bbb", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 17 } },
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      },
    ]);
  });

  test("returns diagnostics for invalid encoding type", () => {
    const lines = ["#.REGISTER", "SomeType INVALID aaa bbb", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateRegisterEntries(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 1, character: 9 }, end: { line: 1, character: 16 } },
        message: `Invalid encoding type! Please use one of ${allEncodingTypeStrings.join(", ")}.`,
        source: "cnf-lsp",
      },
    ]);
  });
});
