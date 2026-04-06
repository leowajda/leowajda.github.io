import { eurekaProjectAdapter } from "./build.js"
import type { ProjectDefinition } from "../project.js"

export const eurekaProjectDefinition: ProjectDefinition = {
  adapter: eurekaProjectAdapter
}
