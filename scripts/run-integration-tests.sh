#!/bin/bash

# Run integration tests locally and generate badge JSON files
# Usage: ./scripts/run-integration-tests.sh [test-subset]
#   test-subset: quick, traditional-ml, transformers, all (default: quick)

set -e

TEST_SUBSET=${1:-quick}
RESULTS_DIR="test-results"
BADGES_DIR="badges-json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🧪 ML Container Creator - Integration Tests"
echo "Test Subset: $TEST_SUBSET"
echo "Timestamp: $TIMESTAMP"
echo ""

# Create results directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$BADGES_DIR"

# Test configurations based on subset
# Format: "config_name|framework|model_server|model_format|instance_type"
CONFIGS=""

if [ "$TEST_SUBSET" = "quick" ] || [ "$TEST_SUBSET" = "all" ]; then
    CONFIGS="$CONFIGS
sklearn-flask-cpu|sklearn|flask|pkl|cpu-optimized
xgboost-fastapi-cpu|xgboost|fastapi|json|cpu-optimized"
fi

if [ "$TEST_SUBSET" = "traditional-ml" ] || [ "$TEST_SUBSET" = "all" ]; then
    CONFIGS="$CONFIGS
sklearn-flask-cpu|sklearn|flask|pkl|cpu-optimized
sklearn-fastapi-cpu|sklearn|fastapi|joblib|cpu-optimized
xgboost-flask-cpu|xgboost|flask|json|cpu-optimized
xgboost-fastapi-cpu|xgboost|fastapi|ubj|cpu-optimized
tensorflow-flask-cpu|tensorflow|flask|SavedModel|cpu-optimized
tensorflow-fastapi-cpu|tensorflow|fastapi|h5|cpu-optimized"
fi

if [ "$TEST_SUBSET" = "transformers" ] || [ "$TEST_SUBSET" = "all" ]; then
    CONFIGS="$CONFIGS
transformers-vllm-gpu|transformers|vllm|TinyLlama/TinyLlama-1.1B-Chat-v1.0|gpu-enabled
transformers-sglang-gpu|transformers|sglang|TinyLlama/TinyLlama-1.1B-Chat-v1.0|gpu-enabled"
fi

