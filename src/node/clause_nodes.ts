import { NodePosition, NodeType, IBaseNode } from "./base_nodes"
import { Record, List } from "immutable"

export interface IPackageClause extends IBaseNode {
  name: IBaseNode
}

export class PackageClause
  extends Record({ loc: null, name: null, nodeType: NodeType.PACKAGE_CLAUSE })
  implements IPackageClause {
  constructor(props: IPackageClause) {
    super(props)
  }
}

export interface IImportClause extends IBaseNode {
  name: IBaseNode
  asStr?: IBaseNode
  isImportAll: boolean
  exposing: List<IBaseNode>
}

export class ImportClause
  extends Record({
    loc: null,
    name: null,
    asStr: null,
    exposing: List(),
    isImportAll: false
  })
  implements IImportClause {
  constructor(props: IImportClause) {
    super(props)
  }
}
