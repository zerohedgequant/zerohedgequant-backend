#!/usr/bin/env python3
"""High-confidence credential indicators in tracked Git history.

Print ONLY the commit hash, path and pattern category, never the matched line
or secret material. This is a baseline, not a substitute for GitHub Secret
Scanning, gitleaks, runtime log review or credential rotation.
"""
import re
import subprocess
import sys

PATTERNS = [
    ("github_access_token", re.compile(r"\bgh(?:p|o|u|s|r|h)_[A-Za-z0-9_]{25,}\b")),
    ("github_fine_grained_token", re.compile(r"\bgithub_pat_[A-Za-z0-9_]{25,}\b")),
    ("aws_access_key", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("openai_secret", re.compile(r"\bsk-(?:proj-)?[A-Za-z0-9_-]{28,}\b")),
    ("stripe_live_secret", re.compile(r"\bsk_live_[A-Za-z0-9]{16,}\b")),
    ("slack_access_token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{18,}\b")),
    ("google_service_account", re.compile(r'"private_key"\s*:\s*"-----BEGIN')),
    ("private_key_pem", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----")),
    ("credentialed_postgres_url", re.compile(r"postgres(?:ql)?://[^\s'\"<>:]+:[^\s'\"<>@]+@[^\s'\"<>]+", re.I)),
    ("upstox_hardcoded_secret", re.compile(r"(?:UPSTOX_API_SECRET|UPSTOX_CLIENT_SECRET)\s*[:=]\s*['\"][A-Za-z0-9_-]{16,}['\"]")),
]
MAX_FINDINGS = 50

def main():
    cmd = [
        "git", "-c", "core.quotepath=false", "log", "--all", "--no-ext-diff",
        "--format=COMMIT_MARKER:%H", "--no-color", "-p", "--",
    ]
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="replace")
    commit = "unknown"
    path = "unknown"
    matches = set()
    for line in process.stdout:
        if line.startswith("COMMIT_MARKER:"):
            commit = line.split(":",1)[1].strip()[:40]
        elif line.startswith("+++ b/"):
            path = line[6:].strip()[:220]
        elif line.startswith("+") and not line.startswith("+++"):
            # Only inspect added text, including historical content removed later.
            candidate=line[1:].strip()
            for category, pattern in PATTERNS:
                if pattern.search(candidate):
                    matches.add((commit,path,category))
                    if len(matches) >= MAX_FINDINGS:
                        process.terminate()
                        break
        if len(matches) >= MAX_FINDINGS: break
    if process.poll() is None and len(matches) < MAX_FINDINGS:
        process.wait(timeout=60)
    print("Historical credential-indicator scan (no credential values are printed).")
    if matches:
        for commit,path,category in sorted(matches)[:MAX_FINDINGS]:
            print(f"REVIEW: commit={commit} path={path} category={category}")
        print(f"Review required: {len(matches)} possible secret exposures. Rotate any genuine credential immediately.")
        return 2
    print("No high-confidence credential patterns found in textual commit additions.")
    print("LIMITS: Not an entropy scan, not binary scanning, not GitHub secret scanning, not logs, not a guarantee.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
