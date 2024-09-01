import { test, expect } from "bun:test";
import { Interpreter } from "../interpreter";
import { Token, TokenType } from "../token";
import { Unary, Literal, Binary, Grouping, Expression } from "../expression";

// Utility function to create tokens
const createToken = (
  type: TokenType,
  lexeme: string = "",
  literal: any = null
): Token => {
  return new Token({ type, lexeme, literal, line: 1 });
};

test("Interpreter - evaluating literal expression", () => {
  const interpreter = new Interpreter();
  const expr = new Literal(42);

  const result = interpreter.evaluate(expr);

  expect(result).toBe(42);
});

test("Interpreter - evaluating unary expression", () => {
  const interpreter = new Interpreter();
  const expr = new Unary(createToken(TokenType.MINUS, "-"), new Literal(42));

  const result = interpreter.evaluate(expr);

  expect(result).toBe(-42);
});

test("Interpreter - evaluating binary addition", () => {
  const interpreter = new Interpreter();
  const expr = new Binary(
    new Literal(40),
    createToken(TokenType.PLUS, "+"),
    new Literal(2)
  );

  const result = interpreter.evaluate(expr);

  expect(result).toBe(42);
});

test("Interpreter - evaluating binary multiplication", () => {
  const interpreter = new Interpreter();
  const expr = new Binary(
    new Literal(6),
    createToken(TokenType.STAR, "*"),
    new Literal(7)
  );

  const result = interpreter.evaluate(expr);

  expect(result).toBe(42);
});

test("Interpreter - evaluating nested expressions", () => {
  const interpreter = new Interpreter();
  const expr = new Binary(
    new Unary(createToken(TokenType.MINUS, "-"), new Literal(8)),
    createToken(TokenType.PLUS, "+"),
    new Binary(
      new Literal(4),
      createToken(TokenType.STAR, "*"),
      new Literal(10)
    )
  );

  const result = interpreter.evaluate(expr);

  expect(result).toBe(32); // (-8) + (4 * 10) = -8 + 40 = 32
});
