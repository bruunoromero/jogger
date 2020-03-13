import { IBaseNode, NodeType } from "./base_nodes"
import { Record, List } from "immutable"

export interface IModuleStmt extends IBaseNode {
  name: IBaseNode
  stmts: List<IBaseNode>
}

export class ModuleStmt
  extends Record({
    loc: null,
    name: null,
    stmts: List(),
    nodeType: NodeType.MODULE_STMT
  })
  implements IModuleStmt {
  constructor(props: IModuleStmt) {
    super(props)
  }
}

export interface IDeclStmt extends IBaseNode {
  name: IBaseNode
  value: IBaseNode
  typeSpec?: IBaseNode
}

export class DeclStmt
  extends Record({
    loc: null,
    name: null,
    value: null,
    typeSpec: null,
    nodeType: NodeType.DECL_STMT
  })
  implements IDeclStmt {
  constructor(props: IDeclStmt) {
    super(props)
  }
}

export interface IFnDeclStmt extends IBaseNode {
  name: IBaseNode
  value: IBaseNode
  params: List<IBaseNode>
  returnTypeSpec: IBaseNode
  genericParams: List<IBaseNode>
}

export class FnDeclStmt
  extends Record({
    loc: null,
    name: null,
    value: null,
    params: List(),
    returnTypeSpec: null,
    genericParams: List(),
    nodeType: NodeType.FN_DECL_STMT
  })
  implements IFnDeclStmt {
  constructor(props: IFnDeclStmt) {
    super(props)
  }
}

export interface IDataDeclStmt extends IBaseNode {
  name: IBaseNode
  fields: List<IBaseNode>
  genericParams: List<IBaseNode>
}

export class DataDeclStmt
  extends Record({
    loc: null,
    name: null,
    fields: List(),
    genericParams: List(),
    nodeType: NodeType.DATA_DECL_STMT
  })
  implements IDataDeclStmt {
  constructor(props: IDataDeclStmt) {
    super(props)
  }
}

export interface ITypeDeclStmt extends IBaseNode {
  name: IBaseNode
  constructors: List<IBaseNode>
  genericParams: List<IBaseNode>
}

export class TypeDeclStmt
  extends Record({
    loc: null,
    name: null,
    constructors: List(),
    genericParams: List(),
    nodeType: NodeType.TYPE_DECL_STMT
  })
  implements ITypeDeclStmt {
  constructor(props: ITypeDeclStmt) {
    super(props)
  }
}

export interface ITypeCtor extends IBaseNode {
  name: IBaseNode
  fields: List<IBaseNode>
}

export class TypeCtor
  extends Record({
    loc: null,
    name: null,
    fields: List(),
    nodeType: NodeType.TYPE_CTOR
  })
  implements ITypeCtor {
  constructor(props: ITypeCtor) {
    super(props)
  }
}

export interface IBlockStmt extends IBaseNode {
  nodes: List<IBaseNode>
}

export class BlockStmt
  extends Record({
    loc: null,
    nodes: List(),
    nodeType: NodeType.BLOCK_STMT
  })
  implements IBlockStmt {
  constructor(props: IBlockStmt) {
    super(props)
  }
}

export interface IExprStmt extends IBaseNode {
  expr: IBaseNode
}

export class ExprStmt
  extends Record({ loc: null, expr: null, nodeType: NodeType.EXPR_STMT })
  implements IExprStmt {
  constructor(props: IExprStmt) {
    super(props)
  }
}
