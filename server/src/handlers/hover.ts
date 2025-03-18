import { TextDocuments, TextDocumentPositionParams, Hover } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { extractWordFromLine } from "../utils/textUtils";
import { hoverItems } from "../utils/documentation";

export function onHover(
  documents: TextDocuments<TextDocument>,
  params: TextDocumentPositionParams,
): Hover {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return { contents: [] };
  }

  const line = document.getText().split("\n")[params.position.line];
  const characterIndex = params.position.character;
  const word = extractWordFromLine(line, characterIndex);

  const hoverItem = hoverItems.get(word);
  if (hoverItem) {
    return hoverItem;
  }

  return { contents: [] };
}
