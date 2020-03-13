import { NodeType, IBaseNode } from "./base_nodes"
import { Record, List } from "immutable"

export interface IGenericType extends IBaseNode {
  name: string
}

export class GenericType
  extends Record({
    loc: null,
    name: "",
    nodeType: NodeType.GENERIC_TYPE
  })
  implements IGenericType {
  constructor(props: IGenericType) {
    super(props)
  }
}

export interface IAbstractType extends IBaseNode {
  name: IBaseNode
  params: List<IBaseNode>
}

export class AbstractType
  extends Record({
    loc: null,
    name: null,
    params: List(),
    nodeType: NodeType.ABSTRACT_TYPE
  })
  implements IAbstractType {
  constructor(props: IAbstractType) {
    super(props)
  }
}

export interface IConcreteType extends IBaseNode {
  name: IBaseNode
  params: List<IBaseNode>
}

export class ConcreteType
  extends Record({
    loc: null,
    name: null,
    params: List(),
    nodeType: NodeType.CONCRETE_TYPE
  })
  implements IConcreteType {
  constructor(props: IConcreteType) {
    super(props)
  }
}

export interface IFnType extends IBaseNode {
  returnType: IBaseNode
  argsType: List<IBaseNode>
}

export class FnType
  extends Record({
    loc: null,
    argsType: List(),
    returnType: null,
    nodeType: NodeType.FN_TYPE
  })
  implements IFnType {
  constructor(props: IFnType) {
    super(props)
  }
}

export interface IParameter extends IBaseNode {
  name: IBaseNode
  typeSpec: IBaseNode
}

export class Parameter
  extends Record({
    loc: null,
    name: null,
    typeSpec: null,
    nodeType: NodeType.PARAMETER
  })
  implements IParameter {
  constructor(props: IParameter) {
    super(props)
  }
}
