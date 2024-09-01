import {
  Expression,
  Unary,
  Binary,
  Literal,
  Grouping,
  type Visitor,
} from "./expression";
import { TokenType } from "./token";

export class Interpreter implements Visitor<any> {
  visitUnaryExpr(expr: Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -right;
    }

    return null;
  }

  visitLiteralExpr(expr: Literal): any {
    return expr.value;
  }

  visitBinaryExpr(expr: Binary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.PLUS:
        return left + right;
      case TokenType.MINUS:
        return left - right;
      case TokenType.STAR:
        return left * right;
      case TokenType.SLASH:
        return left / right;
    }

    return null;
  }

  visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  evaluate(expr: Expression): any {
    return expr.accept(this);
  }

  private isTruthy(value: any): boolean {
    if (value === null) return false;
    if (typeof value === "boolean") return value;
    return true;
  }

  interpret(expression: Expression) {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (error) {
      console.error("Runtime error", error);
    }
  }

  private stringify(value: any): string {
    if (value === null) return "nil";
    return value.toString();
  }
}
