# Local Integration Testing

Run integration tests in your own AWS account and publish results as status badges.

## Overview

Instead of giving GitHub Actions access to your AWS account, you can:
1. Run tests locally in your AWS environment
2. Generate badge JSON files
3. Publish badges to S3 (or any public web server)
4. Display badges in your README

## Quick Start

```bash
# 1. Run tests (quick subset, local Docker only)
./scripts/run-integration-tests.sh quick

# 2. Publish badges to S3
./scripts/publish-badges-to-s3.sh my-badge-bucket

# 3. Add badges to README
# See output for badge URLs
```

## Test Subsets

### Quick (Local Docker Only - Free)
```bash
./scripts/run-integration-tests.sh quick
```
- Tests: sklearn-flask, xgboost-fastapi
- No AWS deployment
- Cost: $0

### Traditional ML (Full SageMaker Deployment)
```bash
./scripts/run-integration-tests.sh traditional-ml
```
- Tests: 6 configs (sklearn, xgboost, tensorflow)
- Deploys to SageMaker
- Cost: ~$0.60 per run

### Transformers (GPU Instances)
```bash
./scripts/run-integration-tests.sh transformers
```
- Tests: 2 configs (vLLM, SGLang)
- Requires GPU instances
- Cost: ~$4 per run

### All Tests
```bash
./scripts/run-integration-tests.sh all
```
- Tests: All 8 configs
- Cost: ~$5 per run

## What Gets Tested

For each configuration:

1. **Generate** - Run `yo ml-container-creator` with config
2. **Build** - Build Docker image
3. **Deploy** - Push to ECR and deploy to SageMaker (if not quick)
4. **Test** - Run inference test against endpoint
5. **Cleanup** - Delete endpoint, config, and model

## Output Files

### Test Results (`test-results/`)
- `{config}-generate.log` - Project generation output
- `{config}-build.log` - Docker build output
- `{config}-push.log` - ECR push output
- `{config}-deploy.log` - SageMaker deployment output
- `{config}-test.log` - Inference test output
- `{config}-cleanup.log` - Resource cleanup output
- `{config}-result.json` - Structured test result

### Badge Files (`badges-json/`)
- `{config}.json` - Shields.io endpoint JSON

Example badge JSON:
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

## Publishing Badges

### Option 1: S3 (Recommended)

```bash
# Create bucket and upload badges
./scripts/publish-badges-to-s3.sh my-badge-bucket

# Badge URL format:
# https://my-badge-bucket.s3.amazonaws.com/badges/sklearn-flask-cpu.json
```

The script automatically:
- Creates bucket if it doesn't exist
- Configures public read access
- Sets appropriate content-type and cache headers
- Uploads all badge JSON files

### Option 2: GitHub Pages

```bash
# Clone your repo's gh-pages branch
git clone -b gh-pages https://github.com/YOUR_USERNAME/YOUR_REPO.git gh-pages-repo

# Copy badges
cp -r badges-json gh-pages-repo/

# Commit and push
cd gh-pages-repo
git add badges-json/
git commit -m "Update integration test badges"
git push

# Badge URL format:
# https://YOUR_USERNAME.github.io/YOUR_REPO/badges-json/sklearn-flask-cpu.json
```

### Option 3: Any Web Server

Upload `badges-json/*.json` to any publicly accessible web server. Just ensure:
- Files are served with `Content-Type: application/json`
- CORS is enabled if needed
- HTTPS is used (shields.io requires it)

## Using Badges in README

```markdown
## Configuration Status

![sklearn-flask-cpu](https://img.shields.io/endpoint?url=https://YOUR_BUCKET.s3.amazonaws.com/badges/sklearn-flask-cpu.json)
![xgboost-fastapi-cpu](https://img.shields.io/endpoint?url=https://YOUR_BUCKET.s3.amazonaws.com/badges/xgboost-fastapi-cpu.json)
```

Or use the helper script:
```bash
./scripts/generate-badge-markdown.sh YOUR_BUCKET.s3.amazonaws.com/badges
```

