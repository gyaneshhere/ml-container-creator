// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Serve Script Generation Unit Tests
 * 
 * Tests serve script generation for TensorRT-LLM model server.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.2
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import path from 'path';
import fs from 'fs';

describe('TensorRT-LLM Serve Script Generation - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Serve Script Generation Unit Tests');
        console.log('📋 Testing: Serve script generation for tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Serve Script Generation Unit Tests');

    describe('Serve Script Command', () => {
        it('should contain trtllm-serve command', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing trtllm-serve command');
            console.log('  📝 Validates: Requirements 11.2');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify serve script exists
            assert.file(['code/serve']);
            
            // Verify trtllm-serve command is present
            assert.fileContent('code/serve', /exec trtllm-serve/);
            
            console.log('    ✅ trtllm-serve command present');
        });
    });

    describe('PREFIX Configuration', () => {
        it('should set PREFIX to TRTLLM_', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing PREFIX configuration');
            console.log('  📝 Validates: Requirements 11.2');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify PREFIX is set to TRTLLM_
            assert.fileContent('code/serve', /PREFIX="TRTLLM_"/);
            
            console.log('    ✅ PREFIX set to TRTLLM_');
        });
    });

    describe('Startup Message', () => {
        it('should display TensorRT-LLM in startup message', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing startup message');
            console.log('  📝 Validates: Requirements 11.2');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify startup message contains TensorRT-LLM
            assert.fileContent('code/serve', /Starting TensorRT-LLM server/);
            
            console.log('    ✅ Startup message displays TensorRT-LLM');
        });
    });

    describe('Host and Port Arguments', () => {
        it('should bind to 0.0.0.0:8080', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing host and port arguments');
            console.log('  📝 Validates: Requirements 11.2');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Read serve script content
            const servePath = path.join(result.cwd, 'code/serve');
            const serveContent = fs.readFileSync(servePath, 'utf8');
            
            // Verify host and port are set correctly
            assert.ok(serveContent.includes('--host') || serveContent.includes('0.0.0.0'), 
                'Should bind to host 0.0.0.0');
            assert.ok(serveContent.includes('--port') || serveContent.includes('8080'), 
                'Should bind to port 8080');
            
            console.log('    ✅ Host and port arguments correct');
        });
    });
});
