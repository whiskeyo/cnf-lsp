import {
  Diagnostic,
  TextDocumentChangeEvent,
  Connection,
  DiagnosticSeverity,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  findBlocksOfText,
  splitTextIntoLines,
  BlockOfTextRange,
  isBlockOfTextRangeValid,
  stripComment,
  changeWhitespacesToSingleSpace,
  createRangeForToken,
  createRangeForLine,
} from "../utils/textUtils";
import { Element, ElementDiagnosticType, elements } from "../utils/documentation";

import log from "../utils/log";

function diagnoseBlock(
  element: Element,
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!element.diagnostics) {
    return diagnostics;
  }

  if (!isBlockOfTextRangeValid(blockOfTextRange)) {
    return diagnostics;
  }

  const block = lines
    .slice(blockOfTextRange.start + 1, blockOfTextRange.end)
    .map((line) => stripComment(line, "#"))
    .map(changeWhitespacesToSingleSpace);

  for (let i = 0; i < block.length; i++) {
    log.write(`Diagnosing line ==> ${block[i]}`);
    if (block[i].trim() === "") {
      continue;
    }

    const tokens = block[i].split(" ");

    let hasDiagnosed = false;
    element.diagnostics?.forEach((diag) => {
      if (
        diag.diagnosticType === ElementDiagnosticType.BODY &&
        tokens.length === diag.expectedNumberOfTokens
      ) {
        diag.checkers.forEach((checker) => {
          if (checker.checkFunction(tokens[checker.tokenIndex])) {
            diagnostics.push({
              severity: checker.severity,
              range: createRangeForToken(block, blockOfTextRange, i, tokens[checker.tokenIndex]),
              message: checker.message,
              source: "cnf-lsp",
            });
          }
        });
        hasDiagnosed = true;
      }
    });

    if (!hasDiagnosed) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: createRangeForLine(block, blockOfTextRange, i),
        message: `Invalid ${element.label} entry.`,
        source: "cnf-lsp",
      });
    }
  }

  return diagnostics;
}

function diagnoseAllBlocks(lines: string[]) {
  const diagnostics: Diagnostic[] = [];
  const nextDirectiveStart = "#.";

  for (const element of elements) {
    const blocks = findBlocksOfText(element.label, nextDirectiveStart, lines);
    for (const block of blocks) {
      diagnostics.push(...diagnoseBlock(element, lines, block));
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
  const diagnostics: Diagnostic[] = diagnoseAllBlocks(lines);
  connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
}
