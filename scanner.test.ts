import { expect, test } from "bun:test";
import { Scanner, TokenType, Token } from ".";

test("it contains a source when passed one", () => {
  const source = "()";
  const scanner = new Scanner({ source });

  expect(scanner.source).toEqual(source);
});

test("it scans a source when called", () => {
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
