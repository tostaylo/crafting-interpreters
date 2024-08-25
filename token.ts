export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two character tokens.
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals.
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords.
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUNCTION,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  EOF,
}

export type Literal = string | object | number;

type TokenParams = {
  type: TokenType;
  lexeme: string;
  line: number;
  literal?: Literal;
};
export class Token {
  public type: TokenType;
  public lexeme: string;
  public line: number;
  public literal?: Literal;

  constructor({ type, lexeme, line, literal }: TokenParams) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.literal = literal;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
