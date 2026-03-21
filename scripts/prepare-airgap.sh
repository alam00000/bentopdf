#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# BentoPDF Air-Gapped Deployment Preparation Script
# ============================================================
# Automates the creation of a self-contained deployment bundle
# for air-gapped (offline) networks.
#
# Run this on a machine WITH internet access. The output bundle
# contains everything needed to deploy BentoPDF offline.
#
# Usage:
#   bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
#   bash scripts/prepare-airgap.sh   # interactive mode
#   bash scripts/prepare-airgap.sh --ocr-languages eng,deu,fra
#   bash scripts/prepare-airgap.sh --search-ocr-language german
#
# See --help for all options.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Output formatting ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*" >&2; }
step()    { echo -e "\n${BOLD}==> $*${NC}"; }

# Disable colors if NO_COLOR is set
if [ -n "${NO_COLOR:-}" ]; then
  RED='' GREEN='' YELLOW='' BLUE='' BOLD='' NC=''
fi

# --- Defaults ---
WASM_BASE_URL=""
IMAGE_NAME="bentopdf"
OUTPUT_DIR="./bentopdf-airgap-bundle"
SIMPLE_MODE=""
BASE_URL=""
COMPRESSION_MODE=""
LANGUAGE=""
BRAND_NAME=""
BRAND_LOGO=""
FOOTER_TEXT=""
DOCKERFILE="Dockerfile"
SKIP_DOCKER=false
SKIP_WASM=false
INTERACTIVE=false
OCR_LANGUAGES="eng"
TESSDATA_VERSION="4.0.0_best_int"
LIST_OCR_LANGUAGES=false
SEARCH_OCR_LANGUAGE_TERM=""

TESSERACT_LANGUAGE_CONFIG="src/js/config/tesseract-languages.ts"
FONT_MAPPING_CONFIG="src/js/config/font-mappings.ts"

SUPPORTED_OCR_LANGUAGES_RAW=""
OCR_FONT_MANIFEST_RAW=""

load_supported_ocr_languages() {
  if [ -n "$SUPPORTED_OCR_LANGUAGES_RAW" ]; then
    return
  fi

  if [ ! -f "$TESSERACT_LANGUAGE_CONFIG" ]; then
    error "Missing OCR language config: ${TESSERACT_LANGUAGE_CONFIG}"
    exit 1
  fi

  SUPPORTED_OCR_LANGUAGES_RAW=$(node -e "const fs = require('fs'); const source = fs.readFileSync(process.argv[1], 'utf8'); const languages = []; const pattern = /^\\s*([a-z0-9_]+):\\s*'([^']+)'/gm; let match; while ((match = pattern.exec(source)) !== null) { languages.push(match[1] + '\\t' + match[2]); } process.stdout.write(languages.join('\\n'));" "$TESSERACT_LANGUAGE_CONFIG")

  if [ -z "$SUPPORTED_OCR_LANGUAGES_RAW" ]; then
    error "Failed to load supported OCR languages from ${TESSERACT_LANGUAGE_CONFIG}"
    exit 1
  fi
}

is_supported_ocr_language() {
  local code="$1"
  load_supported_ocr_languages
  printf '%s\n' "$SUPPORTED_OCR_LANGUAGES_RAW" | awk -F '\t' -v code="$code" '$1 == code { found = 1 } END { exit found ? 0 : 1 }'
}

show_supported_ocr_languages() {
  load_supported_ocr_languages

  echo ""
  echo -e "${BOLD}Supported OCR languages:${NC}"
  echo "  Use the code in the left column for --ocr-languages."
  echo ""
  printf '%s\n' "$SUPPORTED_OCR_LANGUAGES_RAW" | awk -F '\t' '{ printf "  %-12s %s\n", $1, $2 }'
  echo ""
  echo "  Example: --ocr-languages eng,deu,fra,spa"
  echo ""
}

