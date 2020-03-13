import { ParserRuleContext } from "antlr4"
import { TerminalNode } from "antlr4/tree/Tree"

import { JoggerVisitor } from "./Parser/JoggerVisitor"
import { BinOp, AccessOp } from "./node/binary_operator"
import {
  SymbolExpr,
  IntLiteral,
  FloatLiteral,
  StringLiteral,
  CharLiteral,
  CallExpr,
  RecordExpr,
  ListExpr,
  RecordField,
  IfExpr,
  MatchExpr,
  MatchClause,
  FnExpr
} from "./node/expression_nodes"
import { IBaseNode, NodePosition, NodeUtils, NodeType } from "./node/base_nodes"
import {
  GenericType,
  Parameter,
  ConcreteType,
  AbstractType,
  FnType
} from "./node/type_nodes"
import {
  AsClauseContext,
  RecordFieldContext,
  MatchClauseContext,
  ExprStmtContext
} from "./parser/JoggerParser"
import {
  IParametersContext,
  IParameterListContext,
  IParameterTypeParamsContext,
  IGenericParamsContext,
  IExposingClauseContext,
  IModuleStmtContext,
  IIfExprContext,
  IMatchExprContext,
  IFnDeclStmtContext,
  IDataDeclStmtContext,
  ITypeDeclStmtContext,
  ITypeDeclCtorsContext,
  IUnnamedTypesContext,
  ITypeDeclCtorContext,
  IBlockContext,
  IPrimitiveContext,
  IRecordFieldsContext,
  IListContext,
  IFnExpressionContext,
  IAccessContext,
  IStmtContext,
  ISymbolOrRecordContext,
  IBasicTypeContext,
  IParameterTypeContext,
  IEmptytableUnnamedTypesContext,
  IFnTypeContext,
  IParameterSpecContext,
  IParameterContext,
  IDeclStmtContext,
  ISymbolAccessContext,
  IPackageClauseContext,
  IImportClauseContext
} from "./context_types"
import {
  ExprStmt,
  ModuleStmt,
  DeclStmt,
  FnDeclStmt,
  DataDeclStmt,
  TypeDeclStmt,
  TypeCtor,
  BlockStmt
} from "./node/statement_nodes"
import { PackageClause, ImportClause } from "./node/clause_nodes"
import { List } from "immutable"

const locFromTerminal = (node: TerminalNode) =>
  new NodePosition({ start: node.getSymbol(), end: node.getSymbol() })

const locFromCtx = (ctx: ParserRuleContext) =>
  new NodePosition({ start: ctx.start, end: ctx.stop })

class Visitor extends JoggerVisitor {
  visit: (ctx: ParserRuleContext) => IBaseNode

  constructor() {
    super()
    this.makeOpVisitors()
  }

  // UTILS

  makeOpVisitors() {
    for (let i = 2; i < 8; i++) {
      this[`visitOp${i}`] = this.makeVisitorFromOp(i)
    }

    this.visitExpr = this.makeVisitorFromOp(8)
    this.visitOp1 = this.makeVisitOp("access", 1)
  }

  makeVisitorFromOp(op: number) {
    return this.makeVisitOp(`op${op - 1}`, op)
  }

  makeVisitOp(child: string, op: number) {
    return (ctx: ParserRuleContext) => {
      if (ctx.getChildCount() > 1) {
        return this.visitOperator(ctx, ctx[child](), ctx[`OP${op}`](0))
      } else {
        return this.visit(ctx[child](0))
      }
    }
  }

  visitOperator(
    ctx: ParserRuleContext,
    nodes: ParserRuleContext[],
    op: TerminalNode
  ) {
    return nodes
      .map(el => this.visit(el))
      .reduce(
        (left, right) =>
          new BinOp({
            loc: locFromCtx(ctx),
            op: new SymbolExpr({
              value: op.getText(),
              loc: locFromTerminal(op)
            }),
            left,
            right
          })
      )
  }

  makeCall(callee: IBaseNode, ctxs: IParametersContext[]) {
    const currentCtx = ctxs[0]

    if (ctxs.length === 1) {
      return new CallExpr({
        callee,
        loc: locFromCtx(currentCtx),
        args: List(currentCtx.expr().map(expr => this.visitExpr(expr)))
      })
    } else {
      return this.makeCall(
        new CallExpr({
          callee,
          loc: locFromCtx(currentCtx),
          args: List(currentCtx.expr().map(expr => this.visitExpr(expr)))
        }),
        ctxs.slice(1)
      )
    }
  }

