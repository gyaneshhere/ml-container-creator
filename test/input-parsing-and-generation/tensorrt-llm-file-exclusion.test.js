// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM File Exclusion Unit Tests
 * 
 * Tests file exclusion patterns for TensorRT-LLM model server.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.4
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('TensorRT-LLM File Exclusion - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM File Exclusion Unit Tests');
        console.log('📋 Testing: File exclusion for tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM File Exclusion Unit Tests');

    describe('Traditional ML Files Exclusion', () => {
        it('should exclude model_handler.py', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing model_handler.py exclusion');
            console.log('  📝 Validates: Requirements 11.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify model_handler.py is NOT generated
            assert.noFile(['code/model_handler.py']);
            
            console.log('    ✅ model_handler.py excluded');
        });

        it('should exclude serve.py', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing serve.py exclusion');
            console.log('  📝 Validates: Requirements 11.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify serve.py is NOT generated
            assert.noFile(['code/serve.py']);
            
            console.log('    ✅ serve.py excluded');
        });

        it('should exclude nginx-predictors.conf and include nginx-tensorrt.conf', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing nginx configuration files');
            console.log('  📝 Validates: Requirements 11.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify nginx-predictors.conf is NOT generated (for traditional ML only)
            assert.noFile(['nginx-predictors.conf']);
            // Verify nginx-tensorrt.conf IS generated (for TensorRT-LLM)
            assert.file(['nginx-tensorrt.conf']);
            
            console.log('    ✅ nginx configuration files correct');
        });
    });

    describe('Transformer Files Inclusion', () => {
        it('should include serve script', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing serve script inclusion');
            console.log('  📝 Validates: Requirements 11.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify serve script IS generated
            assert.file(['code/serve']);
            
            console.log('    ✅ serve script included');
        });
    });

    describe('Consistency with Other Transformer Servers', () => {
        it('should exclude traditional ML files like vllm', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing traditional ML file exclusions (like vllm)');
            console.log('  📝 Validates: Requirements 11.4');
            
            // Generate TensorRT-LLM project
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify traditional ML files are excluded (same as vllm)
            assert.noFile(['code/model_handler.py', 'code/serve.py', 'nginx-predictors.conf']);
            // But TensorRT-LLM should have its own nginx config and startup script
            assert.file(['code/serve', 'nginx-tensorrt.conf', 'code/start_server.sh']);
            
            console.log('    ✅ Traditional ML files excluded, TensorRT-LLM specific files included');
        });

        it('should exclude traditional ML files like sglang', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing traditional ML file exclusions (like sglang)');
            console.log('  📝 Validates: Requirements 11.4');
            
            // Generate TensorRT-LLM project
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify traditional ML files are excluded (same as sglang)
            assert.noFile(['code/model_handler.py', 'code/serve.py', 'nginx-predictors.conf']);
            // But TensorRT-LLM should have its own nginx config and startup script
            assert.file(['code/serve', 'nginx-tensorrt.conf', 'code/start_server.sh']);
            
            console.log('    ✅ Traditional ML files excluded, TensorRT-LLM specific files included');
        });
    });
});
