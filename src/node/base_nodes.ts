import { Record, List } from "immutable"

import { RootStmtNode } from "./statement_nodes"
import { ModuleClause, ImportClause } from "./clause_nodes"

export enum NodeType {
  INT_LITERAL,
  FLOAT_LITERAL,
  CHAR_LITERAL,
  STRING_LITERAL,
  LIST_EXPR,
  SYMBOL_EXPR,
  BLOCK_STMT,
  BIN_OP,
  ACCESS_OP,
  IMPORT_CLAUSE,
  IF_EXPR,
  FN_TYPE,
  EXPR_STMT,
  DECL_STMT,
  MODULE_CLAUSE,
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
  start: { line: number; column: number }
  end: { line: number; column: number }
}

export class NodePosition
  extends Record<INodePosition>({ start: null, end: null })
  implements INodePosition {
  constructor(props: INodePosition) {
    super(props)
  }
}

export interface IBaseNode {
  sym?: Symbol
  loc: NodePosition
  nodeType?: NodeType
}

export interface IProgram extends IBaseNode {
  module: ModuleClause
  stmts: List<RootStmtNode>
  imports: List<ImportClause>
}

export class Program
  extends Record<IProgram>({
    loc: null,
    module: null,
    sym: Symbol(),
    stmts: List<RootStmtNode>(),
    imports: List<ImportClause>()
  })
  implements IProgram {
  constructor(props: IProgram) {
    super(props)
  }
}

export class NodeUtils {
  static isInstance(node: IBaseNode, nodeType: NodeType) {
    return node.nodeType === nodeType
  }
}
