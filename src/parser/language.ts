import * as P from "parsimmon"
import { List } from "immutable"

import * as t from "./transformer"

import {
  MatchClause,
  Expr,
  SymbolExpr,
  RecordField,
  ListExpr,
  IfExpr,
  MatchExpr,
  FnExpr,
  FloatLiteral,
  IntLiteral,
  StringLiteral,
  CharLiteral,
  RecordExpr
} from "../node/expression_nodes"
import {
  BlockStmt,
  DeclStmt,
  FnDeclStmt,
  StmtNode,
  DataDeclStmt,
  TypeCtor,
  TypeDeclStmt
} from "../node/statement_nodes"
import { AccessOp } from "../node/binary_operator"
import {
  Parameter,
  GenericType,
  TypeNode,
  AbstractType,
  ConcreteType,
  FnType
} from "../node/type_nodes"
import { ImportClause, ModuleClause } from "../node/clause_nodes"
import { Program } from "../node/base_nodes"

const makeOperator = (r: P.Language, start: string) =>
  P.seq(P.oneOf(start), r.OperatorStr)
    .tie()
    .mark()
    .map(t.makeSymbol)

const makeOperatorExpr = (r, num) =>
  P.seq(
    r[`OperatorExpr${num - 1}`],
    P.seq<SymbolExpr, Expr>(
      r[`Operator${num}`].trim(P.optWhitespace),
      r[`OperatorExpr${num - 1}`]
    ).many()
  )
    .mark()
    .map(t.makeOperatorExpr)

const comma = P.string(",").trim(P.optWhitespace)
const colon = P.string(":").trim(P.optWhitespace)
const pipe = P.string("|").trim(P.optWhitespace)
const openParen = P.string("(").trim(P.optWhitespace)
const closeParen = P.string(")").trim(P.optWhitespace)
const openBrace = P.string("[").trim(P.optWhitespace)
const closeBrace = P.string("]").trim(P.optWhitespace)
const openCurly = P.string("{").trim(P.optWhitespace)
const closeCurly = P.string("}").trim(P.optWhitespace)
const assign = P.string("=").trim(P.optWhitespace)
const fatArrow = P.string("=>").trim(P.optWhitespace)

interface IfContext {
  cond: Expr
  truthy: Expr | BlockStmt
  falsy: Expr | BlockStmt
}

interface RecordFieldContext {
  name: SymbolExpr
  value: Expr
}

interface SymbolOrRecordContext {
  node: SymbolExpr | AccessOp
  recordFields: List<RecordField>[]
}

interface MatchExprContext {
  matcher: Expr
  clauses: MatchClause[]
}

interface MatchClauseContext {
  cond: Expr
  truthy: BlockStmt | Expr
}

interface FnExprContext {
  params: List<Parameter>
  returnTypeSpec: TypeNode[]
  body: BlockStmt | Expr
}

interface ParameterContext {
  name: SymbolExpr
  typeSpec: TypeNode
}

interface PrimitiveContext {
  expr: Expr
  args: List<Expr>[]
}

interface JoggerContext {
  module: ModuleClause
  imports: ImportClause[]
  stmts: StmtNode[]
}

interface ModuleClauseContext {
  name: SymbolExpr | AccessOp
}

interface ImportClauseContext {
  name: SymbolExpr | AccessOp
  asClause?: any
  exposingClause?: any
}

interface DeclStmtContext {
  name: SymbolExpr
  typeSpec: any[]
  value: Expr
}

interface FnDeclStmtContext {
  name: SymbolExpr
  genericParams: any[][]
  params: any[]
  returnTypeSpec: any[][]
  body: any
}

interface DataDeclStmtContext {
  name: SymbolExpr
  genericParams: List<GenericType>[]
  fields: List<Parameter>
}

interface TypeDeclStmtContext {
  name: SymbolExpr
  genericParams: List<GenericType>[]
  constructors: TypeCtor[]
}

interface TypeDeclCtorContext {
  name: SymbolExpr
  fields: List<any>[]
}

interface BasicTypeContext {
  name: SymbolExpr | AccessOp
  params: TypeNode[][]
}

interface FnTypeContext {
  argsType: List<TypeNode>
  returnType: TypeNode
}

