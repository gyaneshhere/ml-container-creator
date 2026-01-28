// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Shared validation helper functions for tests
 * 
 * These functions mirror the validation logic from the generator
 * to avoid duplicating validation code across test files.
 */

/**
 * Validate HuggingFace token format
 * Returns true if valid, displays warning for invalid format (non-blocking)
 */
export function validateHFToken(input) {
    // Empty is valid (not all models require auth)
    if (!input || input.trim() === '') {
        return true;
    }
    
    // $HF_TOKEN reference is valid
    if (input.trim() === '$HF_TOKEN') {
        return true;
    }
    
    // Direct token should start with hf_ (warning only, not blocking)
    if (!input.startsWith('hf_')) {
        console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
        console.warn('   If this is intentional, you can ignore this warning.');
    }
    
    return true; // Always return true (non-blocking validation)
}

/**
 * Validate TensorRT-LLM framework compatibility
 * Throws error if framework is not 'transformers'
 */
export function validateTensorRTLLMFramework(framework) {
    if (framework !== 'transformers') {
        throw new Error('TensorRT-LLM is only compatible with transformers framework');
    }
    return true;
}

/**
 * Validate CodeBuild compute type
 * Returns true if valid compute type
 */
export function validateCodeBuildComputeType(computeType) {
    const validTypes = [
        'BUILD_GENERAL1_SMALL',
        'BUILD_GENERAL1_MEDIUM',
        'BUILD_GENERAL1_LARGE',
        'BUILD_GENERAL1_2XLARGE'
    ];
    return validTypes.includes(computeType);
}

/**
 * Validate framework and model server compatibility
 * Returns true if valid combination
 */
export function validateFrameworkServerCompatibility(framework, modelServer) {
    const compatibilityMatrix = {
        sklearn: ['flask', 'fastapi'],
        xgboost: ['flask', 'fastapi'],
        tensorflow: ['flask', 'fastapi'],
        transformers: ['vllm', 'sglang', 'tensorrt-llm']
    };
    
    const validServers = compatibilityMatrix[framework];
    if (!validServers) {
        throw new Error(`Unknown framework: ${framework}`);
    }
    
    if (!validServers.includes(modelServer)) {
        throw new Error(`Model server '${modelServer}' is not compatible with framework '${framework}'`);
    }
    
    return true;
}

/**
 * Validate model format for framework
 * Returns true if valid format for the framework
 */
export function validateModelFormat(framework, modelFormat) {
    const formatMatrix = {
        sklearn: ['pkl', 'joblib'],
        xgboost: ['json', 'model', 'ubj'],
        tensorflow: ['keras', 'h5', 'SavedModel'],
        transformers: [null] // No format needed
    };
    
    const validFormats = formatMatrix[framework];
    if (!validFormats) {
        throw new Error(`Unknown framework: ${framework}`);
    }
    
    if (!validFormats.includes(modelFormat)) {
        throw new Error(`Model format '${modelFormat}' is not valid for framework '${framework}'`);
    }
    
    return true;
}