show_matching_ocr_languages() {
  local query="$1"
  load_supported_ocr_languages

  if [ -z "$query" ]; then
    error "OCR language search requires a non-empty query."
    exit 1
  fi

  local matches
  matches=$(printf '%s\n' "$SUPPORTED_OCR_LANGUAGES_RAW" | awk -F '\t' -v query="$query" '
    BEGIN {
      normalized = tolower(query)
    }
    {
      code = tolower($1)
      name = tolower($2)
      if (index(code, normalized) || index(name, normalized)) {
        printf "%s\t%s\n", $1, $2
      }
    }
  ')

  echo ""
  echo -e "${BOLD}OCR language search:${NC} ${query}"

  if [ -z "$matches" ]; then
    echo "  No supported OCR languages matched that query."
    echo "  Tip: run --list-ocr-languages to browse the full list."
    echo ""
    return 1
  fi

  echo "  Matching codes for --ocr-languages:"
  echo ""
  printf '%s\n' "$matches" | awk -F '\t' '{ printf "  %-12s %s\n", $1, $2 }'
  echo ""
}

load_required_ocr_fonts() {
  if [ -n "$OCR_FONT_MANIFEST_RAW" ]; then
    return
  fi

  if [ ! -f "$FONT_MAPPING_CONFIG" ]; then
    error "Missing OCR font mapping config: ${FONT_MAPPING_CONFIG}"
    exit 1
  fi

  OCR_FONT_MANIFEST_RAW=$(node -e "const fs = require('fs'); const source = fs.readFileSync(process.argv[1], 'utf8'); const selected = (process.argv[2] || '').split(',').map((value) => value.trim()).filter(Boolean); const sections = source.split('export const fontFamilyToUrl'); const languageSection = sections[0] || ''; const fontSection = sections[1] || ''; const languageToFamily = {}; const fontFamilyToUrl = {}; let match; const languagePattern = /^\s*([a-z_]+):\s*'([^']+)',/gm; while ((match = languagePattern.exec(languageSection)) !== null) { languageToFamily[match[1]] = match[2]; } const fontPattern = /^\s*'([^']+)':\s*'([^']+)',/gm; while ((match = fontPattern.exec(fontSection)) !== null) { fontFamilyToUrl[match[1]] = match[2]; } const families = new Set(['Noto Sans']); for (const lang of selected) { families.add(languageToFamily[lang] || 'Noto Sans'); } const lines = Array.from(families).sort().map((family) => { const url = fontFamilyToUrl[family] || fontFamilyToUrl['Noto Sans']; const fileName = url.split('/').pop(); return [family, url, fileName].join('\t'); }); process.stdout.write(lines.join('\n'));" "$FONT_MAPPING_CONFIG" "$OCR_LANGUAGES")

  if [ -z "$OCR_FONT_MANIFEST_RAW" ]; then
    error "Failed to resolve OCR font assets from ${FONT_MAPPING_CONFIG}"
    exit 1
  fi
}

# --- Usage ---
usage() {
  cat <<'EOF'
BentoPDF Air-Gapped Deployment Preparation

USAGE:
  bash scripts/prepare-airgap.sh [OPTIONS]
  bash scripts/prepare-airgap.sh                    # interactive mode

REQUIRED:
  --wasm-base-url <url>   Base URL where WASM files will be hosted
                          in the air-gapped network
                          (e.g. https://internal.example.com/wasm)

OPTIONS:
  --image-name <name>     Docker image name          (default: bentopdf)
  --output-dir <path>     Output bundle directory     (default: ./bentopdf-airgap-bundle)
  --dockerfile <path>     Dockerfile to use           (default: Dockerfile)
  --simple-mode           Enable Simple Mode
  --base-url <path>       Subdirectory base URL       (e.g. /pdf/)
  --compression <mode>    Compression: g, b, o, all   (default: all)
  --language <code>       Default UI language          (e.g. fr, de, es)
  --brand-name <name>     Custom brand name
  --brand-logo <path>     Logo path relative to public/
  --footer-text <text>    Custom footer text
  --ocr-languages <list>  Comma-separated OCR languages to bundle
                          (default: eng)
  --list-ocr-languages    Print supported OCR language codes and exit
  --search-ocr-language   Search supported OCR languages by code or name
  --skip-docker           Skip Docker build and export
  --skip-wasm             Skip WASM download (reuse existing .tgz files)
  --help                  Show this help message

EXAMPLES:
  # Minimal (prompts for WASM URL interactively)
  bash scripts/prepare-airgap.sh

  # Full automation
  bash scripts/prepare-airgap.sh \
    --wasm-base-url https://internal.example.com/wasm \
    --ocr-languages eng,deu,fra \
    --brand-name "AcmePDF" \
    --language fr

  # Skip Docker build (reuse existing image)
  bash scripts/prepare-airgap.sh \
    --wasm-base-url https://internal.example.com/wasm \
    --skip-docker

  # Show all supported OCR language codes
  bash scripts/prepare-airgap.sh --list-ocr-languages

  # Search OCR languages by code or human-readable name
  bash scripts/prepare-airgap.sh --search-ocr-language german
EOF
  exit 0
}

# --- Parse arguments ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wasm-base-url)  WASM_BASE_URL="$2"; shift 2 ;;
    --image-name)     IMAGE_NAME="$2"; shift 2 ;;
    --output-dir)     OUTPUT_DIR="$2"; shift 2 ;;
    --simple-mode)    SIMPLE_MODE="true"; shift ;;
    --base-url)       BASE_URL="$2"; shift 2 ;;
    --compression)    COMPRESSION_MODE="$2"; shift 2 ;;
    --language)       LANGUAGE="$2"; shift 2 ;;
    --brand-name)     BRAND_NAME="$2"; shift 2 ;;
    --brand-logo)     BRAND_LOGO="$2"; shift 2 ;;
    --footer-text)    FOOTER_TEXT="$2"; shift 2 ;;
    --ocr-languages)  OCR_LANGUAGES="$2"; shift 2 ;;
    --list-ocr-languages) LIST_OCR_LANGUAGES=true; shift ;;
    --search-ocr-language) SEARCH_OCR_LANGUAGE_TERM="$2"; shift 2 ;;
    --dockerfile)     DOCKERFILE="$2"; shift 2 ;;
    --skip-docker)    SKIP_DOCKER=true; shift ;;
    --skip-wasm)      SKIP_WASM=true; shift ;;
    --help|-h)        usage ;;
    *)                error "Unknown option: $1"; echo "Run with --help for usage."; exit 1 ;;
  esac
done

# --- Validate project root ---
cd "$PROJECT_ROOT"

if [ ! -f "package.json" ] || [ ! -f "src/js/const/cdn-version.ts" ]; then
  error "This script must be run from the BentoPDF project root."
  error "Expected to find package.json and src/js/const/cdn-version.ts"
  exit 1
fi

if [ "$LIST_OCR_LANGUAGES" = true ]; then
  show_supported_ocr_languages
  exit 0
fi

if [ -n "$SEARCH_OCR_LANGUAGE_TERM" ]; then
  if show_matching_ocr_languages "$SEARCH_OCR_LANGUAGE_TERM"; then
    exit 0
  fi
  exit 1
fi

# --- Check prerequisites ---
check_prerequisites() {
  local missing=false

  if ! command -v npm &>/dev/null; then
    error "npm is required but not found. Install Node.js first."
    missing=true
  fi

  if [ "$SKIP_WASM" = false ] && ! command -v curl &>/dev/null; then
    error "curl is required to download OCR language data."
    missing=true
  fi

  if [ "$SKIP_DOCKER" = false ] && ! command -v docker &>/dev/null; then
    error "docker is required but not found (use --skip-docker to skip)."
    missing=true
  fi

  if [ "$missing" = true ]; then
    exit 1
  fi
}

# --- Read versions from source code ---
read_versions() {
  PYMUPDF_VERSION=$(grep "pymupdf:" src/js/const/cdn-version.ts | grep -o "'[^']*'" | tr -d "'")
  GS_VERSION=$(grep "ghostscript:" src/js/const/cdn-version.ts | grep -o "'[^']*'" | tr -d "'")
  APP_VERSION=$(node -p "require('./package.json').version")
  TESSERACT_VERSION=$(node -p "require('./package-lock.json').packages['node_modules/tesseract.js'].version")
  TESSERACT_CORE_VERSION=$(node -p "require('./package-lock.json').packages['node_modules/tesseract.js-core'].version")

  if [ -z "$PYMUPDF_VERSION" ] || [ -z "$GS_VERSION" ] || [ -z "$TESSERACT_VERSION" ] || [ -z "$TESSERACT_CORE_VERSION" ]; then
    error "Failed to read external asset versions from the repository metadata"
    exit 1
  fi
}

