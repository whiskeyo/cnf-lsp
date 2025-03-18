import {
  CompletionItem,
  CompletionItemKind,
  Hover,
  InsertTextFormat,
  MarkupKind,
} from "vscode-languageserver/node";

import { CnfDirectives, EncodingTypes } from "./constants";

type Element = {
  label: string;
  kind: CompletionItemKind;
  detail: string;
  documentation: string;
  insertText?: string;
  insertTextFormat?: InsertTextFormat;
};

const DirectiveRegister: Element = {
  label: CnfDirectives.REGISTER,
  kind: CompletionItemKind.Keyword,
  detail: "Register a dissector for an object to an OID.",
  documentation:
    "`#.REGISTER` directive in the Asn2wrs conformation file can be used to register a dissector for an " +
    "object to an OID. This is very useful for X.509 and similar protocols where structures and " +
    "objects are frequently associated with an OID. In particular, some of the structures here " +
    "encode an OID in a field and then the content in a different field later, and how that field " +
    "is to be dissected depends on the previously seen OID.",
};

const DirectiveImport: Element = {
  label: CnfDirectives.IMPORT,
  kind: CompletionItemKind.Keyword,
  detail: "Include/import another conformance (*.cnf) file.",
  documentation:
    "`#.IMPORT` directive in the Asn2wrs conformation file is used" +
    " to import external type definitions from another file.",
  insertText: `${CnfDirectives.IMPORT} \${1:filepath}`,
  insertTextFormat: InsertTextFormat.Snippet,
};

const DirectiveInclude: Element = {
  label: CnfDirectives.INCLUDE,
  kind: CompletionItemKind.Keyword,
  detail: "Include/import another conformance (*.cnf) file.",
  documentation:
    "`#.INCLUDE` directive in the Asn2wrs conformation file is used" +
    " to import external type definitions from another file.",
  insertText: `${CnfDirectives.INCLUDE} \${1:filepath}`,
  insertTextFormat: InsertTextFormat.Snippet,
};

const DirectiveTypeRename: Element = {
  label: CnfDirectives.TYPE_RENAME,
  kind: CompletionItemKind.Keyword,
  detail: "Rename a type.",
  documentation:
    "`#.TYPE_RENAME` directive in the Asn2wrs conformation file is used" + " to rename a type.",
};

const DirectiveFieldRename: Element = {
  label: CnfDirectives.FIELD_RENAME,
  kind: CompletionItemKind.Keyword,
  detail: "Rename a field.",
  documentation:
    "`#.FIELD_RENAME` directive in the Asn2wrs conformation file is used" + " to rename a field.",
};

const DirectiveTFRename: Element = {
  label: CnfDirectives.TF_RENAME,
  kind: CompletionItemKind.Keyword,
  detail: "Rename a type or field.",
  documentation:
    "`#.TF_RENAME` directive in the Asn2wrs conformation file is used" +
    " to rename a type or field.",
};

function createConstantEncodingDetail(name: string, shortName: string): string {
  return `Register an item using ${name} encoding (abbreviated as ${shortName}).`;
}

function createConstantEncodingDocumentation(name: string, shortName: string): string {
  return `Encoding type ${name} (abbreviated as ${shortName})`;
}

const ConstantEncodingN: Element = {
  label: EncodingTypes.N,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.NUM, EncodingTypes.N),
  documentation: createConstantEncodingDocumentation(EncodingTypes.NUM, EncodingTypes.N),
};

const ConstantEncodingNum: Element = {
  label: EncodingTypes.NUM,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.NUM, EncodingTypes.N),
  documentation: createConstantEncodingDocumentation(EncodingTypes.NUM, EncodingTypes.N),
};

const ConstantEncodingS: Element = {
  label: EncodingTypes.S,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.STR, EncodingTypes.S),
  documentation: createConstantEncodingDocumentation(EncodingTypes.STR, EncodingTypes.S),
};

const ConstantEncodingStr: Element = {
  label: EncodingTypes.STR,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.STR, EncodingTypes.S),
  documentation: createConstantEncodingDocumentation(EncodingTypes.STR, EncodingTypes.S),
};

