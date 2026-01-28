// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Property-Based Tests
 * 
 * Tests universal correctness properties for HF token feature.
 * 
 * Feature: huggingface-token-authentication
 * 
 * Consolidates:
 * - hf-token-validation.property.test.js
 * - hf-token-dockerfile.property.test.js
 * - hf-token-prompt-logic.property.test.js
 * - hf-token-precedence.property.test.js
 * - hf-token-privacy.property.test.js
 * - hf-token-validation-consistency.property.test.js
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import { validateHFToken } from './validation-helpers.js';
import assert from 'yeoman-assert';
import path from 'path';
import fs from 'fs';

describe('HuggingFace Token Properties', () => {
    let helpers;
    let activeRunners = []; // Track active test runners for cleanup

    before(async () => {
        helpers = await import('yeoman-test');
    });

    // Cleanup after each test to prevent resource leaks
    afterEach(async function() {
        // Clean up any active test runners
        if (activeRunners.length > 0) {
            for (const runner of activeRunners) {
                try {
                    if (runner && typeof runner.cleanup === 'function') {
                        await runner.cleanup();
                    }
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
            activeRunners = [];
        }
        
        // Small delay to allow async cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    setupTestHooks('HuggingFace Token Properties');

    describe('Token Format Validation', () => {
        it('should warn for any token without hf_ prefix', async function() {
            this.timeout(5000);
            
            await fc.assert(fc.property(
                fc.string({ minLength: 20, maxLength: 50 })
                    .filter(s => !s.startsWith('hf_') && s.trim() !== '' && s.trim() !== '$HF_TOKEN'),
                (token) => {
                    const originalWarn = console.warn;
                    let warned = false;
                    console.warn = () => { warned = true; };
                    
                    validateHFToken(token);
                    console.warn = originalWarn;
                    
                    return warned;
                }
            ), { numRuns: 10 });
        });

        it('should not warn for any token with hf_ prefix', async function() {
            this.timeout(5000);
            
            await fc.assert(fc.property(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                (token) => {
                    const originalWarn = console.warn;
                    let warned = false;
                    console.warn = () => { warned = true; };
                    
                    validateHFToken(token);
                    console.warn = originalWarn;
                    
                    return !warned;
                }
            ), { numRuns: 10 });
        });

        it('should not warn for $HF_TOKEN reference', async function() {
            this.timeout(5000);
            
            await fc.assert(fc.property(
                fc.constant('$HF_TOKEN'),
                (token) => {
                    const originalWarn = console.warn;
                    let warned = false;
                    console.warn = () => { warned = true; };
                    
                    validateHFToken(token);
                    console.warn = originalWarn;
                    
                    return !warned;
                }
            ), { numRuns: 5 });
        });

        it('should not warn for empty input', async function() {
            this.timeout(5000);
            
            await fc.assert(fc.property(
                fc.oneof(fc.constant(''), fc.constant('   '), fc.constant('\t')),
                (token) => {
                    const originalWarn = console.warn;
                    let warned = false;
                    console.warn = () => { warned = true; };
                    
                    validateHFToken(token);
                    console.warn = originalWarn;
                    
                    return !warned;
                }
            ), { numRuns: 5 });
        });
    });

    describe('Dockerfile ENV Injection', () => {
        it.skip('should inject ENV for any valid token with transformers', async function() {
            this.timeout(15000);
            
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                fc.constantFrom('vllm', 'sglang', 'tensorrt-llm'),
                async (token, server) => {
                    const modelName = server === 'tensorrt-llm' ? 'meta-llama/Llama-3.2-3B' : 'test/model';
                    
                    await helpers.default.run(getGeneratorPath())
                        .withOptions({
                            'skip-prompts': true,
                            'framework': 'transformers',
                            'model-server': server,
                            'model-name': modelName,
                            'hf-token': token,
                            'include-testing': false,
                            'include-sample': false
                        });
                    
                    assert.fileContent('Dockerfile', `ENV HF_TOKEN="${token}"`);
                    return true;
                }
            ), { numRuns: 15 });
        });

        it.skip('should not inject ENV for non-transformers frameworks', async function() {
            this.timeout(15000);
            
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                async (framework, token) => {
                    const options = {
                        'skip-prompts': true,
                        framework,
                        'model-server': 'flask',
                        'hf-token': token,
                        'include-testing': false,
                        'include-sample': false
                    };
                    
                    if (framework === 'sklearn') options['model-format'] = 'pkl';
                    else if (framework === 'xgboost') options['model-format'] = 'json';
                    else if (framework === 'tensorflow') options['model-format'] = 'keras';
                    
                    const result = await helpers.default.run(getGeneratorPath()).withOptions(options);
                    
                    const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                    const content = fs.readFileSync(dockerfilePath, 'utf8');
                    
                    return !content.includes('ENV HF_TOKEN=');
                }
            ), { numRuns: 15 });
        });

        it.skip('should not inject ENV for empty or null tokens', async function() {
            this.timeout(10000);
            
            await fc.assert(fc.asyncProperty(
                fc.oneof(fc.constant(null), fc.constant(''), fc.constant('   ')),
                fc.constantFrom('vllm', 'sglang'),
                async (token, server) => {
                    const options = {
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': server,
                        'model-name': 'test/model',
                        'include-testing': false,
                        'include-sample': false
                    };
                    
                    if (token !== null) {
                        options['hf-token'] = token;
                    }
                    
                    const result = await helpers.default.run(getGeneratorPath()).withOptions(options);
                    
                    const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                    const content = fs.readFileSync(dockerfilePath, 'utf8');
                    
                    return !content.includes('ENV HF_TOKEN=');
                }
            ), { numRuns: 10 });
        });

        it.skip('should place ENV HF_TOKEN in correct position', async function() {
            this.timeout(10000);
            
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,30}$/),
                async (token) => {
                    const result = await helpers.default.run(getGeneratorPath())
                        .withOptions({
                            'skip-prompts': true,
                            'framework': 'transformers',
                            'model-server': 'vllm',
                            'model-name': 'test/model',
                            'hf-token': token,
                            'include-testing': false,
                            'include-sample': false
                        });
                    
                    const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                    const content = fs.readFileSync(dockerfilePath, 'utf8');
                    
                    const vllmPos = content.indexOf('ENV VLLM_MODEL=');
                    const hfPos = content.indexOf('ENV HF_TOKEN=');
                    const copyPos = content.indexOf('COPY code/serve');
                    
                    return vllmPos !== -1 && hfPos !== -1 && copyPos !== -1 &&
                           vllmPos < hfPos && hfPos < copyPos;
                }
            ), { numRuns: 10 });
        });
    });

    describe('Token Precedence', () => {
        it.skip('should use CLI token over environment variable', async function() {
            this.timeout(10000);
            
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,30}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,30}$/),
                async (cliToken, envToken) => {
                    // Skip if tokens are the same
                    if (cliToken === envToken) return true;
                    
                    process.env.HF_TOKEN = envToken;
                    
                    await helpers.default.run(getGeneratorPath())
                        .withOptions({
                            'skip-prompts': true,
                            'framework': 'transformers',
                            'model-server': 'vllm',
                            'model-name': 'test/model',
                            'hf-token': cliToken,
                            'include-testing': false,
                            'include-sample': false
                        });
                    
                    delete process.env.HF_TOKEN;
                    
                    // CLI token should be used
                    assert.fileContent('Dockerfile', `ENV HF_TOKEN="${cliToken}"`);
                    return true;
                }
            ), { numRuns: 10 });
        });
    });

    describe('Token Privacy', () => {
        it.skip('should not log token values', async function() {
            this.timeout(10000);
            
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                async (token) => {
                    // Capture console output
                    const originalLog = console.log;
                    const logs = [];
                    console.log = (...args) => {
                        logs.push(args.join(' '));
                    };
                    
                    await helpers.default.run(getGeneratorPath())
                        .withOptions({
                            'skip-prompts': true,
                            'framework': 'transformers',
                            'model-server': 'vllm',
                            'model-name': 'test/model',
                            'hf-token': token,
                            'include-testing': false,
                            'include-sample': false
                        });
                    
                    console.log = originalLog;
                    
                    // Token should not appear in logs
                    const tokenInLogs = logs.some(log => log.includes(token));
                    return !tokenInLogs;
                }
            ), { numRuns: 10 });
        });
    });

    describe('Validation Consistency', () => {
        it('should consistently validate token format', async function() {
            this.timeout(5000);
            
            await fc.assert(fc.property(
                fc.string({ minLength: 10, maxLength: 50 }),
                (token) => {
                    // Run validation twice - should get same result
                    const originalWarn = console.warn;
                    let warned1 = false;
                    let warned2 = false;
                    
                    console.warn = () => { warned1 = true; };
                    validateHFToken(token);
                    
                    console.warn = () => { warned2 = true; };
                    validateHFToken(token);
                    
                    console.warn = originalWarn;
                    
                    // Results should be consistent
                    return warned1 === warned2;
                }
            ), { numRuns: 20 });
        });
    });
});