# Function to test a configuration
test_config() {
    local config_name=$1
    local framework=$2
    local model_server=$3
    local model_format=$4
    local instance_type=$5
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Testing: $config_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local status="success"
    local message="passing"
    local color="brightgreen"
    local error_msg=""
    
    # Create test workspace directory
    local test_workspace="test-workspace"
    mkdir -p "$test_workspace"
    
    # Step 1: Generate project
    echo "📦 Generating project..."
    if [ "$framework" = "transformers" ]; then
        yo ml-container-creator \
            --skip-prompts \
            --project-name="$config_name" \
            --project-dir="$test_workspace/$config_name" \
            --framework="$framework" \
            --model-server="$model_server" \
            --model-name="$model_format" \
            --instance-type="$instance_type" \
            --deploy-target="sagemaker" \
            --include-testing=true \
            --region="${AWS_REGION:-us-east-1}" \
            > "$RESULTS_DIR/${config_name}-generate.log" 2>&1 || {
                status="failure"
                message="generation failed"
                color="red"
                error_msg="Project generation failed"
            }
    else
        yo ml-container-creator \
            --skip-prompts \
            --project-name="$config_name" \
            --project-dir="$test_workspace/$config_name" \
            --framework="$framework" \
            --model-server="$model_server" \
            --model-format="$model_format" \
            --instance-type="$instance_type" \
            --deploy-target="sagemaker" \
            --include-sample=true \
            --include-testing=true \
            --region="${AWS_REGION:-us-east-1}" \
            > "$RESULTS_DIR/${config_name}-generate.log" 2>&1 || {
                status="failure"
                message="generation failed"
                color="red"
                error_msg="Project generation failed"
            }
    fi
    
    if [ "$status" = "success" ]; then
        # Step 2: Build Docker image
        echo "🐳 Building Docker image..."
        cd "test-workspace/$config_name"
        docker build -t "$config_name:test" . \
            > "../../$RESULTS_DIR/${config_name}-build.log" 2>&1 || {
                status="failure"
                message="build failed"
                color="red"
                error_msg="Docker build failed"
            }
        cd ../..
    fi
    
    if [ "$status" = "success" ] && [ "$TEST_SUBSET" != "quick" ]; then
        # Step 3: Deploy to SageMaker (only for non-quick tests)
        echo "☁️  Deploying to SageMaker..."
        cd "test-workspace/$config_name"
        
        # Build and push to ECR
        chmod +x deploy/build_and_push.sh
        ./deploy/build_and_push.sh \
            > "../../$RESULTS_DIR/${config_name}-push.log" 2>&1 || {
                status="failure"
                message="ECR push failed"
                color="red"
                error_msg="ECR push failed"
            }
        
        if [ "$status" = "success" ]; then
            # Deploy to SageMaker
            chmod +x deploy/deploy.sh
            ./deploy/deploy.sh \
                > "../../$RESULTS_DIR/${config_name}-deploy.log" 2>&1 || {
                    status="failure"
                    message="deployment failed"
                    color="red"
                    error_msg="SageMaker deployment failed"
                }
        fi
        
        if [ "$status" = "success" ]; then
            # Step 4: Test endpoint
            echo "🧪 Testing endpoint..."
            
            # Wait for endpoint to be in service
            aws sagemaker wait endpoint-in-service \
                --endpoint-name "${config_name}-endpoint" \
                --region "${AWS_REGION:-us-east-1}" \
                > "../../$RESULTS_DIR/${config_name}-wait.log" 2>&1 || {
                    status="failure"
                    message="endpoint timeout"
                    color="red"
                    error_msg="Endpoint failed to reach InService"
                }
            
            if [ "$status" = "success" ] && [ -f "test/test_hosted_endpoint.py" ]; then
                python test/test_hosted_endpoint.py \
                    > "../../$RESULTS_DIR/${config_name}-test.log" 2>&1 || {
                        status="failure"
                        message="inference failed"
                        color="red"
                        error_msg="Inference test failed"
                    }
            fi
        fi
        
        # Step 5: Cleanup (always run)
        echo "🧹 Cleaning up..."
        aws sagemaker delete-endpoint \
            --endpoint-name "${config_name}-endpoint" \
            --region "${AWS_REGION:-us-east-1}" \
            > "../../$RESULTS_DIR/${config_name}-cleanup.log" 2>&1 || true
        
        aws sagemaker delete-endpoint-config \
            --endpoint-config-name "${config_name}-config" \
            --region "${AWS_REGION:-us-east-1}" \
            >> "../../$RESULTS_DIR/${config_name}-cleanup.log" 2>&1 || true
        
        aws sagemaker delete-model \
            --model-name "${config_name}-model" \
            --region "${AWS_REGION:-us-east-1}" \
            >> "../../$RESULTS_DIR/${config_name}-cleanup.log" 2>&1 || true
        
        cd ../..
    fi
    
    # Generate badge JSON
    cat > "$BADGES_DIR/${config_name}.json" <<EOF
{
  "schemaVersion": 1,
  "label": "${config_name}",
  "message": "${message}",
  "color": "${color}",
  "namedLogo": "amazon-aws",
  "logoColor": "white"
}
EOF
    
    # Save detailed result
    cat > "$RESULTS_DIR/${config_name}-result.json" <<EOF
{
  "config": "${config_name}",
  "status": "${status}",
  "message": "${message}",
  "error": "${error_msg}",
  "timestamp": "${TIMESTAMP}",
  "framework": "${framework}",
  "model_server": "${model_server}",
  "instance_type": "${instance_type}"
}
EOF
    
    if [ "$status" = "success" ]; then
        echo "✅ $config_name: PASSED"
    else
        echo "❌ $config_name: FAILED - $error_msg"
    fi
    echo ""
}

# Run tests for each configuration
echo "$CONFIGS" | while IFS='|' read -r config_name framework model_server model_format instance_type; do
    # Skip empty lines
    [ -z "$config_name" ] && continue
    
    test_config "$config_name" "$framework" "$model_server" "$model_format" "$instance_type"
done

# Generate summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total=0
passed=0
failed=0

for result_file in "$RESULTS_DIR"/*-result.json; do
    if [ -f "$result_file" ]; then
        total=$((total + 1))
        status=$(jq -r '.status' "$result_file")
        config=$(jq -r '.config' "$result_file")
        
        if [ "$status" = "success" ]; then
            passed=$((passed + 1))
            echo "✅ $config"
        else
            failed=$((failed + 1))
            error=$(jq -r '.error' "$result_file")
            echo "❌ $config - $error"
        fi
    fi
done

echo ""
echo "Total: $total | Passed: $passed | Failed: $failed"
echo ""
echo "📁 Results saved to: $RESULTS_DIR/"
echo "🏷️  Badges saved to: $BADGES_DIR/"
echo ""
echo "Next steps:"
echo "1. Review logs in $RESULTS_DIR/ for any failures"
echo "2. Upload $BADGES_DIR/ to a public web server"
echo "3. Use badge URLs in your README"
