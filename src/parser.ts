import { List } from "immutable"

import * as IO from "./io"
import { File } from "./file"
import { ProjectConfig } from "./project_config"
import { ImportClause } from "./node/clause_nodes"
import { SymbolExpr } from "./node/expression_nodes"
import { AccessOp } from "./node/binary_operator"
import { Program } from "./node/base_nodes"
import { language } from "./parser/language"

const withCore = (program: Program) => {
  if (program.module.name.str() === "Jogger.Core") {
    return program
  }

  return program.update("imports", imp =>
    imp.push(
      new ImportClause({
        loc: null,
        exposing: List(),
        isImportAll: true,
        name: new AccessOp({
          loc: null,
          left: new SymbolExpr({ loc: null, value: "Jogger" }),
          right: new SymbolExpr({ loc: null, value: "Core" })
        })
      })
    )
  )
}

export const parse = (filename: string, source: string): File => {
  const program = withCore(language.Jogger.tryParse(source))

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
