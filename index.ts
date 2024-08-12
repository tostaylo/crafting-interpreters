export class Interpreter {
  async runFile() {
    const path = "code.text";
    const file = Bun.file(path);

    const text = await file.text();

    console.log({ text });
  }

  report({
    line,
    where,
    message,
  }: {
    line: string;
    where: string;
    message: string;
  }) {
    console.log({ line, where, message });
  }
}

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
  FUN,
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

const tokenMap: { [char: string]: TokenType } = {
  "(": TokenType.LEFT_PAREN,
  ")": TokenType.RIGHT_PAREN,
  "{": TokenType.LEFT_BRACE,
  "}": TokenType.RIGHT_BRACE,
  ",": TokenType.COMMA,
  ".": TokenType.DOT,
  "-": TokenType.MINUS,
  "+": TokenType.PLUS,
  ";": TokenType.SEMICOLON,
  "*": TokenType.STAR,
};

type TokenParams = {
  type: TokenType;
  lexeme: string;
  line: number;
  literal?: object;
};
export class Token {
  public type: TokenType;
  public lexeme: string;
  public line: number;
  public literal?: object;

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

export class Scanner {
  source: string;
  tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 0;

  constructor({ source }: { source: string }) {
    this.source = source;
  }

  private isEnd(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private tokenizer({ type, literal }: { type: TokenType; literal?: object }) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token({ type, lexeme: text, line: this.line, literal })
    );
  }

  private addToken(type: TokenType) {
    this.tokenizer({ type });
  }

  private scanToken(): void {
    const char = this.advance();
    console.log({ char });

    const tokenType = tokenMap[char];
    console.log({ tokenType });
    if (tokenType !== undefined) {
      this.addToken(tokenType);
    } else {
      // Handle unexpected characters or more complex cases here
      console.error(`Unexpected character: ${char}`);
    }
  }

  scanTokens() {
    while (!this.isEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      new Token({
        type: TokenType.EOF,
        lexeme: "",
        line: this.line,
        literal: undefined,
      })
    );
  }
}

// const interpret = new Interpreter();

// interpret.runFile();
