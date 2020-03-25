import * as fs from "fs"
import * as path from "path"
import { List } from "immutable"
import { ProjectConfig } from "./project_config"

export const loadFile = async (
  config: ProjectConfig,
  paths: List<string>
): Promise<string> => {
  const filePath = paths.unshift(config.src).join(path.sep) + config.ext

  return await fs.promises.readFile(filePath, "utf-8")
}
