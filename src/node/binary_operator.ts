import { NodeType, IBaseNode } from "./base_nodes"
import { Record } from "immutable"

export interface IBinOp extends IBaseNode {
  op: IBaseNode
  left: IBaseNode
  right: IBaseNode
}

export class BinOp
  extends Record({
    loc: null,
    op: null,
    left: null,
    right: null,
    nodeType: NodeType.BIN_OP
  })
  implements IBinOp {
  constructor(props: IBinOp) {
    super(props)
  }
}

export interface IAccessOp extends IBaseNode {
  left: IBaseNode
  right: IBaseNode
}

export class AccessOp extends Record({
  loc: null,
  left: null,
  right: null,
  nodeType: NodeType.ACCESS_OP
}) {
  constructor(props: IAccessOp) {
    super(props)
  }
}
