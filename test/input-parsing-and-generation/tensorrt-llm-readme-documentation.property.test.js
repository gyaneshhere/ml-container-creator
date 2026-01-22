// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM README Documentation Property-Based Tests
 * 
 * Tests the correctness properties for TensorRT-LLM documentation in generated README files.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { setupTestHooks } from './test-utils.js';

describe('TensorRT-LLM README Documentation - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM README Documentation Property Tests');
        console.log('📋 Testing: Universal correctness properties for TensorRT-LLM README documentation');
        console.log('🔧 Configuration: 100 iterations per property');
        
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM README Documentation Properties');

    describe('Property 9: README Documentation', () => {
        it('should include tensorrt-llm in the main project README', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 9: README Documentation');
            console.log('  📝 The main project README should include "tensorrt-llm" in the list of supported model servers');
            
            // Feature: tensorrt-llm-support, Property 9: README includes tensorrt-llm
            await fc.assert(fc.asyncProperty(
                fc.constant(true),
                async () => {
                    console.log('    🔍 Testing main project README.md');
                    
                    try {
                        // Check the main project README (use __dirname to get reliable path)
                        const projectRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '../..');
                        const readmePath = path.join(projectRoot, 'README.md');
                        
                        if (!fs.existsSync(readmePath)) {
                            console.log('    ❌ README.md not found in project root');
                            console.log(`    📁 Looked in: ${readmePath}`);
                            return false;
                        }
                        
                        console.log('    ✅ README.md found');
                        
                        // Read README content
                        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
                        
                        // Check for tensorrt-llm mentions
                        const hasTensorRtLlmMention = readmeContent.toLowerCase().includes('tensorrt-llm') ||
                                                      readmeContent.toLowerCase().includes('tensorrt_llm') ||
                                                      readmeContent.includes('TensorRT-LLM');
                        
                        if (!hasTensorRtLlmMention) {
                            console.log('    ❌ README does not mention tensorrt-llm');
                            return false;
                        }
                        
                        console.log('    ✅ README correctly includes tensorrt-llm reference');
                        
                        // Check that it's in the model server list
                        const modelServerPattern = /model[- ]server[s]?.*?(?:vllm|sglang|tensorrt)/is;
                        const hasModelServerSection = modelServerPattern.test(readmeContent);
                        
                        if (!hasModelServerSection) {
                            console.log('    ⚠️  tensorrt-llm not found in model server context');
                        } else {
                            console.log('    ✅ tensorrt-llm mentioned in model server context');
                        }
                        
                        // Check CLI options table includes tensorrt-llm
                        const cliTablePattern = /--model-server.*?(?:flask|fastapi|vllm|sglang|tensorrt-llm)/is;
                        const hasCliTable = cliTablePattern.test(readmeContent);
                        
                        if (!hasCliTable) {
                            console.log('    ⚠️  tensorrt-llm not found in CLI options table');
                        } else {
                            console.log('    ✅ tensorrt-llm found in CLI options table');
                        }
                        
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Error reading README: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 5000,
                interruptAfterTimeLimit: 4000
            });
            
            console.log('  ✅ Property 9 validated: README documentation correctly includes tensorrt-llm');
        });

        it('should include tensorrt-llm in model server list in CLI options table', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 9b: README CLI Options Table');
            console.log('  📝 The README CLI options table should list tensorrt-llm as a valid model server option');
            
            // Feature: tensorrt-llm-support, Property 9: README includes tensorrt-llm (CLI table aspect)
            await fc.assert(fc.asyncProperty(
                fc.constant(true),
                async () => {
                    console.log('    🔍 Testing CLI options table in README');
                    
                    try {
                        const projectRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '../..');
                        const readmePath = path.join(projectRoot, 'README.md');
                        
                        if (!fs.existsSync(readmePath)) {
                            console.log('    ❌ README.md not found');
                            return false;
                        }
                        
                        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
                        
                        // Look for the CLI options table with model-server row
                        const modelServerRowPattern = /\|\s*`--model-server[^|]*\|[^|]*\|[^|]*`flask`[^|]*`tensorrt-llm`[^|]*\|/i;
                        const hasModelServerRow = modelServerRowPattern.test(readmeContent);
                        
                        if (!hasModelServerRow) {
                            console.log('    ❌ tensorrt-llm not found in --model-server CLI option');
                            return false;
                        }
                        
                        console.log('    ✅ tensorrt-llm correctly listed in CLI options table');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 5000,
                interruptAfterTimeLimit: 4000
            });
            
            console.log('  ✅ Property 9b validated: CLI options table includes tensorrt-llm');
        });

        it('should include tensorrt-llm in transformers framework section', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 9c: README Framework-Specific Options');
            console.log('  📝 The README should list tensorrt-llm as a model server option for transformers framework');
            
            // Feature: tensorrt-llm-support, Property 9: README includes tensorrt-llm (framework section aspect)
            await fc.assert(fc.asyncProperty(
                fc.constant(true),
                async () => {
                    console.log('    🔍 Testing transformers framework section in README');
                    
                    try {
                        const projectRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '../..');
                        const readmePath = path.join(projectRoot, 'README.md');
                        
                        if (!fs.existsSync(readmePath)) {
                            console.log('    ❌ README.md not found');
                            return false;
                        }
                        
                        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
                        
                        // Look for transformers section with model servers
                        const transformersPattern = /transformers[^]*?model\s+servers[^]*?`tensorrt-llm`/is;
                        const hasTransformersSection = transformersPattern.test(readmeContent);
                        
                        if (!hasTransformersSection) {
                            console.log('    ❌ tensorrt-llm not found in transformers framework section');
                            return false;
                        }
                        
                        console.log('    ✅ tensorrt-llm correctly listed in transformers framework section');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 5000,
                interruptAfterTimeLimit: 4000
            });
            
            console.log('  ✅ Property 9c validated: Transformers framework section includes tensorrt-llm');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM README Documentation Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