const ConstantEncodingB: Element = {
  label: EncodingTypes.B,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.BER, EncodingTypes.B),
  documentation: createConstantEncodingDocumentation(EncodingTypes.BER, EncodingTypes.B),
};

const ConstantEncodingBer: Element = {
  label: EncodingTypes.BER,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.BER, EncodingTypes.B),
  documentation: createConstantEncodingDocumentation(EncodingTypes.BER, EncodingTypes.B),
};

const ConstantEncodingP: Element = {
  label: EncodingTypes.P,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.PER, EncodingTypes.P),
  documentation: createConstantEncodingDocumentation(EncodingTypes.PER, EncodingTypes.P),
};

const ConstantEncodingPer: Element = {
  label: EncodingTypes.PER,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.PER, EncodingTypes.P),
  documentation: createConstantEncodingDocumentation(EncodingTypes.PER, EncodingTypes.P),
};

const ConstantEncodingO: Element = {
  label: EncodingTypes.O,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.OER, EncodingTypes.O),
  documentation: createConstantEncodingDocumentation(EncodingTypes.OER, EncodingTypes.O),
};

const ConstantEncodingOer: Element = {
  label: EncodingTypes.OER,
  kind: CompletionItemKind.Constant,
  detail: createConstantEncodingDetail(EncodingTypes.OER, EncodingTypes.O),
  documentation: createConstantEncodingDocumentation(EncodingTypes.OER, EncodingTypes.O),
};

function createCompletionItem(element: Element): CompletionItem {
  return {
    label: element.label,
    kind: element.kind,
    detail: element.detail,
    documentation: {
      kind: MarkupKind.Markdown,
      value: element.documentation,
    },
    insertText: element.insertText,
    insertTextFormat: element.insertTextFormat,
  };
}

function createHoverItem(element: Element): Hover {
  return {
    contents: {
      kind: "markdown",
      value: `### ${element.label}\n\n${element.detail}\n\n${element.documentation}`,
    },
  };
}

export const completionItems: CompletionItem[] = [
  // Directives
  createCompletionItem(DirectiveRegister),
  createCompletionItem(DirectiveImport),
  createCompletionItem(DirectiveInclude),
  createCompletionItem(DirectiveTypeRename),
  createCompletionItem(DirectiveFieldRename),
  createCompletionItem(DirectiveTFRename),
  // Constants
  createCompletionItem(ConstantEncodingN),
  createCompletionItem(ConstantEncodingNum),
  createCompletionItem(ConstantEncodingS),
  createCompletionItem(ConstantEncodingStr),
  createCompletionItem(ConstantEncodingB),
  createCompletionItem(ConstantEncodingBer),
  createCompletionItem(ConstantEncodingP),
  createCompletionItem(ConstantEncodingPer),
  createCompletionItem(ConstantEncodingO),
  createCompletionItem(ConstantEncodingOer),
];

export const hoverItems: Map<string, Hover> = new Map([
  // Directives
  [DirectiveRegister.label, createHoverItem(DirectiveRegister)],
  [DirectiveImport.label, createHoverItem(DirectiveImport)],
  [DirectiveInclude.label, createHoverItem(DirectiveInclude)],
  [DirectiveTypeRename.label, createHoverItem(DirectiveTypeRename)],
  [DirectiveFieldRename.label, createHoverItem(DirectiveFieldRename)],
  [DirectiveTFRename.label, createHoverItem(DirectiveTFRename)],
  // Constants
  [ConstantEncodingN.label, createHoverItem(ConstantEncodingN)],
  [ConstantEncodingNum.label, createHoverItem(ConstantEncodingNum)],
  [ConstantEncodingS.label, createHoverItem(ConstantEncodingS)],
  [ConstantEncodingStr.label, createHoverItem(ConstantEncodingStr)],
  [ConstantEncodingB.label, createHoverItem(ConstantEncodingB)],
  [ConstantEncodingBer.label, createHoverItem(ConstantEncodingBer)],
  [ConstantEncodingP.label, createHoverItem(ConstantEncodingP)],
  [ConstantEncodingPer.label, createHoverItem(ConstantEncodingPer)],
  [ConstantEncodingO.label, createHoverItem(ConstantEncodingO)],
  [ConstantEncodingOer.label, createHoverItem(ConstantEncodingOer)],
]);
