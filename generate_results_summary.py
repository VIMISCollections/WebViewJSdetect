import os
import re
from datetime import datetime

print("=" * 80)
print("WEBVIEWJSDETECT ANALYSIS RESULTS SUMMARY")
print("=" * 80)
print()

extracted_base = "extracted_apks"
results_summary = []

for app_dir in sorted(os.listdir(extracted_base)):
    app_path = os.path.join(extracted_base, app_dir)
    if not os.path.isdir(app_path):
        continue

    result_file = os.path.join(app_path, "opgen_generated_files", "used_time.txt")
    combined_js = os.path.join(app_path, "opgen_generated_files", "combined.js")

    if os.path.exists(result_file):
        try:
            with open(result_file, 'r', errors='ignore') as f:
                content = f.read()

            # Extract the latest result (last analysis)
            lines = content.split('\n')

            # Find the latest analysis timestamp and results
            latest_timestamp = None
            finish_time = None
            code_cov = None
            detection = None
            error_msg = None

            for i in range(len(lines)-1, -1, -1):
                line = lines[i].strip()

                if "finish within" in line:
                    # Extract timing and code coverage
                    match = re.search(r'finish within ([\d.]+) seconds.*?(\d+\.?\d*)% stmt covered', line)
                    if match:
                        finish_time = float(match.group(1))
                        code_cov = float(match.group(2))
                    elif "seconds" in line:
                        match = re.search(r'finish within ([\d.]+) seconds', line)
                        if match:
                            finish_time = float(match.group(1))

                if "detected" in line.lower():
                    if "nothing detected" in line.lower():
                        detection = "No Vulnerabilities Detected"
                    elif "taint detected" in line.lower():
                        detection = "Vulnerability Detected"

                if "Error:" in line and not error_msg:
                    error_msg = line

                if re.match(r'\d{10,}\.', line):  # Unix timestamp
                    latest_timestamp = line.split('----')[0] if '----' in line else None
                    if i > 10 and latest_timestamp is None:
                        break

            # Check if files exist
            has_combined_js = os.path.exists(combined_js)
            combined_size = os.path.getsize(combined_js) if has_combined_js else 0

            results_summary.append({
                'app': app_dir,
                'status': 'Analyzed' if finish_time is not None else 'In Progress/Failed',
                'time': finish_time,
                'coverage': code_cov,
                'detection': detection or 'Unknown',
                'error': error_msg,
                'combined_js_size': combined_size
            })
        except Exception as e:
            results_summary.append({
                'app': app_dir,
                'status': 'Error Reading Results',
                'time': None,
                'coverage': None,
                'detection': 'Error',
                'error': str(e),
                'combined_js_size': 0
            })
    else:
        results_summary.append({
            'app': app_dir,
            'status': 'Not Analyzed',
            'time': None,
            'coverage': None,
            'detection': 'N/A',
            'error': 'No results file',
            'combined_js_size': 0
        })

# Print results
print(f"{'APP NAME':<40} {'STATUS':<20} {'TIME (s)':<12} {'COVERAGE %':<12} {'DETECTION':<30}")
print("-" * 114)

for result in results_summary:
    app_name = result['app'][:35]
    status = result['status'][:18]
    time_str = f"{result['time']:.4f}" if result['time'] is not None else "N/A"
    coverage_str = f"{result['coverage']:.1f}%" if result['coverage'] is not None else "N/A"
    detection = result['detection'][:28]

    print(f"{app_name:<40} {status:<20} {time_str:<12} {coverage_str:<12} {detection:<30}")

print("-" * 114)
print()
print("SUMMARY STATISTICS:")
print("-" * 80)

analyzed = [r for r in results_summary if r['status'] == 'Analyzed']
vulnerabilities = [r for r in analyzed if 'Vulnerability' in r['detection']]

print(f"Total APKs: {len(results_summary)}")
print(f"Analyzed: {len(analyzed)}")
print(f"Vulnerabilities Detected: {len(vulnerabilities)}")
if analyzed:
    avg_time = sum(r['time'] for r in analyzed if r['time']) / len([r for r in analyzed if r['time']])
    avg_coverage = sum(r['coverage'] for r in analyzed if r['coverage'] is not None) / len([r for r in analyzed if r['coverage'] is not None])
    print(f"Average Analysis Time: {avg_time:.4f} seconds")
    print(f"Average Code Coverage: {avg_coverage:.2f}%")

print()
print(f"Analysis completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)

