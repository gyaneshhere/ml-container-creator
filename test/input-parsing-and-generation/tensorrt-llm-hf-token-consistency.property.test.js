// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM HuggingFace Token Consistency Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token handling consistency
 * across vllm, sglang, and tensorrt-llm model servers.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import helpers from 'yeoman-test';

describe('TensorRT-LLM HuggingFace Token Consistency - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM HuggingFace Token Consistency Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token consistency');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM HuggingFace Token Consistency Properties');

    describe('Property 3: HuggingFace Token Consistency', () => {
        it('should set HF_TOKEN identically for vllm, sglang, and tensorrt-llm when token is provided', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 3: HuggingFace Token Consistency');
            console.log('  📝 For any generator configuration with transformers framework and a provided HF token, the generated Dockerfile should set HF_TOKEN environment variable identically for vllm, sglang, and tensorrt-llm');
            console.log('  📝 Validates: Requirements 4.1, 4.2, 4.3');
            
            // Feature: tensorrt-llm-support, Property 3: HF token handling is consistent across servers
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (hfToken, modelName) => {
                    console.log(`    🔍 Testing HF token consistency with token: ${hfToken.substring(0, 20)}... and model: ${modelName}`);
                    
                    try {
                        // Generate Dockerfiles for all three model servers
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const dockerfileContents = {};
                        
                        for (const modelServer of servers) {
                            const result = await helpers.run(getGeneratorPath())
                                .withOptions({
                                    'skip-prompts': true,
                                    'framework': 'transformers',
                                    'model-server': modelServer,
                                    'model-name': modelName,
                                    'hf-token': hfToken,
                                    'include-testing': false,
                                    'include-sample': false
                                });
                            
                            // Read Dockerfile content
                            const path = await import('path');
                            const fs = await import('fs');
                            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                            dockerfileContents[modelServer] = fs.readFileSync(dockerfilePath, 'utf8');
                        }
                        
                        // Verify all Dockerfiles contain ENV HF_TOKEN
                        for (const modelServer of servers) {
                            if (!dockerfileContents[modelServer].includes('ENV HF_TOKEN=')) {
                                console.log(`    ❌ ENV HF_TOKEN not found in ${modelServer} Dockerfile`);
                                return false;
                            }
                        }
                        
                        // Extract HF_TOKEN lines from each Dockerfile
                        const hfTokenLines = {};
                        for (const modelServer of servers) {
                            const match = dockerfileContents[modelServer].match(/ENV HF_TOKEN="[^"]+"/);
                            if (!match) {
                                console.log(`    ❌ Could not extract HF_TOKEN line from ${modelServer} Dockerfile`);
                                return false;
                            }
                            hfTokenLines[modelServer] = match[0];
                        }
                        
                        // Verify all HF_TOKEN lines are identical
                        const vllmLine = hfTokenLines['vllm'];
                        const sglangLine = hfTokenLines['sglang'];
                        const trtllmLine = hfTokenLines['tensorrt-llm'];
                        
                        if (vllmLine !== sglangLine || vllmLine !== trtllmLine) {
                            console.log('    ❌ HF_TOKEN lines are not identical:');
                            console.log(`       vllm:        ${vllmLine}`);
                            console.log(`       sglang:      ${sglangLine}`);
                            console.log(`       tensorrt-llm: ${trtllmLine}`);
                            return false;
                        }
                        
                        // Verify the token value is correct
                        const expectedLine = `ENV HF_TOKEN="${hfToken}"`;
                        if (vllmLine !== expectedLine) {
                            console.log('    ❌ HF_TOKEN line doesn\'t match expected format');
                            console.log(`       Expected: ${expectedLine}`);
                            console.log(`       Got:      ${vllmLine}`);
                            return false;
                        }
                        
                        console.log('    ✅ HF_TOKEN set identically across all transformer servers');
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
            
            console.log('  ✅ Property 3 validated: HF_TOKEN consistency across transformer servers');
        });

        it('should not set HF_TOKEN for any transformer server when token is not provided', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 3b: HF Token Omission Consistency');
            console.log('  📝 For any configuration without HF token, all transformer servers should omit ENV HF_TOKEN');
            console.log('  📝 Validates: Requirements 4.1, 4.2, 4.3');
            
            // Feature: tensorrt-llm-support, Property 3: HF token handling is consistent across servers (omission)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing HF token omission with model: ${modelName}`);
                    
                    try {
                        // Generate Dockerfiles for all three model servers without HF token
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const dockerfileContents = {};
                        
                        for (const modelServer of servers) {
                            const result = await helpers.run(getGeneratorPath())
                                .withOptions({
                                    'skip-prompts': true,
                                    'framework': 'transformers',
                                    'model-server': modelServer,
                                    'model-name': modelName,
                                    'include-testing': false,
                                    'include-sample': false
                                });
                            
                            // Read Dockerfile content
                            const path = await import('path');
                            const fs = await import('fs');
                            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                            dockerfileContents[modelServer] = fs.readFileSync(dockerfilePath, 'utf8');
                        }
                        
                        // Verify none of the Dockerfiles contain ENV HF_TOKEN
                        for (const modelServer of servers) {
                            if (dockerfileContents[modelServer].includes('ENV HF_TOKEN=')) {
                                console.log(`    ❌ ENV HF_TOKEN found in ${modelServer} Dockerfile when not provided`);
                                return false;
                            }
                        }
                        
                        console.log('    ✅ HF_TOKEN correctly omitted from all transformer servers');
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
            
            console.log('  ✅ Property 3b validated: HF_TOKEN omission consistent across transformer servers');
        });

        it('should place HF_TOKEN in same position relative to model ENV for all transformer servers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 3c: HF Token Placement Consistency');
            console.log('  📝 For any configuration with HF token, ENV HF_TOKEN should appear after model ENV and before COPY for all servers');
            console.log('  📝 Validates: Requirements 4.1, 4.2, 4.3');
            
            // Feature: tensorrt-llm-support, Property 3: HF token handling is consistent across servers (placement)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (hfToken, modelName) => {
                    console.log('    🔍 Testing HF token placement consistency');
                    
                    try {
                        // Generate Dockerfiles for all three model servers
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const placements = {};
                        
                        for (const modelServer of servers) {
                            const result = await helpers.run(getGeneratorPath())
                                .withOptions({
                                    'skip-prompts': true,
                                    'framework': 'transformers',
                                    'model-server': modelServer,
                                    'model-name': modelName,
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
                            let modelEnvPos;
                            if (modelServer === 'vllm') {
                                modelEnvPos = dockerfileContent.indexOf('ENV VLLM_MODEL=');
                            } else if (modelServer === 'sglang') {
                                modelEnvPos = dockerfileContent.indexOf('ENV SGLANG_MODEL_PATH=');
                            } else if (modelServer === 'tensorrt-llm') {
                                modelEnvPos = dockerfileContent.indexOf('ENV TRTLLM_MODEL=');
                            }
                            
                            const hfTokenPos = dockerfileContent.indexOf('ENV HF_TOKEN=');
                            const copyPos = dockerfileContent.indexOf('COPY code/serve');
                            
                            placements[modelServer] = {
                                modelEnvPos,
                                hfTokenPos,
                                copyPos,
                                valid: modelEnvPos !== -1 && hfTokenPos !== -1 && copyPos !== -1 &&
                                       modelEnvPos < hfTokenPos && hfTokenPos < copyPos
                            };
                        }
                        
                        // Verify all placements are valid
                        for (const modelServer of servers) {
                            if (!placements[modelServer].valid) {
                                console.log(`    ❌ Invalid placement for ${modelServer}:`);
                                console.log(`       Model ENV: ${placements[modelServer].modelEnvPos}`);
                                console.log(`       HF_TOKEN:  ${placements[modelServer].hfTokenPos}`);
                                console.log(`       COPY:      ${placements[modelServer].copyPos}`);
                                return false;
                            }
                        }
                        
                        console.log('    ✅ HF_TOKEN placement consistent across all transformer servers');
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
            
            console.log('  ✅ Property 3c validated: HF_TOKEN placement consistent');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM HuggingFace Token Consistency Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
