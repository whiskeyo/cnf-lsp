import {
  CompletionItem,
  CompletionItemKind,
  DiagnosticSeverity,
  Hover,
  InsertTextFormat,
  MarkupKind,
} from "vscode-languageserver/node";

import {
  allEncodingTypeStrings,
  asn1EncodingTypeStrings,
  CnfDirectives,
  EncodingTypes,
} from "./constants";
import { doesStartWithUppercase } from "./textUtils";

type ElementDiagnosticCheck = {
  tokenIndex: number;
  severity: DiagnosticSeverity;
  message: string;
  checkFunction: (token: string) => boolean;
};

export enum ElementDiagnosticType {
  HEADER,
  BODY,
}

export type ElementDiagnostic = {
  diagnosticType: ElementDiagnosticType;
  expectedNumberOfTokens: number;
  checkers: ElementDiagnosticCheck[];
};

export type Element = {
  label: string;
  kind: CompletionItemKind;
  detail: string;
  documentation: string;
  insertText?: string;
  insertTextFormat?: InsertTextFormat;
  diagnostics?: ElementDiagnostic[]; // Added diagnostics property
};

export const DirectiveRegister: Element = {
  label: CnfDirectives.REGISTER,
  kind: CompletionItemKind.Keyword,
  detail: "Register a dissector for an object to an OID.",
  documentation:
    "`#.REGISTER` directive in the Asn2wrs conformation file can be used to register a dissector for an " +
    "object to an OID. This is very useful for X.509 and similar protocols where structures and " +
    "objects are frequently associated with an OID. In particular, some of the structures here " +
    "encode an OID in a field and then the content in a different field later, and how that field " +
    "is to be dissected depends on the previously seen OID.",
  diagnostics: [
    {
      diagnosticType: ElementDiagnosticType.BODY,
      expectedNumberOfTokens: 3,
      checkers: [
        {
          tokenIndex: 0,
          severity: DiagnosticSeverity.Warning,
          message: "The first token should start with an uppercase letter.",
          checkFunction: (token: string) => !doesStartWithUppercase(token),
        } as ElementDiagnosticCheck,
        {
          tokenIndex: 1,
          severity: DiagnosticSeverity.Error,
          message: `Invalid encoding type! Please use one of ${asn1EncodingTypeStrings.join(", ")}.`,
          checkFunction: (token: string) => !asn1EncodingTypeStrings.includes(token),
        } as ElementDiagnosticCheck,
      ],
    },
    {
      diagnosticType: ElementDiagnosticType.BODY,
      expectedNumberOfTokens: 4,
      checkers: [
        {
          tokenIndex: 0,
          severity: DiagnosticSeverity.Warning,
          message: "The first token should start with an uppercase letter.",
          checkFunction: (token: string) => !doesStartWithUppercase(token),
        } as ElementDiagnosticCheck,
        {
          tokenIndex: 1,
          severity: DiagnosticSeverity.Error,
          message: `Invalid encoding type! Please use one of ${allEncodingTypeStrings.join(", ")}.`,
          checkFunction: (token: string) => !allEncodingTypeStrings.includes(token),
        } as ElementDiagnosticCheck,
      ],
    },
  ],
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
    "`#.TYPE_RENAME` directive in the Asn2wrs conformation file is used to rename a type.",
  diagnostics: [
    {
      diagnosticType: ElementDiagnosticType.BODY,
      expectedNumberOfTokens: 2,
      checkers: [
        {
          tokenIndex: 1,
          severity: DiagnosticSeverity.Warning,
          message: "Type name should always start with an uppercase letter.",
          checkFunction: (token: string) => !doesStartWithUppercase(token),
        } as ElementDiagnosticCheck,
      ],
    },
  ],
};

const DirectiveFieldRename: Element = {
  label: CnfDirectives.FIELD_RENAME,
  kind: CompletionItemKind.Keyword,
  detail: "Rename a field.",
  documentation:
    "`#.FIELD_RENAME` directive in the Asn2wrs conformation file is used to rename a field.",
  diagnostics: [
    {
      diagnosticType: ElementDiagnosticType.BODY,
      expectedNumberOfTokens: 2,
      checkers: [
        {
          tokenIndex: 1,
          severity: DiagnosticSeverity.Warning,
          message: "Field name should always start with a lowercase letter.",
          checkFunction: (token: string) => doesStartWithUppercase(token),
        } as ElementDiagnosticCheck,
      ],
    },
  ],
};

const DirectiveTFRename: Element = {
  label: CnfDirectives.TF_RENAME,
  kind: CompletionItemKind.Keyword,
  detail: "Rename a type or field.",
  documentation:
    "`#.TF_RENAME` directive in the Asn2wrs conformation file is used to rename a type or field.",
};

const DirectiveEnd: Element = {
  label: CnfDirectives.END,
  kind: CompletionItemKind.Keyword,
  detail: "End of a directive block.",
  documentation:
    "`#.END` directive in the Asn2wrs conformation file is used to mark the end " +
    "of a directive block. Its use is optional, as any other directive will also " +
    "end the current block.",
};

const DirectiveEndOfCnf: Element = {
  label: CnfDirectives.END_OF_CNF,
  kind: CompletionItemKind.Keyword,
  detail: "End of the conformance file.",
  documentation:
    "`#.END_OF_CNF` directive in the Asn2wrs conformation file is used to mark the end " +
    "of the conformance file. It is used to indicate that the file has ended. " +
    "Its use is optional, and rarely used overall.",
};

const DirectiveOpt: Element = {
  label: CnfDirectives.OPT,
  kind: CompletionItemKind.Keyword,
  detail: "Set an asn2wrs compiler option.",
  documentation:
    "`#.OPT` directive in the Asn2wrs conformation file is used to set compiler options. " +
    "List of all compiler options can be found in the `tools/asn2wrs.py`, but here is also the list: " +
    "`-I`, `-b|BER|CER|DER`, `PER`, `OER`, `-p|PROTO`, `ALIGNED`, `-u|UNALIGNED`, `PROTO_ROOT_NAME`, " +
    "`-d`, `-e`, `-S`, `GROUP_BY_PROT`, `-o`, `-O`, `-s`, `-k`, `-L`, `EMBEDDED_PDV_CB`, `EXTERNAL_TYPE_CB`, " +
    "`-r`. List based on commit 67227be85ef7adc1a33357c3eb2a271bc704441b.",
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

export const elements: Element[] = [
  // Directives
  DirectiveRegister,
  DirectiveImport,
  DirectiveInclude,
  DirectiveTypeRename,
  DirectiveFieldRename,
  DirectiveTFRename,
  DirectiveEnd,
  DirectiveEndOfCnf,
  DirectiveOpt,
  // Constants
  ConstantEncodingN,
  ConstantEncodingNum,
  ConstantEncodingS,
  ConstantEncodingStr,
  ConstantEncodingB,
  ConstantEncodingBer,
  ConstantEncodingP,
  ConstantEncodingPer,
  ConstantEncodingO,
  ConstantEncodingOer,
];

export const completionItems: CompletionItem[] = elements.map(createCompletionItem);

export const hoverItems: Map<string, Hover> = new Map(
  elements.map((element) => [element.label, createHoverItem(element)]),
);
