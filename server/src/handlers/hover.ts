import { TextDocuments, TextDocumentPositionParams, Hover } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import log from "../utils/log";
import { extractWordFromLine } from "../utils/textUtils";

export function onHover(
  documents: TextDocuments<TextDocument>,
  params: TextDocumentPositionParams,
): Hover {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    log.write("[onHover] Document not found");
    return { contents: [] };
  }

  const line = document.getText().split("\n")[params.position.line];
  const characterIndex = params.position.character;
  const word = extractWordFromLine(line, characterIndex);

  const hoverContent = `You hovered over the word: ${word}`;

  log.write(`[onHover] Hovered over the word: ${word}`);
  return {
    contents: {
      kind: "markdown",
      value: hoverContent,
    },
  };
}
