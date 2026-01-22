// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Serve Script Consistency Property-Based Tests
 * 
 * Tests the correctness properties for serve script consistency across transformer servers.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import helpers from 'yeoman-test';

describe('TensorRT-LLM Serve Script Consistency - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Serve Script Consistency Property Tests');
        console.log('📋 Testing: Universal correctness properties for serve script consistency');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Serve Script Consistency Properties');

    describe('Property 6: Serve Script Consistency', () => {
        it('should follow same structural pattern for all transformer servers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 6: Serve Script Consistency');
            console.log('  📝 For any transformer model server (vllm, sglang, tensorrt-llm), the generated serve scripts should follow the same structural pattern');
            console.log('  📝 Validates: Requirements 6.3, 9.3');
            
            // Feature: tensorrt-llm-support, Property 6: Serve scripts follow same pattern across servers
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing serve script consistency with model: ${modelName}`);
                    
                    try {
                        // Generate serve scripts for all three model servers
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const serveScripts = {};
                        
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
                            
                            // Read serve script content
                            const path = await import('path');
                            const fs = await import('fs');
                            const serveScriptPath = path.join(result.cwd, 'code/serve');
                            serveScripts[modelServer] = fs.readFileSync(serveScriptPath, 'utf8');
                        }
                        
                        // Verify all scripts have the same structural elements
                        const requiredElements = [
                            'Starting',  // Startup message
                            'SERVER_ARGS',  // Server arguments array
                            '--host 0.0.0.0',  // Host binding
                            // Note: port varies (8080 for vllm/sglang, 8081 for tensorrt-llm with nginx proxy)
                            'PREFIX=',  // Environment variable prefix
                            'EXCLUDE_VARS',  // Excluded variables array
                            'env | grep',  // Environment variable grep
                            'tr \'[:upper:]\' \'[:lower:]\'',  // Lowercase conversion
                            'tr \'_\' \'-\'',  // Underscore to dash conversion
                            'exec'  // Exec command
                        ];
                        
                        for (const modelServer of servers) {
                            for (const element of requiredElements) {
                                if (!serveScripts[modelServer].includes(element)) {
                                    console.log(`    ❌ ${modelServer} script missing element: ${element}`);
                                    return false;
                                }
                            }
                            
                            // Verify port configuration (conditional based on server)
                            if (modelServer === 'tensorrt-llm') {
                                if (!serveScripts[modelServer].includes('--port 8081')) {
                                    console.log(`    ❌ ${modelServer} script should use port 8081 (nginx proxy)`);
                                    return false;
                                }
                            } else {
                                if (!serveScripts[modelServer].includes('--port 8080')) {
                                    console.log(`    ❌ ${modelServer} script should use port 8080`);
                                    return false;
                                }
                            }
                        }
                        
                        console.log('    ✅ All serve scripts have consistent structure');
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
            
            console.log('  ✅ Property 6 validated: Serve script consistency across transformer servers');
        });

        it('should have consistent environment variable handling logic across servers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 6b: Environment Variable Handling Consistency');
            console.log('  📝 All transformer servers should use the same environment variable to argument conversion logic');
            console.log('  📝 Validates: Requirements 6.3');
            
            // Feature: tensorrt-llm-support, Property 6: Serve scripts follow same pattern across servers
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log('    🔍 Testing environment variable handling consistency');
                    
                    try {
                        // Generate serve scripts for all three model servers
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const serveScripts = {};
                        
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
                            
                            // Read serve script content
                            const path = await import('path');
                            const fs = await import('fs');
                            const serveScriptPath = path.join(result.cwd, 'code/serve');
                            serveScripts[modelServer] = fs.readFileSync(serveScriptPath, 'utf8');
                        }
                        
                        // Extract the conversion logic section from each script
                        // The logic should be identical except for the PREFIX value
                        const conversionLogicPattern = /# Loop through the array[\s\S]*?done/;
                        
                        for (const modelServer of servers) {
                            const match = serveScripts[modelServer].match(conversionLogicPattern);
                            if (!match) {
                                console.log(`    ❌ ${modelServer} script missing conversion logic`);
                                return false;
                            }
                        }
                        
                        // Verify all scripts have the same conversion steps
                        const conversionSteps = [
                            'IFS=',  // Variable splitting
                            'skip=false',  // Skip flag
                            'for exclude in',  // Exclusion loop
                            '${key#"${PREFIX}"}',  // Prefix removal
                            'tr \'[:upper:]\' \'[:lower:]\'',  // Lowercase
                            'tr \'_\' \'-\'',  // Dash replacement
                            'SERVER_ARGS+='  // Argument addition
                        ];
                        
                        for (const modelServer of servers) {
                            for (const step of conversionSteps) {
                                if (!serveScripts[modelServer].includes(step)) {
                                    console.log(`    ❌ ${modelServer} script missing conversion step: ${step}`);
                                    return false;
                                }
                            }
                        }
                        
                        console.log('    ✅ Environment variable handling logic consistent');
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
            
            console.log('  ✅ Property 6b validated: Environment variable handling consistency verified');
        });

        it('should have consistent argument array initialization across servers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 6c: Argument Array Initialization Consistency');
            console.log('  📝 All transformer servers should initialize SERVER_ARGS with --host 0.0.0.0 and appropriate port (8080 for vllm/sglang, 8081 for tensorrt-llm with nginx proxy)');
            console.log('  📝 Validates: Requirements 6.3');
            
            // Feature: tensorrt-llm-support, Property 6: Serve scripts follow same pattern across servers
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log('    🔍 Testing argument array initialization consistency');
                    
                    try {
                        // Generate serve scripts for all three model servers
                        const servers = ['vllm', 'sglang', 'tensorrt-llm'];
                        const serveScripts = {};
                        
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
                            
                            // Read serve script content
                            const path = await import('path');
                            const fs = await import('fs');
                            const serveScriptPath = path.join(result.cwd, 'code/serve');
                            serveScripts[modelServer] = fs.readFileSync(serveScriptPath, 'utf8');
                        }
                        
                        // Verify all scripts initialize SERVER_ARGS with host and port
                        // Note: port varies (8080 for vllm/sglang, 8081 for tensorrt-llm with nginx proxy)
                        
                        for (const modelServer of servers) {
                            const hasHostArg = serveScripts[modelServer].includes('SERVER_ARGS=(--host 0.0.0.0');
                            if (!hasHostArg) {
                                console.log(`    ❌ ${modelServer} script missing --host 0.0.0.0 in SERVER_ARGS`);
                                return false;
                            }
                            
                            // Check port based on server type
                            if (modelServer === 'tensorrt-llm') {
                                if (!serveScripts[modelServer].includes('--port 8081)')) {
                                    console.log(`    ❌ ${modelServer} script should use port 8081 (nginx proxy)`);
                                    return false;
                                }
                            } else {
                                if (!serveScripts[modelServer].includes('--port 8080)')) {
                                    console.log(`    ❌ ${modelServer} script should use port 8080`);
                                    return false;
                                }
                            }
                        }
                        
                        console.log('    ✅ Argument array initialization consistent');
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
            
            console.log('  ✅ Property 6c validated: Argument array initialization consistency verified');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM Serve Script Consistency Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
