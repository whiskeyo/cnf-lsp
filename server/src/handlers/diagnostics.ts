import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  Position,
  TextDocumentChangeEvent,
  Connection,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import {
  findBlocksOfText,
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  splitTextIntoLines,
  doesStartWithUppercase,
  BlockOfTextRange,
  doesStartWithLowercase,
} from "../utils/text";

import { allEncodingTypeStrings, CnfDirectives, textEncodingTypeStrings } from "../utils/constants";
import log from "../utils/log";

/// Validates entries inside the #.REGISTER block
/// @param lines The lines of the document.
/// @returns Diagnostics for the entries inside the #.REGISTER block.
function validateRegisterEntries(
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
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].length),
        ),
        message: "Invalid register entry",
        source: "cnf-lsp",
      });

      continue;
    }

    if (!doesStartWithUppercase(tokens[0])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].indexOf(tokens[0])),
          Position.create(
            blockOfTextRange.start + i + 1,
            registerEntries[i].indexOf(tokens[0]) + tokens[0].length,
          ),
        ),
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      });
    }

    if (!allEncodingTypeStrings.includes(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].indexOf(tokens[1])),
          Position.create(
            blockOfTextRange.start + i + 1,
            registerEntries[i].indexOf(tokens[1]) + tokens[1].length,
          ),
        ),
        message: `Invalid encoding type! Please use one of ${allEncodingTypeStrings.join(", ")}.`,
        source: "cnf-lsp",
      });
    }

    if (textEncodingTypeStrings.includes(tokens[1]) && tokens.length !== 4) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].length),
        ),
        message: `Invalid number of arguments for encoding type ${tokens[1]}.`,
        source: "cnf-lsp",
      });
    }
  }

  return diagnostics;
}

function validateFieldRenames(lines: string[], blockOfTextRange: BlockOfTextRange): Diagnostic[] {
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
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, fieldRenameEntries[i].length),
        ),
        message: "Invalid field rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      });

      continue;
    }
    if (!doesStartWithLowercase(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, fieldRenameEntries[i].length),
        ),
        message: "Field name should always start with a lowercase letter",
        source: "cnf-lsp",
      });
    }
  }
  return diagnostics;
}

function validateTypeRenames(lines: string[], blockOfTextRange: BlockOfTextRange): Diagnostic[] {
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
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, typeRenameEntries[i].length),
        ),
        message: "Invalid type rename entry. Expected 2 tokens.",
        source: "cnf-lsp",
      });

      continue;
    }
    if (!doesStartWithUppercase(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, typeRenameEntries[i].length),
        ),
        message: "Type name should always start with a uppercase letter",
        source: "cnf-lsp",
      });
    }
  }
  return diagnostics;
}

type BlockValidator = (lines: string[], blockOfTextRange: BlockOfTextRange) => Diagnostic[];

function validateAllBlocks(
  lines: string[],
  validators: [BlockValidator, string, string][],
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const [validator, startMarker, endMarker] of validators) {
    const blocks = findBlocksOfText(startMarker, endMarker, lines);
    log.write("Blocks for " + startMarker + ": " + JSON.stringify(blocks));
    for (const block of blocks) {
      let newDiagnostics = validator(lines, block);
      log.write("Diagnostics for " + startMarker + ": " + JSON.stringify(newDiagnostics));
      diagnostics.push(...newDiagnostics);
    }
  }

  return diagnostics;
}

/// Handles document changes and provides diagnostics.
/// @param connection The connection to the client.
/// @param change The change event.
export function onDocumentChange(
  connection: Connection,
  change: TextDocumentChangeEvent<TextDocument>,
) {
  const lines = splitTextIntoLines(change.document.getText());
  const nextDirectiveStart = "#.";

  const diagnostics: Diagnostic[] = validateAllBlocks(lines, [
    [validateRegisterEntries, CnfDirectives.REGISTER, nextDirectiveStart],
    [validateFieldRenames, CnfDirectives.FIELD_RENAME, nextDirectiveStart],
    [validateTypeRenames, CnfDirectives.TYPE_RENAME, nextDirectiveStart],
  ]);

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
}
