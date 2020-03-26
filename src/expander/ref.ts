import { List, Record, Map } from "immutable"

import { File } from "../file"
import { Graph, Dependency } from "../dependency"
import {
  RootStmtNode,
  BlockStmt,
  ExprStmt,
  DeclStmt,
  FnDeclStmt,
  TypeDeclStmt,
  DataDeclStmt
} from "../node/statement_nodes"
import {
  Expr,
  CallExpr,
  ListExpr,
  MatchExpr,
  IfExpr,
  RecordExpr,
  SymbolExpr,
  FnExpr
} from "../node/expression_nodes"
import { AccessOp } from "../node/binary_operator"
import { ImportClause } from "../node/clause_nodes"
import {
  TypeNode,
  GenericType,
  ConcreteType,
  AbstractType,
  Parameter
} from "../node/type_nodes"
import { Validator } from "../validator"

interface IContext {
  parent: Context
  types: List<string>
  imports: List<string>
  variables: List<string>
  exposingTypes: List<string>
  importAs: Map<string, string>
  exposingVariables: List<string>
  importedTypes: Map<string, string>
  importedVariables: Map<string, string>
}

class Context
  extends Record<IContext>({
    parent: null,
    types: List(),
    imports: List(),
    importAs: Map(),
    variables: List(),
    importedTypes: Map(),
    exposingTypes: List(),
    exposingVariables: List(),
    importedVariables: Map()
  })
  implements IContext {
  constructor(props: IContext) {
    super(props)
  }

  extend() {
    return new Context({
      parent: this,
      types: List(),
      imports: List(),
      importAs: Map(),
      variables: List(),
      importedTypes: Map(),
      exposingTypes: List(),
      importedVariables: Map(),
      exposingVariables: List()
    })
  }

  isRoot(): boolean {
    return this.parent === null
  }

  root(): Context {
    if (this.isRoot) {
      return this
    }

    return this.parent.root()
  }

  hasVariable(name: string): boolean {
    if (this.variables.contains(name)) {
      return true
    }

    if (!this.isRoot) {
      return this.parent.hasVariable(name)
    }

    return false
  }

  hasType(name: string): boolean {
    return this.root().types.contains(name)
  }

  hasImport(name: string): boolean {
    return this.root().imports.contains(name)
  }

  hasImportAs(name: string): boolean {
    return this.root().importAs.has(name)
  }

  findContext(name: string, ctxs: Map<string, Context>): Context | null {
    const root = this.root()

    if (root.hasImport(name)) {
      return ctxs.get(name)
    }

    if (root.hasImportAs(name)) {
      const importName = root.importAs.get(name)
      return ctxs.get(importName)
    }

    return null
  }

  hasImportedVariable(name: string): boolean {
    return this.root().importedVariables.has(name)
  }

  hasImportedType(name: string): boolean {
    return this.root().importedTypes.has(name)
  }

  getImportFromVariable(name: string) {
    return this.root().importedVariables.get(name)
  }

  getImportFromType(name: string) {
    return this.root().importedTypes.get(name)
  }
}

export const getImports = (imports: List<ImportClause>) =>
  imports.map(imp => imp.name.str())

export const getImportAs = (imports: List<ImportClause>) =>
  Map<string, string>().withMutations(mapping => {
    imports.forEach(imp => {
      if (imp.asStr) {
        mapping.set(imp.asStr.str(), imp.name.str())
      }
    })
  })

export const getFromImports = (
  imports: List<ImportClause>,
  ctxs: Map<string, Context>,
  key: "exposingVariables" | "exposingTypes"
): Map<string, string> => {
  return Map<string, string>().withMutations(mapping => {
    const importAll = imports.filter(imp => imp.isImportAll)
    const exposing = imports.filter(imp => !imp.exposing.isEmpty())

    exposing.forEach(imp => {
      const importName = imp.name.str()
      const impCtx = ctxs.get(importName)

      imp.exposing
        .map(exp => exp.str())
        .filter(name => impCtx.get(key).contains(name))
        .forEach(exposedType => {
          mapping.set(exposedType, importName)
        })
    })

    importAll.forEach(imp => {
      const importName = imp.name.str()
      const impCtx = ctxs.get(importName)

      impCtx.get(key).forEach(exposedType => {
        mapping.set(exposedType, importName)
      })
    })
  })
}

export const expand = (
  file: File,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
): File => {
  const updated = file.updateIn(
    ["program", "stmts"],
    (stmts: List<RootStmtNode>) =>
      stmts.map(stmt => expandStmt(stmt, ctx, ctxs, validator))
  )

  ctx.set("exposingTypes", ctx.types).set("exposingVariables", ctx.variables)

  return updated
}

