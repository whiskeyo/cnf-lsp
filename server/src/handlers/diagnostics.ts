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

interface BlockOfTextRange {
  start: number;
  end: number;
}

function findBlockOfText(startText: string, endText: string, lines: string[]): BlockOfTextRange {
  let start = -1;
  let end = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(startText)) {
      start = i;
      i++;
    }
    if (start !== -1 && lines[i].startsWith(endText)) {
      end = i;
      break;
    }
  }

  if (start !== -1 && end === -1) {
    // EOF case
    end = lines.length;
  }

  return { start, end };
}

function isBlockOfTextRangeValid(blockOfTextRange: BlockOfTextRange): boolean {
  return blockOfTextRange.start !== -1; // if end is -1, it means we reached the EOF
}

function stripComment(line: string): string {
  return line.split("#")[0].trim();
}

function changeWhitespacesToSingleSpace(line: string): string {
  return line.replace(/\s+/g, " ");
}

function validateRegisterEntries(document: TextDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const text = document.getText();
  const lines = text.split(/\r?\n/g);

  let blockOfTextRange = findBlockOfText("#.REGISTER", "#.", lines);
  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    log.write({
      text: `No register block found [start: ${blockOfTextRange.start}, end: ${blockOfTextRange.end}]`,
    });
    return diagnostics;
  }

  let registerEntries = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map(stripComment)
    .map(changeWhitespacesToSingleSpace)
    .filter((entry) => entry.trim() !== "");
  log.write({ text: `Register entries: ${registerEntries}, length: ${registerEntries.length}` });
  for (let i = 0; i < registerEntries.length; i++) {
    log.write({ text: `Register entry: ${registerEntries[i]}` });
    let registerEntry = registerEntries[i];
    let tokens = registerEntry.split(" ");
    log.write({ text: `Tokens: ${tokens}` });

    if (tokens.length !== 3 && tokens.length !== 4) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntry.length),
        ),
        message: "Invalid register entry",
        source: "cnf-lsp",
      });

      continue;
    }

    if (tokens[0][0].toUpperCase() !== tokens[0][0]) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntry.length),
        ),
        message: "Type name should always start with an uppercase letter",
        source: "cnf-lsp",
      });
    }

    // check if tokens[1] is one of keys: N|S|B|P|O|NUM|STR|BER|PER|OER
    const encodingTypes = ["N", "NUM", "S", "STR", "B", "BER", "P", "PER", "O", "OER"];
    if (!encodingTypes.includes(tokens[1])) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntry.length),
        ),
        message: `Invalid encoding type! Please use one of ${encodingTypes.join(", ")}.`,
        source: "cnf-lsp",
      });
    }

    const encodingTypesWithFourArgs = ["N", "NUM", "S", "STR"];
    if (encodingTypesWithFourArgs.includes(tokens[1]) && tokens.length !== 4) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: Range.create(
          Position.create(blockOfTextRange.start + i + 1, 0),
          Position.create(blockOfTextRange.start + i + 1, registerEntry.length),
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
