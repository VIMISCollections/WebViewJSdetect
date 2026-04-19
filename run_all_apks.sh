#!/usr/bin/env bash
set -u

mkdir -p run_results
printf "apk\tstatus\tused_time_file\n" > run_results/run_summary.tsv

for apk in benchmark_apps/*.apk; do
  name=$(basename "$apk" .apk)
  echo "===== $name ====="

  rm -rf "extracted/$name"
  mkdir -p "extracted/$name"
  unzip -q "$apk" -d "extracted/$name"

  if [ ! -d "extracted/$name/assets" ]; then
    echo -e "${name}.apk\tno_assets\tnone" >> run_results/run_summary.tsv
    echo "STATUS: no_assets"
    echo
    continue
  fi

  if ! find "extracted/$name/assets" -type f | grep -qEi '\.js$'; then
    echo -e "${name}.apk\tno_js\tmissing" >> run_results/run_summary.tsv
    echo "STATUS: no_js"
    echo
    continue
  fi

  python generate_opg.py -t chrome_ext -crx -pq --ablation_mode CoCo-single \
    "extracted/$name/assets" > "run_results/${name}.log" 2>&1

  used="extracted/$name/assets/opgen_generated_files/used_time.txt"

  if [ ! -f "$used" ]; then
    echo -e "${name}.apk\tno_used_time\tmissing" >> run_results/run_summary.tsv
    echo "STATUS: no_used_time"
    echo
    continue
  fi

  if grep -q "Error:" "$used"; then
    status="error"
  elif grep -q "tainted detected" "$used"; then
    status="tainted_detected"
  elif grep -q "nothing detected" "$used"; then
    status="nothing_detected"
  else
    status="unknown"
  fi

  echo -e "${name}.apk\t${status}\t${used}" >> run_results/run_summary.tsv
  echo "STATUS: ${status}"
  grep -nE 'tainted detected|nothing detected|from .* to .*|Error:' "$used" || true
  echo
done
