import {
  Diagnostic,
  DiagnosticSeverity,
  TextDocuments,
  Range,
  Position,
  TextDocumentChangeEvent,
  Connection,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import log from "../utils/log";
import {
  findBlockOfText,
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  splitTextIntoLines,
  doesStartWithUppercase,
} from "../utils/text";

import { allEncodingTypeStrings, textEncodingTypeStrings } from "../utils/constants";

function validateRegisterEntries(document: TextDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();
  const lines = splitTextIntoLines(text);

  const blockOfTextRange = findBlockOfText("#.REGISTER", "#.", lines);
  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    return diagnostics;
  }

  const registerEntries = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map((line) => stripComment(line, "#"))
    .map((line) => stripComment(line, "-"))
    .map(changeWhitespacesToSingleSpace)
    .filter((entry) => entry.trim() !== "");

  for (let i = 0; i < registerEntries.length; i++) {
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
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].length),
        ),
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      });
    }

    if (!allEncodingTypeStrings.includes(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntries[i].length),
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

/// Analyzes the document and returns a list of diagnostics.
/// @param document The document to analyze.
/// @returns A list of diagnostics.
function getDiagnostics(document: TextDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();
  const lines = text.split(/\r?\n/g);

  lines.forEach((line, i) => {
    const index = line.indexOf("TODO");
    if (index !== -1) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: Range.create(Position.create(i, index), Position.create(i, index + 4)),
        message: "TODO found",
        source: "cnf-lsp",
      });
    }
  });

  return diagnostics;
}

/// Handles document changes and provides diagnostics.
/// @param documents The collection of documents.
export function onDocumentChange(
  documents: TextDocuments<TextDocument>,
  connection: Connection,
  change: TextDocumentChangeEvent<TextDocument>,
) {
  log.write({ text: "Document change detected" });

  const diagnostics = getDiagnostics(change.document);
  diagnostics.push(...validateRegisterEntries(change.document));

  log.write({ text: `Diagnostics: ${JSON.stringify(diagnostics)}` });

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
}
