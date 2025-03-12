interface BlockOfTextRange {
  start: number;
  end: number;
}

export function findBlockOfText(
  startText: string,
  endText: string,
  lines: string[],
): BlockOfTextRange {
  let start = -1;
  let end = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(startText)) {
      start = i;
      i++;
    }
    if (start !== -1 && lines[i].startsWith(endText)) {
      end = i;
      break;
    }
  }

  if (start !== -1 && end === -1) {
    // EOF case
    end = lines.length;
  }

  return { start, end };
}

export function isBlockOfTextRangeValid(blockOfTextRange: BlockOfTextRange): boolean {
  return blockOfTextRange.start !== -1; // if end is -1, it means we reached the EOF
}

export function stripComment(line: string, startComment: string = "#"): string {
  return line.split(startComment)[0].trim();
}

export function changeWhitespacesToSingleSpace(line: string): string {
  return line.replace(/\s+/g, " ");
}

export function splitTextIntoLines(text: string): string[] {
  return text.split(/\r?\n/g);
}

export function doesStartWithUppercase(text: string): boolean {
  return text[0].toUpperCase() === text[0];
}
