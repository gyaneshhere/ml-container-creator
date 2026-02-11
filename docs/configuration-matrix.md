# Configuration Matrix

This document lists all valid configuration combinations supported by the ML Container Creator generator.

## Framework Compatibility Matrix

| Framework | Model Servers | Model Formats | Instance Types | Deploy Targets |
|-----------|--------------|---------------|----------------|----------------|
| sklearn | flask, fastapi | pkl, joblib | cpu-optimized, gpu-enabled, custom | sagemaker, codebuild |
| xgboost | flask, fastapi | json, model, ubj | cpu-optimized, gpu-enabled, custom | sagemaker, codebuild |
| tensorflow | flask, fastapi | keras, h5, SavedModel | cpu-optimized, gpu-enabled, custom | sagemaker, codebuild |
| transformers | vllm, sglang, tensorrt-llm, lmi, djl | N/A | gpu-enabled, custom | sagemaker, codebuild |

## Valid Configuration Combinations

### Traditional ML (sklearn, xgboost, tensorflow)

All traditional ML frameworks support:
- **Model Servers**: Flask, FastAPI
- **Instance Types**: CPU-optimized (recommended), GPU-enabled, custom
- **Deploy Targets**: SageMaker, CodeBuild

#### scikit-learn Configurations

1. **sklearn + Flask + pkl + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=sklearn --model-server=flask --model-format=pkl \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

2. **sklearn + Flask + joblib + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=sklearn --model-server=flask --model-format=joblib \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

3. **sklearn + FastAPI + pkl + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=sklearn --model-server=fastapi --model-format=pkl \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

4. **sklearn + FastAPI + joblib + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=sklearn --model-server=fastapi --model-format=joblib \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

#### XGBoost Configurations

5. **xgboost + Flask + json + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=xgboost --model-server=flask --model-format=json \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

6. **xgboost + Flask + model + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=xgboost --model-server=flask --model-format=model \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

7. **xgboost + Flask + ubj + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=xgboost --model-server=flask --model-format=ubj \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

8. **xgboost + FastAPI + json + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=xgboost --model-server=fastapi --model-format=json \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

9. **xgboost + FastAPI + model + CPU + SageMaker**
   ```bash
   yo ml-container-creator --skip-prompts \
     --framework=xgboost --model-server=fastapi --model-format=model \
     --instance-type=cpu-optimized --deploy-target=sagemaker
   ```

10. **xgboost + FastAPI + ubj + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=xgboost --model-server=fastapi --model-format=ubj \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

#### TensorFlow Configurations

11. **tensorflow + Flask + keras + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=flask --model-format=keras \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

12. **tensorflow + Flask + h5 + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=flask --model-format=h5 \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

13. **tensorflow + Flask + SavedModel + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=flask --model-format=SavedModel \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

14. **tensorflow + FastAPI + keras + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=fastapi --model-format=keras \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

15. **tensorflow + FastAPI + h5 + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=fastapi --model-format=h5 \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

16. **tensorflow + FastAPI + SavedModel + CPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=tensorflow --model-server=fastapi --model-format=SavedModel \
      --instance-type=cpu-optimized --deploy-target=sagemaker
    ```

### Transformers (LLMs)

Transformer models require:
- **Model Servers**: vLLM, SGLang, TensorRT-LLM, LMI, DJL
- **Instance Types**: GPU-enabled (required), custom
- **Deploy Targets**: SageMaker, CodeBuild
- **Model Name**: Hugging Face model ID (e.g., "TinyLlama/TinyLlama-1.1B-Chat-v1.0")

#### Transformer Configurations

17. **transformers + vLLM + GPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=transformers --model-server=vllm \
      --model-name="TinyLlama/TinyLlama-1.1B-Chat-v1.0" \
      --instance-type=gpu-enabled --deploy-target=sagemaker
    ```

18. **transformers + SGLang + GPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=transformers --model-server=sglang \
      --model-name="TinyLlama/TinyLlama-1.1B-Chat-v1.0" \
      --instance-type=gpu-enabled --deploy-target=sagemaker
    ```

19. **transformers + TensorRT-LLM + GPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=transformers --model-server=tensorrt-llm \
      --model-name="TinyLlama/TinyLlama-1.1B-Chat-v1.0" \
      --instance-type=gpu-enabled --deploy-target=sagemaker
    ```

