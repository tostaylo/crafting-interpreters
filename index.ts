class Interpreter {
  async runFile() {
    const path = "code.js";
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

const interpret = new Interpreter();

interpret.runFile();
