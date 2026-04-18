#!/bin/bash
# Build all benchmark APKs from source
# Usage: bash build_all.sh [app]
# Apps: jellyfin | mastodon | nextcloud | all (default)

export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.9.10-hotspot"

BASE="$(cd "$(dirname "$0")" && pwd)"
APK_OUT="$BASE/../"
APP="${1:-all}"

build_jellyfin() {
    echo "=== Building Jellyfin (libre/release) ==="
    cd "$BASE/jellyfin-android"
    bash ./gradlew :app:assembleLibreRelease 2>&1 | tail -10
    APK=$(find app/build/outputs/apk/libre/release -name "*.apk" 2>/dev/null | head -1)
    if [ -n "$APK" ]; then
        cp "$APK" "$APK_OUT/jellyfin-libre-release-fresh.apk"
        echo "  -> Copied to: $APK_OUT/jellyfin-libre-release-fresh.apk"
    fi
}

build_mastodon() {
    echo "=== Building Mastodon (githubRelease) ==="
    cd "$BASE/mastodon-android"
    bash ./gradlew :mastodon:assembleGithubRelease 2>&1 | tail -10
    APK=$(find mastodon/build/outputs/apk/githubRelease -name "*.apk" 2>/dev/null | head -1)
    if [ -n "$APK" ]; then
        cp "$APK" "$APK_OUT/mastodon-githubRelease-fresh.apk"
        echo "  -> Copied to: $APK_OUT/mastodon-githubRelease-fresh.apk"
    fi
}

build_nextcloud() {
    echo "=== Building Nextcloud Notes (fdroid/release) ==="
    cd "$BASE/nextcloud-notes"
    bash ./gradlew :app:assembleFdroidRelease 2>&1 | tail -10
    APK=$(find app/build/outputs/apk/fdroid/release -name "*.apk" 2>/dev/null | head -1)
    if [ -n "$APK" ]; then
        cp "$APK" "$APK_OUT/nextcloud-notes-fdroid-release-fresh.apk"
        echo "  -> Copied to: $APK_OUT/nextcloud-notes-fdroid-release-fresh.apk"
    fi
}

case "$APP" in
    jellyfin)  build_jellyfin ;;
    mastodon)  build_mastodon ;;
    nextcloud) build_nextcloud ;;
    all)
        build_jellyfin
        build_mastodon
        build_nextcloud
        ;;
    *)
        echo "Usage: bash build_all.sh [jellyfin|mastodon|nextcloud|all]"
        exit 1
        ;;
esac

echo ""
echo "Done. Fresh APKs are in: $APK_OUT"
