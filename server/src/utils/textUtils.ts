import { Range, Position } from "vscode-languageserver/node";

export interface BlockOfTextRange {
  start: number;
  end: number;
}

export function findBlocksOfText(
  startText: string,
  endText: string,
  lines: string[],
): BlockOfTextRange[] {
  const blocks: BlockOfTextRange[] = [];
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i].startsWith(startText)) {
      start = i;
    } else if (start !== -1 && lines[i].startsWith(endText)) {
      blocks.push({ start, end: i - 1 }); // block ends just the line before
      i = i - 1;
      start = -1;
    }
  }

  if (start !== -1) {
    blocks.push({ start, end: lines.length }); // EOF case
  }

  return blocks;
}

export function isBlockOfTextRangeValid(blockOfTextRange: BlockOfTextRange): boolean {
  return blockOfTextRange.start !== -1; // if end is -1, it means we reached the EOF
}

export function stripComment(line: string, startComment: string = "#"): string {
  if (line.startsWith(startComment)) {
    return "";
  } else {
    return line.split(startComment)[0].trim();
  }
}

export function changeWhitespacesToSingleSpace(line: string): string {
  return line.replace(/\s+/g, " ");
}

export function splitTextIntoLines(text: string): string[] {
  return text.split(/\r?\n/g);
}

export function doesStartWithLowercase(text: string): boolean {
  if (text === "") {
    return false;
  }

  return text[0].toLowerCase() === text[0];
}

export function doesStartWithUppercase(text: string): boolean {
  if (text === "") {
    return false;
  }

  return text[0].toUpperCase() === text[0];
}

export function createRangeForToken(
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
  lineIdx: number,
  token: string,
): Range {
  const line = blockOfTextRange.start + lineIdx + 1;
  const character = lines[lineIdx].indexOf(token);
  return Range.create(
    Position.create(line, character),
    Position.create(line, character + token.length),
  );
}

export function createRangeForLine(
  lines: string[],
  blockOfTextRange: BlockOfTextRange,
  lineIdx: number,
): Range {
  return Range.create(
    Position.create(blockOfTextRange.start + lineIdx + 1, 0),
    Position.create(blockOfTextRange.start + lineIdx + 1, lines[lineIdx].length),
  );
}
