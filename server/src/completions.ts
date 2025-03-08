import {
    CompletionItemKind,
    CompletionItem,
    TextEdit,
    Range,
    Position,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

const importIncludeDetail = "Include/import another conformance (*.cnf) file.";
const importIncludeDocumentation =
    "This directive in the Asn2wrs conformation file is used to import external" +
    " type definitions from another file.";

export const completions = [
    {
        label: "#.IMPORT",
        insertText: "#.IMPORT",
        kind: CompletionItemKind.Method,
        documentation: importIncludeDocumentation,
        detail: importIncludeDetail,
    },
    {
        label: "#.INCLUDE",
        insertText: "#.INCLUDE",
        kind: CompletionItemKind.Method,
        documentation: importIncludeDocumentation,
        detail: importIncludeDetail,
    }
] as CompletionItem[];

export function getCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    const line = document.getText({
        start: { line: position.line, character: 0 },
        end: { line: position.line, character: position.character },
    });

    const prefix = line.slice(0, position.character);
    const startCharacter = prefix.lastIndexOf("#.") !== -1 ? prefix.lastIndexOf("#.") : 0;
    const range = Range.create(
        Position.create(position.line, startCharacter),
        position
    );

    return completions.map((completion) => ({
        ...completion,
        textEdit: TextEdit.replace(range, completion.insertText || completion.label),
    }));
}
