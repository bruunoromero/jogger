import { List } from "immutable"
import { InputStream, CommonTokenStream } from "antlr4"

import * as IO from "./io"
import { Visitor } from "./visitor"
import { File } from "./file"
import { IJoggerContext } from "./context_types"
import { JoggerParser } from "./parser/JoggerParser"
import { JoggerLexer } from "./parser/JoggerLexer"
import { ProjectConfig } from "./project_config"
import { ImportClause } from "./node/clause_nodes"

export const parse = (filename: string, source: string): File => {
  const inputStream = new InputStream(source)
  const lexer = new JoggerLexer(inputStream)
  const tokenStream = new CommonTokenStream(lexer)
  const parser = new JoggerParser(tokenStream)
  const visitor = new Visitor()

  const program = visitor.visitJogger(parser.jogger() as IJoggerContext)

  return new File({ filename, source, program })
}

const importFiles = async (
  config: ProjectConfig,
  imports: List<List<string>>
): Promise<List<File>> => {
  const imps = await Promise.all(
    imports.map(imp =>
      IO.loadFile(config, imp).then(f => parse(imp.join("."), f))
    )
  )
  return List<File>(imps)
}

const importToParts = (imp: ImportClause): List<string> => {
  return List(imp.name.str().split("."))
}

export const loadFiles = async (
  config: ProjectConfig,
  imports: List<List<string>>
): Promise<List<File>> => {
  const importedFiles = await importFiles(config, imports)

  const derivatedImports = await Promise.all(
    importedFiles
      .map(imported => imported.program.imports.map(importToParts))
      .filter(imps => !imps.isEmpty())
      .map(imps => loadFiles(config, imps))
      .flatten()
      .toList()
  )

  return importedFiles.concat(List(derivatedImports))
}

export const parseAll = async (config: ProjectConfig): Promise<List<File>> => {
  const entryTree = (
    await importFiles(config, List().push(List.of(config.entry)))
  ).first<File>()

  const imports = entryTree.program.imports.map(importToParts)
  const allFiles = await loadFiles(config, imports)

  return allFiles
    .flatten()
    .toList()
    .unshift(entryTree)
}
