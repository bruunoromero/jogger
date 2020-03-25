import {
  ExprContext,
  ParameterContext,
  ParameterTypeContext,
  GenericParamsContext,
  ExposingClauseContext,
  ParameterListContext,
  ParametersContext,
  StmtContext,
  IfExprContext,
  BlockOrExprContext,
  MatchExprContext,
  MatchClauseContext,
  FnExpressionContext,
  FnDeclStmtContext,
  DataDeclStmtContext,
  TypeDeclStmtContext,
  TypeDeclCtorsContext,
  TypeDeclCtorContext,
  UnnamedTypesContext,
  BlockContext,
  PrimitiveContext,
  RecordFieldsContext,
  RecordFieldContext,
  ListContext,
  SymbolOrRecordContext,
  BasicTypeContext,
  EmptytableUnnamedTypesContext,
  FnTypeContext,
  ParameterSpecContext,
  DeclStmtContext,
  SymbolAccessContext,
  ImportClauseContext,
  JoggerContext,
  AccessExprContext,
  ModuleClauseContext,
  RootStmtContext
} from "./parser/JoggerParser"
import { TerminalNode } from "antlr4/tree/Tree"

export interface IParametersContext extends ParametersContext {
  expr(): ExprContext[]
}

export interface IParameterListContext extends ParameterListContext {
  parameter(): IParameterContext[]
}

export interface IParameterTypeParamsContext extends ParameterTypeContext {
  parameterType(): IParameterTypeContext[]
}

export interface IGenericParamsContext extends GenericParamsContext {
  GENERIC(): TerminalNode[]
}

export interface IExposingClauseContext extends ExposingClauseContext {
  SYMBOL(): TerminalNode[]
}

export interface IIfExprContext extends IfExprContext {
  blockOrExpr(i: number): BlockOrExprContext
}

export interface IMatchExprContext extends MatchExprContext {
  matchClause(): MatchClauseContext[]
}

export interface IFnDeclStmtContext extends FnDeclStmtContext {
  genericParams(): IGenericParamsContext
  parameterList(): IParameterListContext
  parameterSpec(): IParameterSpecContext
}

export interface IDataDeclStmtContext extends DataDeclStmtContext {
  genericParams(): IGenericParamsContext
  parameterList(): IParameterListContext
}

export interface ITypeDeclStmtContext extends TypeDeclStmtContext {
  genericParams(): IGenericParamsContext
  typeDeclCtors(): ITypeDeclCtorsContext
}

export interface ITypeDeclCtorsContext extends TypeDeclCtorsContext {
  typeDeclCtor(): ITypeDeclCtorContext[]
}

export interface ITypeDeclCtorContext extends TypeDeclCtorContext {
  unnamedTypes(): IUnnamedTypesContext
}

export interface IUnnamedTypesContext extends UnnamedTypesContext {
  parameterType(): IParameterTypeContext[]
}

export interface IBlockContext extends BlockContext {
  stmt(): IStmtContext[]
}

export interface IPrimitiveContext extends PrimitiveContext {
  ifExpr(): IIfExprContext
  parameters(): IParametersContext[]
  list(): IListContext
  fnExpression(): IFnExpressionContext
  symbolOrRecord(): ISymbolOrRecordContext
}

export interface IRecordFieldsContext extends RecordFieldsContext {
  recordField(): RecordFieldContext[]
}

export interface IListContext extends ListContext {
  expr(): ExprContext[]
}

export interface IFnExpressionContext extends FnExpressionContext {
  parameterList(): IParameterListContext
  parameterSpec(): IParameterSpecContext
}

export interface IAccessExprContext extends AccessExprContext {
  primitive(): IPrimitiveContext[]
}

export interface IStmtContext extends StmtContext {
  declStmt(): IDeclStmtContext
  fnDeclStmt(): IFnDeclStmtContext
}

export interface IRootStmtContext extends RootStmtContext {
  declStmt(): IDeclStmtContext
  fnDeclStmt(): IFnDeclStmtContext
  dataDeclStmt(): IDataDeclStmtContext
  typeDeclStmt(): ITypeDeclStmtContext
}

export interface ISymbolOrRecordContext extends SymbolOrRecordContext {
  recordFields(): IRecordFieldsContext
}

export interface IBasicTypeContext extends BasicTypeContext {
  parameterTypeParams(): IParameterTypeParamsContext
  symbolAccess(): ISymbolAccessContext
}

export interface IParameterTypeContext extends ParameterTypeContext {
  basicType(): IBasicTypeContext
  fnType(): IFnTypeContext
}

export interface IEmptytableUnnamedTypesContext
  extends EmptytableUnnamedTypesContext {
  parameterType(): IParameterTypeContext[]
}

export interface IFnTypeContext extends FnTypeContext {
  emptytableUnnamedTypes(): IEmptytableUnnamedTypesContext
  parameterType(): IParameterTypeContext
}

export interface IParameterContext extends ParameterContext {
  parameterSpec(): IParameterSpecContext
}

export interface IParameterSpecContext extends ParameterSpecContext {
  parameterType(): IParameterTypeContext
}

export interface IDeclStmtContext extends DeclStmtContext {
  parameterSpec(): IParameterSpecContext
}

export interface ISymbolAccessContext extends SymbolAccessContext {
  SYMBOL(): TerminalNode[]
}

export interface IModuleClauseContext extends ModuleClauseContext {
  symbolAccess(): ISymbolAccessContext
}

export interface IImportClauseContext extends ImportClauseContext {
  symbolAccess(): ISymbolAccessContext
  exposingClause(): IExposingClauseContext
}

export interface IJoggerContext extends JoggerContext {
  rootStmt(): IRootStmtContext[]
  importClause(): IImportClauseContext[]
  moduleClause(): IModuleClauseContext
}
