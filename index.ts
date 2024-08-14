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

  private currentChar(): string {
    return this.source[this.current];
  }

  private isMatch({ expected }: { expected: string }): boolean {
    if (this.isEnd()) return false;
    if (this.currentChar() != expected) return false;

    // seems a bit weird this has two responsibilities
    // one to progress char consumption
    // the other to return boolean
    this.current++;
    return true;
  }

  private peek() {
    if (this.isEnd()) return "\0";
    return this.currentChar();
  }

  private getTokenType(char: string): TokenType | undefined {
    switch (char) {
      case "(":
        return TokenType.LEFT_PAREN;
      case ")":
        return TokenType.RIGHT_PAREN;
      case "{":
        return TokenType.LEFT_BRACE;
      case "}":
        return TokenType.RIGHT_BRACE;
      case ",":
        return TokenType.COMMA;
      case ".":
        return TokenType.DOT;
      case "-":
        return TokenType.MINUS;
      case "+":
        return TokenType.PLUS;
      case ";":
        return TokenType.SEMICOLON;
      case "*":
        return TokenType.STAR;
      case "!":
        return this.isMatch({ expected: "=" })
          ? TokenType.BANG_EQUAL
          : TokenType.BANG;

      case "=":
        return this.isMatch({ expected: "=" })
          ? TokenType.EQUAL_EQUAL
          : TokenType.EQUAL;

      case "<":
        return this.isMatch({ expected: "=" })
          ? TokenType.LESS_EQUAL
          : TokenType.LESS;

      case ">":
        return this.isMatch({ expected: "=" })
          ? TokenType.GREATER_EQUAL
          : TokenType.GREATER;

      case "/":
        if (this.isMatch({ expected: "/" })) {
          // A comment goes until the end of the line.
          while (this.peek() != "\n" && !this.isEnd()) this.advance();
          return undefined;
        } else {
          return TokenType.SLASH;
        }

      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        return undefined;

      case "\n":
        this.line++;
        return undefined;

      default:
        throw new Error(`Unknown character: ${char}`);
    }
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

    const tokenType = this.getTokenType(char);
    if (tokenType !== undefined && tokenType >= 0) {
      this.addToken(tokenType);
      return;
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
