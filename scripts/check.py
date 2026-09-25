"""Run model checks and verify snapshots without modifying the working tree."""
from pathlib import Path
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    env = dict(os.environ)
    # The calculator uses assertions; never allow optimization to disable them.
    env.pop("PYTHONOPTIMIZE", None)
    with tempfile.TemporaryDirectory(prefix="community-power-check-") as temporary:
        model = Path(temporary) / "model"
        model.mkdir()
        for name in ("calculate.py", "assumptions.csv", "mvp_budget.csv"):
            shutil.copy2(ROOT / "model" / name, model / name)
        subprocess.run([sys.executable, str(model / "calculate.py")],
                       check=True, env=env)
        stale = []
        for name in ("forecast.csv", "scenario_summary.csv"):
            committed = ROOT / "model" / name
            if (not committed.exists() or
                    committed.read_text(encoding="utf-8-sig") !=
                    (model / name).read_text(encoding="utf-8-sig")):
                stale.append(name)
        if stale:
            print("FAIL: stale or missing snapshots: " + ", ".join(stale),
                  file=sys.stderr)
            print("Run: python model/calculate.py", file=sys.stderr)
            return 1
    print("PASS: model checks and generated snapshots match")
    return 0


if __name__ == "__main__":
    sys.exit(main())
