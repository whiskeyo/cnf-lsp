import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import {
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  BlockOfTextRange,
  doesStartWithUppercase,
  createRangeForToken,
  createRangeForLine,
} from "../../utils/textUtils";

/// Validates entries inside the #.TYPE_RENAME block
/// @param lines The lines of the document.
/// @param blockOfTextRange The range of the #.TYPE_RENAME block.
/// @returns Diagnostics for the entries inside the #.TYPE_RENAME block.
export function validateTypeRenames(
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    return diagnostics;
  }

  const typeRenameEntries = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map((line) => stripComment(line, "#"))
    .map(changeWhitespacesToSingleSpace);

  const expectedTokensCount = 2;
  for (let i = 0; i < typeRenameEntries.length; i++) {
    if (typeRenameEntries[i].trim() === "") {
      continue;
    }

    const tokens = typeRenameEntries[i].split(" ");
    if (tokens.length !== expectedTokensCount) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForLine(typeRenameEntries, blockOfTextRange, i),
        message: "Invalid type rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      });

      continue;
    }
    if (!doesStartWithUppercase(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: createRangeForToken(typeRenameEntries, blockOfTextRange, i, tokens[1]),
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      });
    }
  }
  return diagnostics;
}
