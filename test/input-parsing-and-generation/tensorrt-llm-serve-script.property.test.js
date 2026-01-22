// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Serve Script Configuration Property-Based Tests
 * 
 * Tests the correctness properties for TensorRT-LLM serve script generation.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('TensorRT-LLM Serve Script Configuration - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Serve Script Configuration Property Tests');
        console.log('📋 Testing: Universal correctness properties for TensorRT-LLM serve script generation');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Serve Script Configuration Properties');

    describe('Property 4: Serve Script Command Configuration', () => {
        it('should use trtllm-serve command for tensorrt-llm model server', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 4: Serve Script Command Configuration');
            console.log('  📝 For any generator configuration where modelServer is "tensorrt-llm", the generated serve script should use "trtllm-serve" as the exec command, bind to host 0.0.0.0 and port 8081 (nginx proxies to 8080), set PREFIX to "TRTLLM_", and display "Starting TensorRT-LLM server"');
            console.log('  📝 Validates: Requirements 5.1, 5.2, 5.3, 5.5, 5.6');
            
            // Feature: tensorrt-llm-support, Property 4: Serve script has correct command and configuration
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log(`    🔍 Testing serve script generation with model: ${modelName}`);
                    
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
                        
                        // Verify serve script exists
                        assert.file(['code/serve']);
                        
                        // Read serve script content
                        const path = await import('path');
                        const fs = await import('fs');
                        const serveScriptPath = path.join(result.cwd, 'code/serve');
                        const serveScriptContent = fs.readFileSync(serveScriptPath, 'utf8');
                        
                        // Verify startup message
                        if (!serveScriptContent.includes('Starting TensorRT-LLM server')) {
                            console.log('    ❌ Startup message not found or incorrect');
                            return false;
                        }
                        
                        // Verify PREFIX is set to TRTLLM_
                        if (!serveScriptContent.includes('PREFIX="TRTLLM_"')) {
                            console.log('    ❌ PREFIX not set to TRTLLM_');
                            return false;
                        }
                        
                        // Verify host and port arguments (port 8081 for TensorRT-LLM with nginx proxy)
                        if (!serveScriptContent.includes('--host 0.0.0.0') || !serveScriptContent.includes('--port 8081')) {
                            console.log('    ❌ Host or port arguments not correct (should be 0.0.0.0:8081 for nginx proxy)');
                            return false;
                        }
                        
                        // Verify exec command uses trtllm-serve with correct syntax
                        // Should be: exec trtllm-serve serve "$TRTLLM_MODEL" "${SERVER_ARGS[@]}"
                        if (!serveScriptContent.includes('exec trtllm-serve serve "$TRTLLM_MODEL"')) {
                            console.log('    ❌ Exec command does not use correct trtllm-serve syntax');
                            return false;
                        }
                        
                        // Verify TRTLLM_MODEL check exists
                        if (!serveScriptContent.includes('if [ -z "$TRTLLM_MODEL" ]')) {
                            console.log('    ❌ TRTLLM_MODEL validation check not found');
                            return false;
                        }
                        
                        console.log('    ✅ Serve script configuration correct for tensorrt-llm');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Serve script generation failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 4 validated: Serve script command configuration correct');
        });

        it('should include environment variable conversion logic for TRTLLM_ prefix', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 4b: Environment Variable Conversion Logic');
            console.log('  📝 The serve script should include logic to convert TRTLLM_ prefixed environment variables to command-line arguments');
            console.log('  📝 Validates: Requirements 5.3, 5.4');
            
            // Feature: tensorrt-llm-support, Property 4: Serve script has correct command and configuration
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log('    🔍 Testing environment variable conversion logic');
                    
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
                        
                        // Read serve script content
                        const path = await import('path');
                        const fs = await import('fs');
                        const serveScriptPath = path.join(result.cwd, 'code/serve');
                        const serveScriptContent = fs.readFileSync(serveScriptPath, 'utf8');
                        
                        // Verify environment variable grep logic
                        if (!serveScriptContent.includes('env | grep "^${PREFIX}"')) {
                            console.log('    ❌ Environment variable grep logic not found');
                            return false;
                        }
                        
                        // Verify conversion logic (lowercase, replace underscores)
                        if (!serveScriptContent.includes('tr \'[:upper:]\' \'[:lower:]\'') || 
                            !serveScriptContent.includes('tr \'_\' \'-\'')) {
                            console.log('    ❌ Conversion logic not found');
                            return false;
                        }
                        
                        // Verify prefix removal logic
                        if (!serveScriptContent.includes('${key#"${PREFIX}"}')) {
                            console.log('    ❌ Prefix removal logic not found');
                            return false;
                        }
                        
                        console.log('    ✅ Environment variable conversion logic present');
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
            
            console.log('  ✅ Property 4b validated: Environment variable conversion logic correct');
        });

        it('should exclude TRTLLM_MODEL from EXCLUDE_VARS array for tensorrt-llm', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 4c: EXCLUDE_VARS Configuration');
            console.log('  📝 The serve script should exclude TRTLLM_MODEL from command-line arguments');
            console.log('  📝 Validates: Requirements 5.4');
            
            // Feature: tensorrt-llm-support, Property 4: Serve script has correct command and configuration
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^[a-z0-9-]+\/[A-Za-z0-9-_.]+$/),
                async (modelName) => {
                    console.log('    🔍 Testing EXCLUDE_VARS configuration');
                    
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
                        
                        // Read serve script content
                        const path = await import('path');
                        const fs = await import('fs');
                        const serveScriptPath = path.join(result.cwd, 'code/serve');
                        const serveScriptContent = fs.readFileSync(serveScriptPath, 'utf8');
                        
                        // Verify EXCLUDE_VARS includes TRTLLM_MODEL
                        // After EJS processing, the script should contain EXCLUDE_VARS=("TRTLLM_MODEL")
                        if (!serveScriptContent.includes('EXCLUDE_VARS=("TRTLLM_MODEL")')) {
                            console.log('    ❌ EXCLUDE_VARS does not exclude TRTLLM_MODEL');
                            return false;
                        }
                        
                        // Verify PREFIX is set to TRTLLM_ (confirms we're in the right conditional)
                        if (!serveScriptContent.includes('PREFIX="TRTLLM_"')) {
                            console.log('    ❌ PREFIX not set to TRTLLM_ (wrong conditional)');
                            return false;
                        }
                        
                        console.log('    ✅ EXCLUDE_VARS correctly excludes TRTLLM_MODEL');
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
            
            console.log('  ✅ Property 4c validated: EXCLUDE_VARS configuration correct');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM Serve Script Configuration Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
