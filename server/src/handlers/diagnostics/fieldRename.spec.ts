import { validateFieldRenames } from "./fieldRename";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import { BlockOfTextRange } from "../../utils/textUtils";

describe("validateFieldRenames", () => {
  test("should return empty array if no lines are provided", () => {
    const lines: string[] = [];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if block of range is invalid", () => {
    const lines = ["#.FIELD_RENAME"];
    const blockOfTextRange: BlockOfTextRange = { start: -1, end: -1 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if no field rename entries are provided", () => {
    const lines = ["#.FIELD_RENAME"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if field rename entries are empty", () => {
    const lines = ["#.FIELD_RENAME", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 1 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if field rename entries are valid", () => {
    const lines = ["#.FIELD_RENAME", "oldName newName"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 1 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return error diagnostic if field rename entry is invalid", () => {
    const lines = ["#.FIELD_RENAME", "oldName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 7 } },
        message: "Invalid field rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      },
    ]);
  });

  test("should return warning diagnostic if field name does not start with lowercase letter", () => {
    const lines = ["#.FIELD_RENAME", "oldName NewName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateFieldRenames(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: 1, character: 8 }, end: { line: 1, character: 15 } },
        message: "Field name should always start with a lowercase letter",
        source: "cnf-lsp",
      },
    ]);
  });

  test("should return multiple diagnostics if multiple field rename entries are invalid", () => {
    const lines = ["#.FIELD_RENAME", "oldName newName", "oldName", "oldName NewName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 4 };

    const result = validateFieldRenames(lines, blockOfTextRange);
    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 2, character: 0 }, end: { line: 2, character: 7 } },
        message: "Invalid field rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      },
      {
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: 3, character: 8 }, end: { line: 3, character: 15 } },
        message: "Field name should always start with a lowercase letter",
        source: "cnf-lsp",
      },
    ]);
  });
});
