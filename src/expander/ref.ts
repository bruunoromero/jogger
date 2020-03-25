import { List, Record, Map } from "immutable"

import { File } from "../file"
import { Graph } from "../dependency"
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
import { locFromCtx } from "../visitor"

interface IContext {
  parent: Context
  ctors: List<string>
  types: List<string>
  imports: List<string>
  importAs: Map<string, string>
  variables: List<string>
  datas: Map<string, List<string>>
}

class Context
  extends Record<IContext>({
    parent: null,
    datas: Map(),
    ctors: List(),
    types: List(),
    imports: List(),
    importAs: Map(),
    variables: List()
  })
  implements IContext {
  constructor(props: IContext) {
    super(props)
  }

  extend() {
    return new Context({
      parent: this,
      datas: Map(),
      ctors: List(),
      types: List(),
      imports: List(),
      importAs: Map(),
      variables: List()
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

  hasCtor(name: string): boolean {
    return this.root().ctors.contains(name)
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

  hasData(name: string): boolean {
    return this.root().datas.has(name)
  }

  data(name: string): List<string> {
    return this.root().datas.get(name)
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

export const getImportVariables = (
  imports: List<ImportClause>,
  ctxs: Map<string, Context>
): List<string> => {
  const exposing = imports
    .filter(imp => !imp.exposing.isEmpty())
    .map(imp => imp.exposing.map(exp => exp.str()))
    .flatten()
    .toList()

  return imports
    .filter(imp => imp.isImportAll)
    .map(imp => ctxs.get(imp.name.str()).variables)
    .flatten()
    .toList()
    .concat(exposing)
}

export const expand = (
  file: File,
  ctx: Context,
  ctxs: Map<string, Context>
): File => {
  return file.updateIn(["program", "stmts"], (stmts: List<RootStmtNode>) =>
    stmts.map(stmt => expandStmt(stmt, ctx, ctxs))
  )
}

export const expandAll = (graph: Graph<File>) => {
  let ctxs = Map<string, Context>()

  return graph
    .sort()
    .map(el => graph.getDependency(el))
    .reduce((graph, dep) => {
      let file: File

      const ctx = new Context({
        parent: null,
        datas: Map(),
        types: List(),
        ctors: List(),
        imports: getImports(dep.value.program.imports),
        importAs: getImportAs(dep.value.program.imports),
        variables: getImportVariables(dep.value.program.imports, ctxs)
      }).withMutations(ctx => {
        file = expand(dep.value, ctx, ctxs)
      })

      ctxs = ctxs.set(dep.name, ctx)
      console.log(ctxs.toJS())
      return graph.replaceDependency(dep.name, file)
    }, graph)
}

export const expandBlockOrExpr = (
  value: Expr | BlockStmt,
  ctx: Context,
  ctxs: Map<string, Context>
) => {
  if (value instanceof BlockStmt) {
    return expandStmt(value, ctx, ctxs)
  } else {
    return expandExpr(value, ctx, ctxs)
  }
}

export const expandExpr = (
  value: Expr,
  ctx: Context,
  ctxs: Map<string, Context>
) => {
  if (value instanceof ListExpr) {
    return value.update("value", it => it.map(v => expandExpr(v, ctx, ctxs)))
  } else if (value instanceof MatchExpr) {
    return value
      .update("matcher", v => expandExpr(v, ctx, ctxs))
      .update("clauses", clauses =>
        clauses.map(it =>
          it
            .update("cond", v => expandExpr(v, ctx, ctxs))
            .update("truthy", v => expandBlockOrExpr(v, ctx, ctxs))
        )
      )
  } else if (value instanceof IfExpr) {
    return value
      .update("cond", v => expandExpr(v, ctx, ctxs))
      .update("truthy", v => expandBlockOrExpr(v, ctx, ctxs))
      .update("falsy", v => expandBlockOrExpr(v, ctx, ctxs))
  } else if (value instanceof RecordExpr) {
    return value.update("fields", fields =>
      fields.map(it => it.update("value", v => expandExpr(v, ctx, ctxs)))
    )
  } else if (value instanceof CallExpr) {
    return value
      .update("callee", v => expandExpr(v, ctx, ctxs))
      .update("args", args => args.map(v => expandExpr(v, ctx, ctxs)))
  } else if (value instanceof SymbolExpr) {
    if (!ctx.hasVariable(value.str())) {
      // TODO: DO SOMETHING WHEN NOT FOUND
    }

    return value
  } else if (value instanceof AccessOp) {
    const accessCtx = ctx.findContext(value.moduleStr(), ctxs)
    if (accessCtx) {
      if (!accessCtx.hasVariable(value.symbolStr())) {
        // TODO: DO SOMETHING VARIABLE NOT FOUND ON MODULE
      }
    } else {
      // TODO: DO SOMETHING WHEN MODULE NOT FOUND
    }

    return value
  } else if (value instanceof FnExpr) {
    return value.update("body", v => expandBlockOrExpr(v, ctx, ctxs))
  }

  return value
}

export const expandStmt = (
  stmt: RootStmtNode,
  ctx: Context,
  ctxs: Map<string, Context>
) => {
  if (stmt instanceof DeclStmt) {
    ctx.update("variables", vars => vars.push(stmt.name.str()))
    return stmt.update("value", v => expandBlockOrExpr(v, ctx, ctxs))
  } else if (stmt instanceof FnDeclStmt) {
    ctx.update("variables", vars => vars.push(stmt.name.str()))
    return stmt.update("value", v => expandBlockOrExpr(v, ctx, ctxs))
  } else if (stmt instanceof BlockStmt) {
    return stmt.update("nodes", it =>
      it.map(stmt => expandStmt(stmt, ctx, ctxs))
    )
  } else if (stmt instanceof ExprStmt) {
    return stmt.update("expr", v => expandExpr(v, ctx, ctxs))
  }

  if (stmt instanceof TypeDeclStmt) {
    ctx.update("types", types => types.push(stmt.name.str()))
    stmt.constructors.forEach(ctor => {
      ctx.update("ctors", ctors => ctors.push(ctor.name.str()))
    })
  }

  if (stmt instanceof DataDeclStmt) {
    ctx.update("datas", datas =>
      datas.set(
        stmt.name.str(),
        stmt.fields.map(f => f.name.str())
      )
    )
  }

  return stmt
}
