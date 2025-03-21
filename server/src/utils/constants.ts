/// Directives used in the Asn2wrs conformation file.
export enum CnfDirectives {
  IMPORT = "#.IMPORT",
  INCLUDE = "#.INCLUDE",
  TYPE_RENAME = "#.TYPE_RENAME",
  FIELD_RENAME = "#.FIELD_RENAME",
  TF_RENAME = "#.TF_RENAME",
  END_OF_CNF = "#.END_OF_CNF",
  OPT = "#.OPT",
  PDU = "#.PDU",
  REGISTER = "#.REGISTER",
  MODULE = "#.MODULE",
  MODULE_IMPORT = "#.MODULE_IMPORT",
  OMIT_ASSIGNMENT = "#.OMIT_ASSIGNMENT",
  NO_OMIT_ASSGN = "#.NO_OMIT_ASSGN",
  VIRTUAL_ASSGN = "#.VIRTUAL_ASSGN",
  SET_TYPE = "#.SET_TYPE",
  ASSIGN_VALUE_TO_TYPE = "#.ASSIGN_VALUE_TO_TYPE",
  IMPORT_TAG = "#.IMPORT_TAG",
  TYPE_ATTR = "#.TYPE_ATTR",
  ETYPE_ATTR = "#.ETYPE_ATTR",
  FIELD_ATTR = "#.FIELD_ATTR",
  EFIELD_ATTR = "#.EFIELD_ATTR",
  SYNTAX = "#.SYNTAX",
  OMIT_ALL_ASSIGNMENTS = "#.OMIT_ALL_ASSIGNMENTS",
  OMIT_ASSIGNMENTS_EXCEPT = "#.OMIT_ASSIGNMENTS_EXCEPT",
  OMIT_ALL_TYPE_ASSIGNMENTS = "#.OMIT_ALL_TYPE_ASSIGNMENTS",
  OMIT_TYPE_ASSIGNMENTS_EXCEPT = "#.OMIT_TYPE_ASSIGNMENTS_EXCEPT",
  OMIT_ALL_VALUE_ASSIGNMENTS = "#.OMIT_ALL_VALUE_ASSIGNMENTS",
  OMIT_VALUE_ASSIGNMENTS_EXCEPT = "#.OMIT_VALUE_ASSIGNMENTS_EXCEPT",
  EXPORTS = "#.EXPORTS",
  MODULE_EXPORTS = "#.MODULE_EXPORTS",
  USER_DEFINED = "#.USER_DEFINED",
  NO_EMIT = "#.NO_EMIT",
  MAKE_ENUM = "#.MAKE_ENUM",
  MAKE_DEFINES = "#.MAKE_DEFINES",
  USE_VALS_EXT = "#.USE_VALS_EXT",
  FN_HDR = "#.FN_HDR",
  FN_FTR = "#.FN_FTR",
  FN_BODY = "#.FN_BODY",
  FN_PARS = "#.FN_PARS",
  CLASS = "#.CLASS",
  ASSIGNED_OBJECT_IDENTIFIER = "#.ASSIGNED_OBJECT_IDENTIFIER",
  END = "#.END",
}

// Encoding types that can be used inside the #.REGISTER block for entries.
export enum EncodingTypes {
  N = "N",
  NUM = "NUM",
  S = "S",
  STR = "STR",
  B = "B",
  BER = "BER",
  P = "P",
  PER = "PER",
  O = "O",
  OER = "OER",
}

export const allEncodingTypes = [
  EncodingTypes.N,
  EncodingTypes.NUM,
  EncodingTypes.S,
  EncodingTypes.STR,
  EncodingTypes.B,
  EncodingTypes.BER,
  EncodingTypes.P,
  EncodingTypes.PER,
  EncodingTypes.O,
  EncodingTypes.OER,
];

export const asn1EncodingTypes = [
  EncodingTypes.B,
  EncodingTypes.BER,
  EncodingTypes.P,
  EncodingTypes.PER,
  EncodingTypes.O,
  EncodingTypes.OER,
];

export const textEncodingTypes = [
  EncodingTypes.N,
  EncodingTypes.NUM,
  EncodingTypes.S,
  EncodingTypes.STR,
];

export const allEncodingTypeStrings = allEncodingTypes.map((type) => type.toString());
export const asn1EncodingTypeStrings = asn1EncodingTypes.map((type) => type.toString());
export const textEncodingTypeStrings = textEncodingTypes.map((type) => type.toString());
