// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Dockerfile Template Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token injection into Dockerfile templates.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: huggingface-token-authentication
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('HuggingFace Token Dockerfile Template - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Dockerfile Template Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token Dockerfile injection');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Dockerfile Template Properties');

    describe('Property 7: Dockerfile ENV Injection', () => {
        it('should inject ENV HF_TOKEN directive for any non-empty token value', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 7: Dockerfile ENV Injection');
            console.log('  📝 For any configuration with a non-empty hfToken value, the generated Dockerfile should contain an ENV HF_TOKEN directive with the correct token value');
            console.log('  📝 Validates: Requirements 4.1, 4.2');
            
            // Feature: huggingface-token-authentication, Property 7: Dockerfile ENV Injection
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                fc.constantFrom('vllm', 'sglang'),
                async (hfToken, modelServer) => {
                    console.log(`    🔍 Testing ENV injection with token: ${hfToken.substring(0, 20)}... and server: ${modelServer}`);
                    
                    try {
                        await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': modelServer,
                                'model-name': 'meta-llama/Llama-2-7b-hf',
                                'hf-token': hfToken,
                                'include-testing': false,
                                'include-sample': false
                            });
                        
                        // Verify Dockerfile exists
                        assert.file(['Dockerfile']);
                        
                        // Verify ENV HF_TOKEN directive is present
                        assert.fileContent('Dockerfile', /ENV HF_TOKEN=/);
                        
                        // Verify the token value is correctly injected
                        const expectedEnvLine = `ENV HF_TOKEN="${hfToken}"`;
                        assert.fileContent('Dockerfile', expectedEnvLine);
                        
                        console.log('    ✅ ENV HF_TOKEN directive correctly injected');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ ENV injection failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 7 validated: ENV HF_TOKEN injection working correctly for all non-empty tokens');
        });

        it('should place ENV HF_TOKEN after VLLM_MODEL and before COPY', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 7b: ENV Directive Placement');
            console.log('  📝 For any token value, ENV HF_TOKEN should appear after ENV VLLM_MODEL and before COPY command');
            console.log('  📝 Validates: Requirements 4.4');
            
            // Feature: huggingface-token-authentication, Property 7: Dockerfile ENV Injection (placement)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                async (hfToken) => {
                    console.log('    🔍 Testing ENV directive placement');
                    
                    try {
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': 'vllm',
                                'model-name': 'meta-llama/Llama-2-7b-hf',
                                'hf-token': hfToken,
                                'include-testing': false,
                                'include-sample': false
                            });
                        
                        // Read Dockerfile content
                        const path = await import('path');
                        const fs = await import('fs');
                        const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                        
                        // Find positions of key directives
                        const vllmModelPos = dockerfileContent.indexOf('ENV VLLM_MODEL=');
                        const hfTokenPos = dockerfileContent.indexOf('ENV HF_TOKEN=');
                        const copyPos = dockerfileContent.indexOf('COPY code/serve');
                        
                        // Verify all directives exist
                        if (vllmModelPos === -1) {
                            console.log('    ❌ ENV VLLM_MODEL not found');
                            return false;
                        }
                        if (hfTokenPos === -1) {
                            console.log('    ❌ ENV HF_TOKEN not found');
                            return false;
                        }
                        if (copyPos === -1) {
                            console.log('    ❌ COPY command not found');
                            return false;
                        }
                        
                        // Verify correct order: VLLM_MODEL < HF_TOKEN < COPY
                        if (!(vllmModelPos < hfTokenPos && hfTokenPos < copyPos)) {
                            console.log(`    ❌ Incorrect directive order: VLLM_MODEL=${vllmModelPos}, HF_TOKEN=${hfTokenPos}, COPY=${copyPos}`);
                            return false;
                        }
                        
                        console.log('    ✅ ENV directive placement correct');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Placement test failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 7b validated: ENV directive placement correct');
        });

        it('should only inject ENV HF_TOKEN in transformers section', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 7c: Transformers-Only Injection');
            console.log('  📝 ENV HF_TOKEN should only appear in transformers framework Dockerfiles');
            console.log('  📝 Validates: Requirements 4.4');
            
            // Feature: huggingface-token-authentication, Property 7: Dockerfile ENV Injection (transformers only)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                fc.constantFrom('flask', 'fastapi'),
                async (hfToken, framework, modelServer) => {
                    console.log(`    🔍 Testing non-transformers framework: ${framework}`);
                    
                    try {
                        const options = {
                            'skip-prompts': true,
                            framework,
                            'model-server': modelServer,
                            'hf-token': hfToken,
                            'include-testing': false,
                            'include-sample': false
                        };
                        
                        // Add model format for non-transformer frameworks
                        if (framework === 'sklearn') {
                            options['model-format'] = 'pkl';
                        } else if (framework === 'xgboost') {
                            options['model-format'] = 'json';
                        } else if (framework === 'tensorflow') {
                            options['model-format'] = 'keras';
                        }
                        
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions(options);
                        
                        // Read Dockerfile content
                        const path = await import('path');
                        const fs = await import('fs');
                        const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                        
                        // Verify ENV HF_TOKEN is NOT present
                        if (dockerfileContent.includes('ENV HF_TOKEN=')) {
                            console.log('    ❌ ENV HF_TOKEN found in non-transformers Dockerfile');
                            return false;
                        }
                        
                        console.log(`    ✅ ENV HF_TOKEN correctly excluded from ${framework} Dockerfile`);
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
            
            console.log('  ✅ Property 7c validated: ENV HF_TOKEN only in transformers Dockerfiles');
        });
    });

    describe('Property 8: No ENV Injection for Empty Tokens', () => {
        it('should not inject ENV HF_TOKEN directive for empty or null token values', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 8: No ENV Injection for Empty Tokens');
            console.log('  📝 For any configuration where hfToken is null or empty string, the generated Dockerfile should not contain an ENV HF_TOKEN directive');
            console.log('  📝 Validates: Requirements 4.3');
            
            // Feature: huggingface-token-authentication, Property 8: No ENV Injection for Empty Tokens
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.constant(null),
                    fc.constant(''),
                    fc.constant('   ')
                ),
                fc.constantFrom('vllm', 'sglang'),
                async (hfToken, modelServer) => {
                    console.log(`    🔍 Testing no ENV injection with token: ${hfToken === null ? 'null' : `'${hfToken}'`}`);
                    
                    try {
                        const options = {
                            'skip-prompts': true,
                            'framework': 'transformers',
                            'model-server': modelServer,
                            'model-name': 'meta-llama/Llama-2-7b-hf',
                            'include-testing': false,
                            'include-sample': false
                        };
                        
                        // Only add hf-token if not null
                        if (hfToken !== null) {
                            options['hf-token'] = hfToken;
                        }
                        
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions(options);
                        
                        // Verify Dockerfile exists
                        assert.file(['Dockerfile']);
                        
                        // Read Dockerfile content
                        const path = await import('path');
                        const fs = await import('fs');
                        const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                        const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                        
                        // Verify ENV HF_TOKEN is NOT present
                        if (dockerfileContent.includes('ENV HF_TOKEN=')) {
                            console.log('    ❌ ENV HF_TOKEN found when token is empty/null');
                            return false;
                        }
                        
                        console.log('    ✅ ENV HF_TOKEN correctly excluded for empty/null token');
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
            
            console.log('  ✅ Property 8 validated: No ENV injection for empty/null tokens');
        });

        it('should generate valid Dockerfile without HF_TOKEN when not provided', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 8b: Valid Dockerfile Without Token');
            console.log('  📝 Dockerfile should be valid and complete even without HF_TOKEN');
            console.log('  📝 Validates: Requirements 4.3, 13.1');
            
            // Feature: huggingface-token-authentication, Property 8: No ENV Injection (backward compatibility)
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('vllm', 'sglang'),
                fc.stringMatching(/^[a-z0-9-]+\/[a-z0-9-]+$/),
                async (modelServer, modelName) => {
                    console.log(`    🔍 Testing Dockerfile generation without token for ${modelServer}`);
                    
                    try {
                        const result = await helpers.run(getGeneratorPath())
                            .withOptions({
                                'skip-prompts': true,
                                'framework': 'transformers',
                                'model-server': modelServer,
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
                        
                        // Verify essential directives are present
                        if (!dockerfileContent.includes('FROM')) {
                            console.log('    ❌ FROM directive missing');
                            return false;
                        }
                        // Check for model server-specific ENV variable
                        const hasVllmModel = dockerfileContent.includes('ENV VLLM_MODEL=');
                        const hasSglangModel = dockerfileContent.includes('ENV SGLANG_MODEL_PATH=');
                        if (!hasVllmModel && !hasSglangModel) {
                            console.log('    ❌ ENV VLLM_MODEL or ENV SGLANG_MODEL_PATH missing');
                            return false;
                        }
                        if (!dockerfileContent.includes('COPY code/serve')) {
                            console.log('    ❌ COPY command missing');
                            return false;
                        }
                        if (!dockerfileContent.includes('ENTRYPOINT')) {
                            console.log('    ❌ ENTRYPOINT missing');
                            return false;
                        }
                        
                        // Verify HF_TOKEN is not present
                        if (dockerfileContent.includes('ENV HF_TOKEN=')) {
                            console.log('    ❌ ENV HF_TOKEN found when not provided');
                            return false;
                        }
                        
                        console.log('    ✅ Valid Dockerfile generated without HF_TOKEN');
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
            
            console.log('  ✅ Property 8b validated: Valid Dockerfile generation without token');
        });
    });
});