# --- Interactive mode ---
interactive_mode() {
  echo ""
  echo -e "${BOLD}============================================================${NC}"
  echo -e "${BOLD}  BentoPDF Air-Gapped Deployment Preparation${NC}"
  echo -e "${BOLD}  App Version: ${APP_VERSION}${NC}"
  echo -e "${BOLD}============================================================${NC}"
  echo ""
  echo "  Detected WASM versions from source:"
  echo "    PyMuPDF:      ${PYMUPDF_VERSION}"
  echo "    Ghostscript:  ${GS_VERSION}"
  echo "    CoherentPDF:  latest"
  echo "    Tesseract.js: ${TESSERACT_VERSION}"
  echo "    OCR Data:     ${TESSDATA_VERSION}"
  echo ""

  # [1] WASM base URL (REQUIRED)
  echo -e "${BOLD}[1/8] WASM Base URL ${RED}(required)${NC}"
  echo "    The URL where WASM files will be hosted inside the air-gapped network."
  echo "    The script will append /pymupdf/, /gs/, /cpdf/ to this URL."
  echo ""
  echo "    Examples:"
  echo "      https://internal.example.com/wasm"
  echo "      http://192.168.1.100/assets/wasm"
  echo "      https://cdn.mycompany.local/bentopdf"
  echo ""
  while true; do
    read -r -p "    URL: " WASM_BASE_URL
    if [ -z "$WASM_BASE_URL" ]; then
      warn "WASM base URL is required. Please enter a URL."
    elif [[ ! "$WASM_BASE_URL" =~ ^https?:// ]]; then
      warn "Must start with http:// or https://. Try again."
    else
      break
    fi
  done
  echo ""

  # [2] Docker image name (optional)
  echo -e "${BOLD}[2/8] Docker Image Name ${GREEN}(optional)${NC}"
  echo "    The name used to tag the Docker image (used with 'docker run')."
  read -r -p "    Image name [${IMAGE_NAME}]: " input
  IMAGE_NAME="${input:-$IMAGE_NAME}"
  echo ""

  # [3] Simple mode (optional)
  echo -e "${BOLD}[3/8] Simple Mode ${GREEN}(optional)${NC}"
  echo "    Hides navigation, hero, features, FAQ — shows only PDF tools."
  read -r -p "    Enable Simple Mode? (y/N): " input
  if [[ "${input:-}" =~ ^[Yy]$ ]]; then
    SIMPLE_MODE="true"
  fi
  echo ""

  # [4] Default language (optional)
  echo -e "${BOLD}[4/8] Default UI Language ${GREEN}(optional)${NC}"
  echo "    Supported: en, ar, be, da, de, es, fr, id, it, nl, pt, tr, vi, zh, zh-TW"
  while true; do
    read -r -p "    Language [en]: " input
    LANGUAGE="${input:-}"
    if [ -z "$LANGUAGE" ] || echo " en ar be da de es fr id it nl pt tr vi zh zh-TW " | grep -q " $LANGUAGE "; then
      break
    fi
    warn "Invalid language code '${LANGUAGE}'. Try again."
  done
  echo ""

  # [5] Custom branding (optional)
  echo -e "${BOLD}[5/8] Custom Branding ${GREEN}(optional)${NC}"
  echo "    Replace the default BentoPDF name, logo, and footer text."
  read -r -p "    Brand name [BentoPDF]: " input
  BRAND_NAME="${input:-}"
  if [ -n "$BRAND_NAME" ]; then
    echo "    Place your logo in the public/ folder before building."
    read -r -p "    Logo path relative to public/ [images/favicon-no-bg.svg]: " input
    BRAND_LOGO="${input:-}"
    read -r -p "    Footer text [© 2026 BentoPDF. All rights reserved.]: " input
    FOOTER_TEXT="${input:-}"
  fi
  echo ""

  # [6] Base URL (optional)
  echo -e "${BOLD}[6/8] Base URL ${GREEN}(optional)${NC}"
  echo "    Set this if hosting under a subdirectory (e.g. /pdf/)."
  read -r -p "    Base URL [/]: " input
  BASE_URL="${input:-}"
  echo ""

  # [7] Dockerfile (optional)
  echo -e "${BOLD}[7/8] Dockerfile ${GREEN}(optional)${NC}"
  echo "    Options: Dockerfile (standard) or Dockerfile.nonroot (custom PUID/PGID)"
  read -r -p "    Dockerfile [${DOCKERFILE}]: " input
  DOCKERFILE="${input:-$DOCKERFILE}"
  echo ""

  # [8] OCR languages (optional)
  echo -e "${BOLD}[8/9] OCR Languages ${GREEN}(optional)${NC}"
  echo "    Comma-separated traineddata files to bundle for offline OCR."
  echo "    Enter Tesseract language codes such as: eng,deu,fra,spa"
  echo "    Type 'list' to print the full supported language list."
  echo "    Type 'search <term>' to find codes by name or abbreviation."
  while true; do
    read -r -p "    OCR languages [${OCR_LANGUAGES}]: " input
    if [ -z "${input:-}" ]; then
      break
    fi
    if [ "$input" = "list" ]; then
      show_supported_ocr_languages
      continue
    fi
    if [[ "$input" == search\ * ]]; then
      search_query="${input#search }"
      if ! show_matching_ocr_languages "$search_query"; then
        warn "No OCR language matched '${search_query}'."
      fi
      continue
    fi
    OCR_LANGUAGES="$input"
    break
  done
  echo ""

  # [9] Output directory (optional)
  echo -e "${BOLD}[9/9] Output Directory ${GREEN}(optional)${NC}"
  read -r -p "    Path [${OUTPUT_DIR}]: " input
  OUTPUT_DIR="${input:-$OUTPUT_DIR}"

  # Confirm
  echo ""
  echo -e "${BOLD}--- Configuration Summary ---${NC}"
  echo ""
  echo "  WASM Base URL:  ${WASM_BASE_URL}"
  echo "  Image Name:     ${IMAGE_NAME}"
  echo "  Dockerfile:     ${DOCKERFILE}"
  echo "  Simple Mode:    ${SIMPLE_MODE:-false}"
  echo "  Language:       ${LANGUAGE:-en (default)}"
  echo "  Brand Name:     ${BRAND_NAME:-BentoPDF (default)}"
  [ -n "$BRAND_NAME" ] && echo "  Brand Logo:     ${BRAND_LOGO:-images/favicon-no-bg.svg (default)}"
  [ -n "$BRAND_NAME" ] && echo "  Footer Text:    ${FOOTER_TEXT:-(default)}"
  echo "  Base URL:       ${BASE_URL:-/ (root)}"
  echo "  OCR Languages:  ${OCR_LANGUAGES}"
  echo "  Output:         ${OUTPUT_DIR}"
  echo ""
  read -r -p "  Proceed? (Y/n): " input
  if [[ "${input:-Y}" =~ ^[Nn]$ ]]; then
    echo "Aborted."
    exit 0
  fi
}

# --- SHA-256 checksum (cross-platform) ---
sha256() {
  if command -v sha256sum &>/dev/null; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum &>/dev/null; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    echo "n/a"
  fi
}

# --- File size (human-readable, cross-platform) ---
filesize() {
  if stat --version &>/dev/null 2>&1; then
    # GNU stat (Linux)
    stat --printf='%s' "$1" 2>/dev/null | awk '{
      if ($1 >= 1073741824) printf "%.1f GB", $1/1073741824;
      else if ($1 >= 1048576) printf "%.1f MB", $1/1048576;
      else if ($1 >= 1024) printf "%.1f KB", $1/1024;
      else printf "%d B", $1;
    }'
  else
    # BSD stat (macOS)
    stat -f '%z' "$1" 2>/dev/null | awk '{
      if ($1 >= 1073741824) printf "%.1f GB", $1/1073741824;
      else if ($1 >= 1048576) printf "%.1f MB", $1/1048576;
      else if ($1 >= 1024) printf "%.1f KB", $1/1024;
      else printf "%d B", $1;
    }'
  fi
}

