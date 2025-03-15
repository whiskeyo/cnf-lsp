import { Diagnostic, TextDocumentChangeEvent, Connection } from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import { findBlocksOfText, splitTextIntoLines, BlockOfTextRange } from "../utils/textUtils";

import { CnfDirectives } from "../utils/constants";
import log from "../utils/log";
import { validateRegisterEntries } from "./diagnostics/register";
import { validateFieldRenames } from "./diagnostics/fieldRename";
import { validateTypeRenames } from "./diagnostics/typeRename";

/// A block validator function type. It takes a block of text and returns diagnostics,
/// if any are found. Made specifically for the validateAllBlocks function to simplify
/// calling multiple validators.
type BlockValidator = (lines: string[], blockOfTextRange: BlockOfTextRange) => Diagnostic[];

function validateAllBlocks(
  lines: string[],
  validators: [BlockValidator, string, string][],
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const [validator, startMarker, endMarker] of validators) {
    const blocks = findBlocksOfText(startMarker, endMarker, lines);
    for (const block of blocks) {
      const newDiagnostics = validator(lines, block);
      log.write(`Diagnostics for ${startMarker} [lines ${block.start}-${block.end}]:`);
      for (const diag of newDiagnostics) {
        log.write(JSON.stringify(diag, null, 2));
      }

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
