import { List } from "immutable"

import { File } from "../file"
import {
  RootStmtNode,
  BlockStmt,
  ExprStmt,
  DeclStmt,
  FnDeclStmt,
  StmtNode
} from "../node/statement_nodes"
import {
  Expr,
  CallExpr,
  ListExpr,
  MatchExpr,
  IfExpr,
  RecordExpr
} from "../node/expression_nodes"
import { Dependency, Graph } from "../dependency"

export const expand = (file: File) => {
  return file.updateIn(["program", "stmts"], it => it.map(expandStmt))
}

export const expandAll = (graph: Graph<File>) => {
  return graph.update("deps", (dep: List<Dependency<File>>) =>
    dep.map(it => it.update("value", expand))
  )
}

export const expandBlockOrExpr = (
  value: Expr | BlockStmt
): Expr | BlockStmt => {
  if (value instanceof BlockStmt) {
    return expandStmt(value) as BlockStmt
  } else {
    return expandExpr(value)
  }
}

export const expandCallee = (callee: Expr, remainArgs: List<Expr>) => {
  if (remainArgs.isEmpty() || remainArgs.size === 1) {
    return new CallExpr({
      loc: callee.loc,
      callee: callee,
      args: remainArgs.map(expandExpr)
    })
  } else {
    return expandCallee(
      new CallExpr({
        loc: callee.loc,
        callee: callee,
        args: remainArgs.take(1).map(expandExpr)
      }),
      remainArgs.shift()
    )
  }
}

export const expandCall = (call: CallExpr) => {
  const updatedCall = call.update("callee", expandExpr)

  if (call.args.isEmpty()) {
    return updatedCall
  }

  if (call.args.size === 1) {
    return updatedCall.update("args", args => args.map(expandExpr))
  }

  return expandCallee(updatedCall.callee, updatedCall.args)
}

export const expandExpr = (value: Expr): Expr => {
  if (value instanceof ListExpr) {
    return value.update("value", it => it.map(expandExpr))
  } else if (value instanceof MatchExpr) {
    return value
      .update("matcher", expandExpr)
      .update("clauses", clauses =>
        clauses.map(it =>
          it.update("cond", expandExpr).update("truthy", expandBlockOrExpr)
        )
      )
  } else if (value instanceof IfExpr) {
    return value
      .update("cond", expandExpr)
      .update("truthy", expandBlockOrExpr)
      .update("falsy", expandBlockOrExpr)
  } else if (value instanceof RecordExpr) {
    return value.update("fields", fields =>
      fields.map(it => it.update("value", expandExpr))
    )
  } else if (value instanceof CallExpr) {
    return expandCall(value)
  }

  return value
}

export const expandStmt = (stmt: RootStmtNode): RootStmtNode => {
  if (stmt instanceof DeclStmt) {
    return stmt.update("value", expandBlockOrExpr)
  } else if (stmt instanceof FnDeclStmt) {
    return stmt.update("body", expandBlockOrExpr)
  } else if (stmt instanceof BlockStmt) {
    return stmt.update("nodes", it => it.map(expandStmt) as List<StmtNode>)
  } else if (stmt instanceof ExprStmt) {
    return stmt.update("expr", expandExpr)
  }

  return stmt
}
