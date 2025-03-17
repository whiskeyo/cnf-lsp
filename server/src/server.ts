import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  CompletionItem,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";

import { debounce } from "lodash";

import { onCompletion, onCompletionResolve } from "./handlers/completion";
import { onDocumentChange } from "./handlers/diagnostic";
import { TextDocument } from "vscode-languageserver-textdocument";
import { onInitialize } from "./handlers/initialize";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
const debounceTimeout = 100; // milliseconds

connection.onInitialize((params: InitializeParams) => onInitialize(params));
connection.onCompletion((params: TextDocumentPositionParams) => onCompletion(documents, params));
connection.onCompletionResolve((item: CompletionItem) => onCompletionResolve(item));

const onDidChangeContentDebounced = debounce(
  (connection, change) => onDocumentChange(connection, change),
  debounceTimeout,
);
documents.onDidChangeContent((change) => onDidChangeContentDebounced(connection, change));

documents.listen(connection);
connection.listen();
