import {
  SymbolExpr,
  CharLiteral,
  IntLiteral,
  FloatLiteral,
  StringLiteral,
  RecordExpr,
  RecordField,
  ListExpr,
  IfExpr,
  MatchClause,
  MatchExpr,
  FnExpr,
  CallExpr,
  Expr
} from "../node/expression_nodes"
import { NodePosition, NodeType, NodeUtils, Program } from "../node/base_nodes"
import { AccessOp, BinOp } from "../node/binary_operator"
import {
  GenericType,
  Parameter,
  TypeNode,
  ConcreteType,
  AbstractType,
  FnType
} from "../node/type_nodes"
import { List } from "immutable"
import {
  BlockStmt,
  DeclStmt,
  FnDeclStmt,
  DataDeclStmt,
  TypeCtor,
  TypeDeclStmt
} from "../node/statement_nodes"
import { ModuleClause, ImportClause } from "../node/clause_nodes"

const interpretEscapes = (str: string) => {
  let escapes = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t"
  }
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    let type = escape.charAt(0)
    let hex = escape.slice(1)
    if (type === "u") {
      return String.fromCharCode(parseInt(hex, 16))
    }
    if (escapes.hasOwnProperty(type)) {
      return escapes[type]
    }
    return type
  })
}

export const makeSymbol = ({ start, value, end }) =>
  new SymbolExpr({
    value,
    loc: new NodePosition({ start, end })
  })

export const makeChar = ({ start, value, end }) =>
  new CharLiteral({
    value,
    loc: new NodePosition({ start, end })
  })

export const makeInt = ({ start, value, end }) =>
  new IntLiteral({
    value: parseInt(value, 10),
    loc: new NodePosition({ start, end })
  })

export const makeFloat = ({ start, value, end }) =>
  new FloatLiteral({
    value: parseFloat(value),
    loc: new NodePosition({ start, end })
  })

export const makeString = ({ start, value, end }) =>
  new StringLiteral({
    value: interpretEscapes(value),
    loc: new NodePosition({ start, end })
  })

export const makeSymbolAccess = ({ start, value, end }) => {
  if (value.length > 1) {
    return value.reduce(
      (left, right) =>
        new AccessOp({
          loc: new NodePosition({ start, end }),
          left,
          right
        }) as any
    )
  } else {
    return value[0]
  }
}

export const makeSymbolOrRecord = ({
  start,
  value: {
    node,
    recordFields: [fields]
  },
  end
}) => {
  if (fields) {
    return new RecordExpr({
      name: node,
      fields: List(fields),
      loc: new NodePosition({ start, end })
    })
  } else {
    return node
  }
}

export const makeGeneric = ({ start, value, end }) =>
  new GenericType({
    name: value.slice(1),
    loc: new NodePosition({ start, end })
  })

export const makeRecordField = ({ start, value: { name, value }, end }) =>
  new RecordField({
    name,
    value,
    loc: new NodePosition({ start, end })
  })

export const makeList = ({ start, value, end }) =>
  new ListExpr({
    loc: new NodePosition({ start, end }),
    value: List(value)
  })

export const makeIfExpr = ({ start, value: { cond, truthy, falsy }, end }) =>
  new IfExpr({ loc: new NodePosition({ start, end }), cond, truthy, falsy })

export const makeBlock = ({ start, value, end }) =>
  new BlockStmt({ loc: new NodePosition({ start, end }), nodes: List(value) })

export const makeMatchClause = ({ start, value: { cond, truthy }, end }) =>
  new MatchClause({ loc: new NodePosition({ start, end }), cond, truthy })

export const makeMatchExpr = ({ start, value: { matcher, clauses }, end }) =>
  new MatchExpr({
    matcher,
    clauses: List(clauses),
    loc: new NodePosition({ start, end })
  })

export const makeParameter = ({ start, value: { name, typeSpec }, end }) =>
  new Parameter({ loc: new NodePosition({ start, end }), name, typeSpec })

export const makeFnExpr = ({
  start,
  value: {
    params,
    returnTypeSpec: [returnTypeSpec],
    body
  },
  end
}) =>
  new FnExpr({
    loc: new NodePosition({ start, end }),
    body,
    params,
    returnTypeSpec
  })

