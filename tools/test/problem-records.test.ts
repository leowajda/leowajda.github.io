import assert from "node:assert/strict"
import test from "node:test"
import { buildProblemRecords, implementationKey } from "../src/projects/eureka/problem-records.js"
import type { ProjectManifest } from "../src/projects/schema.js"
import type { ProblemSourceRecord } from "../src/projects/eureka/source.js"

const manifest: ProjectManifest = {
  kind: "eureka",
  slug: "eureka",
  title: "Eureka",
  description: "Algorithms",
  route_base: "/eureka",
  source_repo_path: "sources/eureka"
}

const problem: ProblemSourceRecord = {
  name: "Two Sum",
  url: "https://leetcode.com/problems/two-sum",
  difficulty: "Easy",
  categories: ["Array", "Hash Table"],
  implementations: {
    java: {
      iterative: "https://github.com/example/eureka-java/blob/main/src/array/TwoSum.java"
    },
    python: {
      hash_map: "https://github.com/example/eureka-python/blob/main/src/array/two_sum.py"
    }
  }
}

test("buildProblemRecords derives language summaries, implementation urls, and search title", () => {
  const records = buildProblemRecords(
    manifest,
    [
      ["java", { label: "Java", code_language: "java" }],
      ["python", { label: "Python", code_language: "python" }]
    ],
    "two-sum",
    problem,
    {
      [implementationKey("java", "iterative", problem.implementations.java!.iterative!)]: "class Solution {}",
      [implementationKey("python", "hash_map", problem.implementations.python!.hash_map!)]: "def two_sum(): pass"
    },
    {}
  )

  assert.equal(records.page.difficulty_slug, "easy")
  assert.deepEqual(records.page.languages, [
    { slug: "java", label: "Java", count: 1 },
    { slug: "python", label: "Python", count: 1 }
  ])
  assert.equal(records.page.implementations[0]?.detail_url, "/eureka/problems/two-sum/#java-iterative")
  assert.equal(records.page.implementations[0]?.embed_url, "/eureka/problems/two-sum/embed/java-iterative/")
  assert.equal(records.page.implementations[1]?.approach_label, "Hash Map")
  assert.equal(records.page.search_title, "two sum")
})
