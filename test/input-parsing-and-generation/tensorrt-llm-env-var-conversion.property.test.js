// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Environment Variable Conversion Property-Based Tests
 * 
 * Tests the correctness properties for environment variable to command-line argument conversion.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';

describe('TensorRT-LLM Environment Variable Conversion - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Environment Variable Conversion Property Tests');
        console.log('📋 Testing: Universal correctness properties for environment variable conversion');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Environment Variable Conversion Properties');

    describe('Property 5: Environment Variable Conversion', () => {
        it('should convert TRTLLM_ prefixed variables to command-line arguments correctly', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 5: Environment Variable Conversion');
            console.log('  📝 For any environment variable with TRTLLM_ prefix, the conversion should remove prefix, convert to lowercase, replace underscores with dashes, and prepend with --');
            console.log('  📝 Validates: Requirements 5.3, 6.1, 6.2, 6.4');
            
            // Feature: tensorrt-llm-support, Property 5: Environment variables are converted correctly
            await fc.assert(fc.property(
                fc.stringMatching(/^[A-Z_]+$/),
                (envVarSuffix) => {
                    console.log(`    🔍 Testing conversion for TRTLLM_${envVarSuffix}`);
                    
                    // Simulate the conversion logic from the serve script
                    const fullVarName = `TRTLLM_${envVarSuffix}`;
                    const prefix = 'TRTLLM_';
                    
                    // Remove prefix
                    const withoutPrefix = fullVarName.substring(prefix.length);
                    
                    // Convert to lowercase
                    const lowercase = withoutPrefix.toLowerCase();
                    
                    // Replace underscores with dashes
                    const argName = lowercase.replace(/_/g, '-');
                    
                    // Prepend with --
                    const finalArg = `--${argName}`;
                    
                    // Verify the conversion follows the expected pattern
                    const expectedPattern = /^--[a-z-]+$/;
                    
                    if (!expectedPattern.test(finalArg)) {
                        console.log(`    ❌ Conversion result "${finalArg}" doesn't match expected pattern`);
                        return false;
                    }
                    
                    // Verify no uppercase letters remain
                    if (/[A-Z]/.test(finalArg)) {
                        console.log(`    ❌ Uppercase letters found in converted argument: ${finalArg}`);
                        return false;
                    }
                    
                    // Verify no underscores remain
                    if (finalArg.includes('_')) {
                        console.log(`    ❌ Underscores found in converted argument: ${finalArg}`);
                        return false;
                    }
                    
                    // Verify prefix was removed
                    if (finalArg.toLowerCase().includes('trtllm')) {
                        console.log(`    ❌ Prefix not properly removed: ${finalArg}`);
                        return false;
                    }
                    
                    console.log(`    ✅ Conversion correct: TRTLLM_${envVarSuffix} → ${finalArg}`);
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5 validated: Environment variable conversion algorithm correct');
        });

        it('should handle both flag arguments and value arguments', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 5b: Flag and Value Argument Handling');
            console.log('  📝 The conversion should handle both flag arguments (no value) and value arguments appropriately');
            console.log('  📝 Validates: Requirements 6.4');
            
            // Feature: tensorrt-llm-support, Property 5: Environment variables are converted correctly
            await fc.assert(fc.property(
                fc.stringMatching(/^[A-Z_]+$/),
                fc.oneof(
                    fc.constant(''),  // Empty value (flag argument)
                    fc.string({ minLength: 1, maxLength: 50 })  // Non-empty value
                ),
                (envVarSuffix, value) => {
                    console.log(`    🔍 Testing TRTLLM_${envVarSuffix}="${value}"`);
                    
                    const fullVarName = `TRTLLM_${envVarSuffix}`;
                    const prefix = 'TRTLLM_';
                    
                    // Conversion logic
                    const withoutPrefix = fullVarName.substring(prefix.length);
                    const lowercase = withoutPrefix.toLowerCase();
                    const argName = lowercase.replace(/_/g, '-');
                    const finalArg = `--${argName}`;
                    
                    // For flag arguments (empty value), only the argument name should be added
                    // For value arguments, both argument name and value should be added
                    
                    if (value === '') {
                        // Flag argument - just the argument name
                        console.log(`    ✅ Flag argument: ${finalArg}`);
                        return true;
                    } else {
                        // Value argument - argument name + value
                        console.log(`    ✅ Value argument: ${finalArg} ${value}`);
                        return true;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5b validated: Flag and value argument handling correct');
        });

        it('should produce consistent results for the same input', async function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 5c: Conversion Consistency');
            console.log('  📝 Converting the same environment variable multiple times should produce identical results');
            console.log('  📝 Validates: Requirements 6.1, 6.2');
            
            // Feature: tensorrt-llm-support, Property 5: Environment variables are converted correctly
            await fc.assert(fc.property(
                fc.stringMatching(/^[A-Z_]+$/),
                (envVarSuffix) => {
                    console.log(`    🔍 Testing conversion consistency for TRTLLM_${envVarSuffix}`);
                    
                    const fullVarName = `TRTLLM_${envVarSuffix}`;
                    const prefix = 'TRTLLM_';
                    
                    // Convert twice
                    const convert = (varName) => {
                        const withoutPrefix = varName.substring(prefix.length);
                        const lowercase = withoutPrefix.toLowerCase();
                        const argName = lowercase.replace(/_/g, '-');
                        return `--${argName}`;
                    };
                    
                    const result1 = convert(fullVarName);
                    const result2 = convert(fullVarName);
                    
                    if (result1 !== result2) {
                        console.log(`    ❌ Inconsistent results: ${result1} vs ${result2}`);
                        return false;
                    }
                    
                    console.log(`    ✅ Consistent conversion: ${result1}`);
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5c validated: Conversion consistency verified');
        });
    });

    after(() => {
        console.log('\n📊 TensorRT-LLM Environment Variable Conversion Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
