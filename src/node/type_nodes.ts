import { NodeType, IBaseNode } from "./base_nodes"
import { Record, List } from "immutable"
import { SymbolExpr } from "./expression_nodes"

export type TypeNode = ConcreteType | AbstractType | GenericType | FnType

export interface IGenericType extends IBaseNode {
  name: string
}

export class GenericType
  extends Record<IGenericType>({
    loc: null,
    name: "",
    sym: Symbol(),
    nodeType: NodeType.GENERIC_TYPE
  })
  implements IGenericType {
  constructor(props: IGenericType) {
    super(props)
  }
}

export interface IAbstractType extends IBaseNode {
  name: IBaseNode
  params: List<TypeNode>
}

export class AbstractType
  extends Record<IAbstractType>({
    loc: null,
    name: null,
    params: List(),
    sym: Symbol(),
    nodeType: NodeType.ABSTRACT_TYPE
  })
  implements IAbstractType {
  constructor(props: IAbstractType) {
    super(props)
  }
}

export interface IConcreteType extends IBaseNode {
  name: IBaseNode
  params: List<TypeNode>
}

export class ConcreteType
  extends Record<IConcreteType>({
    loc: null,
    name: null,
    params: List(),
    sym: Symbol(),
    nodeType: NodeType.CONCRETE_TYPE
  })
  implements IConcreteType {
  constructor(props: IConcreteType) {
    super(props)
  }
}

export interface IFnType extends IBaseNode {
  returnType: TypeNode
  argsType: List<TypeNode>
}

export class FnType
  extends Record<IFnType>({
    loc: null,
    argsType: List(),
    returnType: null,
    sym: Symbol(),
    nodeType: NodeType.FN_TYPE
  })
  implements IFnType {
  constructor(props: IFnType) {
    super(props)
  }
}

export interface IParameter extends IBaseNode {
  name: SymbolExpr
  typeSpec: TypeNode
}

export class Parameter
  extends Record<IParameter>({
    loc: null,
    name: null,
    typeSpec: null,
    sym: Symbol(),
    nodeType: NodeType.PARAMETER
  })
  implements IParameter {
  constructor(props: IParameter) {
    super(props)
  }
}
