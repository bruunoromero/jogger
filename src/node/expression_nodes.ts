import { IBaseNode, NodeType } from "./base_nodes"
import { Record, List } from "immutable"
import { BinOp, AccessOp } from "./binary_operator"
import { BlockStmt } from "./statement_nodes"
import { TypeNode, Parameter } from "./type_nodes"

export type Expr =
  | IntLiteral
  | FloatLiteral
  | CharLiteral
  | StringLiteral
  | SymbolExpr
  | ListExpr
  | FnExpr
  | IfExpr
  | MatchExpr
  | CallExpr
  | RecordExpr
  | BinOp
  | AccessOp

export interface IPrimitive<T> extends IBaseNode {
  value: T
}

export class IntLiteral
  extends Record<IPrimitive<number>>({
    loc: null,
    value: 0,
    sym: Symbol(),
    nodeType: NodeType.INT_LITERAL
  })
  implements IPrimitive<number> {
  constructor(props: IPrimitive<number>) {
    super(props)
  }
}

export class FloatLiteral
  extends Record<IPrimitive<number>>({
    loc: null,
    value: 0,
    sym: Symbol(),
    nodeType: NodeType.FLOAT_LITERAL
  })
  implements IPrimitive<number> {
  constructor(props: IPrimitive<number>) {
    super(props)
  }
}

export class CharLiteral
  extends Record<IPrimitive<string>>({
    loc: null,
    value: "",
    sym: Symbol(),
    nodeType: NodeType.CHAR_LITERAL
  })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }
}

export class StringLiteral
  extends Record<IPrimitive<string>>({
    loc: null,
    value: "",
    sym: Symbol(),
    nodeType: NodeType.CHAR_LITERAL
  })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }
}

export class SymbolExpr
  extends Record<IPrimitive<string>>({
    loc: null,
    value: "",
    sym: Symbol(),
    nodeType: NodeType.SYMBOL_EXPR
  })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }

  str() {
    return this.value
  }
}

export class ListExpr
  extends Record<IPrimitive<List<Expr>>>({
    loc: null,
    value: List(),
    sym: Symbol(),
    nodeType: NodeType.LIST_EXPR
  })
  implements IPrimitive<List<Expr>> {
  constructor(props: IPrimitive<List<Expr>>) {
    super(props)
  }
}

export interface IFnExpr extends IBaseNode {
  body: Expr | BlockStmt
  params: List<Parameter>
  returnTypeSpec: TypeNode | null
}

export class FnExpr
  extends Record<IFnExpr>({
    loc: null,
    body: null,
    params: List(),
    returnTypeSpec: null,
    sym: Symbol(),
    nodeType: NodeType.FN_EXPR
  })
  implements IFnExpr {
  constructor(props: IFnExpr) {
    super(props)
  }
}

export interface IIfExpr extends IBaseNode {
  cond: Expr
  truthy: Expr | BlockStmt
  falsy: Expr | BlockStmt
}

export class IfExpr
  extends Record<IIfExpr>({
    loc: null,
    cond: null,
    truthy: null,
    falsy: null,
    sym: Symbol(),
    nodeType: NodeType.IF_EXPR
  })
  implements IIfExpr {
  constructor(props: IIfExpr) {
    super(props)
  }
}

export interface IMatchExpr extends IBaseNode {
  matcher: Expr
  clauses: List<MatchClause>
}

export class MatchExpr
  extends Record<IMatchExpr>({
    loc: null,
    matcher: null,
    clauses: List(),
    sym: Symbol(),
    nodeType: NodeType.MATCH_EXPR
  })
  implements IMatchExpr {
  constructor(props: IMatchExpr) {
    super(props)
  }
}

export interface IMatchClause extends IBaseNode {
  cond: Expr
  truthy: Expr | BlockStmt
}

export class MatchClause
  extends Record<IMatchClause>({
    loc: null,
    cond: null,
    truthy: null,
    sym: Symbol(),
    nodeType: NodeType.MATCH_CLAUSE
  })
  implements IMatchClause {
  constructor(props: IMatchClause) {
    super(props)
  }
}

export interface ICallExpr extends IBaseNode {
  callee: Expr
  args: List<Expr>
}

export class CallExpr
  extends Record<ICallExpr>({
    loc: null,
    callee: null,
    args: List(),
    sym: Symbol(),
    nodeType: NodeType.CALL_EXPR
  })
  implements ICallExpr {
  constructor(props: ICallExpr) {
    super(props)
  }
}

export interface IRecordExpr extends IBaseNode {
  name: SymbolExpr | AccessOp
  fields: List<RecordField>
}

export class RecordExpr
  extends Record<IRecordExpr>({
    loc: null,
    name: null,
    fields: List(),
    sym: Symbol(),
    nodeType: NodeType.RECORD_EXPR
  })
  implements IRecordExpr {
  constructor(props: IRecordExpr) {
    super(props)
  }
}

export interface IRecordField extends IBaseNode {
  name: SymbolExpr
  value: Expr
}

export class RecordField
  extends Record<IRecordField>({
    loc: null,
    name: null,
    value: null,
    sym: Symbol(),
    nodeType: NodeType.RECORD_FIELD
  })
  implements IRecordField {
  constructor(props: IRecordField) {
    super(props)
  }
}
