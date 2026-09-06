#!/usr/bin/env python3
"""Offline Sidequest code evidence. Does not measure rendering or game quality."""
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys


def run(args, root):
    try:
        p = subprocess.run(args, cwd=root, capture_output=True, text=True, timeout=180)
        return p.returncode, p.stdout + p.stderr
    except subprocess.TimeoutExpired as exc:
        return 124, f"Timed out after {exc.timeout}s: {args[0]}\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, help="New evidence directory; relative to repo root")
    parser.add_argument("--browser-status", choices=["unverified", "blocked"], default="unverified")
    parser.add_argument("--browser-note", default="This offline tool performs no browser checks.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    for name in ("node", "git"):
        if not shutil.which(name):
            parser.error(f"Required executable unavailable: {name}")
    for name in ("dist/registry.js", ".openai/hosting.json", "tests"):
        if not (root / name).exists():
            parser.error(f"Not a Sidequest checkout: missing {name}")
    out = Path(args.output).expanduser()
    if not out.is_absolute():
        out = root / out
    out = out.resolve()
    # Keep evidence out of shipped/synced content even if invoked incorrectly.
    allowed = (root / "refinement/evidence").resolve()
    if allowed not in out.parents:
        parser.error("Output must be a new child directory under refinement/evidence/")
    try:
        out.mkdir(parents=True, exist_ok=False)
    except FileExistsError:
        parser.error("Output already exists; choose a new directory to preserve earlier evidence")

    summary = {
        "created_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "Offline source, syntax, inventory and automated tests only",
        "browser": {"status": args.browser_status, "note": args.browser_note},
        "visual": {"status": "unverified"},
        "device": {"status": "unverified"},
        "player": {"status": "unverified"},
    }
    git_code, head = run(["git", "rev-parse", "HEAD"], root)
    _, status = run(["git", "status", "--short"], root)
    _, node_version = run(["node", "--version"], root)
    summary["git"] = {"head": head.strip() if git_code == 0 else None, "status": status.strip()}
    summary["node_version"] = node_version.strip()
    hosting = json.loads((root / ".openai/hosting.json").read_text())
    summary["hosting"] = {"project_id": hosting.get("project_id"), "static": hosting.get("static")}

    paths = sorted({p for d in ("dist", "tests") for p in (root / d).rglob("*") if p.is_file()}
                   | {root / ".openai/hosting.json"})
    manifest = []
    for p in paths:
        data = p.read_bytes()
        manifest.append({"path": p.relative_to(root).as_posix(), "bytes": len(data),
                         "sha256": hashlib.sha256(data).hexdigest()})
    serialized = json.dumps(manifest, sort_keys=True, separators=(",", ":"))
    summary["source_fingerprint_sha256"] = hashlib.sha256(serialized.encode()).hexdigest()
    (out / "source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    summary["payload_on_disk"] = {
        "dist_bytes": sum(p["bytes"] for p in manifest if p["path"].startswith("dist/")),
        "audio_asset_bytes": sum(p["bytes"] for p in manifest if p["path"].startswith("dist/audio/assets/")),
        "note": "File bytes, not compressed transfer size or first-play network cost",
    }

    source_files = sorted((root / "dist").rglob("*.js"))
    syntax_log, syntax_failed = [], []
    for path in source_files:
        code, output = run(["node", "--check", str(path)], root)
        relative = path.relative_to(root).as_posix()
        syntax_log.append(f"{relative}: {'PASS' if code == 0 else 'FAIL'}\n{output}")
        if code:
            syntax_failed.append(relative)
    (out / "syntax.log").write_text("\n".join(syntax_log))
    summary["syntax"] = {"status": "fail" if syntax_failed else "pass",
                         "files_checked": len(source_files), "failed_files": syntax_failed}

    inventory_script = """const {games}=await import(process.argv[1]);
console.log(JSON.stringify(games.map(g=>({id:g.id,title:g.title,category:g.category,
scoreLabel:g.scoreLabel,lowerIsBetter:!!g.lowerIsBetter}))));"""
    code, inventory_output = run(["node", "--input-type=module", "-e", inventory_script,
                                  (root / "dist/registry.js").as_uri()], root)
    inventory_error = None
    try:
        if code:
            raise ValueError(inventory_output)
        games = json.loads(inventory_output)
        ids = [g["id"] for g in games]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate registered game IDs")
        summary["inventory"] = {"status": "pass", "registered_games": len(games), "games": games}
    except (ValueError, KeyError, TypeError) as exc:
        inventory_error = str(exc)
        summary["inventory"] = {"status": "fail", "error": inventory_error}
    (out / "inventory.log").write_text(inventory_output)

    tests = sorted((root / "tests").glob("*.test.mjs"))
    if tests:
        code, test_output = run(["node", "--test", *map(str, tests)], root)
    else:
        code, test_output = 1, "No tests found\n"
    (out / "tests.log").write_text(test_output)
    counts = {key: int(m.group(1)) if (m := re.search(rf"^# {key} (\d+)\s*$", test_output, re.M)) else None
              for key in ("tests", "pass", "fail", "skipped", "cancelled")}
    summary["tests"] = {"status": "pass" if code == 0 else "fail", "exit_code": code, **counts}
    passed = not syntax_failed and not inventory_error and code == 0 and counts["tests"] not in (0, None)
    summary["code_checkpoint"] = "pass" if passed else "fail"
    summary["release_ready"] = False
    summary["release_note"] = "This tool cannot certify visual quality, real devices, player experience, or publication."
    (out / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps({"directory": str(out), "code_checkpoint": summary["code_checkpoint"],
                      "tests": summary["tests"], "fingerprint": summary["source_fingerprint_sha256"],
                      "release_ready": False}, indent=2))
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
