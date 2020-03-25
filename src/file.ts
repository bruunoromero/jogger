import { Program } from "./node/base_nodes"
import { Record } from "immutable"

export interface IFile {
  source: string
  filename: string
  program: Program
}

export class File
  extends Record<IFile>({
    source: "",
    filename: "",
    program: null
  })
  implements IFile {
  constructor(props: IFile) {
    super(props)
  }
}
