from __future__ import annotations

from pathlib import Path

from workflow_support import require_env, run_git, write_output


def main() -> None:
    github_output = Path(require_env("GITHUB_OUTPUT"))
    repository = require_env("repository")
    server_url = require_env("server_url")

    details = [
        f"{server_url}/{repository}/commit/{commit_sha.lstrip('+')}"
        for line in run_git("submodule", "status", "--", "sources").splitlines()
        if line.startswith("+")
        for commit_sha, _path in [line.split(maxsplit=1)]
    ]

    if not details:
        raise SystemExit(0)

    noun = "submodule" if len(details) == 1 else "submodules"
    write_output(
        github_output,
        "commit_msg",
        f"chore(submodules): update source {noun}\n" + "\n".join(details),
    )


if __name__ == "__main__":
    main()