20. **transformers + LMI + GPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=transformers --model-server=lmi \
      --model-name="TinyLlama/TinyLlama-1.1B-Chat-v1.0" \
      --instance-type=gpu-enabled --deploy-target=sagemaker
    ```

21. **transformers + DJL + GPU + SageMaker**
    ```bash
    yo ml-container-creator --skip-prompts \
      --framework=transformers --model-server=djl \
      --model-name="TinyLlama/TinyLlama-1.1B-Chat-v1.0" \
      --instance-type=gpu-enabled --deploy-target=sagemaker
    ```

## CodeBuild Deployment Variations

All configurations above can also use CodeBuild as the deploy target:

```bash
# Example: sklearn with CodeBuild
yo ml-container-creator --skip-prompts \
  --framework=sklearn --model-server=flask --model-format=pkl \
  --instance-type=cpu-optimized --deploy-target=codebuild \
  --codebuild-compute-type=BUILD_GENERAL1_MEDIUM
```

CodeBuild compute types:
- `BUILD_GENERAL1_SMALL` - 3 GB memory, 2 vCPUs
- `BUILD_GENERAL1_MEDIUM` - 7 GB memory, 4 vCPUs
- `BUILD_GENERAL1_LARGE` - 15 GB memory, 8 vCPUs

## Optional Modules

All configurations support these optional modules:

### Sample Model
```bash
--include-sample=true
```
Includes training code and sample data (not available for transformers).

### Testing
```bash
--include-testing=true \
--test-types="local-model-cli,local-model-server,hosted-model-endpoint"
```

Test types:
- `local-model-cli` - Test model loading directly
- `local-model-server` - Test local Docker container
- `hosted-model-endpoint` - Test deployed SageMaker endpoint

## Total Configuration Count

### Traditional ML
- 3 frameworks × 2 model servers × (2-3 formats) × 2 deploy targets = **36 configurations**

### Transformers
- 1 framework × 5 model servers × 2 deploy targets = **10 configurations**

### Total: **46 base configurations**

With optional modules (sample model, testing) and CodeBuild compute types, the total number of possible combinations exceeds **200**.

## Recommended Test Coverage

For comprehensive testing, we recommend testing these representative configurations:

### Minimum Coverage (6 configs)
1. sklearn + Flask + pkl + CPU + SageMaker
2. xgboost + FastAPI + json + CPU + SageMaker
3. tensorflow + Flask + SavedModel + CPU + SageMaker
4. transformers + vLLM + GPU + SageMaker
5. sklearn + Flask + pkl + CPU + CodeBuild
6. transformers + SGLang + GPU + SageMaker

### Standard Coverage (12 configs)
Add to minimum:
7. sklearn + FastAPI + joblib + CPU + SageMaker
8. xgboost + Flask + ubj + CPU + SageMaker
9. tensorflow + FastAPI + h5 + CPU + SageMaker
10. transformers + TensorRT-LLM + GPU + SageMaker
11. xgboost + FastAPI + json + CPU + CodeBuild
12. transformers + LMI + GPU + SageMaker

### Full Coverage (24+ configs)
Test all combinations of:
- Each framework with each supported model server
- At least one model format per framework
- Both SageMaker and CodeBuild deployment
- With and without optional modules

## Configuration Constraints

### Invalid Combinations

These combinations are **not supported**:

❌ **transformers + Flask** - Transformers require specialized serving (vLLM, SGLang, etc.)
❌ **transformers + FastAPI** - Transformers require specialized serving
❌ **transformers + CPU** - Transformers require GPU instances
❌ **TensorRT-LLM + sklearn** - TensorRT-LLM only works with transformers
❌ **vLLM + xgboost** - vLLM only works with transformers
❌ **SGLang + tensorflow** - SGLang only works with transformers

### Validation

The generator validates configurations and will show an error if you try an invalid combination:

```bash
yo ml-container-creator --skip-prompts \
  --framework=sklearn --model-server=vllm
# Error: Unsupported model server 'vllm' for framework 'sklearn'
```

## AWS Region Support

All configurations work in these AWS regions:
- us-east-1, us-east-2, us-west-1, us-west-2
- eu-west-1, eu-west-2, eu-central-1, eu-north-1
- ap-southeast-1, ap-southeast-2, ap-northeast-1
- ca-central-1, sa-east-1

Note: GPU instance availability varies by region. Check [AWS SageMaker instance types](https://aws.amazon.com/sagemaker/pricing/) for regional availability.

## Instance Type Recommendations

### CPU-Optimized (Traditional ML)
- **ml.m5.xlarge** - Small models, low traffic
- **ml.m5.2xlarge** - Medium models, moderate traffic
- **ml.c5.2xlarge** - Compute-intensive models

### GPU-Enabled (Transformers)
- **ml.g4dn.xlarge** - Small models (< 7B parameters)
- **ml.g5.2xlarge** - Medium models (7B-13B parameters)
- **ml.g5.12xlarge** - Large models (13B-30B parameters)
- **ml.p4d.24xlarge** - Very large models (> 30B parameters)

## See Also

- [Integration Testing Guide](integration-testing.md) - How to test configurations
- [Getting Started](getting-started.md) - Basic usage guide
- [Configuration Guide](configuration.md) - Detailed configuration options
