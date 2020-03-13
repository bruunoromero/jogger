grammar Jogger;

// UTILS

symbolAccess : SYMBOL ('.' s SYMBOL)* ;

unnamedTypes : '(' s parameterType (',' s parameterType)* s ')';
emptytableUnnamedTypes : '(' s (parameterType (',' s parameterType)* s)? ')';
parameterList : '(' s (parameter (',' s parameter)* s)? ')';
parameterSpec : ':' s parameterType;
parameter : SYMBOL s parameterSpec;

// RULES

jogger : packageClause importClause* stmt*;

packageClause : 'package' s symbolAccess stmtEnd;

importClause : 'import' s symbolAccess s asClause? exposingClause? stmtEnd;
asClause : 'as' s SYMBOL;
exposingClause : 'exposing' s '(' s (ALL_SYM | SYMBOL (',' s SYMBOL)*) s ')';

stmt :
    ( moduleStmt
    | exprStmt
    | declStmt
    | fnDeclStmt
    | dataDeclStmt
    | typeDeclStmt)
    stmtEnd;

moduleStmt : 'module' s SYMBOL s '{' stmt* '}';

exprStmt : expr;

declStmt : 'let' s SYMBOL parameterSpec? s '=' s expr;

fnDeclStmt : 'def' s SYMBOL genericParams? parameterList parameterSpec? s '=' s blockOrExpr;

dataDeclStmt : 'data' s SYMBOL s genericParams? parameterList;

typeDeclStmt : 'type' s SYMBOL s genericParams? s '=' s typeDeclCtors;
typeDeclCtors : typeDeclCtor ('|' s typeDeclCtor)*;
typeDeclCtor : SYMBOL s unnamedTypes?;

parameterType : GENERIC | fnType | basicType;
basicType: symbolAccess parameterTypeParams?;
fnType : emptytableUnnamedTypes '=>' parameterType;
parameterTypeParams : '[' parameterType (',' parameterType)* ']';

genericParams : '[' GENERIC (',' GENERIC)* ']';

expr : op7 (OP8 op7)*;

op7 : op6 (OP7 s op6)*;
op6 : op5 (OP6 s op5)*;
op5 : op4 (OP5 s op4)*;
op4 : op3 (OP4 s op3)*;
op3 : op2 (OP3 s op2)*;
op2 : op1 (OP2 s op1)*;
op1 : access (OP1 s access)*;
access : primitive ('.' s primitive)*;

block : '{' stmt+ '}';

blockOrExpr : block | expr;

ifExpr : 'if' s '(' expr ')' blockOrExpr 'else' blockOrExpr;

matchExpr : 'match' '('  expr ')' '{' matchClause+ '}';
matchClause : 'case' expr '=>' blockOrExpr ';'?;

fnExpression : 'fn' parameterList parameterSpec? '=>' blockOrExpr;

list : '[' (expr (',' expr)*)? ']';

recordFields : '{' (recordField (',' recordField)*)? '}';
recordField : SYMBOL ':' expr;

symbolOrRecord : SYMBOL recordFields?;

primitive :
    ( list
    | ifExpr
    | matchExpr
    | fnExpression
    | '(' expr ')'
    | FLOAT
    | INT
    | CHAR
    | STRING
    | symbolOrRecord)
    parameters*
    ;

parameters : ('(' (expr (',' expr)*)? ')');

stmtEnd : ';' NL* | NL+ | EOF;

s : NL*;

// TOKENS


GENERIC : '\'' [a-z]+;

INT : '-'? DIGIT+;
FLOAT : '-'? DIGIT+ '.' DIGIT+;
// SYMBOL : [a-zA-Z][a-zA-Z0-9_?!$]*;
SYMBOL: OPERATOR;
STRING : '"' ( ~'"' | '\\' '"' )* '"';
CHAR : '\'' (PRINTABLE_CHAR | CHAR_ESCAPE_SEQ) '\'';

OP1 : ('*' | '/' | '%' )  OPERATOR?;
OP2 : ('+' | '-') OPERATOR?;
OP3 : ':' OPERATOR?;
OP4 : ('=' | '!') OPERATOR?;
OP5 : ('<' | '>') OPERATOR?;
OP6 : '&' OPERATOR?;
OP7 : '^' OPERATOR?;
OP8 : '|' OPERATOR?;

ALL_SYM : '..';

WS: [ \t]+ -> skip;
NL : ('\r' '\n' | '\n' | '\r');

// FRAGMENTS

fragment
DIGIT : [0-9];

fragment
SYMBOL_HEAD
    : ~('0' .. '9'
        | '`' | '\'' | '"' | '#' | ':' | '(' | ')' | '[' | ']' | '{' | '}' | '.'
        | [ \n\r\t,]
        )
    ;

fragment
SYMBOL_REST
    : SYMBOL_HEAD
    | '0'..'9'
    ;

fragment
PRINTABLE_CHAR
   : '\u0020' .. '\u007F'
   ;

fragment
CHAR_ESCAPE_SEQ
   : '\\' ('b' | 't' | 'n' | 'f' | 'r' | '"' | '\'' | '\\')
   ;

fragment
OPERATOR : SYMBOL_HEAD SYMBOL_REST* (':' SYMBOL_REST+)*;