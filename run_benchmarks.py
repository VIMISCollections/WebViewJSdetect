#!/usr/bin/env python3
"""
Run benchmarks on all APK files in benchmark_apps/
"""
import os
import subprocess
import zipfile
import sys
from pathlib import Path

def main():
    benchmark_dir = Path("benchmark_apps")
    run_results_dir = Path("run_results")
    extracted_dir = Path("extracted")

    # Create run_results directory
    run_results_dir.mkdir(exist_ok=True)

    # Write header to summary file
    summary_file = run_results_dir / "run_summary.tsv"
    with open(summary_file, 'w') as f:
        f.write("apk\tstatus\tused_time_file\n")

    # Process each APK
    for apk_path in sorted(benchmark_dir.glob("*.apk")):
        name = apk_path.stem
        print(f"\n===== {name} =====")

        # Extract APK
        extract_path = extracted_dir / name
        if extract_path.exists():
            import shutil
            shutil.rmtree(extract_path)
        extract_path.mkdir(parents=True, exist_ok=True)

        try:
            with zipfile.ZipFile(apk_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
        except Exception as e:
            print(f"Error extracting APK: {e}")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\textract_error\tnone\n")
            continue

        # Check if assets directory exists
        assets_path = extract_path / "assets"
        if not assets_path.exists():
            print("STATUS: no_assets")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\tno_assets\tnone\n")
            continue

        # Check if there are JS files
        js_files = list(assets_path.rglob("*.js"))
        if not js_files:
            print("STATUS: no_js")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\tno_js\tmissing\n")
            continue

        print(f"Found {len(js_files)} JS files")

        # Run analysis
        log_file = run_results_dir / f"{name}.log"
        cmd = [
            sys.executable,
            "generate_opg.py",
            "-t", "chrome_ext",
            "-crx",
            "-pq",
            "--ablation_mode", "CoCo-single",
            str(assets_path)
        ]

        print(f"Running: {' '.join(cmd)}")
        try:
            with open(log_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.STDOUT, timeout=300)
        except subprocess.TimeoutExpired:
            print(f"Analysis timed out for {name}")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\ttimeout\tmissing\n")
            continue
        except Exception as e:
            print(f"Error running analysis: {e}")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\texecution_error\tmissing\n")
            continue

        # Check for used_time.txt
        used_time_file = assets_path / "opgen_generated_files" / "used_time.txt"

        if not used_time_file.exists():
            print("STATUS: no_used_time")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\tno_used_time\tmissing\n")
            continue

        # Parse used_time.txt
        try:
            with open(used_time_file, 'r') as f:
                content = f.read()

            if "Error:" in content:
                status = "error"
            elif "tainted detected" in content:
                status = "tainted_detected"
            elif "nothing detected" in content:
                status = "nothing_detected"
            else:
                status = "unknown"

            print(f"STATUS: {status}")

            # Print relevant lines
            for line in content.split('\n'):
                if any(x in line for x in ['tainted detected', 'nothing detected', 'from ', 'to ', 'Error:']):
                    print(line)

            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\t{status}\t{used_time_file}\n")
        except Exception as e:
            print(f"Error parsing used_time.txt: {e}")
            with open(summary_file, 'a') as f:
                f.write(f"{name}.apk\tparse_error\tmissing\n")

    print("\n" + "="*50)
    print("BENCHMARK RUN COMPLETE")
    print(f"Summary saved to: {summary_file}")
    print("="*50)

    # Print summary
    if summary_file.exists():
        print("\nSUMMARY:")
        with open(summary_file, 'r') as f:
            print(f.read())

if __name__ == "__main__":
    main()

