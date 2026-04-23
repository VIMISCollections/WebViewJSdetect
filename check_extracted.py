import os
import glob

print("Checking extracted APK folders for JavaScript files:")
print("=" * 70)

extracted_base = "extracted_apks"
for app_dir in sorted(os.listdir(extracted_base)):
    app_path = os.path.join(extracted_base, app_dir)
    if os.path.isdir(app_path):
        # Find all JS files
        js_files = glob.glob(os.path.join(app_path, "**/*.js"), recursive=True)
        # Find all subdirectories
        subdirs = [d for d in os.listdir(app_path) if os.path.isdir(os.path.join(app_path, d))]

        print(f"\n{app_dir}:")
        print(f"  JS files: {len(js_files)}")
        print(f"  Subdirs: {', '.join(sorted(subdirs)[:5])}")
        if len(js_files) > 0:
            print(f"  Sample JS files:")
            for js_file in js_files[:3]:
                print(f"    - {os.path.relpath(js_file, app_path)}")

