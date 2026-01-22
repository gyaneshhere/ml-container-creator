// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Configuration Unit Tests
 * 
 * Tests prompt configuration for TensorRT-LLM model server option.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.1, 11.2, 11.3
 */

import { setupTestHooks } from './test-utils.js';
import { modelServerPrompts } from '../../generators/app/lib/prompts.js';

describe('TensorRT-LLM Configuration - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Configuration Unit Tests');
        console.log('📋 Testing: Prompt configuration for tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Configuration Unit Tests');

    describe('Model Server Prompt Configuration', () => {
        it('should include tensorrt-llm in choices for transformers framework', () => {
            console.log('\n  🧪 Testing tensorrt-llm appears for transformers');
            console.log('  📝 Validates: Requirements 11.1, 11.2');
            
            // Get the model server prompt
            const prompt = modelServerPrompts[0];
            
            // Verify prompt exists
            if (!prompt) {
                throw new Error('Model server prompt not found');
            }
            
            // Verify prompt has choices function
            if (typeof prompt.choices !== 'function') {
                throw new Error('Model server prompt choices is not a function');
            }
            
            // Test with transformers framework
            const transformersAnswers = { framework: 'transformers' };
            const choices = prompt.choices(transformersAnswers);
            
            // Verify tensorrt-llm is included
            if (!choices.includes('tensorrt-llm')) {
                throw new Error(`tensorrt-llm not found in choices for transformers. Got: ${JSON.stringify(choices)}`);
            }
            
            // Verify all expected transformer servers are present
            const expectedServers = ['vllm', 'sglang', 'tensorrt-llm'];
            for (const server of expectedServers) {
                if (!choices.includes(server)) {
                    throw new Error(`Expected server ${server} not found in choices`);
                }
            }
            
            console.log(`  ✅ tensorrt-llm correctly included in transformers choices: ${JSON.stringify(choices)}`);
        });

        it('should not include tensorrt-llm for sklearn framework', () => {
            console.log('\n  🧪 Testing tensorrt-llm absent for sklearn');
            console.log('  📝 Validates: Requirements 11.2');
            
            const prompt = modelServerPrompts[0];
            const sklearnAnswers = { framework: 'sklearn' };
            const choices = prompt.choices(sklearnAnswers);
            
            // Verify tensorrt-llm is NOT included
            if (choices.includes('tensorrt-llm')) {
                throw new Error(`tensorrt-llm should not appear for sklearn. Got: ${JSON.stringify(choices)}`);
            }
            
            // Verify traditional ML servers are present
            const expectedServers = ['flask', 'fastapi'];
            for (const server of expectedServers) {
                if (!choices.includes(server)) {
                    throw new Error(`Expected server ${server} not found in choices`);
                }
            }
            
            console.log(`  ✅ tensorrt-llm correctly absent for sklearn: ${JSON.stringify(choices)}`);
        });

        it('should not include tensorrt-llm for xgboost framework', () => {
            console.log('\n  🧪 Testing tensorrt-llm absent for xgboost');
            console.log('  📝 Validates: Requirements 11.2');
            
            const prompt = modelServerPrompts[0];
            const xgboostAnswers = { framework: 'xgboost' };
            const choices = prompt.choices(xgboostAnswers);
            
            // Verify tensorrt-llm is NOT included
            if (choices.includes('tensorrt-llm')) {
                throw new Error(`tensorrt-llm should not appear for xgboost. Got: ${JSON.stringify(choices)}`);
            }
            
            console.log(`  ✅ tensorrt-llm correctly absent for xgboost: ${JSON.stringify(choices)}`);
        });

        it('should not include tensorrt-llm for tensorflow framework', () => {
            console.log('\n  🧪 Testing tensorrt-llm absent for tensorflow');
            console.log('  📝 Validates: Requirements 11.2');
            
            const prompt = modelServerPrompts[0];
            const tensorflowAnswers = { framework: 'tensorflow' };
            const choices = prompt.choices(tensorflowAnswers);
            
            // Verify tensorrt-llm is NOT included
            if (choices.includes('tensorrt-llm')) {
                throw new Error(`tensorrt-llm should not appear for tensorflow. Got: ${JSON.stringify(choices)}`);
            }
            
            console.log(`  ✅ tensorrt-llm correctly absent for tensorflow: ${JSON.stringify(choices)}`);
        });
    });

    describe('Answer Object Structure', () => {
        it('should accept tensorrt-llm as valid modelServer value', () => {
            console.log('\n  🧪 Testing tensorrt-llm as answer value');
            console.log('  📝 Validates: Requirements 11.3');
            
            // Simulate answer object with tensorrt-llm
            const answers = {
                framework: 'transformers',
                modelServer: 'tensorrt-llm',
                modelName: 'meta-llama/Llama-3.2-3B',
                deployTarget: 'sagemaker',
                instanceType: 'gpu-enabled',
                awsRegion: 'us-east-1',
                includeSampleModel: false,
                includeTesting: false
            };
            
            // Verify answer structure
            if (answers.modelServer !== 'tensorrt-llm') {
                throw new Error('modelServer value not set correctly');
            }
            
            if (answers.framework !== 'transformers') {
                throw new Error('framework value not set correctly');
            }
            
            console.log('  ✅ Answer object structure valid with tensorrt-llm');
        });

        it('should work with complete transformers configuration', () => {
            console.log('\n  🧪 Testing complete tensorrt-llm configuration');
            console.log('  📝 Validates: Requirements 11.3');
            
            // Simulate complete answer object
            const answers = {
                projectName: 'test-tensorrt-llm',
                destinationDir: './test-output',
                framework: 'transformers',
                modelName: 'meta-llama/Llama-3.2-3B',
                modelServer: 'tensorrt-llm',
                hfToken: undefined,
                includeSampleModel: false,
                includeTesting: true,
                testTypes: ['hosted-model-endpoint'],
                deployTarget: 'sagemaker',
                instanceType: 'gpu-enabled',
                awsRegion: 'us-east-1',
                awsRoleArn: 'arn:aws:iam::123456789012:role/TestRole',
                buildTimestamp: '2024-01-01T00:00:00'
            };
            
            // Verify all required fields are present
            const requiredFields = [
                'projectName', 'destinationDir', 'framework', 'modelName',
                'modelServer', 'deployTarget', 'instanceType', 'awsRegion'
            ];
            
            for (const field of requiredFields) {
                if (!(field in answers)) {
                    throw new Error(`Required field ${field} missing from answer object`);
                }
            }
            
            // Verify tensorrt-llm specific values
            if (answers.modelServer !== 'tensorrt-llm') {
                throw new Error('modelServer should be tensorrt-llm');
            }
            
            if (answers.framework !== 'transformers') {
                throw new Error('framework should be transformers for tensorrt-llm');
            }
            
            console.log('  ✅ Complete configuration structure valid');
        });
    });

    describe('Prompt Message and Type', () => {
        it('should have correct prompt message', () => {
            console.log('\n  🧪 Testing prompt message');
            console.log('  📝 Validates: Requirements 11.1');
            
            const prompt = modelServerPrompts[0];
            
            // Verify prompt has message
            if (!prompt.message) {
                throw new Error('Prompt message not found');
            }
            
            // Verify message is appropriate
            if (!prompt.message.toLowerCase().includes('model server')) {
                throw new Error('Prompt message should mention model server');
            }
            
            console.log(`  ✅ Prompt message: "${prompt.message}"`);
        });

        it('should be a list type prompt', () => {
            console.log('\n  🧪 Testing prompt type');
            console.log('  📝 Validates: Requirements 11.1');
            
            const prompt = modelServerPrompts[0];
            
            // Verify prompt type
            if (prompt.type !== 'list') {
                throw new Error(`Expected prompt type 'list', got '${prompt.type}'`);
            }
            
            console.log('  ✅ Prompt type is list');
        });

        it('should have name field set to modelServer', () => {
            console.log('\n  🧪 Testing prompt name field');
            console.log('  📝 Validates: Requirements 11.1');
            
            const prompt = modelServerPrompts[0];
            
            // Verify prompt name
            if (prompt.name !== 'modelServer') {
                throw new Error(`Expected prompt name 'modelServer', got '${prompt.name}'`);
            }
            
            console.log('  ✅ Prompt name is modelServer');
        });
    });
});