export const expandAll = (graph: Graph<File>) => {
  let ctxs = Map<string, Context>()

  return graph
    .sort()
    .map(el => graph.getDependency(el))
    .reduce((graph, dep: Dependency<File>) => {
      let file: File
      const fileValidator = new Validator(dep.value.source, dep.value.filename)

      const ctx = new Context({
        parent: null,
        types: List(),
        variables: List(),
        exposingTypes: List(),
        exposingVariables: List(),
        importedTypes: getFromImports(
          dep.value.program.imports,
          ctxs,
          "exposingTypes"
        ),
        importedVariables: getFromImports(
          dep.value.program.imports,
          ctxs,
          "exposingVariables"
        ),
        imports: getImports(dep.value.program.imports),
        importAs: getImportAs(dep.value.program.imports)
      }).withMutations(ctx => {
        file = expand(dep.value, ctx, ctxs, fileValidator)
      })

      ctxs = ctxs.set(dep.name, ctx)

      fileValidator.thryThrow()

      return graph.replaceDependency(dep.name, file)
    }, graph)
}

export const expandBlockOrExpr = (
  value: Expr | BlockStmt,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (value instanceof BlockStmt) {
    return expandStmt(value, ctx, ctxs, validator)
  } else {
    return expandExpr(value, ctx, ctxs, validator)
  }
}

export const expandExpr = (
  value: Expr,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (value instanceof ListExpr) {
    return value.update("value", it =>
      it.map(v => expandExpr(v, ctx, ctxs, validator))
    )
  } else if (value instanceof MatchExpr) {
    return value
      .update("matcher", v => expandExpr(v, ctx, ctxs, validator))
      .update("clauses", clauses =>
        clauses.map(it =>
          it
            .update("cond", v => expandExpr(v, ctx, ctxs, validator))
            .update("truthy", v => expandBlockOrExpr(v, ctx, ctxs, validator))
        )
      )
  } else if (value instanceof IfExpr) {
    return value
      .update("cond", v => expandExpr(v, ctx, ctxs, validator))
      .update("truthy", v => expandBlockOrExpr(v, ctx, ctxs, validator))
      .update("falsy", v => expandBlockOrExpr(v, ctx, ctxs, validator))
  } else if (value instanceof RecordExpr) {
    return value
      .update("name", name =>
        rewriteSymbolOrAccessVariable(name, ctx, ctxs, validator)
      )
      .update("fields", fields =>
        fields.map(it =>
          it.update("value", v => expandExpr(v, ctx, ctxs, validator))
        )
      )
  } else if (value instanceof CallExpr) {
    return value
      .update("callee", v => expandExpr(v, ctx, ctxs, validator))
      .update("args", args =>
        args.map(v => expandExpr(v, ctx, ctxs, validator))
      )
  } else if (value instanceof FnExpr) {
    const fnCtx = ctx.extend().asMutable()
    return value
      .update("params", params =>
        params.map(p => {
          fnCtx.update("variables", vars => vars.push(p.name.str()))
          return expandParameter(p, ctx, ctxs, validator)
        })
      )
      .update("returnTypeSpec", t => expandType(t, ctx, ctxs, validator))
      .update("body", v => expandBlockOrExpr(v, fnCtx, ctxs, validator))
  } else if (value instanceof SymbolExpr || value instanceof AccessOp) {
    return rewriteSymbolOrAccessVariable(value, ctx, ctxs, validator)
  }

  return value
}

export const expandStmt = (
  stmt: RootStmtNode,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (stmt instanceof DeclStmt) {
    ctx.update("variables", vars => vars.push(stmt.name.str()))
    return stmt
      .update("value", v => expandBlockOrExpr(v, ctx, ctxs, validator))
      .update("typeSpec", t => expandType(t, ctx, ctxs, validator))
  } else if (stmt instanceof FnDeclStmt) {
    ctx.update("variables", vars => vars.push(stmt.name.str()))
    const fnCtx = ctx.extend().asMutable()
    return stmt
      .update("params", params =>
        params.map(p => {
          fnCtx.update("variables", vars => vars.push(p.name.str()))
          return expandParameter(p, ctx, ctxs, validator)
        })
      )
      .update("returnTypeSpec", t => expandType(t, ctx, ctxs, validator))
      .update("body", v => expandBlockOrExpr(v, fnCtx, ctxs, validator))
  } else if (stmt instanceof BlockStmt) {
    return stmt.update("nodes", it =>
      it.map(stmt => expandStmt(stmt, ctx, ctxs, validator))
    )
  } else if (stmt instanceof ExprStmt) {
    return stmt.update("expr", v => expandExpr(v, ctx, ctxs, validator))
  } else if (stmt instanceof TypeDeclStmt) {
    ctx.update("types", types => types.push(stmt.name.str()))
    stmt.constructors.forEach(ctor => {
      ctx.update("variables", ctors => ctors.push(ctor.name.str()))
    })

    return stmt.update("constructors", ctors =>
      ctors.map(ctor =>
        ctor.update("fields", fields =>
          fields.map(f => expandType(f, ctx, ctxs, validator))
        )
      )
    )
  } else if (stmt instanceof DataDeclStmt) {
    ctx.update("types", types => types.push(stmt.name.str()))
    ctx.update("variables", variables => variables.push(stmt.name.str()))
    return stmt.update("fields", fields =>
      fields.map(f => expandParameter(f, ctx, ctxs, validator))
    )
  }

  return stmt
}

