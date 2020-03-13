import { Record, List } from "immutable"

import { Token } from "antlr4"

export enum NodeType {
  PACKAGE_CLAUSE,
  INT_LITERAL,
  FLOAT_LITERAL,
  CHAR_LITERAL,
  STRING_LITERAL,
  LIST_EXPR,
  SYMBOL_EXPR,
  ROOT,
  BLOCK_STMT,
  BIN_OP,
  ACCESS_OP,
  IMPORT_CLAUSE,
  IF_EXPR,
  FN_TYPE,
  EXPR_STMT,
  DECL_STMT,
  MODULE_STMT,
  FN_DECL_STMT,
  TYPE_DECL_STMT,
  TYPE_CTOR,
  DATA_DECL_STMT,
  MATCH_EXPR,
  MATCH_CLAUSE,
  PARAMETER,
  FN_EXPR,
  CALL_EXPR,
  RECORD_EXPR,
  RECORD_FIELD,
  GENERIC_TYPE,
  ABSTRACT_TYPE,
  CONCRETE_TYPE
}

export interface INodePosition {
  start: Token
  end: Token
}

export class NodePosition extends Record({ start: null, end: null })
  implements INodePosition {
  constructor(props: INodePosition) {
    super(props)
  }
}

export interface IBaseNode {
  loc: NodePosition
  nodeType?: NodeType
}

export interface IRootNode extends IBaseNode {
  text: string
  filename: string
  nodes: List<IBaseNode>
}

export class RootNode
  extends Record({
    loc: null,
    nodeType: NodeType.ROOT,
    filename: "",
    text: "",
    nodes: List()
  })
  implements IRootNode {
  constructor(props: IRootNode) {
    super(props)
  }
}

export class NodeUtils {
  static isInstance(node: IBaseNode, nodeType: NodeType) {
    return node.nodeType === nodeType
  }
}
