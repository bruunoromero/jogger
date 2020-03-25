import { NodeType, IBaseNode } from "./base_nodes"
import { Record, List } from "immutable"
import { AccessOp } from "./binary_operator"
import { SymbolExpr } from "./expression_nodes"

export interface IPackageClause extends IBaseNode {
  name: AccessOp | SymbolExpr
}

export class ModuleClause
  extends Record<IPackageClause>({
    loc: null,
    name: null,
    sym: Symbol(),
    nodeType: NodeType.MODULE_CLAUSE
  })
  implements IPackageClause {
  constructor(props: IPackageClause) {
    super(props)
  }
}

export interface IImportClause extends IBaseNode {
  name: AccessOp | SymbolExpr
  asStr?: SymbolExpr
  isImportAll: boolean
  exposing: List<SymbolExpr>
}

export class ImportClause
  extends Record<IImportClause>({
    loc: null,
    name: null,
    asStr: null,
    sym: Symbol(),
    exposing: List(),
    isImportAll: false
  })
  implements IImportClause {
  constructor(props: IImportClause) {
    super(props)
  }
}
