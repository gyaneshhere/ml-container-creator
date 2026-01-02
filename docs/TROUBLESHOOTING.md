# Troubleshooting Guide

Common issues and solutions for ML Container Creator.

## Quick Reference - Most Common Issues

| Issue | Quick Fix |
|-------|-----------|
| `SyntaxError: Unexpected token 'export'` | `nvm use node` |
| `yo: command not found` | `npm install -g yo@latest` |
| Test script hanging | Run with `--verbose`, check directory isolation |
| ESLint errors | `npm run lint -- --fix` |
| npm audit failing CI | Only fail on critical: `npm audit --audit-level critical` |
| Property tests failing | Run from project root directory |
| Generator not found | `npm link` in project directory |

## Table of Contents

- [Generator Issues](#generator-issues)
- [Development & Testing Issues](#development--testing-issues)
- [CI/CD Issues](#cicd-issues)
- [Docker Build Issues](#docker-build-issues)
- [Local Testing Issues](#local-testing-issues)
- [AWS Deployment Issues](#aws-deployment-issues)
- [SageMaker Endpoint Issues](#sagemaker-endpoint-issues)
- [Model Loading Issues](#model-loading-issues)
- [Performance Issues](#performance-issues)

---

## Generator Issues

### Generator Not Found

**Symptom:**
```bash
$ yo ml-container-creator
Error: ml-container-creator generator not found
```

**Solution:**
```bash
# Link the generator
cd ml-container-creator
npm link

# Verify it's linked
npm list -g generator-ml-container-creator

# If still not working, reinstall Yeoman
npm install -g yo
```

### Node Version Error

**Symptom:**
```bash
Error: The engine "node" is incompatible with this module
# OR
SyntaxError: Unexpected token 'export'
# OR  
SyntaxError: Cannot use import statement outside a module
```

**Solution:**
```bash
# Check Node version
node --version

# Must be 24.11.1 or higher for ES6 module support
# Install correct version using nvm
nvm install node  # Gets latest stable
nvm use node

# Or use mise
mise install

# Pro tip: When encountering ES6 import/export errors, 
# this is usually a Node.js version compatibility issue
```

### Template Variables Not Replaced

**Symptom:**
Generated files contain `<%= projectName %>` instead of actual values.

**Solution:**
- Check that templates use `.ejs` extension or are in templates directory
- Verify `copyTpl` is used, not `copy`
- Check for EJS syntax errors in templates

### Yeoman Generator Not Working in CI

**Symptom:**
```bash
yo: command not found
# OR
generator-ml-container-creator not found
```

**Solution:**
```bash
# Install Yeoman globally in CI
npm install -g yo@latest

# Link the generator
npm link

# Verify installation
yo --version
yo --generators
```

---

## Development & Testing Issues

### ESLint Errors After Changes

**Symptom:**
```bash
✖ 9552 problems (9552 errors, 0 warnings)
```

**Solution:**
```bash
# Auto-fix formatting issues
npm run lint -- --fix

# Check what files are being linted
npx eslint --debug generators/

# Update .eslintrc.js ignore patterns for generated files
"ignorePatterns": [
    "site/**",
    "drafts/**", 
    "test-output-*/**"
]

# For unused variables, either use them or prefix with underscore
const _unusedVar = something;  // Indicates intentionally unused
```

### Test Script Hanging

**Symptom:**
Test scripts hang indefinitely on certain steps

**Solution:**
```bash
# Run with verbose output to see where it hangs
./scripts/test-generate-projects.sh --verbose

# Common causes:
# 1. Directory conflicts - each test should run in isolated directory
# 2. Property tests running from wrong directory - need project root
# 3. Environment variables not cleaned up between tests

# Fix: Ensure each test creates its own subdirectory
mkdir -p "test-$test_name"
cd "test-$test_name"
# ... run test ...
cd ..
```

### Property-Based Tests Failing

**Symptom:**
```bash
npm run test:property
Error: Cannot find module './test/property-tests.js'
```

**Solution:**
```bash
# Property tests must run from project root directory
cd /path/to/project/root
npm run test:property

# In scripts, store and use project root:
PROJECT_ROOT="$(pwd)"
cd "$PROJECT_ROOT"
npm run test:property
```

### Test Output Directory Conflicts

**Symptom:**
Tests fail because previous test files interfere with new tests

**Solution:**
```bash
# Use timestamped directories
TEST_OUTPUT_DIR="./test-output-$(date +%Y%m%d-%H%M%S)"

# Clean up between test runs
rm -rf test-output-*

# Or keep output for debugging
KEEP_TEST_OUTPUT=true ./scripts/test-generate-projects.sh
```

---

## CI/CD Issues

### npm Security Audit Failures

**Symptom:**
```bash
npm audit
found 11 vulnerabilities (8 moderate, 3 high)
```

**Solution:**
```bash
# Option 1: Use npm overrides in package.json
"overrides": {
  "semver": "^7.6.3",
  "path-to-regexp": "^8.0.0"
}

# Option 2: Only fail on critical vulnerabilities
npm audit --audit-level critical

# Option 3: Update dependencies
npm update
npm audit fix
```

### npm Cache Issues in CI

**Symptom:**
```bash
Error: EACCES: permission denied, mkdir '/github/home/.npm'
```

**Solution:**
```bash
# Remove npm cache configuration if package-lock.json is gitignored
# Don't use: npm ci --cache .npm

# Use standard npm install instead
npm install

# Or configure cache properly
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### CI Failing on Moderate Vulnerabilities

**Symptom:**
CI fails even though vulnerabilities are not critical

**Solution:**
```yaml
# In .github/workflows/ci.yml
# Only fail on critical vulnerabilities
- name: Security audit
  run: |
    if ! npm audit --audit-level critical; then
      echo "Critical vulnerabilities found!"
      exit 1
    fi
    
    # Show all vulnerabilities but don't fail
    npm audit || true
```

### Yeoman Installation in CI

**Symptom:**
```bash
yo: command not found in CI
```

**Solution:**
```yaml
# Install Yeoman before testing
- name: Install Yeoman
  run: npm install -g yo@latest

- name: Link generator
  run: npm link

- name: Test generator
  run: yo ml-container-creator --help
```

### ESLint Failing in CI

**Symptom:**
CI fails on linting errors that pass locally

**Solution:**
```bash
# Ensure consistent Node.js version
# Use same version in CI as locally

# Update .eslintrc.js with proper ignore patterns
"ignorePatterns": [
    "node_modules/**",
    "site/**",
    "drafts/**",
    "test-output-*/**"
]

# Run lint with --fix in CI if needed
npm run lint -- --fix
```

---

## Docker Build Issues

### Build Fails: Package Not Found

**Symptom:**
```bash
ERROR: Could not find a version that satisfies the requirement scikit-learn
```

**Solution:**
```bash
# Update requirements.txt with specific versions
scikit-learn==1.3.0
numpy==1.24.0

# Or use --no-cache-dir
docker build --no-cache -t my-model .
```

### Build Fails: Permission Denied

**Symptom:**
```bash
ERROR: failed to solve: failed to copy files: failed to copy: permission denied
```

**Solution:**
```bash
# Check file permissions
ls -la code/

# Fix permissions
chmod 644 code/*
chmod 755 code/*.sh

# Rebuild
docker build -t my-model .
```

### Build Fails: Model File Too Large

**Symptom:**
```bash
ERROR: failed to copy: file too large
```

**Solution:**
```bash
# Option 1: Use .dockerignore
echo "*.pyc" >> .dockerignore
echo "__pycache__" >> .dockerignore
echo "*.log" >> .dockerignore

# Option 2: Use multi-stage build
# Edit Dockerfile to copy only necessary files

# Option 3: Download model at runtime from S3
# (Recommended for large transformer models)
```

---

## Local Testing Issues

### Container Won't Start

**Symptom:**
```bash
$ docker run -p 8080:8080 my-model
Container exits immediately
```

**Solution:**
```bash
# Check container logs
docker logs <container-id>

# Run interactively to debug
docker run -it my-model /bin/bash

# Check if model file exists
ls -la /opt/ml/model/

# Check Python imports
python -c "import flask; import sklearn"
```

### Port Already in Use

**Symptom:**
```bash
Error: bind: address already in use
```

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
docker run -p 8081:8080 my-model
```

### Health Check Fails

**Symptom:**
```bash
$ curl http://localhost:8080/ping
curl: (7) Failed to connect to localhost port 8080
```

**Solution:**
```bash
# Check if container is running
docker ps

# Check container logs
docker logs <container-id>

# Verify server is listening
docker exec <container-id> netstat -tlnp | grep 8080

# Check firewall rules
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw status
```

### Inference Returns Error

**Symptom:**
```bash
$ curl -X POST http://localhost:8080/invocations -d '{"instances": [[1,2,3]]}'
{"error": "Model prediction failed"}
```

**Solution:**
```bash
# Check container logs for detailed error
docker logs <container-id>

# Common issues:
# 1. Wrong input format
curl -X POST http://localhost:8080/invocations \
  -H "Content-Type: application/json" \
  -d '{"instances": [[1.0, 2.0, 3.0]]}'

# 2. Missing features
# Ensure input has same number of features as training data

# 3. Wrong data type
# Convert strings to numbers, handle missing values

# Test model handler directly
docker exec -it <container-id> python
>>> from code.model_handler import ModelHandler
>>> handler = ModelHandler('/opt/ml/model')
>>> handler.predict([[1.0, 2.0, 3.0]])
```

---

## AWS Deployment Issues

### ECR Repository Not Found

**Symptom:**
```bash
Error: Repository does not exist
```

**Solution:**
```bash
# Create ECR repository
aws ecr create-repository --repository-name my-model

# Or let build_and_push.sh create it
./deploy/build_and_push.sh
```

### Authentication Failed

**Symptom:**
```bash
Error: no basic auth credentials
```

**Solution:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Verify AWS credentials
aws sts get-caller-identity

# Check AWS CLI configuration
aws configure list
```

### IAM Permission Denied

**Symptom:**
```bash
Error: User is not authorized to perform: ecr:CreateRepository
```

**Solution:**
```bash
# Check your IAM permissions
aws iam get-user

# Required permissions:
# - ecr:CreateRepository
# - ecr:PutImage
# - ecr:InitiateLayerUpload
# - ecr:UploadLayerPart
# - ecr:CompleteLayerUpload
# - sagemaker:CreateModel
# - sagemaker:CreateEndpointConfig
# - sagemaker:CreateEndpoint
# - iam:PassRole

# Contact your AWS administrator to add permissions
```

### Image Push Timeout

**Symptom:**
```bash
Error: timeout while pushing image
```

**Solution:**
```bash
# Check internet connection
ping aws.amazon.com

# Increase Docker timeout
export DOCKER_CLIENT_TIMEOUT=300
export COMPOSE_HTTP_TIMEOUT=300

# Use faster network or retry
./deploy/build_and_push.sh
```

---

## SageMaker Endpoint Issues

### Endpoint Creation Failed

**Symptom:**
```bash
Error: Failed to create endpoint
Status: Failed
```

**Solution:**
```bash
# Check CloudWatch logs
aws logs tail /aws/sagemaker/Endpoints/my-model --follow

# Common issues:
# 1. Invalid IAM role
aws iam get-role --role-name SageMakerExecutionRole

# 2. Image not found in ECR
aws ecr describe-images --repository-name my-model

# 3. Insufficient capacity
# Try different instance type or region

# 4. Model artifacts not accessible
# Check S3 permissions in IAM role
```

### Endpoint Stuck in Creating

**Symptom:**
```bash
$ aws sagemaker describe-endpoint --endpoint-name my-model
Status: Creating (for > 15 minutes)
```

**Solution:**
```bash
# Check CloudWatch logs for errors
aws logs tail /aws/sagemaker/Endpoints/my-model --follow

# Common causes:
# 1. Container fails to start
#    - Check Dockerfile CMD/ENTRYPOINT
#    - Verify port 8080 is exposed

# 2. Health check fails
#    - Ensure /ping endpoint returns 200
#    - Check response time < 2 seconds

# 3. Model loading fails
#    - Verify model file exists in container
#    - Check model format matches code

# Delete and recreate if stuck
aws sagemaker delete-endpoint --endpoint-name my-model
./deploy/deploy.sh <role-arn>
```

### Endpoint Returns 500 Error

**Symptom:**
```bash
$ aws sagemaker-runtime invoke-endpoint --endpoint-name my-model ...
ModelError: An error occurred (ModelError) when calling the InvokeEndpoint operation
```

**Solution:**
```bash
# Check CloudWatch logs
aws logs tail /aws/sagemaker/Endpoints/my-model --follow

# Common causes:
# 1. Exception in prediction code
#    - Add try/except blocks
#    - Log detailed errors

# 2. Wrong input format
#    - Verify Content-Type header
#    - Check JSON structure

# 3. Model not loaded
#    - Check model loading in __init__
#    - Verify model path

# Test locally first
docker run -p 8080:8080 my-model
curl -X POST http://localhost:8080/invocations -d '...'
```

### Endpoint Throttling

**Symptom:**
```bash
Error: Rate exceeded
```

**Solution:**
```bash
# Increase instance count
aws sagemaker update-endpoint \
  --endpoint-name my-model \
  --endpoint-config-name my-model-config-v2

# Or enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace sagemaker \
  --resource-id endpoint/my-model/variant/AllTraffic \
  --scalable-dimension sagemaker:variant:DesiredInstanceCount \
  --min-capacity 1 \
  --max-capacity 5
```

---

## Model Loading Issues

### Model File Not Found

**Symptom:**
```python
FileNotFoundError: [Errno 2] No such file or directory: '/opt/ml/model/model.pkl'
```

**Solution:**
```bash
# Verify model file is in code/ directory
ls -la code/

# Check Dockerfile COPY command
grep "COPY.*model" Dockerfile

# Verify model is in container
docker run my-model ls -la /opt/ml/model/

# For transformers, check S3 path
aws s3 ls s3://my-bucket/models/
```

### Model Format Mismatch

**Symptom:**
```python
ValueError: Model format not recognized
```

**Solution:**
```python
# Verify model format matches code
# sklearn: .pkl or .joblib
# xgboost: .json, .model, or .ubj
# tensorflow: SavedModel directory or .h5

# Re-save model in correct format
import joblib
joblib.dump(model, 'model.pkl')

# Or update model_handler.py to match your format
```

### Pickle Version Mismatch

**Symptom:**
```python
ValueError: unsupported pickle protocol: 5
```

**Solution:**
```python
# Save model with compatible protocol
import pickle
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f, protocol=4)

# Or update Python version in Dockerfile
FROM python:3.9  # Use same version as training
```

### Model Dependencies Missing

**Symptom:**
```python
ModuleNotFoundError: No module named 'xgboost'
```

**Solution:**
```bash
# Add missing dependencies to requirements.txt
echo "xgboost==1.7.0" >> requirements.txt

# Rebuild container
docker build -t my-model .

# Verify dependencies
docker run my-model pip list
```

---

## Performance Issues

### Slow Inference

**Symptom:**
Predictions take > 1 second for simple models

**Solution:**
```python
# 1. Load model once at startup, not per request
class ModelHandler:
    def __init__(self):
        self.model = load_model()  # Load once
    
    def predict(self, data):
        return self.model.predict(data)  # Reuse

# 2. Use batch prediction
def predict(self, instances):
    # Process all instances at once
    return self.model.predict(instances)

# 3. Enable GPU acceleration
# Use gpu-enabled instance type

# 4. Optimize model
# - Use ONNX Runtime
# - Apply quantization
# - Prune unnecessary layers

# 5. Increase instance size
# ml.m5.xlarge -> ml.m5.2xlarge
```

### High Memory Usage

**Symptom:**
```bash
Container killed: Out of memory
```

**Solution:**
```python
# 1. Use larger instance
# ml.m5.xlarge (16GB) -> ml.m5.2xlarge (32GB)

# 2. Optimize model loading
import gc
model = load_model()
gc.collect()  # Free memory

# 3. Use model quantization
# Reduce model size by 4x with minimal accuracy loss

# 4. Process in smaller batches
batch_size = 16  # Reduce from 32

# 5. Clear cache between predictions
import torch
torch.cuda.empty_cache()  # For PyTorch models
```

### Cold Start Latency

**Symptom:**
First request takes 30+ seconds

**Solution:**
```python
# 1. Warm up model at startup
class ModelHandler:
    def __init__(self):
        self.model = load_model()
        # Warm up with dummy prediction
        self.model.predict([[0] * num_features])

# 2. Use provisioned concurrency
# Keep instances warm

# 3. Optimize model loading
# - Use faster serialization (joblib vs pickle)
# - Load from local disk, not S3

# 4. Use smaller base image
FROM python:3.9-slim  # Instead of python:3.9
```

### Concurrent Request Handling

**Symptom:**
Endpoint can't handle multiple simultaneous requests

**Solution:**
```python
# 1. Increase Gunicorn workers
# Edit start_server.py
gunicorn --workers 4 --threads 2 serve:app

# 2. Use async serving
# Switch to FastAPI with async endpoints

# 3. Enable auto-scaling
aws application-autoscaling put-scaling-policy \
  --policy-name my-scaling-policy \
  --service-namespace sagemaker \
  --resource-id endpoint/my-model/variant/AllTraffic \
  --scalable-dimension sagemaker:variant:DesiredInstanceCount \
  --policy-type TargetTrackingScaling

# 4. Use multiple instances
InitialInstanceCount=2  # In endpoint config
```

---

## Getting Help

### Check Logs

```bash
# Container logs
docker logs <container-id>

# SageMaker endpoint logs
aws logs tail /aws/sagemaker/Endpoints/my-model --follow

# Build logs
docker build -t my-model . 2>&1 | tee build.log
```

### Enable Debug Mode

```python
# Add to serve.py
import logging
logging.basicConfig(level=logging.DEBUG)

# Add detailed error handling
try:
    prediction = model.predict(data)
except Exception as e:
    logger.error(f"Prediction failed: {str(e)}", exc_info=True)
    raise
```

### Test Components Individually

```bash
# Test model loading
docker run -it my-model python
>>> from code.model_handler import ModelHandler
>>> handler = ModelHandler('/opt/ml/model')

# Test Flask app
docker run -it my-model python code/serve.py

# Test inference
curl -X POST http://localhost:8080/invocations -d '...'
```

### Community Support

- **GitHub Issues**: [Report bugs](https://github.com/awslabs/ml-container-creator/issues)
- **Discussions**: [Ask questions](https://github.com/awslabs/ml-container-creator/discussions)
- **Documentation**: [Read guides](index.md)
- **Examples**: [See examples](./EXAMPLES.md)

### AWS Support

- **SageMaker Documentation**: https://docs.aws.amazon.com/sagemaker/
- **AWS Support**: https://console.aws.amazon.com/support/
- **AWS Forums**: https://forums.aws.amazon.com/forum.jspa?forumID=285

---

## Prevention Tips

### Before Generating

- ✅ Verify Node.js version (24.11.1+) - use `nvm use node` for latest
- ✅ Have model file ready
- ✅ Know model format and framework
- ✅ Have AWS credentials configured
- ✅ Install Yeoman globally: `npm install -g yo@latest`

### Before Building

- ✅ Test model loading locally
- ✅ Verify all dependencies in requirements.txt
- ✅ Check model file size
- ✅ Review Dockerfile
- ✅ Run linting: `npm run lint -- --fix`

### Before Deploying

- ✅ Test container locally
- ✅ Verify IAM role permissions
- ✅ Check ECR repository exists
- ✅ Confirm instance type availability
- ✅ Run comprehensive tests: `./scripts/test-generate-projects.sh`

### Before Production

- ✅ Load test endpoint
- ✅ Set up monitoring and alarms
- ✅ Configure auto-scaling
- ✅ Document deployment process
- ✅ Plan rollback strategy

### Development Best Practices

- ✅ Use `nvm use node` when encountering ES6 import errors
- ✅ Run tests in isolated directories to avoid conflicts
- ✅ Keep test output for debugging: `KEEP_TEST_OUTPUT=true`
- ✅ Use verbose mode for troubleshooting: `--verbose`
- ✅ Clean up environment variables between tests
- ✅ Only fail CI on critical security vulnerabilities
- ✅ Use npm overrides for dependency security patches
