import { expect, test } from "bun:test";
import { Scanner, TokenType, Token } from "..";
import { thisIsAString } from "./__mocks__/escaped-strings";

test("contains a source when passed one", () => {
  const source = "()";
  const scanner = new Scanner({ source });

  expect(scanner.source).toEqual(source);
});

test("scans and creates tokens from one character strings containing one lexeme", () => {
  const source = "(";
  const scanner = new Scanner({ source });

  scanner.scanTokens();

  const resultToken = new Token({
    type: TokenType.LEFT_PAREN,
    lexeme: "(",
    line: 0,
    literal: undefined,
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([resultToken, eofToken]);
});

test("scans and creates tokens from two character strings containing two lexemes", () => {
  const source = "()";
  const scanner = new Scanner({ source });

  scanner.scanTokens();

  const first = new Token({
    type: TokenType.LEFT_PAREN,
    lexeme: "(",
    line: 0,
    literal: undefined,
  });

  const second = new Token({
    type: TokenType.RIGHT_PAREN,
    lexeme: ")",
    line: 0,
    literal: undefined,
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([first, second, eofToken]);
});

test("scans and creates tokens from two character strings containing one lexeme", () => {
  const source = ">=";
  const scanner = new Scanner({ source });

  scanner.scanTokens();

  const resultToken = new Token({
    type: TokenType.GREATER_EQUAL,
    lexeme: ">=",
    line: 0,
    literal: undefined,
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([resultToken, eofToken]);
});

test("scans and creates tokens while ignoring comments", () => {
  const source = "> // this is a comment";
  const scanner = new Scanner({ source });

  scanner.scanTokens();

  const resultToken = new Token({
    type: TokenType.GREATER,
    lexeme: ">",
    line: 0,
    literal: undefined,
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([resultToken, eofToken]);
});

test("scans and creates tokens from strings", () => {
  const scanner = new Scanner({ source: thisIsAString });

  scanner.scanTokens();

  const resultToken = new Token({
    type: TokenType.STRING,
    lexeme: thisIsAString,
    line: 0,
    literal: "This is a string",
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([resultToken, eofToken]);
});

test("scans and creates tokens from numbers", () => {
  const source = "90.091";
  const scanner = new Scanner({ source });

  scanner.scanTokens();

  const resultToken = new Token({
    type: TokenType.NUMBER,
    lexeme: "90.091",
    line: 0,
    literal: 90.091,
  });

  const eofToken = new Token({
    type: TokenType.EOF,
    lexeme: "",
    line: 0,
    literal: undefined,
  });

  expect(scanner.tokens).toStrictEqual([resultToken, eofToken]);
});

// Should I test private methods?
