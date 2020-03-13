import * as Parser from "./parser"
import { Dependency, Graph } from "./dependency"

const tree = Parser.parse("package Main")

const depA = new Dependency({ name: "a", value: 1 })
const depB = new Dependency({ name: "b", value: 2 })
const depC = new Dependency({ name: "c", value: 3 })

const graph = new Graph()
  .addDependency(depA, depB)
  .addDependency(depB, depC)
  .sort()
  .toJS()

console.log(graph)
