// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Model Server Choices Property-Based Tests
 * 
 * Tests the correctness properties for TensorRT-LLM model server choice inclusion.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';
import { modelServerPrompts } from '../../generators/app/lib/prompts.js';

describe('TensorRT-LLM Model Server Choices - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Model Server Choices Property Tests');
        console.log('📋 Testing: Universal correctness properties for TensorRT-LLM model server choices');
        console.log('🔧 Configuration: 100 iterations per property');
        
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Model Server Choices Properties');

    describe('Property 1: Model Server Choice Inclusion', () => {
        it('should include tensorrt-llm in model server choices when framework is transformers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 1: Model Server Choice Inclusion');
            console.log('  📝 For any generator configuration where framework is "transformers", the model server choices should include "tensorrt-llm" alongside "vllm" and "sglang"');
            
            // Feature: tensorrt-llm-support, Property 1: Model server choices include tensorrt-llm for transformers
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow', 'transformers'),
                async (framework) => {
                    console.log(`    🔍 Testing model server choices for framework: ${framework}`);
                    
                    // Get the choices function from the prompt
                    const modelServerPrompt = modelServerPrompts[0];
                    const choicesFunction = modelServerPrompt.choices;
                    
                    // Call the choices function with the framework
                    const choices = choicesFunction({ framework });
                    
                    console.log(`    📋 Available choices for ${framework}: ${choices.join(', ')}`);
                    
                    if (framework === 'transformers') {
                        // For transformers, tensorrt-llm should be included
                        const hasTensorRtLlm = choices.includes('tensorrt-llm');
                        const hasVllm = choices.includes('vllm');
                        const hasSglang = choices.includes('sglang');
                        
                        if (!hasTensorRtLlm) {
                            console.log('    ❌ tensorrt-llm not found in transformers choices');
                            return false;
                        }
                        
                        if (!hasVllm || !hasSglang) {
                            console.log('    ❌ vllm or sglang not found in transformers choices');
                            return false;
                        }
                        
                        console.log('    ✅ tensorrt-llm correctly included for transformers framework');
                        return true;
                    } else {
                        // For non-transformers, tensorrt-llm should NOT be included
                        const hasTensorRtLlm = choices.includes('tensorrt-llm');
                        
                        if (hasTensorRtLlm) {
                            console.log(`    ❌ tensorrt-llm incorrectly included for ${framework} framework`);
                            return false;
                        }
                        
                        console.log(`    ✅ tensorrt-llm correctly excluded for ${framework} framework`);
                        return true;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 45000,
                interruptAfterTimeLimit: 40000
            });
            
            console.log('  ✅ Property 1 validated: Model server choices correctly include tensorrt-llm for transformers');
        });

        it('should maintain consistent choice ordering with tensorrt-llm as the third option for transformers', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 1b: Model Server Choice Ordering');
            console.log('  📝 For any transformers framework configuration, tensorrt-llm should appear as the third choice after vllm and sglang');
            
            // Feature: tensorrt-llm-support, Property 1: Model server choices include tensorrt-llm for transformers (ordering aspect)
            await fc.assert(fc.asyncProperty(
                fc.constant('transformers'),
                async (framework) => {
                    console.log(`    🔍 Testing choice ordering for framework: ${framework}`);
                    
                    // Get the choices function from the prompt
                    const modelServerPrompt = modelServerPrompts[0];
                    const choicesFunction = modelServerPrompt.choices;
                    
                    // Call the choices function with the framework
                    const choices = choicesFunction({ framework });
                    
                    console.log(`    📋 Choice order for ${framework}: ${choices.join(', ')}`);
                    
                    // Verify the expected order: vllm, sglang, tensorrt-llm
                    const expectedOrder = ['vllm', 'sglang', 'tensorrt-llm'];
                    
                    if (choices.length !== expectedOrder.length) {
                        console.log(`    ❌ Unexpected number of choices: ${choices.length} (expected ${expectedOrder.length})`);
                        return false;
                    }
                    
                    for (let i = 0; i < expectedOrder.length; i++) {
                        if (choices[i] !== expectedOrder[i]) {
                            console.log(`    ❌ Choice at position ${i} is "${choices[i]}" (expected "${expectedOrder[i]}")`);
                            return false;
                        }
                    }
                    
                    console.log('    ✅ Choice ordering is correct: vllm, sglang, tensorrt-llm');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 45000,
                interruptAfterTimeLimit: 40000
            });
            
            console.log('  ✅ Property 1b validated: Model server choice ordering is consistent');
        });

        it('should only show tensorrt-llm for transformers framework and not for traditional ML frameworks', async function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 1c: Framework-Specific Choice Filtering');
            console.log('  📝 For any non-transformers framework, tensorrt-llm should not appear in model server choices');
            
            // Feature: tensorrt-llm-support, Property 1: Model server choices include tensorrt-llm for transformers (exclusion aspect)
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                async (framework) => {
                    console.log(`    🔍 Testing tensorrt-llm exclusion for framework: ${framework}`);
                    
                    // Get the choices function from the prompt
                    const modelServerPrompt = modelServerPrompts[0];
                    const choicesFunction = modelServerPrompt.choices;
                    
                    // Call the choices function with the framework
                    const choices = choicesFunction({ framework });
                    
                    console.log(`    📋 Available choices for ${framework}: ${choices.join(', ')}`);
                    
                    // Verify tensorrt-llm is NOT in the choices
                    const hasTensorRtLlm = choices.includes('tensorrt-llm');
                    
                    if (hasTensorRtLlm) {
                        console.log(`    ❌ tensorrt-llm incorrectly included for ${framework} framework`);
                        return false;
                    }
                    
                    // Verify traditional ML servers are present
                    const hasFlask = choices.includes('flask');
                    const hasFastapi = choices.includes('fastapi');
                    
                    if (!hasFlask || !hasFastapi) {
                        console.log(`    ❌ Traditional ML servers (flask/fastapi) not found for ${framework}`);
                        return false;
                    }
                    
                    console.log(`    ✅ tensorrt-llm correctly excluded for ${framework} framework`);
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 45000,
                interruptAfterTimeLimit: 40000
            });
            
            console.log('  ✅ Property 1c validated: tensorrt-llm correctly excluded for non-transformers frameworks');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM Model Server Choices Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