# ============================================================
# MAIN
# ============================================================

check_prerequisites
read_versions
load_supported_ocr_languages

# If no WASM base URL provided, go interactive
if [ -z "$WASM_BASE_URL" ]; then
  INTERACTIVE=true
  interactive_mode
fi

# Validate language code if provided
if [ -n "$LANGUAGE" ]; then
  VALID_LANGS="en ar be da de es fr id it nl pt tr vi zh zh-TW"
  if ! echo " $VALID_LANGS " | grep -q " $LANGUAGE "; then
    error "Invalid language code: ${LANGUAGE}"
    error "Supported: ${VALID_LANGS}"
    exit 1
  fi
fi

IFS=',' read -r -a OCR_LANGUAGE_ARRAY <<< "$OCR_LANGUAGES"
NORMALIZED_OCR_LANGUAGES=()
for raw_lang in "${OCR_LANGUAGE_ARRAY[@]}"; do
  lang=$(echo "$raw_lang" | tr -d '[:space:]')
  if [ -z "$lang" ]; then
    continue
  fi
  if [[ ! "$lang" =~ ^[a-z0-9_]+$ ]]; then
    error "Invalid OCR language code: ${lang}"
    error "Use comma-separated Tesseract codes such as eng,deu,fra,chi_sim"
    exit 1
  fi
  if ! is_supported_ocr_language "$lang"; then
    error "Unsupported OCR language code: ${lang}"
    error "Run with --list-ocr-languages or --search-ocr-language <term> to find supported Tesseract codes."
    exit 1
  fi
  NORMALIZED_OCR_LANGUAGES+=("$lang")
done

