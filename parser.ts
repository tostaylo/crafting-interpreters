import { TokenType, type Token } from "./token";
import { Expression, Binary, Literal, Unary, Grouping } from "./expression";

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private error(token: Token, message: string) {
    console.error(token, message);
    // call Lox.error
    return new Error();
  }

  private consume(type: TokenType, message: string) {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUNCTION:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }

  private primary(): Expression {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      let expression: Expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expression);
    }
  }

  private unary(): Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      let operator: Token = this.previous();
      let right = this.unary();
      return new Unary(operator, right);
    }

    return this.primary();
  }

  private factor(): Expression {
    let expression: Expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      let operator: Token = this.previous();
      let right: Expression = this.unary();
      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private term(): Expression {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      let operator: Token = this.previous();
      let right: Expression = this.factor();
      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private comparison() {
    let expression: Expression = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      let operator: Token = this.previous();
      let right: Expression = this.term();
      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  private expression(): Expression {
    return this.equality();
  }

  private equality(): Expression {
    let expression = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      let operator: Token = this.previous();
      let right: Expression = this.comparison();
      expression = new Binary(expression, operator, right);
    }

    return expression;
  }

  parse() {
    try {
      return this.expression();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
