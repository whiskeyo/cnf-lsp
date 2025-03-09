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

function createImportCompletion(label: string): CompletionItem {
  return {
    label: label,
    insertText: `${label} \${1:filepath}`,
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Method,
    detail: "Include/import another conformance (*.cnf) file.",
    documentation:
      "This directive in the Asn2wrs conformation file is used" +
      " to import external type definitions from another file.",
  };
}

function createRenameCompletion(label: string, typename: string): CompletionItem {
  return {
    label: label,
    insertText: label,
    insertTextFormat: InsertTextFormat.Snippet,
    kind: CompletionItemKind.Method,
    detail: `Start block of renames for ${typename}.`,
    documentation: `This directive in the Asn2wrs conformation file starts a block in which ${typename} can be renamed.`,
  };
}

function createTodoCompletionItem(label: string): CompletionItem {
  return {
    label: label,
    kind: CompletionItemKind.Method,
    detail: `Detail for ${label} is still TODO :(`,
    documentation: `Documentation for ${label} is still TODO :(`,
  };
}

/// List of completions that can be inserted in the document.
const completions: CompletionItem[] = [
  createImportCompletion("#.IMPORT"),
  createImportCompletion("#.INCLUDE"),
  createRenameCompletion("#.TYPE_RENAME", "types"),
  createRenameCompletion("#.FIELD_RENAME", "fields"),
  createRenameCompletion("#.TF_RENAME", "types and fields"),
  createTodoCompletionItem("#.END_OF_CNF"),
  createTodoCompletionItem("#.OPT"),
  createTodoCompletionItem("#.PDU"),
  createTodoCompletionItem("#.REGISTER"),
  createTodoCompletionItem("#.MODULE"),
  createTodoCompletionItem("#.MODULE_IMPORT"),
  createTodoCompletionItem("#.OMIT_ASSIGNMENT"),
  createTodoCompletionItem("#.NO_OMIT_ASSGN"), // can't find anything about it
  createTodoCompletionItem("#.VIRTUAL_ASSGN"),
  createTodoCompletionItem("#.SET_TYPE"),
  createTodoCompletionItem("#.ASSIGN_VALUE_TO_TYPE"),
  createTodoCompletionItem("#.IMPORT_TAG"),
  createTodoCompletionItem("#.TYPE_ATTR"),
  createTodoCompletionItem("#.ETYPE_ATTR"), // can't find anything about it
  createTodoCompletionItem("#.FIELD_ATTR"),
  createTodoCompletionItem("#.EFIELD_ATTR"), // can't find anything about it
  createTodoCompletionItem("#.SYNTAX"),
  createTodoCompletionItem("#.OMIT_ALL_ASSIGNMENTS"), // can't find anything about it
  createTodoCompletionItem("#.OMIT_ASSIGNMENTS_EXCEPT"), // check how it works
  createTodoCompletionItem("#.OMIT_ALL_TYPE_ASSIGNMENTS"), // can't find anything about it
  createTodoCompletionItem("#.OMIT_TYPE_ASSIGNMENTS_EXCEPT"), // can't find anything about it
  createTodoCompletionItem("#.OMIT_ALL_VALUE_ASSIGNMENTS"), // can't find anything about it
  createTodoCompletionItem("#.OMIT_VALUE_ASSIGNMENTS_EXCEPT"), // can't find anything about it
  createTodoCompletionItem("#.EXPORTS"),
  createTodoCompletionItem("#.MODULE_EXPORTS"),
  createTodoCompletionItem("#.USER_DEFINED"), // can't find anything about it
  createTodoCompletionItem("#.NO_EMIT"),
  createTodoCompletionItem("#.MAKE_ENUM"),
  createTodoCompletionItem("#.MAKE_DEFINES"),
  createTodoCompletionItem("#.USE_VALS_EXT"),
  createTodoCompletionItem("#.FN_HDR"),
  createTodoCompletionItem("#.FN_FTR"),
  createTodoCompletionItem("#.FN_BODY"),
  createTodoCompletionItem("#.FN_PARS"),
  createTodoCompletionItem("#.CLASS"),
  createTodoCompletionItem("#.ASSIGNED_OBJECT_IDENTIFIER"),
  createTodoCompletionItem("#.END"),
];

/// Returns a list of completion items for the given document and position. The list is based on the
/// text before the cursor and the list of completions. The text before the cursor is used to determine
/// the completion prefix and the range of text that should be replaced by the completion.
/// @param document The document for which completions are requested.
/// @param position The position in the document where completions are requested.
/// @returns A list of completion items.
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

/// Handles a completion request.
/// @param documents The collection of documents.
/// @param textDocumentPosition The position in the document where completions are requested.
/// @returns A list of completion items.
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

/// Handles a completion resolve request. This function is called when a completion item is selected
/// by the user and the client requests additional information about the completion item.
/// @param item The completion item that should be resolved.
/// @returns The resolved completion item.
export function onCompletionResolve(item: CompletionItem) {
  log.write("Completion resolve request received");

  const completion = completions.find((completion) => completion.label === item.label);
  if (completion) {
    return completion;
  }

  return item;
}