const expandParameter = (
  parameter: Parameter,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  return parameter.update("typeSpec", t => expandType(t, ctx, ctxs, validator))
}

const makeAccess = (sym: SymbolExpr, parts: List<string>) => {
  if (parts.isEmpty()) {
    return sym
  } else {
    return parts
      .map(p => new SymbolExpr({ loc: sym.loc, value: p }))
      .push(sym)
      .reduce(
        (left: any, right) =>
          new AccessOp({
            loc: sym.loc,
            left,
            right
          })
      )
  }
}

export const rewriteSymbolOrAccessVariable = (
  sym: SymbolExpr | AccessOp,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (sym instanceof SymbolExpr) {
    return rewriteSymbolVariable(sym, ctx, ctxs, validator)
  }

  return rewriteAccessVariable(sym, ctx, ctxs, validator)
}

export const rewriteSymbolVariable = (
  sym: SymbolExpr,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (ctx.hasVariable(sym.str())) {
    return sym
  }

  if (ctx.hasImportedVariable(sym.str())) {
    const parts = List(ctx.getImportFromVariable(sym.str()).split("."))
    return makeAccess(sym, parts)
  }

  validator.addError(sym.loc, `could not find variable ${sym.str()}`)
  return sym
}

export const rewriteAccessVariable = (
  sym: AccessOp,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  let moduleName = sym.moduleStr()
  const symName = sym.symbolStr()

  if (ctx.importAs.has(moduleName)) {
    moduleName = ctx.importAs.get(moduleName)
  }

  if (
    ctx.hasImport(moduleName) &&
    ctxs.get(moduleName).exposingVariables.contains(symName)
  ) {
    return makeAccess(
      new SymbolExpr({ loc: sym.loc, value: symName }),
      List(moduleName.split("."))
    )
  }

  validator.addError(sym.loc, `could not find variable ${sym.str()}`)
  return sym
}

export const rewriteSymbolOrAccessType = (
  sym: SymbolExpr | AccessOp,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (sym instanceof SymbolExpr) {
    return rewriteSymbolType(sym, ctx, ctxs, validator)
  }

  return rewriteAccessType(sym, ctx, ctxs, validator)
}

export const rewriteSymbolType = (
  sym: SymbolExpr,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (ctx.hasType(sym.str())) {
    return sym
  }

  if (ctx.hasImportedType(sym.str())) {
    const parts = List(ctx.getImportFromType(sym.str()).split("."))
    return makeAccess(sym, parts)
  }

  validator.addError(sym.loc, `could not find type ${sym.str()}`)
  return sym
}

export const rewriteAccessType = (
  sym: AccessOp,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  let moduleName = sym.moduleStr()
  const symName = sym.symbolStr()

  if (ctx.importAs.has(moduleName)) {
    moduleName = ctx.importAs.get(moduleName)
  }
  if (
    ctx.hasImport(moduleName) &&
    ctxs.get(moduleName).exposingTypes.contains(symName)
  ) {
    return makeAccess(
      new SymbolExpr({ loc: sym.loc, value: symName }),
      List(moduleName.split("."))
    )
  }

  validator.addError(sym.loc, `could not find type ${sym.str()}`)
  return sym
}

const expandType = (
  type: TypeNode | SymbolExpr | AccessOp,
  ctx: Context,
  ctxs: Map<string, Context>,
  validator: Validator
) => {
  if (!type) return type

  if (type instanceof SymbolExpr || type instanceof AccessOp) {
    return rewriteSymbolOrAccessType(type, ctx, ctxs, validator)
  } else if (type instanceof ConcreteType || type instanceof AbstractType) {
    return type
      .update("name", n => expandType(n, ctx, ctxs, validator))
      .update("params", params =>
        params.map(p => expandType(p, ctx, ctxs, validator))
      )
  }

  return type
}
