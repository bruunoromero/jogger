import { List } from "immutable"

import { File } from "../file"
import {
  RootStmtNode,
  BlockStmt,
  ExprStmt,
  DeclStmt,
  FnDeclStmt
} from "../node/statement_nodes"
import {
  Expr,
  CallExpr,
  ListExpr,
  MatchExpr,
  IfExpr,
  RecordExpr,
  FnExpr
} from "../node/expression_nodes"
import { BinOp } from "../node/binary_operator"
import { Dependency, Graph } from "../dependency"

export const expand = (file: File) => {
  return file.updateIn(["program", "stmts"], it => it.map(expandStmt))
}

export const expandAll = (graph: Graph<File>) => {
  return graph.update("deps", (dep: List<Dependency<File>>) =>
    dep.map(it => it.update("value", expand))
  )
}

export const expandBlockOrExpr = (value: Expr | BlockStmt) => {
  if (value instanceof BlockStmt) {
    return expandStmt(value)
  } else {
    return expandExpr(value)
  }
}

export const expandExpr = (value: Expr) => {
  if (value instanceof BinOp) {
    return new CallExpr({
      loc: value.loc,
      callee: value.op,
      args: List.of(expandExpr(value.left), expandExpr(value.right))
    })
  } else if (value instanceof ListExpr) {
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
    return value
      .update("callee", expandExpr)
      .update("args", args => args.map(expandExpr))
  } else if (value instanceof FnExpr) {
    return value.update("body", expandExpr)
  }

  return value
}

export const expandStmt = (stmt: RootStmtNode) => {
  if (stmt instanceof DeclStmt) {
    return stmt.update("value", expandBlockOrExpr)
  } else if (stmt instanceof FnDeclStmt) {
    return stmt.update("body", expandBlockOrExpr)
  } else if (stmt instanceof BlockStmt) {
    return stmt.update("nodes", it => it.map(expandStmt))
  } else if (stmt instanceof ExprStmt) {
    return stmt.update("expr", expandExpr)
  }

  return stmt
}
