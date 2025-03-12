import {
  CompletionItemKind,
  CompletionItem,
  TextDocuments,
  TextEdit,
  Range,
  Position,
  InsertTextFormat,
  TextDocumentPositionParams,
  MarkupKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { CnfDirectives } from "../utils/directives";
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

function createTodoMethodItem(label: string): CompletionItem {
  return {
    label: label,
    kind: CompletionItemKind.Method,
    detail: `Detail for ${label} is still TODO :(`,
    documentation: `Documentation for ${label} is still TODO :(`,
  };
}

function createTodoConstantItem(label: string): CompletionItem {
  return {
    label: label,
    kind: CompletionItemKind.Constant,
    detail: `Detail for ${label} is still TODO :(`,
    documentation: `Documentation for ${label} is still TODO :(`,
  };
}

function createRegistrationTypeItem(label: string, encodingType: string): CompletionItem {
  return {
    label: label,
    kind: CompletionItemKind.Constant,
    detail: `Register an item using ${encodingType} encoding.`,
    documentation: {
      kind: MarkupKind.Markdown,
      value:
        "This value should be used as the first argument in the `#.REGISTER` directive, " +
        "just after specifying the field name. An example, assuming you're inside the " +
        "`#.REGISTER` block:\n" +
        `\`SomeName ${encodingType} "oid" "readable-text"\``,
    },
  };
}

/// List of completions that can be inserted in the document.
const completions: CompletionItem[] = [
  ...[CnfDirectives.IMPORT, CnfDirectives.INCLUDE].map(createImportCompletion),
  ...[
    { label: CnfDirectives.TYPE_RENAME, typename: "types" },
    { label: CnfDirectives.FIELD_RENAME, typename: "fields" },
    { label: CnfDirectives.TF_RENAME, typename: "types and fields" },
  ].map(({ label, typename }) => createRenameCompletion(label, typename)),
  ...[
    CnfDirectives.END_OF_CNF,
    CnfDirectives.OPT,
    CnfDirectives.PDU,
    CnfDirectives.REGISTER,
    CnfDirectives.MODULE,
    CnfDirectives.MODULE_IMPORT,
    CnfDirectives.OMIT_ASSIGNMENT,
    CnfDirectives.NO_OMIT_ASSGN,
    CnfDirectives.VIRTUAL_ASSGN,
    CnfDirectives.SET_TYPE,
    CnfDirectives.ASSIGN_VALUE_TO_TYPE,
    CnfDirectives.IMPORT_TAG,
    CnfDirectives.TYPE_ATTR,
    CnfDirectives.ETYPE_ATTR,
    CnfDirectives.FIELD_ATTR,
    CnfDirectives.EFIELD_ATTR,
    CnfDirectives.SYNTAX,
    CnfDirectives.OMIT_ALL_ASSIGNMENTS,
    CnfDirectives.OMIT_ASSIGNMENTS_EXCEPT,
    CnfDirectives.OMIT_ALL_TYPE_ASSIGNMENTS,
    CnfDirectives.OMIT_TYPE_ASSIGNMENTS_EXCEPT,
    CnfDirectives.OMIT_ALL_VALUE_ASSIGNMENTS,
    CnfDirectives.OMIT_VALUE_ASSIGNMENTS_EXCEPT,
    CnfDirectives.EXPORTS,
    CnfDirectives.MODULE_EXPORTS,
    CnfDirectives.USER_DEFINED,
    CnfDirectives.NO_EMIT,
    CnfDirectives.MAKE_ENUM,
    CnfDirectives.MAKE_DEFINES,
    CnfDirectives.USE_VALS_EXT,
    CnfDirectives.FN_HDR,
    CnfDirectives.FN_FTR,
    CnfDirectives.FN_BODY,
    CnfDirectives.FN_PARS,
    CnfDirectives.CLASS,
    CnfDirectives.ASSIGNED_OBJECT_IDENTIFIER,
    CnfDirectives.END,
  ].map(createTodoMethodItem),
  ...[
    "WITH_VALS",
    "WITHOUT_VALS",
    "ONLY_VALS",
    "ONLY_ENUM",
    "WITH_ENUM",
    "VALS_WITH_TABLE",
    "WS_DLL",
    "EXTERN",
    "NO_PROT_PREFIX",
  ].map(createTodoConstantItem),
  ...[
    { label: "N", encodingType: "NUM" },
    { label: "NUM", encodingType: "NUM" },
    { label: "S", encodingType: "STR" },
    { label: "STR", encodingType: "STR" },
    { label: "B", encodingType: "BER" },
    { label: "BER", encodingType: "BER" },
    { label: "P", encodingType: "PER" },
    { label: "PER", encodingType: "PER" },
    { label: "O", encodingType: "OER" },
    { label: "OER", encodingType: "OER" },
  ].map(({ label, encodingType }) => createRegistrationTypeItem(label, encodingType)),
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
