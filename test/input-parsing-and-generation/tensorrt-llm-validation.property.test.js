// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Validation Property-Based Tests
 * 
 * Tests the correctness properties for TensorRT-LLM configuration validation.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';
import TemplateManager from '../../generators/app/lib/template-manager.js';

describe('TensorRT-LLM Validation - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Validation Property Tests');
        console.log('📋 Testing: Universal correctness properties for TensorRT-LLM validation');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Validation Properties');

    describe('Property 8: Validation Error for Invalid Framework', () => {
        it('should raise error when tensorrt-llm is used with non-transformers framework', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 8: Validation Error for Invalid Framework');
            console.log('  📝 For any generator configuration where modelServer is "tensorrt-llm" and framework is not "transformers", the generator should raise a validation error');
            console.log('  📝 Validates: Requirements 8.1');
            
            // Feature: tensorrt-llm-support, Property 8: Validation Error for Invalid Framework
            fc.assert(fc.property(
                // Generate non-transformer frameworks
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                (invalidFramework) => {
                    console.log(`    🔍 Testing validation error for tensorrt-llm with ${invalidFramework} framework`);
                    
                    try {
                        // Create configuration with tensorrt-llm and non-transformers framework
                        const answers = {
                            framework: invalidFramework,
                            modelServer: 'tensorrt-llm',
                            modelFormat: invalidFramework === 'sklearn' ? 'pkl' : 
                                invalidFramework === 'xgboost' ? 'json' : 'keras',
                            deployTarget: 'sagemaker',
                            includeSampleModel: false,
                            includeTesting: true,
                            instanceType: 'cpu-optimized',
                            awsRegion: 'us-east-1',
                            projectName: 'test-project',
                            destinationDir: '.'
                        };
                        
                        // Create template manager and validate
                        const templateManager = new TemplateManager(answers);
                        
                        // Validation should throw an error
                        let errorThrown = false;
                        let errorMessage = '';
                        
                        try {
                            templateManager.validate();
                        } catch (error) {
                            errorThrown = true;
                            errorMessage = error.message;
                        }
                        
                        // Verify error was thrown
                        if (!errorThrown) {
                            console.log('    ❌ No error thrown for invalid configuration');
                            return false;
                        }
                        
                        // Verify error message mentions TensorRT-LLM and transformers
                        if (!errorMessage.includes('TensorRT-LLM') || !errorMessage.includes('transformers')) {
                            console.log(`    ❌ Error message doesn't mention TensorRT-LLM or transformers: ${errorMessage}`);
                            return false;
                        }
                        
                        console.log('    ✅ Validation error raised with correct message');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with unexpected error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 8 validated: Validation errors raised for invalid framework combinations');
        });

        it('should not raise error when tensorrt-llm is used with transformers framework', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 8b: No Error for Valid Framework');
            console.log('  📝 For any generator configuration where modelServer is "tensorrt-llm" and framework is "transformers", validation should succeed');
            console.log('  📝 Validates: Requirements 8.1');
            
            // Feature: tensorrt-llm-support, Property 8: Validation Error for Invalid Framework (valid case)
            fc.assert(fc.property(
                // Generate various valid configurations with transformers
                fc.record({
                    deployTarget: fc.constantFrom('sagemaker', 'codebuild'),
                    includeSampleModel: fc.boolean(),
                    includeTesting: fc.boolean(),
                    instanceType: fc.constantFrom('cpu-optimized', 'gpu-enabled'),
                    awsRegion: fc.constantFrom('us-east-1', 'us-west-2', 'eu-west-1')
                }),
                (config) => {
                    console.log('    🔍 Testing no error for tensorrt-llm with transformers framework');
                    
                    try {
                        // Create configuration with tensorrt-llm and transformers framework
                        const answers = {
                            framework: 'transformers',
                            modelServer: 'tensorrt-llm',
                            modelName: 'meta-llama/Llama-3.2-3B',
                            deployTarget: config.deployTarget,
                            includeSampleModel: config.includeSampleModel,
                            includeTesting: config.includeTesting,
                            instanceType: config.instanceType,
                            awsRegion: config.awsRegion,
                            projectName: 'test-project',
                            destinationDir: '.'
                        };
                        
                        // Create template manager and validate
                        const templateManager = new TemplateManager(answers);
                        
                        // Validation should NOT throw an error
                        let errorThrown = false;
                        let errorMessage = '';
                        
                        try {
                            templateManager.validate();
                        } catch (error) {
                            errorThrown = true;
                            errorMessage = error.message;
                        }
                        
                        // Verify no error was thrown
                        if (errorThrown) {
                            console.log(`    ❌ Error thrown for valid configuration: ${errorMessage}`);
                            return false;
                        }
                        
                        console.log('    ✅ No validation error for valid configuration');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with unexpected error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 8b validated: No errors for valid tensorrt-llm with transformers');
        });

        it('should not raise tensorrt-llm error when using other model servers with non-transformers', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 8c: No TensorRT-LLM Error for Other Servers');
            console.log('  📝 For any generator configuration where modelServer is not "tensorrt-llm", the tensorrt-llm validation should not trigger');
            console.log('  📝 Validates: Requirements 8.1');
            
            // Feature: tensorrt-llm-support, Property 8: Validation Error for Invalid Framework (other servers)
            fc.assert(fc.property(
                // Generate valid framework/server combinations
                fc.oneof(
                    fc.record({
                        framework: fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                        modelServer: fc.constantFrom('flask', 'fastapi')
                    }),
                    fc.record({
                        framework: fc.constant('transformers'),
                        modelServer: fc.constantFrom('vllm', 'sglang')
                    })
                ),
                (config) => {
                    console.log(`    🔍 Testing no tensorrt-llm error for ${config.modelServer} with ${config.framework}`);
                    
                    try {
                        // Create configuration with non-tensorrt-llm server
                        const answers = {
                            framework: config.framework,
                            modelServer: config.modelServer,
                            modelFormat: config.framework === 'sklearn' ? 'pkl' : 
                                config.framework === 'xgboost' ? 'json' : 
                                    config.framework === 'tensorflow' ? 'keras' : undefined,
                            modelName: config.framework === 'transformers' ? 'meta-llama/Llama-3.2-3B' : undefined,
                            deployTarget: 'sagemaker',
                            includeSampleModel: false,
                            includeTesting: true,
                            instanceType: 'cpu-optimized',
                            awsRegion: 'us-east-1',
                            projectName: 'test-project',
                            destinationDir: '.'
                        };
                        
                        // Create template manager and validate
                        const templateManager = new TemplateManager(answers);
                        
                        // Validation should NOT throw tensorrt-llm specific error
                        let errorThrown = false;
                        let errorMessage = '';
                        
                        try {
                            templateManager.validate();
                        } catch (error) {
                            errorThrown = true;
                            errorMessage = error.message;
                        }
                        
                        // If error was thrown, it should NOT be about tensorrt-llm
                        if (errorThrown && errorMessage.includes('TensorRT-LLM')) {
                            console.log(`    ❌ TensorRT-LLM error thrown for non-tensorrt-llm server: ${errorMessage}`);
                            return false;
                        }
                        
                        console.log('    ✅ No TensorRT-LLM validation error for other servers');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with unexpected error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 8c validated: TensorRT-LLM validation only applies to tensorrt-llm server');
        });
    });
});
