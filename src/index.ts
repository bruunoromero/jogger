import * as Parser from "./parser"

import * as Ref from "./expander/ref"
import * as Dependency from "./dependency"
import * as OpToFn from "./expander/op_to_fn"
import * as Currier from "./expander/currier"
import { ProjectConfig } from "./project_config"
import { NodeType } from "./node/base_nodes"

const main = async () => {
  try {
    const config = new ProjectConfig({ src: "./example" })
    const files = await Parser.parseAll(config)
    const graph = Dependency.makeGraph(files)
    const expandedGraph = OpToFn.expandAll(graph)
    const curriedGraph = Currier.expandAll(expandedGraph)
    const refGraph = Ref.expandAll(curriedGraph)

    console.log(
      refGraph.toJS().deps[0].value.program.stmts[0].expr.callee.callee
    )
  } catch (e) {
    console.error(e)
  }
}

main()
