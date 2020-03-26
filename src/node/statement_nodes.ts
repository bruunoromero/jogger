import { IBaseNode, NodeType } from "./base_nodes"
import { Record, List } from "immutable"
import { Expr, SymbolExpr } from "./expression_nodes"
import { Parameter, TypeNode, GenericType } from "./type_nodes"

export type RootStmtNode =
  | DeclStmt
  | FnDeclStmt
  | DataDeclStmt
  | TypeDeclStmt
  | BlockStmt
  | ExprStmt

export type StmtNode = DeclStmt | FnDeclStmt | BlockStmt | ExprStmt

export interface IDeclStmt extends IBaseNode {
  name: SymbolExpr
  value: Expr | BlockStmt
  typeSpec?: TypeNode
}

export class DeclStmt
  extends Record<IDeclStmt>({
    loc: null,
    name: null,
    value: null,
    typeSpec: null,
    sym: Symbol(),
    nodeType: NodeType.DECL_STMT
  })
  implements IDeclStmt {
  constructor(props: IDeclStmt) {
    super(props)
  }
}

export interface IFnDeclStmt extends IBaseNode {
  name: SymbolExpr
  body: Expr | BlockStmt
  params: List<Parameter>
  returnTypeSpec: TypeNode
  genericParams: List<IBaseNode>
}

export class FnDeclStmt
  extends Record<IFnDeclStmt>({
    loc: null,
    name: null,
    body: null,
    params: List(),
    returnTypeSpec: null,
    genericParams: List(),
    sym: Symbol(),
    nodeType: NodeType.FN_DECL_STMT
  })
  implements IFnDeclStmt {
  constructor(props: IFnDeclStmt) {
    super(props)
  }
}

export interface IDataDeclStmt extends IBaseNode {
  name: SymbolExpr
  fields: List<Parameter>
  genericParams: List<IBaseNode>
}

export class DataDeclStmt
  extends Record<IDataDeclStmt>({
    loc: null,
    name: null,
    fields: List(),
    genericParams: List(),
    sym: Symbol(),
    nodeType: NodeType.DATA_DECL_STMT
  })
  implements IDataDeclStmt {
  constructor(props: IDataDeclStmt) {
    super(props)
  }
}

export interface ITypeDeclStmt extends IBaseNode {
  name: SymbolExpr
  constructors: List<TypeCtor>
  genericParams: List<GenericType>
}

export class TypeDeclStmt
  extends Record<ITypeDeclStmt>({
    loc: null,
    name: null,
    constructors: List(),
    genericParams: List(),
    sym: Symbol(),
    nodeType: NodeType.TYPE_DECL_STMT
  })
  implements ITypeDeclStmt {
  constructor(props: ITypeDeclStmt) {
    super(props)
  }
}

export interface ITypeCtor extends IBaseNode {
  name: SymbolExpr
  fields: List<TypeNode>
}

export class TypeCtor
  extends Record<ITypeCtor>({
    loc: null,
    name: null,
    fields: List(),
    sym: Symbol(),
    nodeType: NodeType.TYPE_CTOR
  })
  implements ITypeCtor {
  constructor(props: ITypeCtor) {
    super(props)
  }
}

export interface IBlockStmt extends IBaseNode {
  nodes: List<StmtNode>
}

export class BlockStmt
  extends Record<IBlockStmt>({
    loc: null,
    nodes: List(),
    sym: Symbol(),
    nodeType: NodeType.BLOCK_STMT
  })
  implements IBlockStmt {
  constructor(props: IBlockStmt) {
    super(props)
  }
}

export interface IExprStmt extends IBaseNode {
  expr: Expr
}

export class ExprStmt
  extends Record<IExprStmt>({
    loc: null,
    expr: null,
    sym: Symbol(),
    nodeType: NodeType.EXPR_STMT
  })
  implements IExprStmt {
  constructor(props: IExprStmt) {
    super(props)
  }
}
