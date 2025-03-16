import { validateTypeRenames } from "./typeRename";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import { BlockOfTextRange } from "../../utils/textUtils";

describe("validateTypeRenames", () => {
  test("should return empty array if no lines are provided", () => {
    const lines: string[] = [];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if no type rename entries are provided", () => {
    const lines = ["#.TYPE_RENAME"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 0 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if type rename entries are empty", () => {
    const lines = ["#.TYPE_RENAME", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 1 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return empty array if type rename entries are valid", () => {
    const lines = ["#.TYPE_RENAME", "OldName NewName"];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 1 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([]);
  });

  test("should return error diagnostic if type rename entry is invalid", () => {
    const lines = ["#.TYPE_RENAME", "OldName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 1, character: 0 }, end: { line: 1, character: 7 } },
        message: "Invalid type rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      },
    ]);
  });

  test("should return warning diagnostic if type name does not start with uppercase letter", () => {
    const lines = ["#.TYPE_RENAME", "OldName newName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 2 };

    const result = validateTypeRenames(lines, blockOfTextRange);

    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: 1, character: 8 }, end: { line: 1, character: 15 } },
        message: "Type name should always start with a uppercase letter",
        source: "cnf-lsp",
      },
    ]);
  });

  test("should return multiple diagnostics if multiple type rename entries are invalid", () => {
    const lines = ["#.TYPE_RENAME", "OldName NewName", "oldName", "OldName newName", ""];
    const blockOfTextRange: BlockOfTextRange = { start: 0, end: 4 };

    const result = validateTypeRenames(lines, blockOfTextRange);
    expect(result).toEqual([
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 2, character: 0 }, end: { line: 2, character: 7 } },
        message: "Invalid type rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      },
      {
        severity: DiagnosticSeverity.Warning,
        range: { start: { line: 3, character: 8 }, end: { line: 3, character: 15 } },
        message: "Type name should always start with a uppercase letter",
        source: "cnf-lsp",
      },
    ]);
  });
});
