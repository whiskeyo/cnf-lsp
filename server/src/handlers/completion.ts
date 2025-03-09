import {
  CompletionItemKind,
  CompletionItem,
  TextDocuments,
  TextEdit,
  Range,
  Position,
  InsertTextFormat,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import log from "../utils/log";

function createImportIncludeCompletion(label: string): CompletionItem {
  return {
    label,
    insertText: `${label} \${1:filepath}`,
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Method,
    detail: "Include/import another conformance (*.cnf) file.",
    documentation:
      "This directive in the Asn2wrs conformation file is used" +
      " to import external type definitions from another file.",
  };
}

const completions = [
  createImportIncludeCompletion("#.IMPORT"),
  createImportIncludeCompletion("#.INCLUDE"),
] as CompletionItem[];

function getCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
  const line = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: position.character },
  });

  const prefix = line.slice(0, position.character);
  const startCharacter = prefix.lastIndexOf("#.") !== -1 ? prefix.lastIndexOf("#.") : 0;
  const range = Range.create(Position.create(position.line, startCharacter), position);

  return completions.map((completion) => ({
    label: completion.label,
    kind: completion.kind,
    textEdit: TextEdit.replace(range, completion.insertText || completion.label),
  }));
}

export function onCompletion(
  documents: TextDocuments<TextDocument>,
  textDocumentPosition: TextDocumentPositionParams,
): CompletionItem[] {
  log.write({ text: "Completion request received" });

  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) {
    return [];
  }

  const position = textDocumentPosition.position;
  const completionItems = getCompletionItems(document, position);

  log.write({ text: `Completion items: ${JSON.stringify(completionItems)}` });

  return completionItems;
}

export function onCompletionResolve(item: CompletionItem) {
  log.write("Completion resolve request received");

  const completion = completions.find((completion) => completion.label === item.label);
  if (completion) {
    return completion;
  }

  return item;
}