if [ ${#NORMALIZED_OCR_LANGUAGES[@]} -eq 0 ]; then
  error "At least one OCR language must be included."
  exit 1
fi

OCR_LANGUAGES=$(IFS=','; echo "${NORMALIZED_OCR_LANGUAGES[*]}")
load_required_ocr_fonts

# Validate WASM base URL format
if [[ ! "$WASM_BASE_URL" =~ ^https?:// ]]; then
  error "WASM base URL must start with http:// or https://"
  error "  Got: ${WASM_BASE_URL}"
  error "  Example: https://internal.example.com/wasm"
  exit 1
fi

# Strip trailing slash from WASM base URL
WASM_BASE_URL="${WASM_BASE_URL%/}"

# Construct WASM URLs
WASM_PYMUPDF_URL="${WASM_BASE_URL}/pymupdf/"
WASM_GS_URL="${WASM_BASE_URL}/gs/"
WASM_CPDF_URL="${WASM_BASE_URL}/cpdf/"
OCR_TESSERACT_WORKER_URL="${WASM_BASE_URL}/ocr/worker.min.js"
OCR_TESSERACT_CORE_URL="${WASM_BASE_URL}/ocr/core"
OCR_TESSERACT_LANG_URL="${WASM_BASE_URL}/ocr/lang-data"
OCR_FONT_BASE_URL="${WASM_BASE_URL}/ocr/fonts"

echo ""
echo -e "${BOLD}============================================================${NC}"
echo -e "${BOLD}  BentoPDF Air-Gapped Bundle Preparation${NC}"
echo -e "${BOLD}  App: v${APP_VERSION}  |  PyMuPDF: ${PYMUPDF_VERSION}  |  GS: ${GS_VERSION}  |  OCR: ${TESSERACT_VERSION}${NC}"
echo -e "${BOLD}============================================================${NC}"

# --- Phase 1: Prepare output directory ---
step "Preparing output directory"

mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR="$(cd "$OUTPUT_DIR" && pwd)"

# Warn if output directory already has bundle files
if ls "$OUTPUT_DIR"/*.tgz "$OUTPUT_DIR"/bentopdf.tar "$OUTPUT_DIR"/setup.sh 2>/dev/null | head -1 &>/dev/null; then
  warn "Output directory already contains files from a previous run."
  warn "Existing files will be overwritten."
  if [ "$INTERACTIVE" = true ]; then
    read -r -p "  Continue? (Y/n): " input
    if [[ "${input:-Y}" =~ ^[Nn]$ ]]; then
      echo "Aborted."
      exit 0
    fi
  fi
fi

info "Output: ${OUTPUT_DIR}"

# --- Phase 2: Download WASM packages ---
if [ "$SKIP_WASM" = true ]; then
  step "Skipping WASM download (--skip-wasm)"
  # Verify each file exists with specific errors
  wasm_missing=false
  if ! ls "$OUTPUT_DIR"/bentopdf-pymupdf-wasm-*.tgz &>/dev/null; then
    error "Missing: bentopdf-pymupdf-wasm-*.tgz"
    wasm_missing=true
  fi
  if ! ls "$OUTPUT_DIR"/bentopdf-gs-wasm-*.tgz &>/dev/null; then
    error "Missing: bentopdf-gs-wasm-*.tgz"
    wasm_missing=true
  fi
  if ! ls "$OUTPUT_DIR"/coherentpdf-*.tgz &>/dev/null; then
    error "Missing: coherentpdf-*.tgz"
    wasm_missing=true
  fi
  if ! ls "$OUTPUT_DIR"/tesseract.js-*.tgz &>/dev/null; then
    error "Missing: tesseract.js-*.tgz"
    wasm_missing=true
  fi
  if ! ls "$OUTPUT_DIR"/tesseract.js-core-*.tgz &>/dev/null; then
    error "Missing: tesseract.js-core-*.tgz"
    wasm_missing=true
  fi
  for lang in "${NORMALIZED_OCR_LANGUAGES[@]}"; do
    if [ ! -f "$OUTPUT_DIR/tesseract-langdata/${lang}.traineddata.gz" ]; then
      error "Missing: tesseract-langdata/${lang}.traineddata.gz"
      wasm_missing=true
    fi
  done
  while IFS=$'\t' read -r font_family font_url font_file; do
    [ -z "$font_file" ] && continue
    if [ ! -f "$OUTPUT_DIR/ocr-fonts/${font_file}" ]; then
      error "Missing: ocr-fonts/${font_file} (${font_family})"
      wasm_missing=true
    fi
  done <<< "$OCR_FONT_MANIFEST_RAW"
  if [ "$wasm_missing" = true ]; then
    error "Run without --skip-wasm first to download the packages."
    exit 1
  fi
  success "Reusing existing WASM packages"
else
  step "Downloading WASM packages"

  WASM_TMP=$(mktemp -d)
  trap 'rm -rf "$WASM_TMP"' EXIT

  info "Downloading @bentopdf/pymupdf-wasm@${PYMUPDF_VERSION}..."
  if ! (cd "$WASM_TMP" && npm pack "@bentopdf/pymupdf-wasm@${PYMUPDF_VERSION}" --quiet 2>&1); then
    error "Failed to download @bentopdf/pymupdf-wasm@${PYMUPDF_VERSION}"
    error "Check your internet connection and that the package exists on npm."
    exit 1
  fi

  info "Downloading @bentopdf/gs-wasm@${GS_VERSION}..."
  if ! (cd "$WASM_TMP" && npm pack "@bentopdf/gs-wasm@${GS_VERSION}" --quiet 2>&1); then
    error "Failed to download @bentopdf/gs-wasm@${GS_VERSION}"
    error "Check your internet connection and that the package exists on npm."
    exit 1
  fi

  info "Downloading coherentpdf..."
  if ! (cd "$WASM_TMP" && npm pack coherentpdf --quiet 2>&1); then
    error "Failed to download coherentpdf"
    error "Check your internet connection and that the package exists on npm."
    exit 1
  fi

  info "Downloading tesseract.js@${TESSERACT_VERSION}..."
  if ! (cd "$WASM_TMP" && npm pack "tesseract.js@${TESSERACT_VERSION}" --quiet 2>&1); then
    error "Failed to download tesseract.js@${TESSERACT_VERSION}"
    exit 1
  fi

  info "Downloading tesseract.js-core@${TESSERACT_CORE_VERSION}..."
  if ! (cd "$WASM_TMP" && npm pack "tesseract.js-core@${TESSERACT_CORE_VERSION}" --quiet 2>&1); then
    error "Failed to download tesseract.js-core@${TESSERACT_CORE_VERSION}"
    exit 1
  fi

  # Move to output directory
  mv "$WASM_TMP"/*.tgz "$OUTPUT_DIR/"

  mkdir -p "$OUTPUT_DIR/tesseract-langdata"
  for lang in "${NORMALIZED_OCR_LANGUAGES[@]}"; do
    info "Downloading OCR language data: ${lang}..."
    if ! curl -fsSL "https://cdn.jsdelivr.net/npm/@tesseract.js-data/${lang}/${TESSDATA_VERSION}/${lang}.traineddata.gz" -o "$OUTPUT_DIR/tesseract-langdata/${lang}.traineddata.gz"; then
      error "Failed to download OCR language data for ${lang}"
      error "Check that the language code exists and that the network can reach jsDelivr."
      exit 1
    fi
  done

  mkdir -p "$OUTPUT_DIR/ocr-fonts"
  while IFS=$'\t' read -r font_family font_url font_file; do
    [ -z "$font_file" ] && continue
    info "Downloading OCR font: ${font_family}..."
    if ! curl -fsSL "$font_url" -o "$OUTPUT_DIR/ocr-fonts/${font_file}"; then
      error "Failed to download OCR font '${font_family}'"
      error "Check that the network can reach the font URL: ${font_url}"
      exit 1
    fi
  done <<< "$OCR_FONT_MANIFEST_RAW"

  rm -rf "$WASM_TMP"
  trap - EXIT

  # Resolve CoherentPDF version from filename
  CPDF_TGZ=$(ls "$OUTPUT_DIR"/coherentpdf-*.tgz 2>/dev/null | head -1)
  CPDF_VERSION=$(basename "$CPDF_TGZ" | sed 's/coherentpdf-\(.*\)\.tgz/\1/')

  success "Downloaded all WASM packages"
  info "  PyMuPDF:      $(filesize "$OUTPUT_DIR"/bentopdf-pymupdf-wasm-*.tgz)"
  info "  Ghostscript:  $(filesize "$OUTPUT_DIR"/bentopdf-gs-wasm-*.tgz)"
  info "  CoherentPDF:  $(filesize "$CPDF_TGZ") (v${CPDF_VERSION})"
  info "  Tesseract.js: $(filesize "$OUTPUT_DIR"/tesseract.js-*.tgz)"
  info "  OCR Core:     $(filesize "$OUTPUT_DIR"/tesseract.js-core-*.tgz)"
  info "  OCR Langs:    ${OCR_LANGUAGES}"
  info "  OCR Fonts:    $(printf '%s\n' "$OCR_FONT_MANIFEST_RAW" | awk -F '\t' 'NF >= 1 { print $1 }' | paste -sd ', ' -)"
fi

# Resolve CPDF version if we skipped download
if [ -z "${CPDF_VERSION:-}" ]; then
  CPDF_TGZ=$(ls "$OUTPUT_DIR"/coherentpdf-*.tgz 2>/dev/null | head -1)
  CPDF_VERSION=$(basename "$CPDF_TGZ" | sed 's/coherentpdf-\(.*\)\.tgz/\1/')
fi

# --- Phase 3: Build Docker image ---
if [ "$SKIP_DOCKER" = true ]; then
  step "Skipping Docker build (--skip-docker)"

  # Check if image exists or tar exists
  if [ -f "$OUTPUT_DIR/bentopdf.tar" ]; then
    success "Reusing existing bentopdf.tar"
  elif docker image inspect "$IMAGE_NAME" &>/dev/null; then
    step "Exporting existing Docker image"
    docker save "$IMAGE_NAME" -o "$OUTPUT_DIR/bentopdf.tar"
    success "Exported: $(filesize "$OUTPUT_DIR/bentopdf.tar")"
  else
    warn "No Docker image '${IMAGE_NAME}' found and no bentopdf.tar in output."
    warn "The bundle will not include a Docker image."
  fi
else
  step "Building Docker image"

  # Verify Dockerfile exists
  if [ ! -f "$DOCKERFILE" ]; then
    error "Dockerfile not found: ${DOCKERFILE}"
    error "Available Dockerfiles:"
    ls -1 Dockerfile* 2>/dev/null | sed 's/^/  /' || echo "  (none found)"
    exit 1
  fi

  # Verify Docker daemon is running
  if ! docker info &>/dev/null; then
    error "Docker daemon is not running. Start Docker and try again."
    exit 1
  fi

  # Build the docker build command
  BUILD_ARGS=()
  BUILD_ARGS+=(--build-arg "VITE_WASM_PYMUPDF_URL=${WASM_PYMUPDF_URL}")
  BUILD_ARGS+=(--build-arg "VITE_WASM_GS_URL=${WASM_GS_URL}")
  BUILD_ARGS+=(--build-arg "VITE_WASM_CPDF_URL=${WASM_CPDF_URL}")
  BUILD_ARGS+=(--build-arg "VITE_TESSERACT_WORKER_URL=${OCR_TESSERACT_WORKER_URL}")
  BUILD_ARGS+=(--build-arg "VITE_TESSERACT_CORE_URL=${OCR_TESSERACT_CORE_URL}")
  BUILD_ARGS+=(--build-arg "VITE_TESSERACT_LANG_URL=${OCR_TESSERACT_LANG_URL}")
  BUILD_ARGS+=(--build-arg "VITE_TESSERACT_AVAILABLE_LANGUAGES=${OCR_LANGUAGES}")
  BUILD_ARGS+=(--build-arg "VITE_OCR_FONT_BASE_URL=${OCR_FONT_BASE_URL}")

  [ -n "$SIMPLE_MODE" ]       && BUILD_ARGS+=(--build-arg "SIMPLE_MODE=${SIMPLE_MODE}")
  [ -n "$BASE_URL" ]          && BUILD_ARGS+=(--build-arg "BASE_URL=${BASE_URL}")
  [ -n "$COMPRESSION_MODE" ]  && BUILD_ARGS+=(--build-arg "COMPRESSION_MODE=${COMPRESSION_MODE}")
  [ -n "$LANGUAGE" ]          && BUILD_ARGS+=(--build-arg "VITE_DEFAULT_LANGUAGE=${LANGUAGE}")
  [ -n "$BRAND_NAME" ]        && BUILD_ARGS+=(--build-arg "VITE_BRAND_NAME=${BRAND_NAME}")
  [ -n "$BRAND_LOGO" ]        && BUILD_ARGS+=(--build-arg "VITE_BRAND_LOGO=${BRAND_LOGO}")
  [ -n "$FOOTER_TEXT" ]        && BUILD_ARGS+=(--build-arg "VITE_FOOTER_TEXT=${FOOTER_TEXT}")

  info "Image name: ${IMAGE_NAME}"
  info "Dockerfile: ${DOCKERFILE}"
  info "WASM URLs:"
  info "  PyMuPDF:     ${WASM_PYMUPDF_URL}"
  info "  Ghostscript: ${WASM_GS_URL}"
  info "  CoherentPDF: ${WASM_CPDF_URL}"
  info "OCR URLs:"
  info "  Worker:      ${OCR_TESSERACT_WORKER_URL}"
  info "  Core:        ${OCR_TESSERACT_CORE_URL}"
  info "  Lang Data:   ${OCR_TESSERACT_LANG_URL}"
  info "  Font Base:   ${OCR_FONT_BASE_URL}"
  info "  Languages:   ${OCR_LANGUAGES}"
  echo ""
  info "Building... this may take a few minutes (npm install + Vite build)."
  echo ""

  docker build -f "$DOCKERFILE" "${BUILD_ARGS[@]}" -t "$IMAGE_NAME" .

  success "Docker image '${IMAGE_NAME}' built successfully"

  # --- Phase 4: Export Docker image ---
  step "Exporting Docker image"

  docker save "$IMAGE_NAME" -o "$OUTPUT_DIR/bentopdf.tar"
  success "Exported: $(filesize "$OUTPUT_DIR/bentopdf.tar")"
fi

# --- Phase 5: Generate setup.sh ---
step "Generating setup script"

cat > "$OUTPUT_DIR/setup.sh" <<SETUP_EOF
#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# BentoPDF Air-Gapped Setup Script
# Generated on $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# BentoPDF v${APP_VERSION}
# ============================================================
# Transfer this entire directory to the air-gapped network,
# then run this script.
# ============================================================

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# --- Check prerequisites ---
if ! command -v docker &>/dev/null; then
  echo "ERROR: docker is required but not found."
  echo "Install Docker first: https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo "ERROR: Docker daemon is not running. Start Docker and try again."
  exit 1
fi

# --- Configuration (baked in at generation time) ---
IMAGE_NAME="${IMAGE_NAME}"
WASM_BASE_URL="${WASM_BASE_URL}"
DOCKER_PORT="\${1:-3000}"

# Where to extract WASM files (override with WASM_EXTRACT_DIR env var)
WASM_DIR="\${WASM_EXTRACT_DIR:-\${SCRIPT_DIR}/wasm}"

echo ""
echo "============================================================"
echo "  BentoPDF Air-Gapped Setup"
echo "  Version: ${APP_VERSION}"
echo "============================================================"
echo ""
echo "  Docker image:  \${IMAGE_NAME}"
echo "  WASM base URL: \${WASM_BASE_URL}"
echo "  WASM extract:  \${WASM_DIR}"
echo "  Port:          \${DOCKER_PORT}"
echo ""

# --- Step 1: Load Docker Image ---
echo "[1/3] Loading Docker image..."
if [ -f "\${SCRIPT_DIR}/bentopdf.tar" ]; then
  docker load -i "\${SCRIPT_DIR}/bentopdf.tar"
  echo "  Docker image '\${IMAGE_NAME}' loaded."
else
  echo "  WARNING: bentopdf.tar not found. Skipping Docker load."
  echo "  Make sure the image '\${IMAGE_NAME}' is already available."
fi

# --- Step 2: Extract WASM Packages ---
echo ""
echo "[2/3] Extracting WASM packages to \${WASM_DIR}..."

mkdir -p "\${WASM_DIR}/pymupdf" "\${WASM_DIR}/gs" "\${WASM_DIR}/cpdf" "\${WASM_DIR}/ocr/core" "\${WASM_DIR}/ocr/lang-data" "\${WASM_DIR}/ocr/fonts"

# PyMuPDF: package has dist/ and assets/ at root
echo "  Extracting PyMuPDF..."
tar xzf "\${SCRIPT_DIR}"/bentopdf-pymupdf-wasm-*.tgz -C "\${WASM_DIR}/pymupdf" --strip-components=1

# Ghostscript: browser expects gs.js and gs.wasm at root
echo "  Extracting Ghostscript..."
TEMP_GS="\$(mktemp -d)"
tar xzf "\${SCRIPT_DIR}"/bentopdf-gs-wasm-*.tgz -C "\${TEMP_GS}"
if [ -d "\${TEMP_GS}/package/assets" ]; then
  cp -r "\${TEMP_GS}/package/assets/"* "\${WASM_DIR}/gs/"
else
  cp -r "\${TEMP_GS}/package/"* "\${WASM_DIR}/gs/"
fi
rm -rf "\${TEMP_GS}"

# CoherentPDF: browser expects coherentpdf.browser.min.js at root
echo "  Extracting CoherentPDF..."
TEMP_CPDF="\$(mktemp -d)"
tar xzf "\${SCRIPT_DIR}"/coherentpdf-*.tgz -C "\${TEMP_CPDF}"
if [ -d "\${TEMP_CPDF}/package/dist" ]; then
  cp -r "\${TEMP_CPDF}/package/dist/"* "\${WASM_DIR}/cpdf/"
else
  cp -r "\${TEMP_CPDF}/package/"* "\${WASM_DIR}/cpdf/"
fi
rm -rf "\${TEMP_CPDF}"

# Tesseract worker: browser expects a single worker.min.js file
echo "  Extracting Tesseract worker..."
TEMP_TESS="\$(mktemp -d)"
tar xzf "\${SCRIPT_DIR}"/tesseract.js-*.tgz -C "\${TEMP_TESS}"
cp "\${TEMP_TESS}/package/dist/worker.min.js" "\${WASM_DIR}/ocr/worker.min.js"
rm -rf "\${TEMP_TESS}"

# Tesseract core: browser expects the full tesseract.js-core directory
echo "  Extracting Tesseract core..."
tar xzf "\${SCRIPT_DIR}"/tesseract.js-core-*.tgz -C "\${WASM_DIR}/ocr/core" --strip-components=1

# OCR language data: copy the bundled traineddata files
echo "  Installing OCR language data..."
cp "\${SCRIPT_DIR}"/tesseract-langdata/*.traineddata.gz "\${WASM_DIR}/ocr/lang-data/"

# OCR fonts: copy the bundled font files for searchable text layer rendering
echo "  Installing OCR fonts..."
cp "\${SCRIPT_DIR}"/ocr-fonts/* "\${WASM_DIR}/ocr/fonts/"

echo "  WASM files extracted to: \${WASM_DIR}"
echo ""
echo "  IMPORTANT: Ensure these paths are served by your internal web server:"
echo "    \${WASM_BASE_URL}/pymupdf/  ->  \${WASM_DIR}/pymupdf/"
echo "    \${WASM_BASE_URL}/gs/       ->  \${WASM_DIR}/gs/"
echo "    \${WASM_BASE_URL}/cpdf/     ->  \${WASM_DIR}/cpdf/"
echo "    \${WASM_BASE_URL}/ocr/worker.min.js  ->  \${WASM_DIR}/ocr/worker.min.js"
echo "    \${WASM_BASE_URL}/ocr/core           ->  \${WASM_DIR}/ocr/core/"
echo "    \${WASM_BASE_URL}/ocr/lang-data      ->  \${WASM_DIR}/ocr/lang-data/"
echo "    \${WASM_BASE_URL}/ocr/fonts          ->  \${WASM_DIR}/ocr/fonts/"

# --- Step 3: Start BentoPDF ---
echo ""
echo "[3/3] Ready to start BentoPDF"
echo ""
echo "  To start manually:"
echo "    docker run -d --name bentopdf -p \${DOCKER_PORT}:8080 --restart unless-stopped \${IMAGE_NAME}"
echo ""
echo "  Then open: http://localhost:\${DOCKER_PORT}"
echo ""

read -r -p "Start BentoPDF now? (y/N): " REPLY
if [[ "\${REPLY:-}" =~ ^[Yy]$ ]]; then
  docker run -d --name bentopdf -p "\${DOCKER_PORT}:8080" --restart unless-stopped "\${IMAGE_NAME}"
  echo ""
  echo "  BentoPDF is running at http://localhost:\${DOCKER_PORT}"
fi
SETUP_EOF

chmod +x "$OUTPUT_DIR/setup.sh"
success "Generated setup.sh"

# --- Phase 6: Generate README ---
step "Generating README"

cat > "$OUTPUT_DIR/README.md" <<README_EOF
# BentoPDF Air-Gapped Deployment Bundle

**BentoPDF v${APP_VERSION}** | Generated on $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Contents

| File | Description |
| --- | --- |
| \`bentopdf.tar\` | Docker image |
| \`bentopdf-pymupdf-wasm-${PYMUPDF_VERSION}.tgz\` | PyMuPDF WASM module |
| \`bentopdf-gs-wasm-${GS_VERSION}.tgz\` | Ghostscript WASM module |
| \`coherentpdf-${CPDF_VERSION}.tgz\` | CoherentPDF WASM module |
| \`tesseract.js-${TESSERACT_VERSION}.tgz\` | Tesseract browser worker package |
| \`tesseract.js-core-${TESSERACT_CORE_VERSION}.tgz\` | Tesseract core runtime package |
| \`tesseract-langdata/\` | OCR language data files (${OCR_LANGUAGES}) |
| \`ocr-fonts/\` | OCR text-layer font files |
| \`setup.sh\` | Automated setup script |
| \`README.md\` | This file |

## WASM Configuration

The Docker image was built with these WASM URLs:

- **PyMuPDF:** \`${WASM_PYMUPDF_URL}\`
- **Ghostscript:** \`${WASM_GS_URL}\`
- **CoherentPDF:** \`${WASM_CPDF_URL}\`
- **OCR Worker:** \`${OCR_TESSERACT_WORKER_URL}\`
- **OCR Core:** \`${OCR_TESSERACT_CORE_URL}\`
- **OCR Lang Data:** \`${OCR_TESSERACT_LANG_URL}\`
- **OCR Font Base:** \`${OCR_FONT_BASE_URL}\`

Bundled OCR languages: **${OCR_LANGUAGES}**

Bundled OCR fonts:

$(printf '%s\n' "$OCR_FONT_MANIFEST_RAW" | awk -F '\t' 'NF >= 3 { printf "- **%s** -> `%s`\n", $1, $3 }')

These URLs are baked into the app at build time. The user's browser fetches
WASM files from these URLs at runtime.

## Quick Setup

Transfer this entire directory to the air-gapped network, then:

\`\`\`bash
bash setup.sh
\`\`\`

The setup script will:
1. Load the Docker image
2. Extract WASM packages to \`./wasm/\` (override with \`WASM_EXTRACT_DIR\`)
3. Optionally start the BentoPDF container

## Manual Setup

### 1. Load the Docker image

\`\`\`bash
docker load -i bentopdf.tar
\`\`\`

### 2. Extract WASM packages

Extract to your internal web server's document root:

\`\`\`bash
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts

# PyMuPDF
tar xzf bentopdf-pymupdf-wasm-${PYMUPDF_VERSION}.tgz -C ./wasm/pymupdf --strip-components=1

# Ghostscript (extract assets/ to root)
TEMP_GS=\$(mktemp -d)
tar xzf bentopdf-gs-wasm-${GS_VERSION}.tgz -C \$TEMP_GS
cp -r \$TEMP_GS/package/assets/* ./wasm/gs/
rm -rf \$TEMP_GS

# CoherentPDF (extract dist/ to root)
TEMP_CPDF=\$(mktemp -d)
tar xzf coherentpdf-${CPDF_VERSION}.tgz -C \$TEMP_CPDF
cp -r \$TEMP_CPDF/package/dist/* ./wasm/cpdf/
rm -rf \$TEMP_CPDF

# Tesseract worker
TEMP_TESS=\$(mktemp -d)
tar xzf tesseract.js-${TESSERACT_VERSION}.tgz -C \$TEMP_TESS
cp \$TEMP_TESS/package/dist/worker.min.js ./wasm/ocr/worker.min.js
rm -rf \$TEMP_TESS

# Tesseract core
tar xzf tesseract.js-core-${TESSERACT_CORE_VERSION}.tgz -C ./wasm/ocr/core --strip-components=1

# OCR language data
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/

# OCR fonts
cp ./ocr-fonts/* ./wasm/ocr/fonts/
\`\`\`

### 3. Configure your web server

Ensure these paths are accessible at the configured URLs:

| URL | Serves From |
| --- | --- |
| \`${WASM_PYMUPDF_URL}\` | \`./wasm/pymupdf/\` |
| \`${WASM_GS_URL}\` | \`./wasm/gs/\` |
| \`${WASM_CPDF_URL}\` | \`./wasm/cpdf/\` |
| \`${OCR_TESSERACT_WORKER_URL}\` | \`./wasm/ocr/worker.min.js\` |
| \`${OCR_TESSERACT_CORE_URL}\` | \`./wasm/ocr/core/\` |
| \`${OCR_TESSERACT_LANG_URL}\` | \`./wasm/ocr/lang-data/\` |
| \`${OCR_FONT_BASE_URL}\` | \`./wasm/ocr/fonts/\` |

### 4. Run BentoPDF

\`\`\`bash
docker run -d --name bentopdf -p 3000:8080 --restart unless-stopped ${IMAGE_NAME}
\`\`\`

Open: http://localhost:3000
README_EOF

success "Generated README.md"

# --- Phase 7: Summary ---
step "Bundle complete"

echo ""
echo -e "${BOLD}  Output: ${OUTPUT_DIR}${NC}"
echo ""
echo "  Files:"
for f in "$OUTPUT_DIR"/*; do
  fname=$(basename "$f")
  fsize=$(filesize "$f")
  echo "    ${fname}  (${fsize})"
done

echo ""
echo -e "${BOLD}  Next steps:${NC}"
echo "    1. Transfer the '$(basename "$OUTPUT_DIR")' directory to the air-gapped network"
echo "    2. Run: bash setup.sh"
echo "    3. Configure your internal web server to serve the WASM files"
echo ""
success "Done!"
