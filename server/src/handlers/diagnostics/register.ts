import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver/node";

import {
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  doesStartWithUppercase,
  BlockOfTextRange,
  createRangeForToken,
  createRangeForLine,
} from "../../utils/textUtils";

import { allEncodingTypeStrings, textEncodingTypeStrings } from "../../utils/constants";

/// Validates entries inside the #.REGISTER block
/// @param lines The lines of the document.
/// @returns Diagnostics for the entries inside the #.REGISTER block.
export function validateRegisterEntries(
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    return diagnostics;
  }

  const registerEntries = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map((line) => stripComment(line, "#"))
    .map((line) => stripComment(line, "-"))
    .map(changeWhitespacesToSingleSpace);

  for (let i = 0; i < registerEntries.length; i++) {
    if (registerEntries[i].trim() === "") {
      continue;
    }

    const tokens = registerEntries[i].split(" ");

    const tokensCountForAsnEncoding = 3;
    const tokensCountForAsnAndTextEncoding = 4;
    if (
      tokens.length !== tokensCountForAsnEncoding &&
      tokens.length !== tokensCountForAsnAndTextEncoding
    ) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForLine(registerEntries, blockOfTextRange, i),
        message: "Invalid register entry",
        source: "cnf-lsp",
      });

      continue;
    }

    if (!doesStartWithUppercase(tokens[0])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: createRangeForToken(registerEntries, blockOfTextRange, i, tokens[0]),
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      });
    }

    if (!allEncodingTypeStrings.includes(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForToken(registerEntries, blockOfTextRange, i, tokens[1]),
        message: `Invalid encoding type! Please use one of ${allEncodingTypeStrings.join(", ")}.`,
        source: "cnf-lsp",
      });
    }

    if (textEncodingTypeStrings.includes(tokens[1]) && tokens.length !== 4) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForLine(registerEntries, blockOfTextRange, i),
        message: `Invalid number of arguments for encoding type ${tokens[1]}.`,
        source: "cnf-lsp",
      });
    }
  }

  return diagnostics;
}
