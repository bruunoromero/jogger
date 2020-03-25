grammar Jogger;

// UTILS

symbolAccess: SYMBOL ('.' s SYMBOL)*;

unnamedTypes: '(' s parameterType (',' s parameterType)* s ')';
emptytableUnnamedTypes:
	'(' s (parameterType (',' s parameterType)* s)? ')';
parameterList: '(' s (parameter (',' s parameter)* s)? ')';
parameterSpec: ':' s parameterType;
parameter: SYMBOL s parameterSpec;

// RULES

jogger: moduleClause importClause* rootStmt*;

moduleClause: 'module' s symbolAccess stmtEnd;

importClause:
	'import' s symbolAccess s asClause? exposingClause? stmtEnd;
asClause: 'as' s SYMBOL;
exposingClause:
	'exposing' s '(' s (ALL_SYM | SYMBOL (',' s SYMBOL)*) s ')';

rootStmt: (
		exprStmt
		| declStmt
		| fnDeclStmt
		| dataDeclStmt
		| typeDeclStmt
	) stmtEnd;

stmt: ( exprStmt | declStmt | fnDeclStmt) stmtEnd;

exprStmt: expr;

declStmt: 'let' s SYMBOL parameterSpec? s '=' s expr;

fnDeclStmt:
	'def' s SYMBOL genericParams? parameterList parameterSpec? s '=' s blockOrExpr;

dataDeclStmt: 'data' s SYMBOL s genericParams? parameterList;

typeDeclStmt:
	'type' s SYMBOL s genericParams? s '=' s typeDeclCtors;
typeDeclCtors: typeDeclCtor ('|' s typeDeclCtor)*;
typeDeclCtor: SYMBOL s unnamedTypes?;

parameterType: GENERIC | fnType | basicType;
basicType: symbolAccess parameterTypeParams?;
fnType: emptytableUnnamedTypes '=>' parameterType;
parameterTypeParams: '[' parameterType (',' parameterType)* ']';

genericParams: '[' GENERIC (',' GENERIC)* ']';

expr: operatorExpr7 (operator8 operatorExpr7)*;

operatorExpr7: operatorExpr6 (operator7 s operatorExpr6)*;
operatorExpr6: operatorExpr5 (operator6 s operatorExpr5)*;
operatorExpr5: operatorExpr4 (operator5 s operatorExpr4)*;
operatorExpr4: operatorExpr3 (operator4 s operatorExpr3)*;
operatorExpr3: operatorExpr2 (operator3 s operatorExpr2)*;
operatorExpr2: operatorExpr1 (operator2 s operatorExpr1)*;
operatorExpr1: accessExpr (operator1 s accessExpr)*;
accessExpr: primitive ('.' s primitive)*;

block: '{' stmt+ '}';

blockOrExpr: block | expr;

ifExpr: 'if' s '(' expr ')' blockOrExpr 'else' blockOrExpr;

matchExpr: 'match' '(' expr ')' '{' matchClause+ '}';
matchClause: 'case' expr '=>' blockOrExpr matchClauseEnd;
matchClauseEnd : ';' NL* | NL+;

fnExpression:
	'fn' parameterList parameterSpec? '=>' blockOrExpr;

list: '[' (expr (',' expr)*)? ']';

recordFields: '{' (recordField (',' recordField)*)? '}';
recordField: SYMBOL ':' expr;

symbolOrRecord: SYMBOL recordFields?;

primitive:
	(
		list
		| ifExpr
		| matchExpr
		| fnExpression
		| '(' expr ')'
		| FLOAT
		| INT
		| CHAR
		| STRING
		| symbolOrRecord
	) parameters*;

parameters: ('(' (expr (',' expr)*)? ')');

stmtEnd: ';' NL* | NL+ | EOF;

s: NL*;

// TOKENS

GENERIC: '\'' [a-z]+;

INT: '-'? DIGIT+;
FLOAT: '-'? DIGIT+ '.' DIGIT+;
// SYMBOL : [a-zA-Z][a-zA-Z0-9_?!$]*;
SYMBOL: OPERATOR;
STRING: '"' ( ~'"' | '\\' '"')* '"';
CHAR: '\'' (PRINTABLE_CHAR | CHAR_ESCAPE_SEQ) '\'';

operator1: ('*' | '/' | '%') SYMBOL?;
operator2: ('+' | '-') SYMBOL?;
operator3: ':' SYMBOL?;
operator4: ('=' | '!') SYMBOL?;
operator5: ('<' | '>') SYMBOL?;
operator6: '&' SYMBOL?;
operator7: '^' SYMBOL?;
operator8: '|' SYMBOL?;

ALL_SYM: '..';

WS: [ \t]+ -> skip;
NL: ('\r' '\n' | '\n' | '\r');

// FRAGMENTS

fragment DIGIT: [0-9];

fragment SYMBOL_HEAD:
	~(
		'0' .. '9'
		| '`'
		| '\''
		| '"'
		| '#'
		| ':'
		| '('
		| ')'
		| '['
		| ']'
		| '{'
		| '}'
		| '.'
		| [ \n\r\t,]
	);

fragment SYMBOL_REST: SYMBOL_HEAD | '0' ..'9';

fragment PRINTABLE_CHAR: '\u0020' .. '\u007F';

fragment CHAR_ESCAPE_SEQ:
	'\\' ('b' | 't' | 'n' | 'f' | 'r' | '"' | '\'' | '\\');

fragment OPERATOR: SYMBOL_HEAD SYMBOL_REST* (':' SYMBOL_REST+)*;