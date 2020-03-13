import { IBaseNode, NodeType } from "./base_nodes"
import { Record, List } from "immutable"

export interface IPrimitive<T> extends IBaseNode {
  value: T
}

export class IntLiteral
  extends Record({ loc: null, value: 0, nodeType: NodeType.INT_LITERAL })
  implements IPrimitive<number> {
  constructor(props: IPrimitive<number>) {
    super(props)
  }
}

export class FloatLiteral
  extends Record({ loc: null, value: 0, nodeType: NodeType.FLOAT_LITERAL })
  implements IPrimitive<number> {
  constructor(props: IPrimitive<number>) {
    super(props)
  }
}

export class CharLiteral
  extends Record({ loc: null, value: "", nodeType: NodeType.CHAR_LITERAL })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }
}

export class StringLiteral
  extends Record({ loc: null, value: "", nodeType: NodeType.CHAR_LITERAL })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }
}

export class SymbolExpr
  extends Record({ loc: null, value: "", nodeType: NodeType.SYMBOL_EXPR })
  implements IPrimitive<string> {
  constructor(props: IPrimitive<string>) {
    super(props)
  }
}

export class ListExpr
  extends Record({ loc: null, value: List(), nodeType: NodeType.LIST_EXPR })
  implements IPrimitive<List<IBaseNode>> {
  constructor(props: IPrimitive<List<IBaseNode>>) {
    super(props)
  }
}

export interface IFnExpr extends IBaseNode {
  body: IBaseNode
  params: List<IBaseNode>
  returnTypeSpec: IBaseNode | null
}

export class FnExpr
  extends Record({
    loc: null,
    body: null,
    params: List(),
    returnTypeSpec: null,
    nodeType: NodeType.FN_EXPR
  })
  implements IFnExpr {
  constructor(props: IFnExpr) {
    super(props)
  }
}

export interface IIfExpr extends IBaseNode {
  cond: IBaseNode
  truthy: IBaseNode
  falsy: IBaseNode
}

export class IfExpr
  extends Record({
    loc: null,
    cond: null,
    truthy: null,
    falsy: null,
    nodeType: NodeType.IF_EXPR
  })
  implements IIfExpr {
  constructor(props: IIfExpr) {
    super(props)
  }
}

export interface IMatchExpr extends IBaseNode {
  matcher: IBaseNode
  clauses: List<IBaseNode>
}

export class MatchExpr
  extends Record({
    loc: null,
    matcher: null,
    clauses: List(),
    nodeType: NodeType.MATCH_EXPR
  })
  implements IMatchExpr {
  constructor(props: IMatchExpr) {
    super(props)
  }
}

export interface IMatchClause extends IBaseNode {
  cond: IBaseNode
  truthy: IBaseNode
}

export class MatchClause
  extends Record({
    loc: null,
    cond: null,
    truthy: null,
    nodeType: NodeType.MATCH_CLAUSE
  })
  implements IMatchClause {
  constructor(props: IMatchClause) {
    super(props)
  }
}

export interface ICallExpr extends IBaseNode {
  callee: IBaseNode
  args: List<IBaseNode>
}

export class CallExpr
  extends Record({
    loc: null,
    callee: null,
    args: List(),
    nodeType: NodeType.CALL_EXPR
  })
  implements ICallExpr {
  constructor(props: ICallExpr) {
    super(props)
  }
}

export interface IRecordExpr extends IBaseNode {
  name: IBaseNode
  fields: List<IBaseNode>
}

export class RecordExpr
  extends Record({
    loc: null,
    name: null,
    fields: List(),
    nodeType: NodeType.RECORD_EXPR
  })
  implements IRecordExpr {
  constructor(props: IRecordExpr) {
    super(props)
  }
}

export interface IRecordField extends IBaseNode {
  name: IBaseNode
  value: IBaseNode
}

export class RecordField
  extends Record({
    loc: null,
    name: null,
    value: null,
    nodeType: NodeType.RECORD_FIELD
  })
  implements IRecordField {
  constructor(props: IRecordField) {
    super(props)
  }
}
