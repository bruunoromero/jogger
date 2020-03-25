import * as tsort from "tsort"
import { Record, List } from "immutable"

import { File } from "./file"

interface TSortGraph {
  sort(): string[]
  add(from: string, to: string): void
}

export interface IDependency<T> {
  value: T
  name: string
}

export class Dependency<T> extends Record({ name: "", value: null })
  implements IDependency<T> {
  constructor(props: IDependency<T>) {
    super(props)
  }
}

export interface IGraph<T> {
  _internal: TSortGraph
  deps: List<Dependency<T>>
}

export class Graph<T>
  extends Record({
    deps: List(),
    _internal: tsort() as TSortGraph
  })
  implements IGraph<T> {
  getDependency(name: string): Dependency<T> {
    return this.deps.filter(dep => dep.name === name).first<Dependency<T>>()
  }

  containsDependency(dep: Dependency<T>) {
    return this.deps.includes(dep)
  }

  addDependency(from: Dependency<T>, to?: Dependency<T>) {
    let newDeps = this.deps

    if (to) {
      this._internal.add(from.name, to.name)
    }

    if (!this.containsDependency(from)) {
      newDeps = newDeps.push(from)
    }

    if (to && !this.containsDependency(to)) {
      newDeps = newDeps.push(to)
    }

    return this.set("deps", newDeps)
  }

  replaceDependency(name: string, value: T) {
    return this.update("deps", deps => {
      const index = deps.findIndex(dep => dep.name === name)

      return deps.update(index, (dep: Dependency<T>) => dep.set("value", value))
    })
  }

  sort() {
    const sorted = List(this._internal.sort())

    const lonelyDeps = this.deps
      .filter(dep => !sorted.find(s => s === dep.name))
      .map(dep => dep.name)

    return List<string>(sorted.concat(lonelyDeps).reverse())
  }
}

export const addFileDeps = (
  graph: Graph<File>,
  file: Dependency<File>,
  deps: List<Dependency<File>>
): Graph<File> =>
  deps.reduce((graph, dep) => graph.addDependency(file, dep), graph)

export const makeGraph = (files: List<File>) => {
  const graph = new Graph<File>()

  if (files.size <= 1) {
    const entry = files.first<File>()

    return graph.addDependency(
      new Dependency({
        value: entry,
        name: entry.program.module.name.str()
      })
    )
  }

  const deps = files.map(
    file =>
      new Dependency({
        value: file,
        name: file.program.module.name.str()
      })
  )

  return files.reduce((accGraph, file) => {
    const fileDep = deps.find(
      dep => dep.name === file.program.module.name.str()
    )

    const importedDeps = file.program.imports
      .map(imp => imp.name.str())
      .map(name => deps.find(dep => dep.name === name))

    return addFileDeps(accGraph, fileDep, importedDeps)
  }, graph)
}
