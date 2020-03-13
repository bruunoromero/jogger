import * as tsort from "tsort"
import { Record, List } from "immutable"

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
  extends Record({ deps: List(), _internal: tsort() as TSortGraph })
  implements IGraph<T> {
  private getDependency(name: string): Dependency<T> {
    return this.deps.filter(dep => dep.name === name).first()
  }

  private containsDependency(dep: Dependency<T>) {
    return this.deps.includes(dep)
  }

  addDependency(from: Dependency<T>, to: Dependency<T>) {
    let newDeps = this.deps

    this._internal.add(from.name, to.name)

    if (!this.containsDependency(from)) {
      newDeps = newDeps.push(from)
    }

    if (!this.containsDependency(to)) {
      newDeps = newDeps.push(to)
    }

    return this.set("deps", newDeps)
  }

  sort() {
    return List<T>(
      this._internal
        .sort()
        .reverse()
        .map(dep => this.getDependency(dep))
        .filter(x => x)
        .map(dep => dep.value)
    )
  }
}
