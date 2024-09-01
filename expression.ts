import { Token } from "./token";

export abstract class Expression {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export interface Visitor<R> {
  visitBinaryExpr(expr: Binary): R;
  visitUnaryExpr(expr: Unary): R;
  visitLiteralExpr(expr: Literal): R;
  visitGroupingExpr(expr: Grouping): R;
}

export class Unary extends Expression {
  constructor(public operator: Token, public right: Expression) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Literal extends Expression {
  constructor(public value: any) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Binary extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping extends Expression {
  constructor(public expression: Expression) {
    super();
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}
