import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { debounce } from "lodash";

import { onCompletion, onCompletionResolve } from "./handlers/completion";
import { onDocumentChange } from "./handlers/diagnostic";
import { onInitialize } from "./handlers/initialize";
import { onHover } from "./handlers/hover";
import log from "./utils/log";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const debounceTimeout = 100; // milliseconds

connection.onInitialize((params: InitializeParams) => onInitialize(params));
connection.onCompletion((params: TextDocumentPositionParams) => onCompletion(documents, params));
connection.onCompletionResolve((item: CompletionItem) => onCompletionResolve(item));
connection.onHover((params) => {
  log.write(`[onHover] onHover received: ${JSON.stringify(params)}`);
  return onHover(documents, params);
});

documents.onDidOpen((event) => {
  log.write(`[onDidOpen] Document opened: ${event.document.uri}`);
  onDocumentChange(connection, { document: event.document });
});

const onDidChangeContentDebounced = debounce(
  (change) => onDocumentChange(connection, change),
  debounceTimeout,
);
documents.onDidChangeContent((change) => onDidChangeContentDebounced(change));

documents.listen(connection);
connection.listen();
