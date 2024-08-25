export class Interpreter {
  async runFile() {
    const path = "code.text";
    const file = Bun.file(path);

    const text = await file.text();
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
    console.error({ line, where, message });
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

type Literal = string | object | number;
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

type Keywords = Map<string, TokenType>;

export class Scanner {
  source: string;
  tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 0;

  private static readonly keywords: Keywords = new Map<string, TokenType>([
    ["and", TokenType.AND],
    ["class", TokenType.CLASS],
    ["else", TokenType.ELSE],
    ["false", TokenType.FALSE],
    ["for", TokenType.FOR],
    ["function", TokenType.FUNCTION],
    ["if", TokenType.IF],
    ["nil", TokenType.NIL],
    ["or", TokenType.OR],
    ["print", TokenType.PRINT],
    ["return", TokenType.RETURN],
    ["super", TokenType.SUPER],
    ["this", TokenType.THIS],
    ["true", TokenType.TRUE],
    ["var", TokenType.VAR],
    ["while", TokenType.WHILE],
  ]);

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

  private isDigit(c: string): boolean {
    const asNum = Number(c);
    return asNum >= 0 && asNum <= 9;
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
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

  private peek(): string {
    if (this.isEnd()) return "\0";
    return this.currentChar();
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }

    return this.source[this.current + 1];
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    return TokenType.IDENTIFIER;
  }

  private number(): TokenType {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a fractional part.
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    return TokenType.NUMBER;
  }

  private string(): TokenType | undefined {
    // supports multi line strings
    while (this.peek() != '"' && this.peek() != "'" && !this.isEnd()) {
      if (this.peek() == "\n") {
        this.line++;
      }
      this.advance();
    }

    if (this.isEnd()) {
      // Interpreter.error(line, "Unterminated string.");
      console.error(this.line, "Unterminated String");
      return;
    }

    // The closing ".
    this.advance();

    return TokenType.STRING;
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

      case "'":
      case '"':
        return this.string();

      default:
        if (this.isDigit(char)) {
          return this.number();
        } else if (this.isAlpha(char)) {
          return this.identifier();
        }
        throw new Error(`Unknown character: ${char}`);
    }
  }

  private tokenizer({ type, literal }: { type: TokenType; literal?: Literal }) {
    const lexeme = this.source.substring(this.start, this.current);

    let t = type;
    let lit = literal;

    if (type === TokenType.STRING) {
      lit = this.source.substring(this.start + 1, this.current - 1);
    } else if (type === TokenType.NUMBER) {
      lit = Number(this.source.substring(this.start, this.current));
    } else if (type === TokenType.IDENTIFIER) {
      let text = this.source.substring(this.start, this.current);
      let identifierType = Scanner.keywords.get(text);

      if (identifierType) {
        t = identifierType;
      }
    }

    this.tokens.push(
      new Token({
        type: t,
        lexeme: lexeme as any,
        line: this.line,
        literal: lit,
      })
    );
  }

  private addToken({ type }: { type: TokenType }) {
    this.tokenizer({ type });
  }

  private scanToken(): void {
    const char = this.advance();

    const tokenType = this.getTokenType(char);
    if (tokenType !== undefined && tokenType >= 0) {
      this.addToken({ type: tokenType });
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