export const makePrimitive = ({ start, value: { expr, args }, end }) => {
  function makeCall(callee: Expr, loc: NodePosition, args: any[][]) {
    if (args.length === 1) {
      return new CallExpr({
        loc,
        callee,
        args: List(args[0])
      })
    } else {
      return this.makeCall(
        new CallExpr({
          loc,
          callee,
          args: List(args[0])
        }),
        args.slice(1)
      )
    }
  }

  if (args.length === 0) {
    return expr
  } else {
    return makeCall(expr, new NodePosition({ start, end }), args)
  }
}

export const makeModuleClause = ({ start, value: { name }, end }) =>
  new ModuleClause({ loc: new NodePosition({ start, end }), name })

export const makeExposingClause = ({ start, value, end }) => {
  if (Array.isArray(value)) {
    return List(value)
  }

  return true
}

export const makeImportClause = ({
  start,
  value: {
    name,
    asClause: [asStr],
    exposingClause: [exposingClause]
  },
  end
}) => {
  const isImportAll = exposingClause === true

  const exposing = (isImportAll ? List<SymbolExpr>() : exposingClause) as List<
    SymbolExpr
  >

  return new ImportClause({
    loc: new NodePosition({ start, end }),
    name,
    asStr,
    exposing,
    isImportAll
  })
}

export const makeDeclStmt = ({
  start,
  value: {
    name,
    typeSpec: [typeSpec],
    value
  },
  end
}) =>
  new DeclStmt({ loc: new NodePosition({ start, end }), name, typeSpec, value })

export const makeFnDeclStmt = ({
  start,
  value: {
    name,
    body,
    params,
    genericParams: [genericParams],
    returnTypeSpec: [returnTypeSpec]
  },
  end
}) =>
  new FnDeclStmt({
    loc: new NodePosition({ start, end }),
    name,
    body,
    params,
    returnTypeSpec,
    genericParams: genericParams || List()
  })

export const makeDataDeclStmt = ({
  start,
  value: {
    name,
    genericParams: [genericParams],
    fields
  },
  end
}) =>
  new DataDeclStmt({
    loc: new NodePosition({ start, end }),
    name,
    fields,
    genericParams: genericParams || List()
  })

export const makeTypeDeclCtor = ({
  start,
  value: {
    name,
    fields: [fields]
  },
  end
}) => {
  return new TypeCtor({
    name,
    fields,
    loc: new NodePosition({ start, end })
  })
}

export const makeTypeDeclStmt = ({
  start,
  value: {
    name,
    genericParams: [genericParams],
    constructors
  },
  end
}) => {
  return new TypeDeclStmt({
    name,
    constructors,
    loc: new NodePosition({ start, end }),
    genericParams: genericParams || List()
  })
}

export const makeBasicType = ({
  start,
  value: {
    name,
    params: [params]
  },
  end
}) => {
  function makeType(
    loc: NodePosition,
    name: SymbolExpr | AccessOp | TypeNode,
    params: List<TypeNode>
  ) {
    const genericParams = params.filter(p =>
      NodeUtils.isInstance(p, NodeType.GENERIC_TYPE)
    )
    const abstractParams = params.filter(p =>
      NodeUtils.isInstance(p, NodeType.ABSTRACT_TYPE)
    )

    if (genericParams.isEmpty() && abstractParams.isEmpty()) {
      return new ConcreteType({ loc, name, params })
    }

    return new AbstractType({ loc, name, params })
  }

  if (!params) {
    return new ConcreteType({
      name,
      loc: new NodePosition({ start, end }),
      params: List<TypeNode>()
    })
  }

  return makeType(new NodePosition({ start, end }), name, List(params))
}

export const makeFnType = ({ start, value: { argsType, returnType }, end }) =>
  new FnType({ loc: new NodePosition({ start, end }), argsType, returnType })

export const makeProgram = ({
  start,
  value: { module, imports, stmts },
  end
}) =>
  new Program({
    loc: new NodePosition({ start, end }),
    module,
    stmts: List(stmts),
    imports: List(imports)
  })

export const makeOperatorExpr = ({ start, value: [first, tail], end }) => {
  if (tail.length === 0) {
    return first
  }
  const ops = tail.filter((_, i) => i % 2 === 0)
  const exprs = [first, ...tail.filter((_, i) => i % 2 !== 0)]

  return exprs.reduce(
    (left, right, index) =>
      new BinOp({
        loc: new NodePosition({ start, end }),
        left,
        right,
        op: ops[index - 1]
      })
  )
}
