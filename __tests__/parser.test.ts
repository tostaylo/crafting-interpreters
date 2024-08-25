import { describe, it, expect } from "bun:test";
import { Parser } from "../parser";
import { TokenType, Token } from "../token";
import { Literal, Unary, Binary, Grouping } from "../expression";

// Utility function to create a token
// Delete and just create manually because it is no help by using unnamed params
function createToken(
  type: TokenType,
  lexeme: string,
  literal: any = null,
  line: number = 1
): Token {
  return { type, lexeme, literal, line };
}

describe("Parser", () => {
  it("parses a literal expression", () => {
    const tokens = [
      createToken(TokenType.NUMBER, "42", 42),
      createToken(TokenType.EOF, ""),
    ];
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).toBeInstanceOf(Literal);
    expect((expression as Literal).value).toBe(42);
  });

  it("parses a unary expression", () => {
    const tokens = [
      createToken(TokenType.MINUS, "-"),
      createToken(TokenType.NUMBER, "123", 123),
      createToken(TokenType.EOF, ""),
    ];
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).toBeInstanceOf(Unary);
    const unaryExpr = expression as Unary;
    expect(unaryExpr.operator.type).toBe(TokenType.MINUS);
    expect(unaryExpr.right).toBeInstanceOf(Literal);
    expect((unaryExpr.right as Literal).value).toBe(123);
  });

  it("parses a binary expression", () => {
    const tokens = [
      createToken(TokenType.NUMBER, "1", 1),
      createToken(TokenType.PLUS, "+"),
      createToken(TokenType.NUMBER, "2", 2),
      createToken(TokenType.EOF, ""),
    ];
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).toBeInstanceOf(Binary);
    const binaryExpr = expression as Binary;
    expect(binaryExpr.operator.type).toBe(TokenType.PLUS);
    expect((binaryExpr.left as Literal).value).toBe(1);
    expect((binaryExpr.right as Literal).value).toBe(2);
  });

  it("parses a grouped expression", () => {
    const tokens = [
      createToken(TokenType.LEFT_PAREN, "("),
      createToken(TokenType.NUMBER, "45", 45),
      createToken(TokenType.RIGHT_PAREN, ")"),
      createToken(TokenType.EOF, ""),
    ];
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).toBeInstanceOf(Grouping);
    const groupingExpr = expression as Grouping;
    expect(groupingExpr.expression).toBeInstanceOf(Literal);
    expect((groupingExpr.expression as Literal).value).toBe(45);
  });

  it("handles parsing errors gracefully", () => {
    // TODO: Bug here. Figure it out
    const tokens = [
      createToken(TokenType.PLUS, "+"),
      createToken(TokenType.NUMBER, "42", 42),
      createToken(TokenType.EOF, ""),
    ];
    const parser = new Parser(tokens);
    const expression = parser.parse();

    expect(expression).toBeNull();
  });
});
