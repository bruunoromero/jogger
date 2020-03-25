import { NodeType, IBaseNode } from "./base_nodes"
import { Record } from "immutable"
import { SymbolExpr, Expr } from "./expression_nodes"

export interface IBinOp extends IBaseNode {
  op: SymbolExpr
  left: Expr
  right: Expr
}

export class BinOp
  extends Record<IBinOp>({
    loc: null,
    op: null,
    left: null,
    right: null,
    sym: Symbol(),
    nodeType: NodeType.BIN_OP
  })
  implements IBinOp {
  constructor(props: IBinOp) {
    super(props)
  }
}

export interface IAccessOp extends IBaseNode {
  left: SymbolExpr | AccessOp
  right: SymbolExpr
}

export class AccessOp extends Record<IAccessOp>({
  loc: null,
  left: null,
  right: null,
  sym: Symbol(),
  nodeType: NodeType.ACCESS_OP
}) {
  constructor(props: IAccessOp) {
    super(props)
  }

  str() {
    return `${this.moduleStr()}.${this.symbolStr()}`
  }

  symbolStr() {
    return (this.right as SymbolExpr).value
  }

  moduleStr() {
    if (this.left.nodeType === NodeType.SYMBOL_EXPR) {
      return (this.left as SymbolExpr).str()
    } else {
      return (this.left as AccessOp).str()
    }
  }
}
