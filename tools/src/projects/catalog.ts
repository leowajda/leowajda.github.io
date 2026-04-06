import { eurekaProjectDefinition } from "./eureka/index.js"
import type { ProjectDefinition } from "./project.js"

export const projectDefinitions = [eurekaProjectDefinition] satisfies ReadonlyArray<ProjectDefinition>