  // MAKERS

  makeSymbol(sym: TerminalNode): SymbolExpr {
    return new SymbolExpr({ loc: locFromTerminal(sym), value: sym.getText() })
  }

  makeInt(sym: TerminalNode): IntLiteral {
    return new IntLiteral({
      loc: locFromTerminal(sym),
      value: parseInt(sym.getText())
    })
  }

  makeFloat(sym: TerminalNode): FloatLiteral {
    return new FloatLiteral({
      loc: locFromTerminal(sym),
      value: parseFloat(sym.getText())
    })
  }

  makeString(sym: TerminalNode): StringLiteral {
    return new StringLiteral({
      loc: locFromTerminal(sym),
      value: sym.getText()
    })
  }

  makeChar(sym: TerminalNode): CharLiteral {
    return new CharLiteral({
      loc: locFromTerminal(sym),
      value: sym.getText()
    })
  }

  makeGenericType(sym: TerminalNode): GenericType {
    return new GenericType({ loc: locFromTerminal(sym), name: sym.getText() })
  }

  makeType(ctx: ParserRuleContext, node: IBaseNode, params: List<IBaseNode>) {
    const genericParams = params.filter(p =>
      NodeUtils.isInstance(p, NodeType.GENERIC_TYPE)
    )
    const abstractParams = params.filter(p =>
      NodeUtils.isInstance(p, NodeType.ABSTRACT_TYPE)
    )

    if (genericParams.isEmpty() && abstractParams.isEmpty()) {
      return new ConcreteType({ loc: locFromCtx(ctx), name: node, params })
    }

    return new AbstractType({ loc: locFromCtx(ctx), name: node, params })
  }

  // PARAMETERS

  visitSymbolAccess(ctx: ISymbolAccessContext): IBaseNode {
    const symbols = ctx.SYMBOL().map(sym => this.makeSymbol(sym)) as IBaseNode[]

    return symbols.reduce(
      (left, right) => new AccessOp({ loc: locFromCtx(ctx), left, right })
    )
  }

  visitEmptytableUnnamedTypes(ctx: IEmptytableUnnamedTypesContext) {
    return List(ctx.parameterType().map(it => this.visitParameterType(it)))
  }

  visitParameterType(ctx: IParameterTypeContext): IBaseNode {
    if (ctx.fnType()) {
      return this.visitFnType(ctx.fnType())
    } else if (ctx.basicType()) {
      return this.visitBasicType(ctx.basicType())
    } else if (ctx.GENERIC()) {
      return this.makeGenericType(ctx.GENERIC())
    } else {
      return super.visitParameterType(ctx)
    }
  }

  visitBasicType(ctx: IBasicTypeContext) {
    const node = this.visitSymbolAccess(ctx.symbolAccess())

    if (ctx.parameterTypeParams()) {
      return this.makeType(
        ctx,
        node,
        this.visitParameterTypeParams(ctx.parameterTypeParams())
      )
    }

    return new ConcreteType({
      name: node,
      loc: locFromCtx(ctx),
      params: List<IBaseNode>()
    })
  }

  visitFnType(ctx: IFnTypeContext) {
    const argsType = this.visitEmptytableUnnamedTypes(
      ctx.emptytableUnnamedTypes()
    )

    const returnType = this.visitParameterType(ctx.parameterType())

    return this.makeType(
      ctx,
      new FnType({ loc: locFromCtx(ctx), argsType, returnType }),
      argsType.push(returnType)
    )
  }

  visitParameterList(ctx: IParameterListContext) {
    return List(ctx.parameter().map(it => this.visitParameter(it)))
  }

