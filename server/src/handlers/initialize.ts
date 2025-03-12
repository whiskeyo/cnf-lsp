import {
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
} from "vscode-languageserver/node";

function hasDiagnosticRelatedInformationCapability(params: InitializeParams): boolean {
  return !!(
    params.capabilities.textDocument &&
    params.capabilities.textDocument.publishDiagnostics &&
    params.capabilities.textDocument.publishDiagnostics.relatedInformation
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onInitialize(params: InitializeParams): InitializeResult {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
      },
    },
  } as InitializeResult;
}