## Automation

### Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Run tests weekly on Monday at 2 AM
0 2 * * 1 cd /path/to/ml-container-creator && ./scripts/run-integration-tests.sh all && ./scripts/publish-badges-to-s3.sh my-badge-bucket
```

### AWS Lambda (Scheduled)

Create a Lambda function that:
1. Clones the repo
2. Runs the test script
3. Publishes badges to S3

Trigger with EventBridge (CloudWatch Events) on a schedule.

### CI/CD (Jenkins, GitLab CI, etc.)

Add a scheduled job that runs the test script in your CI/CD system.

## Cost Management

### Minimize Costs

1. **Run quick tests frequently** (free)
2. **Run full tests weekly** (~$5/week = $20/month)
3. **Run transformer tests monthly** (~$4/month)

### Monitor Costs

```bash
# Check for orphaned SageMaker endpoints
aws sagemaker list-endpoints --region us-east-1

# Check for orphaned ECR images
aws ecr list-images --repository-name ml-container-creator-test

# Delete orphaned resources
aws sagemaker delete-endpoint --endpoint-name ORPHANED_ENDPOINT
```

### Set Budget Alerts

Create an AWS Budget to alert when costs exceed threshold:
```bash
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

## Troubleshooting

### Test Fails at Generation

Check `test-results/{config}-generate.log` for errors. Common issues:
- Generator not linked: `npm link`
- Missing dependencies: `npm install`

### Test Fails at Build

Check `test-results/{config}-build.log`. Common issues:
- Docker not running
- Insufficient disk space
- Base image pull failures

### Test Fails at Deploy

Check `test-results/{config}-deploy.log`. Common issues:
- AWS credentials not configured
- Insufficient IAM permissions
- SageMaker service quotas exceeded
- ECR repository doesn't exist

### Test Fails at Inference

Check `test-results/{config}-test.log`. Common issues:
- Model not loaded correctly
- Endpoint timeout (increase wait time)
- Incorrect request format

### Badges Not Updating

1. **Check S3 upload**: `aws s3 ls s3://my-badge-bucket/badges/`
2. **Check public access**: `curl https://my-badge-bucket.s3.amazonaws.com/badges/sklearn-flask-cpu.json`
3. **Clear shields.io cache**: Wait 5 minutes or add `?v=timestamp` to URL

## Advanced Usage

### Custom Test Configurations

Edit `scripts/run-integration-tests.sh` and add to the `CONFIGS` array:

```bash
CONFIGS["my-custom-config"]="sklearn flask pkl cpu-optimized"
```

### Parallel Testing

Run multiple test subsets in parallel:
```bash
./scripts/run-integration-tests.sh quick &
./scripts/run-integration-tests.sh traditional-ml &
wait
```

### Custom Badge Styling

Edit generated JSON files in `badges-json/`:
```json
{
  "schemaVersion": 1,
  "label": "sklearn-flask-cpu",
  "message": "passing",
  "color": "brightgreen",
  "style": "for-the-badge",
  "namedLogo": "amazon-aws"
}
```

## Security Considerations

### S3 Bucket Security

The publish script creates a **public-read** bucket. Badge JSON files contain no sensitive data, but:
- Use a dedicated bucket for badges only
- Enable S3 access logging
- Set up CloudTrail for audit logs
- Consider using CloudFront for DDoS protection

### AWS Credentials

- Use IAM user with minimal permissions
- Don't commit credentials to git
- Use AWS CLI profiles or environment variables
- Rotate credentials regularly

### Cleanup

The script automatically cleans up SageMaker resources, but verify:
```bash
# List all endpoints
aws sagemaker list-endpoints

# List all ECR images
aws ecr list-images --repository-name ml-container-creator-test
```

## See Also

- [Configuration Matrix](configuration-matrix.md) - All valid configurations
- [Badge Examples](badge-examples.md) - Display options
- [Integration Testing Guide](integration-testing.md) - GitHub Actions approach