  visitParameter(ctx: IParameterContext) {
    return new Parameter({
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL()),
      typeSpec: this.visitParameterSpec(ctx.parameterSpec())
    })
  }

  visitParameterSpec(ctx: IParameterSpecContext) {
    return this.visitParameterType(ctx.parameterType())
  }

  visitParameterTypeParams(ctx: IParameterTypeParamsContext) {
    return List(ctx.parameterType().map(it => this.visitParameterType(it)))
  }

  visitGenericParams(ctx: IGenericParamsContext) {
    return List(ctx.GENERIC().map(it => this.makeGenericType(it)))
  }

  // CLAUSES

  visitPackageClause(ctx: IPackageClauseContext) {
    return new PackageClause({
      loc: locFromCtx(ctx),
      name: this.visitSymbolAccess(ctx.symbolAccess())
    })
  }

  visitImportClause(ctx: IImportClauseContext) {
    const name = this.visitSymbolAccess(ctx.symbolAccess())
    const asStr = ctx.asClause() ? this.visitAsClause(ctx.asClause()) : null
    const exposingClause = ctx.exposingClause()
      ? this.visitExposingClause(ctx.exposingClause())
      : List<IBaseNode>()

    const isImportAll = exposingClause === true

    const exposing = (isImportAll ? [] : exposingClause) as List<IBaseNode>

    return new ImportClause({
      loc: locFromCtx(ctx),
      name,
      asStr,
      exposing,
      isImportAll
    })
  }

  visitAsClause(ctx: AsClauseContext) {
    return this.makeSymbol(ctx.SYMBOL())
  }

  visitExposingClause(ctx: IExposingClauseContext): true | List<IBaseNode> {
    if (ctx.ALL_SYM()) {
      return true
    } else {
      return List(ctx.SYMBOL().map(sym => this.makeSymbol(sym)))
    }
  }

  // STATEMENTS

  visitStmt(ctx: IStmtContext): IBaseNode {
    if (ctx.exprStmt()) {
      return this.visitExprStmt(ctx.exprStmt())
    } else if (ctx.declStmt()) {
      return this.visitDeclStmt(ctx.declStmt())
    } else if (ctx.fnDeclStmt()) {
      return this.visitFnDeclStmt(ctx.fnDeclStmt())
    } else if (ctx.moduleStmt()) {
      return this.visitModuleStmt(ctx.moduleStmt())
    } else if (ctx.dataDeclStmt()) {
      return this.visitDataDeclStmt(ctx.dataDeclStmt())
    } else if (ctx.typeDeclStmt()) {
      return this.visitTypeDeclStmt(ctx.typeDeclStmt())
    } else {
      return super.visitStmt(ctx)
    }
  }

  visitModuleStmt(ctx: IModuleStmtContext): ModuleStmt {
    return new ModuleStmt({
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL()),
      stmts: List(ctx.stmt().map(it => this.visitStmt(it)))
    })
  }

  visitExprStmt(ctx: ExprStmtContext): ExprStmt {
    return new ExprStmt({
      loc: locFromCtx(ctx),
      expr: this.visitExpr(ctx.expr())
    })
  }

  visitDeclStmt(ctx: IDeclStmtContext) {
    return new DeclStmt({
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL()),
      value: this.visitExpr(ctx.expr()),
      typeSpec:
        ctx.parameterSpec() && this.visitParameterSpec(ctx.parameterSpec())
    })
  }

  visitFnDeclStmt(ctx: IFnDeclStmtContext) {
    const genericParams = ctx.genericParams()
      ? this.visitGenericParams(ctx.genericParams())
      : List<IBaseNode>()

    return new FnDeclStmt({
      genericParams,
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL()),
      params: this.visitParameterList(ctx.parameterList()),
      value: this.visitBlockOrExpr(ctx.blockOrExpr()),
      returnTypeSpec:
        ctx.parameterSpec() && this.visitParameterSpec(ctx.parameterSpec())
    })
  }

  visitDataDeclStmt(ctx: IDataDeclStmtContext) {
    const name = this.makeSymbol(ctx.SYMBOL())
    const genericParams = this.visitGenericParams(ctx.genericParams())
    const fields = this.visitParameterList(ctx.parameterList())

    return new DataDeclStmt({
      name,
      fields,
      genericParams,
      loc: locFromCtx(ctx)
    })
  }

  visitTypeDeclStmt(ctx: ITypeDeclStmtContext) {
    const name = this.makeSymbol(ctx.SYMBOL())
    const genericParams = this.visitGenericParams(ctx.genericParams())
    const constructors = this.visitTypeDeclCtors(ctx.typeDeclCtors())

    return new TypeDeclStmt({
      name,
      constructors,
      genericParams,
      loc: locFromCtx(ctx)
    })
  }

  visitTypeDeclCtors(ctx: ITypeDeclCtorsContext) {
    return List(ctx.typeDeclCtor().map(it => this.visitTypeDeclCtor(it)))
  }

  visitTypeDeclCtor(ctx: ITypeDeclCtorContext) {
    const fields = ctx.unnamedTypes()
      ? this.visitUnnamedTypes(ctx.unnamedTypes())
      : List<IBaseNode>()

    return new TypeCtor({
      fields,
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL())
    })
  }

  visitUnnamedTypes(ctx: IUnnamedTypesContext) {
    return List(ctx.parameterType().map(it => this.visitParameterType(it)))
  }

  visitBlock(ctx: IBlockContext) {
    return new BlockStmt({
      loc: locFromCtx(ctx),
      nodes: List(ctx.stmt().map(it => this.visitStmt(it)))
    })
  }

  // EXPRESSIONS

  visitPrimitive(ctx: IPrimitiveContext) {
    let node: IBaseNode

    if (ctx.INT()) {
      node = this.makeInt(ctx.INT())
    } else if (ctx.FLOAT()) {
      node = this.makeFloat(ctx.FLOAT())
    } else if (ctx.STRING()) {
      node = this.makeString(ctx.STRING())
    } else if (ctx.CHAR()) {
      node = this.makeChar(ctx.CHAR())
    } else if (ctx.list()) {
      node = this.visitList(ctx.list())
    } else if (ctx.expr()) {
      node = this.visitExpr(ctx.expr())
    } else if (ctx.ifExpr()) {
      node = this.visitIfExpr(ctx.ifExpr())
    } else if (ctx.symbolOrRecord()) {
      node = this.visitSymbolOrRecord(ctx.symbolOrRecord())
    } else if (ctx.fnExpression()) {
      node = this.visitFnExpression(ctx.fnExpression())
    }

    const params = ctx.parameters()

    if (params.length) {
      return this.makeCall(node, params)
    }

    return node
  }

  visitSymbolOrRecord(ctx: ISymbolOrRecordContext) {
    const sym = this.makeSymbol(ctx.SYMBOL())

    if (ctx.recordFields() != null) {
      return new RecordExpr({
        name: sym,
        loc: locFromCtx(ctx),
        fields: this.visitRecordFields(ctx.recordFields())
      })
    }

    return sym
  }

  visitRecordFields(ctx: IRecordFieldsContext) {
    return List(ctx.recordField().map(it => this.visitRecordField(it)))
  }

  visitRecordField(ctx: RecordFieldContext) {
    return new RecordField({
      loc: locFromCtx(ctx),
      name: this.makeSymbol(ctx.SYMBOL()),
      value: this.visitExpr(ctx.expr())
    })
  }

  visitList(ctx: IListContext) {
    return new ListExpr({
      loc: locFromCtx(ctx),
      value: List(ctx.expr().map(e => this.visitExpr(e)))
    })
  }

  visitIfExpr(ctx: IIfExprContext) {
    const cond = this.visitExpr(ctx.expr())
    const truthy = this.visit(ctx.blockOrExpr(0))
    const falsy = this.visit(ctx.blockOrExpr(1))

    return new IfExpr({ loc: locFromCtx(ctx), cond, truthy, falsy })
  }

  visitMatchExpr(ctx: IMatchExprContext) {
    const matcher = this.visitExpr(ctx.expr())
    const clauses = List(ctx.matchClause().map(it => this.visitMatchClause(it)))

    return new MatchExpr({ loc: locFromCtx(ctx), matcher, clauses })
  }

  visitMatchClause(ctx: MatchClauseContext) {
    const cond = this.visitExpr(ctx.expr())
    const truthy = this.visitBlockOrExpr(ctx.blockOrExpr())

    return new MatchClause({ loc: locFromCtx(ctx), cond, truthy })
  }

  visitFnExpression(ctx: IFnExpressionContext) {
    return new FnExpr({
      loc: locFromCtx(ctx),
      params: this.visitParameterList(ctx.parameterList()),
      body: this.visitBlockOrExpr(ctx.blockOrExpr()),
      returnTypeSpec:
        ctx.parameterSpec() && this.visitParameterSpec(ctx.parameterSpec())
    })
  }

  visitAccess(ctx: IAccessContext): AccessOp {
    return ctx
      .primitive()
      .map(prim => this.visitPrimitive(prim))
      .reduce((left, right) => new AccessOp({ loc: null, left, right }))
  }
}
