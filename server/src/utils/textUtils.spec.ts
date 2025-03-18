import {
  stripComment,
  doesStartWithLowercase,
  doesStartWithUppercase,
  changeWhitespacesToSingleSpace,
  splitTextIntoLines,
  findBlocksOfText,
  isBlockOfTextRangeValid,
  extractWordFromLine,
} from "./textUtils";

describe("findBlocksOfText and isBlockOfTextRangeValid", () => {
  test("finds all blocks of text", () => {
    const lines = [
      "something before directive",
      "#.REGISTER",
      "now inside the directive",
      "#.END",
      "again outside",
      "#.REGISTER",
      "again inside",
      "with more lines",
      "should also work",
      "#.END",
      "and this is the end",
    ];

    const result = findBlocksOfText("#.REGISTER", "#.", lines);
    expect(result).toEqual([
      { start: 1, end: 2 },
      { start: 5, end: 8 },
    ]);
    expect(isBlockOfTextRangeValid(result[0])).toBe(true);
    expect(isBlockOfTextRangeValid(result[1])).toBe(true);
  });

  test("returns empty array if found no blocks of text", () => {
    const lines = [
      "something before directive",
      "now outside the directive",
      "and this is the end",
    ];

    const result = findBlocksOfText("#.REGISTER", "#.", lines);
    expect(result).toEqual([]);
  });

  test("handles empty array", () => {
    const lines: string[] = [];
    const result = findBlocksOfText("#.REGISTER", "#.", lines);
    expect(result).toEqual([]);
  });

  test("handles block that started but did not end", () => {
    const lines = [
      "something before directive",
      "#.REGISTER",
      "now inside the directive",
      "and this is the end",
    ];

    const result = findBlocksOfText("#.REGISTER", "#.", lines);
    expect(result).toEqual([{ start: 1, end: 4 }]);
    expect(isBlockOfTextRangeValid(result[0])).toBe(true);
  });
});

describe("stripComment", () => {
  test("removes text after specified character", () => {
    const line = "this is a test # this is a comment";
    const result = stripComment(line);
    expect(result).toBe("this is a test");
  });

  test("does not change the line if no comment is found", () => {
    const line = "this is a test";
    const result = stripComment(line);
    expect(result).toBe(line);
  });

  test("returns empty line if line starts with comment character", () => {
    const line = "# this is a comment";
    const result = stripComment(line);
    expect(result).toBe("");
  });
});

describe("changeWhitespacesToSingleSpace", () => {
  test("replaces multiple spaces with a single space", () => {
    const line = "this   is    a  test";
    const result = changeWhitespacesToSingleSpace(line);
    expect(result).toBe("this is a test");
  });

  test("replaces tabs with a single space", () => {
    const line = "this\tis\ta\ttest";
    const result = changeWhitespacesToSingleSpace(line);
    expect(result).toBe("this is a test");
  });

  test("does not change the line if no whitespaces are found", () => {
    const line = "this is a test";
    const result = changeWhitespacesToSingleSpace(line);
    expect(result).toBe(line);
  });

  test("handles empty string", () => {
    const line = "";
    const result = changeWhitespacesToSingleSpace(line);
    expect(result).toBe("");
  });
});

describe("splitTextIntoLines", () => {
  test("splits text into lines", () => {
    const text = "this\nis\na\ntest";
    const result = splitTextIntoLines(text);
    expect(result).toEqual(["this", "is", "a", "test"]);
  });

  test("handles empty string", () => {
    const text = "";
    const result = splitTextIntoLines(text);
    expect(result).toEqual([""]);
  });

  test("handles text without newlines", () => {
    const text = "this is a test";
    const result = splitTextIntoLines(text);
    expect(result).toEqual(["this is a test"]);
  });
});

describe("doesStartWithLowercase", () => {
  test("returns false for uppercase letter", () => {
    const string = "U";
    const result = doesStartWithLowercase(string);
    expect(result).toBe(false);
  });

  test("returns true for lowercase letter", () => {
    const string = "u";
    const result = doesStartWithLowercase(string);
    expect(result).toBe(true);
  });

  test("handles empty string", () => {
    const string = "";
    const result = doesStartWithLowercase(string);
    expect(result).toBe(false);
  });

  test("returns false for a string starting with uppercase letter with multiple characters", () => {
    const string = "Test";
    const result = doesStartWithLowercase(string);
    expect(result).toBe(false);
  });

  test("returns true for a string starting with lowercase letter with multiple characters", () => {
    const string = "test";
    const result = doesStartWithLowercase(string);
    expect(result).toBe(true);
  });
});

describe("doesStartWithUppercase", () => {
  test("returns false for lowercase letter", () => {
    const string = "u";
    const result = doesStartWithUppercase(string);
    expect(result).toBe(false);
  });

  test("returns true for uppercase letter", () => {
    const string = "U";
    const result = doesStartWithUppercase(string);
    expect(result).toBe(true);
  });

  test("handles empty string", () => {
    const string = "";
    const result = doesStartWithUppercase(string);
    expect(result).toBe(false);
  });

  test("returns false for a string starting with lowercase letter with multiple characters", () => {
    const string = "test";
    const result = doesStartWithUppercase(string);
    expect(result).toBe(false);
  });

  test("returns true for a string starting with uppercase letter with multiple characters", () => {
    const string = "Test";
    const result = doesStartWithUppercase(string);
    expect(result).toBe(true);
  });
});

describe("extractWordFromLine", () => {
  test("returns empty string for empty line", () => {
    const line = "";
    const characterIndex = 0;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("");
  });

  test("returns empty string for character index out of bounds", () => {
    const line = "this is a test";
    const characterIndex = 100;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("");
  });

  test("returns empty string for negative character index", () => {
    const line = "this is a test";
    const characterIndex = -1;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("");
  });

  test("extracts word from the line", () => {
    const line = "this is a test";
    const characterIndex = 5;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("is");
  });

  test("extracts word from the line with special characters", () => {
    const line = "this.is.a.test";
    const characterIndex = 5;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("this.is.a.test");
  });

  test("extracts directives with #. in the name", () => {
    const line = "imagine that #.REGISTER is being caught";
    const characterIndex = 18;
    const result = extractWordFromLine(line, characterIndex);
    expect(result).toBe("#.REGISTER");
  });
});
