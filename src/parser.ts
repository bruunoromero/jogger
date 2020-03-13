import { InputStream, CommonTokenStream } from "antlr4"
import { JoggerParser } from "./parser/JoggerParser"
import { JoggerLexer } from "./parser/JoggerLexer"

export const parse = (source: string) => {
  const inputStream = new InputStream(source)
  const lexer = new JoggerLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)

  return new JoggerParser(tokenStream).jogger()
}
