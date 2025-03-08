import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  CompletionItemKind,
  CompletionItem,
  TextDocumentPositionParams,
  InsertTextMode,
  Range,
  Position,
  TextEdit,
} from "vscode-languageserver/node";

import log from "./log";
import { completions, getCompletionItems } from "./completions"
import { TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
      },
    },
  };

  return result;
});

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams) => {
  log.write({ text: "Completion request received" });

  const document = documents.get(textDocumentPosition.textDocument.uri);
  if (!document) {
    return [];
  }

  const position = textDocumentPosition.position;
  const completionItems = getCompletionItems(document, position);

  log.write({ text: `Completion items: ${JSON.stringify(completionItems)}` });

  return completionItems;
});

connection.onCompletionResolve((item: CompletionItem) => {
  log.write("Completion resolve request received");
  return item;
});

documents.onDidChangeContent((change) => {
  connection.window.showInformationMessage(
    "onDidChangeContent: " + change.document.uri
  );
  log.write(change.document);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