interface LanguageSpec {
  __: any
  StmtEnd: any
  ParameterList: List<Parameter>
  Jogger: Program
  ModuleClause: ModuleClause
  ImportClause: ImportClause
  AsClause: SymbolExpr
  ExposingClause: List<SymbolExpr> | boolean
  RootStmt: StmtNode
  Stmt: StmtNode
  ExprStmt: Expr
  SymbolAccess: SymbolExpr | AccessOp
  DeclStmt: DeclStmt
  FnDeclStmt: FnDeclStmt
  BlockOrExpr: BlockStmt | Expr
  Primitive: Expr
  Block: BlockStmt
  Operator: SymbolExpr
  Symbol: SymbolExpr
  GenericParams: List<GenericType>
  Generic: GenericType
  DataDeclStmt: DataDeclStmt
  TypeDeclStmt: TypeDeclStmt
  TypeDeclCtor: TypeCtor
  OperatorStr: string
  Parameter: Parameter
  UnnamedTypes: List<TypeNode>
  EmptytableUnnamedTypes: List<TypeNode>
  ParameterType: TypeNode
  BasicType: AbstractType | ConcreteType
  FnType: FnType
  TypeSpec: TypeNode
  Operator1: SymbolExpr
  Operator2: SymbolExpr
  Operator3: SymbolExpr
  Operator4: SymbolExpr
  Operator5: SymbolExpr
  Operator6: SymbolExpr
  Operator7: SymbolExpr
  Operator8: SymbolExpr
  List: ListExpr
  IfExpr: IfExpr
  MatchExpr: MatchExpr
  MatchClause: MatchClause
  MatchClauseEnd: any
  ParenExpr: Expr
  FnExpr: FnExpr
  Float: FloatLiteral
  Int: IntLiteral
  String: StringLiteral
  Char: CharLiteral
  SymbolOrRecord: SymbolExpr | RecordExpr
  Arguments: List<Expr>
  RecordFields: List<RecordField>
  RecordField: RecordField
  OperatorExpr1: Expr
  OperatorExpr2: Expr
  OperatorExpr3: Expr
  OperatorExpr4: Expr
  OperatorExpr5: Expr
  OperatorExpr6: Expr
  OperatorExpr7: Expr
  Expr: Expr
}

