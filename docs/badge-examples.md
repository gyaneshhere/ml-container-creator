# Badge Examples

This document shows examples of how to display configuration status badges in your README.

## Simple List Format

```markdown
## Configuration Status

### Traditional ML
- scikit-learn + Flask: ![sklearn-flask-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json)
- scikit-learn + FastAPI: ![sklearn-fastapi-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-fastapi-cpu.json)
- XGBoost + Flask: ![xgboost-flask-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-flask-cpu.json)
- XGBoost + FastAPI: ![xgboost-fastapi-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-fastapi-cpu.json)
- TensorFlow + Flask: ![tensorflow-flask-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-flask-cpu.json)
- TensorFlow + FastAPI: ![tensorflow-fastapi-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-fastapi-cpu.json)

### Transformers
- vLLM: ![transformers-vllm-gpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-vllm-gpu.json)
- SGLang: ![transformers-sglang-gpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-sglang-gpu.json)
```

## Table Format

```markdown
## Configuration Status

| Framework | Flask | FastAPI | vLLM | SGLang |
|-----------|-------|---------|------|--------|
| scikit-learn | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-fastapi-cpu.json) | N/A | N/A |
| XGBoost | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-fastapi-cpu.json) | N/A | N/A |
| TensorFlow | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-flask-cpu.json) | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-fastapi-cpu.json) | N/A | N/A |
| Transformers | N/A | N/A | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-vllm-gpu.json) | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-sglang-gpu.json) |
```

## Grouped by Framework

```markdown
## Configuration Status

### scikit-learn
![Flask + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json)
![FastAPI + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-fastapi-cpu.json)

### XGBoost
![Flask + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-flask-cpu.json)
![FastAPI + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-fastapi-cpu.json)

### TensorFlow
![Flask + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-flask-cpu.json)
![FastAPI + CPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-fastapi-cpu.json)

### Transformers
![vLLM + GPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-vllm-gpu.json)
![SGLang + GPU](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-sglang-gpu.json)
```

## Compact Format

```markdown
## Configuration Status

**Traditional ML:** 
![sklearn-flask](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json)
![sklearn-fastapi](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-fastapi-cpu.json)
![xgboost-flask](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-flask-cpu.json)
![xgboost-fastapi](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-fastapi-cpu.json)
![tensorflow-flask](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-flask-cpu.json)
![tensorflow-fastapi](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-fastapi-cpu.json)

**Transformers:** 
![vllm](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-vllm-gpu.json)
![sglang](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-sglang-gpu.json)
```

## With Descriptions

```markdown
## Configuration Status

These badges show the current build/deploy/test status for each configuration:

| Configuration | Status | Description |
|---------------|--------|-------------|
| sklearn + Flask | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json) | scikit-learn with Flask on CPU instances |
| sklearn + FastAPI | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-fastapi-cpu.json) | scikit-learn with FastAPI on CPU instances |
| xgboost + Flask | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-flask-cpu.json) | XGBoost with Flask on CPU instances |
| xgboost + FastAPI | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/xgboost-fastapi-cpu.json) | XGBoost with FastAPI on CPU instances |
| tensorflow + Flask | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-flask-cpu.json) | TensorFlow with Flask on CPU instances |
| tensorflow + FastAPI | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/tensorflow-fastapi-cpu.json) | TensorFlow with FastAPI on CPU instances |
| transformers + vLLM | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-vllm-gpu.json) | Transformers with vLLM on GPU instances |
| transformers + SGLang | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/transformers-sglang-gpu.json) | Transformers with SGLang on GPU instances |
```

## Badge Colors

Badges will automatically show:
- 🟢 **Green "passing"** - Build, deploy, and test all succeeded
- 🔴 **Red "failing"** - One or more steps failed
- 🟡 **Yellow "unknown"** - Test hasn't run yet or status unclear

## Generating Badge Markdown

Use the helper script to generate badge markdown for your repository:

```bash
./scripts/generate-badge-markdown.sh YOUR_USERNAME YOUR_REPO
```

This will output ready-to-paste markdown for your README.

## Example Output

Here's what the badges look like when rendered:

### Passing Configuration
![sklearn-flask-cpu](https://img.shields.io/badge/sklearn--flask--cpu-passing-brightgreen)

### Failing Configuration
![xgboost-flask-cpu](https://img.shields.io/badge/xgboost--flask--cpu-failing-red)

### Unknown Status
![tensorflow-flask-cpu](https://img.shields.io/badge/tensorflow--flask--cpu-unknown-yellow)

## Customizing Badge Appearance

You can customize badges by modifying the JSON files in the `gh-pages` branch:

```json
{
  "schemaVersion": 1,
  "label": "sklearn-flask-cpu",
  "message": "passing",
  "color": "brightgreen",
  "namedLogo": "amazon-aws",
  "logoColor": "white"
}
```

Available customizations:
- `label` - Left side text
- `message` - Right side text
- `color` - Badge color (brightgreen, red, yellow, blue, etc.)
- `namedLogo` - Add a logo (see [shields.io logos](https://simpleicons.org/))
- `logoColor` - Logo color
- `style` - Badge style (flat, flat-square, plastic, for-the-badge, social)

## Linking Badges to Workflow

Make badges clickable to view the workflow run:

```markdown
[![sklearn-flask-cpu](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/integration-tests.yml)
```

## Adding Last Updated Timestamp

Show when badges were last updated:

```markdown
## Configuration Status

Last updated: ![](https://img.shields.io/github/last-commit/YOUR_USERNAME/YOUR_REPO/gh-pages?label=)

| Configuration | Status |
|---------------|--------|
| sklearn + Flask | ![](https://img.shields.io/endpoint?url=https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json) |
```

## Tips

1. **Keep it simple** - Don't overwhelm users with too many badges
2. **Group logically** - Organize by framework or use case
3. **Add context** - Explain what the badges mean
4. **Link to docs** - Point to integration testing docs for details
5. **Update regularly** - Run tests frequently to keep badges current
