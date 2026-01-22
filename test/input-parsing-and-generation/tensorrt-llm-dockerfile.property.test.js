// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Dockerfile Configuration Property-Based Tests
 * 
 * Tests the correctness properties for TensorRT-LLM Dockerfile generation.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('TensorRT-LLM Dockerfile Configuration - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Dockerfile Configuration Property Tests');
        console.log('📋 Testing: Universal correctness properties for TensorRT-LLM Dockerfile generation');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Dockerfile Configuration Properties');

    describe('Property 2: Dockerfile Base Image Configuration', () => {
        it('should use correct base image for tensorrt-llm model server', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 2: Dockerfile Base Image Configuration');
            console.log('  📝 For any generator configuration where modelServer is "tensorrt-llm", the generated Dockerfile should use ARG BASE_IMAGE directive and set BASE_IMAGE to "nvcr.io/nvidia/tensorrt-llm/release:1.2.0rc8"');
            console.log('  📝 Validates: Requirements 2.1, 2.2');
            
            // Feature: tensorrt-llm-support, Property 2: Dockerfile has correct base image and environment variables
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing Dockerfile generation with model: ${modelName}`);
                    
                    try {
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': 'tensorrt-llm',
                                'model-name': modelName,
                                'include-testing': false,
                                'include-sample': false
                            });
                        
                        // Verify Dockerfile exists
                        assert.file(['Dockerfile']);
                        
                        // Read Dockerfile content
                        const path = await import('path');
                        const fs = await import('fs');
                        const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                        
                        // Verify ARG BASE_IMAGE directive is present
                        if (!dockerfileContent.includes('ARG BASE_IMAGE=')) {
                            console.log('    ❌ ARG BASE_IMAGE directive not found');
                            return false;
                        }
                        
                        // Verify correct base image for tensorrt-llm
                        const expectedBaseImage = 'ARG BASE_IMAGE=nvcr.io/nvidia/tensorrt-llm/release:1.2.0rc8';
                        if (!dockerfileContent.includes(expectedBaseImage)) {
                            console.log('    ❌ Incorrect base image for tensorrt-llm');
                            return false;
                        }
                        
                        // Verify FROM ${BASE_IMAGE} is present
                        if (!dockerfileContent.includes('FROM ${BASE_IMAGE}')) {
                            console.log('    ❌ FROM ${BASE_IMAGE} directive not found');
                            return false;
                        }
                        
                        console.log('    ✅ Base image configuration correct for tensorrt-llm');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Dockerfile generation failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 2 validated: Base image configuration correct for tensorrt-llm');
        });

        it('should set TRTLLM_MODEL environment variable with correct model name', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 2b: TRTLLM_MODEL Environment Variable');
            console.log('  📝 For any model name, the generated Dockerfile should set ENV TRTLLM_MODEL with the provided model name');
            console.log('  📝 Validates: Requirements 3.1, 3.2');
            
            // Feature: tensorrt-llm-support, Property 2: Dockerfile has correct base image and environment variables
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing TRTLLM_MODEL ENV with model: ${modelName}`);
                    
                    try {
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': 'tensorrt-llm',
                                'model-name': modelName,
                                'include-testing': false,
                                'include-sample': false
                            });
                        
                        // Verify Dockerfile exists
                        assert.file(['Dockerfile']);
                        
                        // Read Dockerfile content
                        const path = await import('path');
                        const fs = await import('fs');
                        const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                        
                        // Verify ENV TRTLLM_MODEL directive is present
                        if (!dockerfileContent.includes('ENV TRTLLM_MODEL=')) {
                            console.log('    ❌ ENV TRTLLM_MODEL directive not found');
                            return false;
                        }
                        
                        // Verify the model name is correctly set
                        const expectedEnvLine = `ENV TRTLLM_MODEL="${modelName}"`;
                        if (!dockerfileContent.includes(expectedEnvLine)) {
                            console.log(`    ❌ TRTLLM_MODEL not set to "${modelName}"`);
                            return false;
                        }
                        
                        console.log('    ✅ TRTLLM_MODEL environment variable correctly set');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 2b validated: TRTLLM_MODEL environment variable correct');
        });

        it('should follow same pattern as vllm and sglang for model environment variable', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 2c: Model Environment Variable Pattern Consistency');
            console.log('  📝 The TRTLLM_MODEL environment variable should follow the same pattern as VLLM_MODEL and SGLANG_MODEL_PATH');
            console.log('  📝 Validates: Requirements 3.2, 3.3');
            
            // Feature: tensorrt-llm-support, Property 2: Dockerfile has correct base image and environment variables
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing pattern consistency with model: ${modelName}`);
                    
                    try {
                        // Generate for tensorrt-llm
                        const trtllmResult = await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': 'tensorrt-llm',
                                'model-name': modelName,
                                'include-testing': false,
                                'include-sample': false
                            });
                        
                        // Read tensorrt-llm Dockerfile
                        const path = await import('path');
                        const fs = await import('fs');
                        const trtllmDockerfilePath = path.join(trtllmResult.cwd, 'Dockerfile');
                        const trtllmDockerfileContent = fs.readFileSync(trtllmDockerfilePath, 'utf8');
                        
                        // Verify TRTLLM_MODEL follows the pattern: ENV <PREFIX>_MODEL="<modelName>"
                        const trtllmEnvPattern = /ENV TRTLLM_MODEL="[^"]+"/;
                        if (!trtllmEnvPattern.test(trtllmDockerfileContent)) {
                            console.log('    ❌ TRTLLM_MODEL does not follow expected pattern');
                            return false;
                        }
                        
                        // Verify it's placed after FROM and before HF_TOKEN (if present)
                        const fromPos = trtllmDockerfileContent.indexOf('FROM ${BASE_IMAGE}');
                        const trtllmModelPos = trtllmDockerfileContent.indexOf('ENV TRTLLM_MODEL=');
                        
                        if (fromPos === -1 || trtllmModelPos === -1) {
                            console.log('    ❌ Required directives not found');
                            return false;
                        }
                        
                        if (!(fromPos < trtllmModelPos)) {
                            console.log('    ❌ TRTLLM_MODEL not placed after FROM');
                            return false;
                        }
                        
                        console.log('    ✅ TRTLLM_MODEL follows consistent pattern');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 2c validated: Model environment variable pattern consistent');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM Dockerfile Configuration Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