export const language = P.createLanguage<LanguageSpec>({
  //UTILS
  __: () => P.newline.many(),
  GenericParams: r =>
    r.Generic.sepBy1(comma)
      .wrap(openBrace, closeBrace)
      .map(gen => List(gen)),
  StmtEnd: r => P.alt(P.seq(P.string(";"), r.__), P.newline.atLeast(1), P.eof),
  TypeSpec: r => colon.then(r.ParameterType),
  UnnamedTypes: r =>
    r.ParameterType.sepBy1(comma)
      .wrap(openParen, closeParen)
      .map(ts => List(ts)),
  EmptytableUnnamedTypes: r =>
    r.ParameterType.sepBy(comma)
      .wrap(openParen, closeParen)
      .map(ts => List(ts)),
  ParameterList: r =>
    r.Parameter.sepBy1(comma)
      .wrap(openParen, closeParen)
      .map(ps => List(ps)),
  Parameter: r =>
    P.seqObj<ParameterContext>(["name", r.Symbol], ["typeSpec", r.TypeSpec])
      .mark()
      .map(t.makeParameter),

  //MAIN
  Jogger: r =>
    P.seqObj<JoggerContext>(
      ["module", r.ModuleClause],
      ["imports", r.ImportClause.many()],
      ["stmts", r.RootStmt.many()]
    )
      .mark()
      .map(t.makeProgram),

  //CLAUSES
  ModuleClause: r =>
    P.seqObj<ModuleClauseContext>(
      P.string("module").trim(P.optWhitespace),
      ["name", r.SymbolAccess],
      r.StmtEnd
    )
      .mark()
      .map(t.makeModuleClause),
  ImportClause: r =>
    P.seqObj<ImportClauseContext>(
      P.string("import").trim(P.optWhitespace),
      ["name", r.SymbolAccess],
      ["asClause", r.AsClause.atMost(1)],
      ["exposingClause", r.ExposingClause.atMost(1)],
      r.StmtEnd
    )
      .mark()
      .map(t.makeImportClause),
  AsClause: r =>
    P.string("as")
      .trim(P.optWhitespace)
      .then(r.Symbol),
  ExposingClause: r =>
    P.string("exposing")
      .trim(P.optWhitespace)
      .then(
        P.alt(
          P.string("..").trim(P.optWhitespace),
          r.Symbol.sepBy1(comma)
        ).wrap(openParen, closeParen)
      )
      .mark()
      .map(t.makeExposingClause),
  RootStmt: r =>
    P.alt(
      r.TypeDeclStmt,
      r.DataDeclStmt,
      r.FnDeclStmt,
      r.DeclStmt,
      r.ExprStmt
    ).skip(r.StmtEnd),
  Stmt: r => P.alt(r.ExprStmt, r.DeclStmt, r.FnDeclStmt).skip(r.StmtEnd),
  ExprStmt: r => r.Expr,
  DeclStmt: r =>
    P.seqObj<DeclStmtContext>(
      P.string("let").trim(P.optWhitespace),
      ["name", P.alt(r.Symbol, r.Operator.wrap(openParen, closeParen))],
      ["typeSpec", r.TypeSpec.atMost(1)],
      assign,
      ["value", r.Expr]
    )
      .mark()
      .map(t.makeDeclStmt),
  FnDeclStmt: r =>
    P.seqObj<FnDeclStmtContext>(
      P.string("def").trim(P.optWhitespace),
      ["name", P.alt(r.Symbol, r.Operator.wrap(openParen, closeParen))],
      ["genericParams", r.GenericParams.atMost(1)],
      ["params", r.ParameterList],
      ["returnTypeSpec", r.TypeSpec.atMost(1)],
      assign,
      ["body", r.BlockOrExpr]
    )
      .mark()
      .map(t.makeFnDeclStmt),
  DataDeclStmt: r =>
    P.seqObj<DataDeclStmtContext>(
      P.string("data").trim(P.optWhitespace),
      ["name", r.Symbol],
      ["genericParams", r.GenericParams.atMost(1)],
      ["fields", r.ParameterList]
    )
      .mark()
      .map(t.makeDataDeclStmt),
  TypeDeclStmt: r =>
    P.seqObj<TypeDeclStmtContext>(
      P.string("type").trim(P.optWhitespace),
      ["name", r.Symbol],
      ["genericParams", r.GenericParams.atMost(1)],
      assign,
      ["constructors", r.TypeDeclCtor.sepBy1(pipe)]
    )
      .mark()
      .map(t.makeTypeDeclStmt),
  TypeDeclCtor: r =>
    P.seqObj<TypeDeclCtorContext>(
      ["name", r.Symbol],
      ["fields", r.UnnamedTypes.atMost(1)]
    )
      .mark()
      .map(t.makeTypeDeclCtor),
  ParameterType: r => {
    return P.alt(r.Generic, r.FnType, r.BasicType)
  },
  BasicType: r => {
    return P.seqObj<BasicTypeContext>(
      ["name", r.SymbolAccess],
      [
        "params",
        r.ParameterType.sepBy1(comma)
          .wrap(openBrace, closeBrace)
          .atMost(1)
      ]
    )
      .mark()
      .map(t.makeBasicType)
  },
  FnType: r =>
    P.seqObj<FnTypeContext>(["argsType", r.EmptytableUnnamedTypes], fatArrow, [
      "returnType",
      r.ParameterType
    ])
      .mark()
      .map(t.makeFnType),
  Symbol: () =>
    P.regexp(/[a-zA-Z$_][a-zA-Z0-9$_!?]*/)
      .desc("a symbol")
      .mark()
      .map(t.makeSymbol),
  Char: () =>
    P.alt(
      P.range("\u0020", "\u007F"),
      P.seq(P.string("\\"), P.oneOf("btnfr\"'\\")).tie()
    )
      .trim(P.string("'"))
      .mark()
      .map(t.makeChar),
  Int: () =>
    P.seq(
      P.string("-")
        .atMost(1)
        .tie(),
      P.digit.atLeast(1).tie()
    )
      .tie()
      .mark()
      .map(t.makeInt),
  Float: () =>
    P.seq(
      P.string("-")
        .atMost(1)
        .tie(),
      P.digit.atLeast(1).tie(),
      P.string("."),
      P.digit.atLeast(1).tie()
    )
      .tie()
      .mark()
      .map(t.makeFloat),
  String: () =>
    P.regexp(/"((?:\\.|.)*?)"/, 1)
      .desc("a string")
      .mark()
      .map(t.makeString),
  OperatorStr: () =>
    P.oneOf("*/%+-:=!<>&^|?")
      .many()
      .tie()
      .desc("an operator"),
  Operator: r => r.OperatorStr.mark().map(t.makeSymbol),
  Operator1: r => makeOperator(r, "*/%"),
  Operator2: r => makeOperator(r, "+-"),
  Operator3: r => makeOperator(r, ":"),
  Operator4: r => makeOperator(r, "=!"),
  Operator5: r => makeOperator(r, "<>"),
  Operator6: r => makeOperator(r, "&"),
  Operator7: r => makeOperator(r, "^"),
  Operator8: r => makeOperator(r, "|"),
  Block: r =>
    r.Stmt.atLeast(1)
      .wrap(openCurly, closeCurly)
      .mark()
      .map(t.makeBlock),
  BlockOrExpr: r => P.alt(r.Block, r.Expr),
  List: r =>
    r.Expr.sepBy(comma)
      .wrap(openBrace, closeBrace)
      .mark()
      .map(t.makeList),
  IfExpr: r =>
    P.seqObj<IfContext>(
      P.string("if"),
      openParen,
      ["cond", r.Expr],
      closeParen,
      ["truthy", r.BlockOrExpr],
      P.string("else"),
      ["falsy", r.BlockOrExpr]
    )
      .mark()
      .map(t.makeIfExpr),
  MatchExpr: r =>
    P.seqObj<MatchExprContext>(
      P.string("match"),
      ["matcher", r.Expr.wrap(openParen, closeParen)],
      ["clauses", r.MatchClause.atLeast(1).wrap(openCurly, closeCurly)]
    )
      .mark()
      .map(t.makeMatchExpr),
  MatchClause: r =>
    P.seqObj<MatchClauseContext>(
      P.string("case"),
      ["cond", r.Expr.wrap(openParen, closeParen)],
      fatArrow,
      ["truthy", r.BlockOrExpr],
      r.MatchClauseEnd
    )
      .mark()
      .map(t.makeMatchClause),
  MatchClauseEnd: r => P.alt(P.seq(P.string(";"), r.__), P.newline.atLeast(1)),
  FnExpr: r =>
    P.seqObj<FnExprContext>(
      P.string("fn").trim(P.optWhitespace),
      ["params", r.ParameterList],
      ["returnTypeSpec", r.TypeSpec.atMost(1)],
      fatArrow,
      ["body", r.BlockOrExpr]
    )
      .mark()
      .map(t.makeFnExpr),
  ParenExpr: r => r.Expr.wrap(openParen, closeParen),
  Primitive: r =>
    P.seqObj<PrimitiveContext>(
      [
        "expr",
        P.alt(
          r.List,
          r.IfExpr,
          r.MatchExpr,
          r.FnExpr,
          r.ParenExpr,
          r.Float,
          r.Int,
          r.Char,
          r.String,
          r.SymbolOrRecord
        )
      ],
      ["args", r.Arguments.many()]
    )
      .mark()
      .map(t.makePrimitive),
  Arguments: r =>
    r.Expr.sepBy(comma)
      .wrap(openParen, closeParen)
      .map(args => List(args)),
  SymbolAccess: r =>
    r.Symbol.sepBy1(r.__.then(P.string(".")))
      .mark()
      .map(t.makeSymbolAccess),
  SymbolOrRecord: r =>
    P.seqObj<SymbolOrRecordContext>(
      ["node", r.SymbolAccess],
      ["recordFields", r.RecordFields.atMost(1)]
    )
      .mark()
      .map(t.makeSymbolOrRecord),
  RecordFields: r =>
    r.RecordField.sepBy1(comma)
      .wrap(openCurly, closeCurly)
      .map(rfs => List(rfs)),
  RecordField: r =>
    P.seqObj<RecordFieldContext>(["name", r.Symbol], colon, ["value", r.Expr])
      .mark()
      .map(t.makeRecordField),
  Generic: () =>
    P.seq(
      P.string("'"),
      P.range("a", "z")
        .atLeast(1)
        .tie()
    )
      .tie()
      .mark()
      .map(t.makeGeneric),
  OperatorExpr1: r =>
    P.seq(r.Primitive, P.seq<SymbolExpr, Expr>(r.Operator1, r.Primitive).many())
      .mark()
      .map(t.makeOperatorExpr),
  OperatorExpr2: r => makeOperatorExpr(r, 2),
  OperatorExpr3: r => makeOperatorExpr(r, 3),
  OperatorExpr4: r => makeOperatorExpr(r, 4),
  OperatorExpr5: r => makeOperatorExpr(r, 5),
  OperatorExpr6: r => makeOperatorExpr(r, 6),
  OperatorExpr7: r => makeOperatorExpr(r, 7),
  Expr: r => makeOperatorExpr(r, 8)
})
