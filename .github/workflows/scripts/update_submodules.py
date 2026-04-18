from __future__ import annotations

from pathlib import Path

from workflow_support import require_env, run_git, write_output


def commit_url(path: str, commit_sha: str, server_url: str) -> str:
    remote_url = run_git("-C", path, "config", "--get", "remote.origin.url")

    if remote_url.startswith("git@github.com:"):
        remote_url = f"{server_url}/{remote_url.removeprefix('git@github.com:')}"
    elif remote_url.startswith("ssh://git@github.com/"):
        remote_url = f"{server_url}/{remote_url.removeprefix('ssh://git@github.com/')}"

    if remote_url.endswith(".git"):
        remote_url = remote_url[:-4]

    return f"{remote_url}/commit/{commit_sha}"


def main() -> None:
    github_output = Path(require_env("GITHUB_OUTPUT"))
    server_url = require_env("server_url")

    details = [
        commit_url(path, commit_sha.lstrip("+"), server_url)
        for line in run_git("submodule", "status", "--", "sources").splitlines()
        if line.startswith("+")
        for commit_sha, path, *_rest in [line.split()]
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
