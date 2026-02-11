#!/bin/bash

# Script to generate badge markdown for README
# Usage: ./scripts/generate-badge-markdown.sh [USERNAME] [REPO]
#   If no args provided, auto-detects from git remote

set -e

# Auto-detect from git remote if not provided
if [ $# -eq 0 ]; then
    REPO_URL=$(git config --get remote.origin.url)
    if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/.]+) ]]; then
        USERNAME="${BASH_REMATCH[1]}"
        REPO="${BASH_REMATCH[2]}"
        echo "Auto-detected: $USERNAME/$REPO"
        echo ""
    else
        echo "Usage: $0 <github-username> <github-repo>"
        echo "Example: $0 awslabs ml-container-creator"
        exit 1
    fi
elif [ $# -ne 2 ]; then
    echo "Usage: $0 <github-username> <github-repo>"
    echo "Example: $0 awslabs ml-container-creator"
    exit 1
else
    USERNAME=$1
    REPO=$2
fi

BASE_URL="https://${USERNAME}.github.io/${REPO}/badges"

echo "# Configuration Status Badges"
echo ""
echo "Copy and paste this into your README.md:"
echo ""
echo "## Configuration Status"
echo ""
echo "### Quick Tests"
echo "![sklearn-flask-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/sklearn-flask-cpu.json)"
echo "![xgboost-fastapi-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/xgboost-fastapi-cpu.json)"
echo ""
echo "### Traditional ML - scikit-learn"
echo "![sklearn-flask-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/sklearn-flask-cpu.json)"
echo "![sklearn-fastapi-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/sklearn-fastapi-cpu.json)"
echo ""
echo "### Traditional ML - XGBoost"
echo "![xgboost-flask-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/xgboost-flask-cpu.json)"
echo "![xgboost-fastapi-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/xgboost-fastapi-cpu.json)"
echo ""
echo "### Traditional ML - TensorFlow"
echo "![tensorflow-flask-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/tensorflow-flask-cpu.json)"
echo "![tensorflow-fastapi-cpu](https://img.shields.io/endpoint?url=${BASE_URL}/tensorflow-fastapi-cpu.json)"
echo ""
echo "### Transformers"
echo "![transformers-vllm-gpu](https://img.shields.io/endpoint?url=${BASE_URL}/transformers-vllm-gpu.json)"
echo "![transformers-sglang-gpu](https://img.shields.io/endpoint?url=${BASE_URL}/transformers-sglang-gpu.json)"
echo ""
echo "---"
echo ""
echo "Or as a table:"
echo ""
echo "| Framework | Flask | FastAPI | vLLM | SGLang |"
echo "|-----------|-------|---------|------|--------|"
echo "| scikit-learn | ![](https://img.shields.io/endpoint?url=${BASE_URL}/sklearn-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=${BASE_URL}/sklearn-fastapi-cpu.json) | N/A | N/A |"
echo "| XGBoost | ![](https://img.shields.io/endpoint?url=${BASE_URL}/xgboost-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=${BASE_URL}/xgboost-fastapi-cpu.json) | N/A | N/A |"
echo "| TensorFlow | ![](https://img.shields.io/endpoint?url=${BASE_URL}/tensorflow-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=${BASE_URL}/tensorflow-fastapi-cpu.json) | N/A | N/A |"
echo "| Transformers | N/A | N/A | ![](https://img.shields.io/endpoint?url=${BASE_URL}/transformers-vllm-gpu.json) | ![](https://img.shields.io/endpoint?url=${BASE_URL}/transformers-sglang-gpu.json) |"
