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

// const interpret = new Interpreter();

// interpret.runFile();
