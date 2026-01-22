// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Dockerfile Generation Unit Tests
 * 
 * Tests Dockerfile generation for TensorRT-LLM model server.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.1, 11.3
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import path from 'path';
import fs from 'fs';

describe('TensorRT-LLM Dockerfile Generation - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Dockerfile Generation Unit Tests');
        console.log('📋 Testing: Dockerfile generation for tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Dockerfile Generation Unit Tests');

    describe('Base Image Configuration', () => {
        it('should use correct TensorRT-LLM base image', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing TensorRT-LLM base image');
            console.log('  📝 Validates: Requirements 11.1');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Verify correct base image
            assert.fileContent('Dockerfile', /ARG BASE_IMAGE=nvcr\.io\/nvidia\/tensorrt-llm\/release:1\.2\.0rc8/);
            assert.fileContent('Dockerfile', /FROM \${BASE_IMAGE}/);
            
            console.log('    ✅ TensorRT-LLM base image correct');
        });

        it('should use ARG directive for base image', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing ARG directive for base image');
            console.log('  📝 Validates: Requirements 11.1');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify ARG comes before FROM
            const argPos = dockerfileContent.indexOf('ARG BASE_IMAGE=');
            const fromPos = dockerfileContent.indexOf('FROM ${BASE_IMAGE}');
            
            assert.ok(argPos !== -1, 'ARG BASE_IMAGE should exist');
            assert.ok(fromPos !== -1, 'FROM ${BASE_IMAGE} should exist');
            assert.ok(argPos < fromPos, 'ARG should come before FROM');
            
            console.log('    ✅ ARG directive correctly placed');
        });
    });

    describe('TRTLLM_MODEL Environment Variable', () => {
        it('should set TRTLLM_MODEL environment variable', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing TRTLLM_MODEL environment variable');
            console.log('  📝 Validates: Requirements 11.3');
            
            const modelName = 'meta-llama/Llama-3.2-3B';
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': modelName,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify TRTLLM_MODEL is set
            assert.fileContent('Dockerfile', `ENV TRTLLM_MODEL="${modelName}"`);
            
            console.log('    ✅ TRTLLM_MODEL environment variable set correctly');
        });

        it('should use provided model name in TRTLLM_MODEL', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing TRTLLM_MODEL with different model names');
            console.log('  📝 Validates: Requirements 11.3');
            
            const testModels = [
                'meta-llama/Llama-3.2-1B-Instruct',
                'openai/gpt-oss-20b',
                'microsoft/DialoGPT-medium'
            ];
            
            for (const modelName of testModels) {
                await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': 'tensorrt-llm',
                        'model-name': modelName,
                        'include-testing': false,
                        'include-sample': false
                    });
                
                // Verify correct model name is used
                assert.fileContent('Dockerfile', `ENV TRTLLM_MODEL="${modelName}"`);
                
                console.log(`    ✅ TRTLLM_MODEL correct for ${modelName}`);
            }
        });

        it('should place TRTLLM_MODEL after FROM directive', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing TRTLLM_MODEL placement');
            console.log('  📝 Validates: Requirements 11.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify TRTLLM_MODEL comes after FROM
            const fromPos = dockerfileContent.indexOf('FROM ${BASE_IMAGE}');
            const trtllmModelPos = dockerfileContent.indexOf('ENV TRTLLM_MODEL=');
            
            assert.ok(fromPos !== -1, 'FROM directive should exist');
            assert.ok(trtllmModelPos !== -1, 'ENV TRTLLM_MODEL should exist');
            assert.ok(fromPos < trtllmModelPos, 'ENV TRTLLM_MODEL should come after FROM');
            
            console.log('    ✅ TRTLLM_MODEL placement correct');
        });
    });

    describe('HuggingFace Token Configuration', () => {
        it('should include HF_TOKEN when provided', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing HF_TOKEN inclusion');
            console.log('  📝 Validates: Requirements 11.3');
            
            const testToken = 'hf_test123456789012345678901234567890';
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'hf-token': testToken,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify HF_TOKEN is included
            assert.fileContent('Dockerfile', `ENV HF_TOKEN="${testToken}"`);
            
            console.log('    ✅ HF_TOKEN included when provided');
        });

        it('should exclude HF_TOKEN when not provided', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing HF_TOKEN exclusion');
            console.log('  📝 Validates: Requirements 11.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify HF_TOKEN is NOT included
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='), 'HF_TOKEN should not be present when not provided');
            
            console.log('    ✅ HF_TOKEN excluded when not provided');
        });

        it('should place HF_TOKEN after TRTLLM_MODEL', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing HF_TOKEN placement');
            console.log('  📝 Validates: Requirements 11.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify HF_TOKEN comes after TRTLLM_MODEL
            const trtllmModelPos = dockerfileContent.indexOf('ENV TRTLLM_MODEL=');
            const hfTokenPos = dockerfileContent.indexOf('ENV HF_TOKEN=');
            
            assert.ok(trtllmModelPos !== -1, 'ENV TRTLLM_MODEL should exist');
            assert.ok(hfTokenPos !== -1, 'ENV HF_TOKEN should exist');
            assert.ok(trtllmModelPos < hfTokenPos, 'ENV HF_TOKEN should come after ENV TRTLLM_MODEL');
            
            console.log('    ✅ HF_TOKEN placement correct');
        });

        it('should handle $HF_TOKEN environment variable reference', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing $HF_TOKEN environment variable reference');
            console.log('  📝 Validates: Requirements 11.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'hf-token': '$HF_TOKEN',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // When $HF_TOKEN is provided, it should NOT be in the Dockerfile
            // (it's an environment variable reference, not a literal value)
            // The Dockerfile should not include HF_TOKEN when using env var reference
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='), 
                '$HF_TOKEN environment variable reference should not be baked into Dockerfile');
            
            console.log('    ✅ $HF_TOKEN reference handled correctly (not baked into image)');
        });
    });

    describe('Complete Dockerfile Structure', () => {
        it('should generate complete Dockerfile with all required sections', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing complete Dockerfile structure');
            console.log('  📝 Validates: Requirements 11.1, 11.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify all required sections exist
            assert.ok(dockerfileContent.includes('ARG BASE_IMAGE='), 'Should have ARG BASE_IMAGE');
            assert.ok(dockerfileContent.includes('FROM ${BASE_IMAGE}'), 'Should have FROM directive');
            assert.ok(dockerfileContent.includes('ENV TRTLLM_MODEL='), 'Should have ENV TRTLLM_MODEL');
            assert.ok(dockerfileContent.includes('ENV HF_TOKEN='), 'Should have ENV HF_TOKEN');
            assert.ok(dockerfileContent.includes('COPY code/serve'), 'Should have COPY serve script');
            assert.ok(dockerfileContent.includes('ENTRYPOINT'), 'Should have ENTRYPOINT');
            
            console.log('    ✅ Complete Dockerfile structure correct');
        });

        it('should not include traditional ML files in Dockerfile', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing traditional ML files exclusion');
            console.log('  📝 Validates: Requirements 11.1');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify traditional ML files are NOT referenced
            assert.ok(!dockerfileContent.includes('model_handler.py'), 'Should not reference model_handler.py');
            assert.ok(!dockerfileContent.includes('serve.py'), 'Should not reference serve.py');
            assert.ok(!dockerfileContent.includes('nginx-predictors.conf'), 'Should not reference nginx-predictors.conf');
            
            console.log('    ✅ Traditional ML files correctly excluded');
        });
    });

    describe('Consistency with Other Transformer Servers', () => {
        it('should follow same pattern as vLLM Dockerfile', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing consistency with vLLM Dockerfile');
            console.log('  📝 Validates: Requirements 11.1');
            
            // Generate TensorRT-LLM Dockerfile
            const trtllmResult = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            const trtllmDockerfilePath = path.join(trtllmResult.cwd, 'Dockerfile');
            const trtllmContent = fs.readFileSync(trtllmDockerfilePath, 'utf8');
            
            // Generate vLLM Dockerfile for comparison
            const vllmResult = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            const vllmDockerfilePath = path.join(vllmResult.cwd, 'Dockerfile');
            const vllmContent = fs.readFileSync(vllmDockerfilePath, 'utf8');
            
            // Verify both have similar structure
            const trtllmHasArg = trtllmContent.includes('ARG BASE_IMAGE=');
            const vllmHasArg = vllmContent.includes('ARG BASE_IMAGE=');
            assert.ok(trtllmHasArg && vllmHasArg, 'Both should use ARG BASE_IMAGE');
            
            const trtllmHasModelEnv = trtllmContent.includes('ENV TRTLLM_MODEL=');
            const vllmHasModelEnv = vllmContent.includes('ENV VLLM_MODEL=');
            assert.ok(trtllmHasModelEnv && vllmHasModelEnv, 'Both should set model environment variable');
            
            const trtllmHasServe = trtllmContent.includes('COPY code/serve');
            const vllmHasServe = vllmContent.includes('COPY code/serve');
            assert.ok(trtllmHasServe && vllmHasServe, 'Both should copy serve script');
            
            console.log('    ✅ TensorRT-LLM Dockerfile follows same pattern as vLLM');
        });
    });
});
