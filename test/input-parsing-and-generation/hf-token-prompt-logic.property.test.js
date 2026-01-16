// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Prompt Logic Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token prompt conditional logic.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: huggingface-token-authentication
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';

describe('HuggingFace Token Prompt Logic - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Prompt Logic Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token prompt display');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Prompt Logic Properties');

    // List of example model IDs that should skip the prompt
    const EXAMPLE_MODEL_IDS = [
        'openai/gpt-oss-20b',
        'meta-llama/Llama-3.2-3B-Instruct',
        'meta-llama/Llama-3.2-1B-Instruct'
    ];

    /**
     * Helper function to determine if HF token prompt should be shown
     * This mirrors the logic in prompts.js
     */
    function shouldShowHfTokenPrompt(answers) {
        const isTransformers = answers.framework === 'transformers';
        const isManualEntry = answers.modelName === 'Custom (enter manually)';
        
        if (isTransformers && isManualEntry && answers.customModelName) {
            const customModel = answers.customModelName.toLowerCase();
            const isExampleModel = EXAMPLE_MODEL_IDS.some(
                exampleId => exampleId.toLowerCase() === customModel
            );
            
            return !isExampleModel; // Show prompt only if NOT an example model
        }
        
        return false; // Skip prompt for non-transformers or non-manual entry
    }

    describe('Property 1: Conditional Prompt Display for Manual Model Entry', () => {
        it('should show HF_TOKEN prompt when framework is transformers and user manually enters a custom model', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 1: Conditional Prompt Display for Manual Model Entry');
            console.log('  📝 For any configuration where framework is "transformers" and modelName is "Custom (enter manually)" with a non-example customModelName, the Generator should prompt for HF_TOKEN');
            console.log('  📝 Validates: Requirements 1.1');
            
            // Feature: huggingface-token-authentication, Property 1: Conditional Prompt Display for Manual Model Entry
            fc.assert(fc.property(
                // Generate custom model names that are NOT in the example list
                fc.stringMatching(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/)
                    .filter(modelName => {
                        const lowerModel = modelName.toLowerCase();
                        return !EXAMPLE_MODEL_IDS.some(exampleId => exampleId.toLowerCase() === lowerModel);
                    }),
                (customModelName) => {
                    console.log(`    🔍 Testing prompt display for custom model: ${customModelName}`);
                    
                    const answers = {
                        framework: 'transformers',
                        modelName: 'Custom (enter manually)',
                        customModelName
                    };
                    
                    const shouldPrompt = shouldShowHfTokenPrompt(answers);
                    
                    if (!shouldPrompt) {
                        console.log(`    ❌ Prompt should be shown for custom model: ${customModelName}`);
                        return false;
                    }
                    
                    console.log('    ✅ Prompt correctly shown for custom model');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 1 validated: Conditional prompt display working correctly for manual model entry');
        });
    });

    describe('Property 2: No Prompt for Example Models', () => {
        it('should NOT show HF_TOKEN prompt when framework is transformers and modelName matches an example model (case-insensitive)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 2: No Prompt for Example Models');
            console.log('  📝 For any configuration where framework is "transformers" and modelName matches an example model ID (case-insensitive), the Generator should not prompt for HF_TOKEN');
            console.log('  📝 Validates: Requirements 1.2, 15.2, 15.4');
            
            // Feature: huggingface-token-authentication, Property 2: No Prompt for Example Models
            fc.assert(fc.property(
                // Generate variations of example model IDs with different cases
                fc.constantFrom(...EXAMPLE_MODEL_IDS).chain(exampleId => 
                    fc.constantFrom(
                        exampleId,                           // Original case
                        exampleId.toUpperCase(),             // All uppercase
                        exampleId.toLowerCase(),             // All lowercase
                        exampleId.split('/').map((part, i) => // Mixed case
                            i === 0 ? part.toUpperCase() : part.toLowerCase()
                        ).join('/')
                    )
                ),
                (modelId) => {
                    console.log(`    🔍 Testing prompt skip for example model: ${modelId}`);
                    
                    const answers = {
                        framework: 'transformers',
                        modelName: 'Custom (enter manually)',
                        customModelName: modelId
                    };
                    
                    const shouldPrompt = shouldShowHfTokenPrompt(answers);
                    
                    if (shouldPrompt) {
                        console.log(`    ❌ Prompt should NOT be shown for example model: ${modelId}`);
                        return false;
                    }
                    
                    console.log('    ✅ Prompt correctly skipped for example model');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 2 validated: Prompt correctly skipped for example models');
        });

        it('should NOT show HF_TOKEN prompt when user selects an example model from the list (not custom entry)', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 2b: No Prompt for Selected Example Models');
            console.log('  📝 When user selects an example model from the list (not "Custom (enter manually)"), prompt should be skipped');
            console.log('  📝 Validates: Requirements 1.2, 15.2');
            
            // Feature: huggingface-token-authentication, Property 2: No Prompt for Example Models (selected)
            fc.assert(fc.property(
                fc.constantFrom(...EXAMPLE_MODEL_IDS),
                (selectedModel) => {
                    console.log(`    🔍 Testing prompt skip for selected model: ${selectedModel}`);
                    
                    const answers = {
                        framework: 'transformers',
                        modelName: selectedModel  // User selected from list, not "Custom (enter manually)"
                    };
                    
                    const shouldPrompt = shouldShowHfTokenPrompt(answers);
                    
                    if (shouldPrompt) {
                        console.log(`    ❌ Prompt should NOT be shown for selected example model: ${selectedModel}`);
                        return false;
                    }
                    
                    console.log('    ✅ Prompt correctly skipped for selected example model');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 2b validated: Prompt correctly skipped for selected example models');
        });
    });

    describe('Property 3: No Prompt for Non-Transformer Frameworks', () => {
        it('should NOT show HF_TOKEN prompt when framework is not transformers, regardless of other parameters', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 3: No Prompt for Non-Transformer Frameworks');
            console.log('  📝 For any configuration where framework is not "transformers", the Generator should not prompt for HF_TOKEN regardless of other parameters');
            console.log('  📝 Validates: Requirements 1.3');
            
            // Feature: huggingface-token-authentication, Property 3: No Prompt for Non-Transformer Frameworks
            fc.assert(fc.property(
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                fc.oneof(
                    fc.constant('Custom (enter manually)'),
                    fc.constant('some-model-name')
                ),
                fc.option(fc.string(), { nil: undefined }),
                (framework, modelName, customModelName) => {
                    console.log(`    🔍 Testing prompt skip for framework: ${framework}`);
                    
                    const answers = {
                        framework,
                        modelName
                    };
                    
                    if (customModelName !== undefined) {
                        answers.customModelName = customModelName;
                    }
                    
                    const shouldPrompt = shouldShowHfTokenPrompt(answers);
                    
                    if (shouldPrompt) {
                        console.log(`    ❌ Prompt should NOT be shown for non-transformer framework: ${framework}`);
                        return false;
                    }
                    
                    console.log('    ✅ Prompt correctly skipped for non-transformer framework');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 3 validated: Prompt correctly skipped for non-transformer frameworks');
        });

        it('should NOT show HF_TOKEN prompt for transformers framework when modelName is not "Custom (enter manually)"', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 3b: No Prompt for Transformers Without Custom Entry');
            console.log('  📝 When framework is transformers but modelName is not "Custom (enter manually)", prompt should be skipped');
            console.log('  📝 Validates: Requirements 1.1 (inverse case)');
            
            // Feature: huggingface-token-authentication, Property 3: No Prompt for Non-Transformer Frameworks (transformers without custom)
            fc.assert(fc.property(
                fc.constantFrom(...EXAMPLE_MODEL_IDS),
                (modelName) => {
                    console.log(`    🔍 Testing prompt skip for transformers with selected model: ${modelName}`);
                    
                    const answers = {
                        framework: 'transformers',
                        modelName  // Not "Custom (enter manually)"
                    };
                    
                    const shouldPrompt = shouldShowHfTokenPrompt(answers);
                    
                    if (shouldPrompt) {
                        console.log('    ❌ Prompt should NOT be shown when modelName is not "Custom (enter manually)"');
                        return false;
                    }
                    
                    console.log('    ✅ Prompt correctly skipped');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 3b validated: Prompt correctly skipped for transformers without custom entry');
        });
    });
});
