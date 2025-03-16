import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import {
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  BlockOfTextRange,
  doesStartWithLowercase,
  createRangeForToken,
  createRangeForLine,
} from "../../utils/textUtils";

/// Validates entries inside the #.FIELD_RENAME block
/// @param lines The lines of the document.
/// @param blockOfTextRange The range of the #.FIELD_RENAME block.
/// @returns Diagnostics for the entries inside the #.FIELD_RENAME block.
export function validateFieldRenames(
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    return diagnostics;
  }

  const fieldRenameEntries = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map((line) => stripComment(line, "#"))
    .map(changeWhitespacesToSingleSpace);

  const expectedTokensCount = 2;
  for (let i = 0; i < fieldRenameEntries.length; i++) {
    if (fieldRenameEntries[i].trim() === "") {
      continue;
    }

    const tokens = fieldRenameEntries[i].split(" ");
    if (tokens.length !== expectedTokensCount) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForLine(fieldRenameEntries, blockOfTextRange, i),
        message: "Invalid field rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      });

      continue;
    }
    if (!doesStartWithLowercase(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: createRangeForToken(fieldRenameEntries, blockOfTextRange, i, tokens[1]),
        message: "Field name should always start with a lowercase letter",
        source: "cnf-lsp",
      });
    }
  }
  return diagnostics;
}
