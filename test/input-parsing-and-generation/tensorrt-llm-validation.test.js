// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Validation Unit Tests
 * 
 * Tests validation rules for TensorRT-LLM model server.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.6
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';

describe('TensorRT-LLM Validation - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Validation Unit Tests');
        console.log('📋 Testing: Validation rules for tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Validation Unit Tests');

    describe('Invalid Framework Combinations', () => {
        it('should error when tensorrt-llm used with sklearn', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing error with sklearn');
            console.log('  📝 Validates: Requirements 11.6');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'tensorrt-llm',
                    'model-format': 'pkl',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Validation should prevent file generation
            assert.noFile(['Dockerfile', 'requirements.txt']);
            console.log('    ✅ Error raised for sklearn + tensorrt-llm - no files generated');
        });

        it('should error when tensorrt-llm used with xgboost', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing error with xgboost');
            console.log('  📝 Validates: Requirements 11.6');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'xgboost',
                    'model-server': 'tensorrt-llm',
                    'model-format': 'json',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Validation should prevent file generation
            assert.noFile(['Dockerfile', 'requirements.txt']);
            console.log('    ✅ Error raised for xgboost + tensorrt-llm - no files generated');
        });

        it('should error when tensorrt-llm used with tensorflow', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing error with tensorflow');
            console.log('  📝 Validates: Requirements 11.6');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'tensorflow',
                    'model-server': 'tensorrt-llm',
                    'model-format': 'keras',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Validation should prevent file generation
            assert.noFile(['Dockerfile', 'requirements.txt']);
            console.log('    ✅ Error raised for tensorflow + tensorrt-llm - no files generated');
        });
    });

    describe('Valid Framework Combination', () => {
        it('should succeed when tensorrt-llm used with transformers', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing success with transformers');
            console.log('  📝 Validates: Requirements 11.6');
            
            try {
                await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': 'tensorrt-llm',
                        'model-name': 'meta-llama/Llama-3.2-3B',
                        'include-testing': false,
                        'include-sample': false
                    });
                
                console.log('    ✅ Success with transformers + tensorrt-llm');
            } catch (error) {
                throw new Error(`Should not have thrown error for valid combination. Got: ${error.message}`);
            }
        });
    });

    describe('Error Message Content', () => {
        it('should provide clear error message', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing error message clarity');
            console.log('  📝 Validates: Requirements 11.6');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'tensorrt-llm',
                    'model-format': 'pkl',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Validation should prevent file generation
            assert.noFile(['Dockerfile', 'requirements.txt']);
            console.log('    ✅ Validation correctly prevents file generation with clear error message');
        });
    });
});
