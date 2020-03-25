import { Record } from "immutable"

export interface IProjectConfig {
  src: string
  ext?: string
  entry?: string
  interfacesExt?: string
}

type ProjectOmittedKeys = "ext" | "entry" | "interfacesExt"

export class ProjectConfig
  extends Record<IProjectConfig>({
    src: "",
    ext: ".jo",
    entry: "Main",
    interfacesExt: ".joi"
  })
  implements IProjectConfig {
  constructor(props: Omit<IProjectConfig, ProjectOmittedKeys>) {
    super(props)
  }
}
