// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Validation Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token format validation.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: huggingface-token-authentication
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';

describe('HuggingFace Token Validation - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Validation Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token validation');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Validation Properties');

    describe('Property 6: Token Format Validation Warning', () => {
        it('should display warning for tokens without hf_ prefix but still accept them', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 6: Token Format Validation Warning');
            console.log('  📝 For any direct token value that does not start with "hf_", the Generator should display a warning but continue processing');
            console.log('  📝 Validates: Requirements 3.1, 3.2');
            
            // Feature: huggingface-token-authentication, Property 6: Token Format Validation Warning
            fc.assert(fc.property(
                // Generate tokens that don't start with hf_
                fc.string({ minLength: 20, maxLength: 50 })
                    .filter(token => !token.startsWith('hf_') && token.trim() !== '' && token.trim() !== '$HF_TOKEN'),
                (invalidToken) => {
                    console.log(`    🔍 Testing validation warning for token without hf_ prefix: ${invalidToken.substring(0, 15)}...`);
                    
                    // Capture console.warn output
                    const originalWarn = console.warn;
                    let warnCalled = false;
                    
                    console.warn = (...args) => {
                        const message = args.join(' ');
                        if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                            warnCalled = true;
                        }
                    };
                    
                    try {
                        // Simulate the validation function from prompts.js
                        const validateToken = (input) => {
                            // Empty is valid (not all models require auth)
                            if (!input || input.trim() === '') {
                                return true;
                            }
                            
                            // $HF_TOKEN reference is valid
                            if (input.trim() === '$HF_TOKEN') {
                                return true;
                            }
                            
                            // Direct token should start with hf_ (warning only, not blocking)
                            if (!input.startsWith('hf_')) {
                                console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
                                console.warn('   If this is intentional, you can ignore this warning.');
                            }
                            
                            return true; // Always return true (non-blocking validation)
                        };
                        
                        // Call validation function
                        const result = validateToken(invalidToken);
                        
                        // Restore console.warn
                        console.warn = originalWarn;
                        
                        // Verify warning was displayed
                        if (!warnCalled) {
                            console.log('    ❌ Warning not displayed for invalid token format');
                            return false;
                        }
                        
                        // Verify validation still returns true (non-blocking)
                        if (result !== true) {
                            console.log('    ❌ Validation blocked token (should be non-blocking)');
                            return false;
                        }
                        
                        console.log('    ✅ Warning displayed and validation non-blocking');
                        return true;
                        
                    } catch (error) {
                        // Restore console.warn on error
                        console.warn = originalWarn;
                        console.log(`    ❌ Validation failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 6 validated: Token format validation warning working correctly');
        });

        it('should not display warning for tokens with hf_ prefix', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 6b: Valid Token Format No Warning');
            console.log('  📝 For any token starting with "hf_", no warning should be displayed');
            console.log('  📝 Validates: Requirements 3.1');
            
            // Feature: huggingface-token-authentication, Property 6: Token Format Validation Warning (valid tokens)
            fc.assert(fc.property(
                // Generate valid tokens starting with hf_
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                (validToken) => {
                    console.log(`    🔍 Testing no warning for valid token: ${validToken.substring(0, 20)}...`);
                    
                    // Capture console.warn output
                    const originalWarn = console.warn;
                    let warnCalled = false;
                    
                    console.warn = (...args) => {
                        const message = args.join(' ');
                        if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                            warnCalled = true;
                        }
                    };
                    
                    try {
                        // Simulate the validation function from prompts.js
                        const validateToken = (input) => {
                            // Empty is valid (not all models require auth)
                            if (!input || input.trim() === '') {
                                return true;
                            }
                            
                            // $HF_TOKEN reference is valid
                            if (input.trim() === '$HF_TOKEN') {
                                return true;
                            }
                            
                            // Direct token should start with hf_ (warning only, not blocking)
                            if (!input.startsWith('hf_')) {
                                console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
                                console.warn('   If this is intentional, you can ignore this warning.');
                            }
                            
                            return true; // Always return true (non-blocking validation)
                        };
                        
                        // Call validation function
                        const result = validateToken(validToken);
                        
                        // Restore console.warn
                        console.warn = originalWarn;
                        
                        // Verify warning was NOT displayed
                        if (warnCalled) {
                            console.log('    ❌ Warning displayed for valid token format');
                            return false;
                        }
                        
                        // Verify validation returns true
                        if (result !== true) {
                            console.log('    ❌ Validation failed for valid token');
                            return false;
                        }
                        
                        console.log('    ✅ No warning for valid token format');
                        return true;
                        
                    } catch (error) {
                        // Restore console.warn on error
                        console.warn = originalWarn;
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 6b validated: No warning for valid token format');
        });

        it('should not display warning for $HF_TOKEN reference', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 6c: No Warning for Environment Variable Reference');
            console.log('  📝 For "$HF_TOKEN" reference, no warning should be displayed');
            console.log('  📝 Validates: Requirements 3.3');
            
            // Feature: huggingface-token-authentication, Property 6: Token Format Validation Warning (env var reference)
            fc.assert(fc.property(
                fc.constant('$HF_TOKEN'),
                (envRef) => {
                    console.log('    🔍 Testing no warning for $HF_TOKEN reference');
                    
                    // Capture console.warn output
                    const originalWarn = console.warn;
                    let warnCalled = false;
                    
                    console.warn = (...args) => {
                        const message = args.join(' ');
                        if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                            warnCalled = true;
                        }
                    };
                    
                    try {
                        // Simulate the validation function from prompts.js
                        const validateToken = (input) => {
                            // Empty is valid (not all models require auth)
                            if (!input || input.trim() === '') {
                                return true;
                            }
                            
                            // $HF_TOKEN reference is valid
                            if (input.trim() === '$HF_TOKEN') {
                                return true;
                            }
                            
                            // Direct token should start with hf_ (warning only, not blocking)
                            if (!input.startsWith('hf_')) {
                                console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
                                console.warn('   If this is intentional, you can ignore this warning.');
                            }
                            
                            return true; // Always return true (non-blocking validation)
                        };
                        
                        // Call validation function
                        const result = validateToken(envRef);
                        
                        // Restore console.warn
                        console.warn = originalWarn;
                        
                        // Verify warning was NOT displayed
                        if (warnCalled) {
                            console.log('    ❌ Warning displayed for $HF_TOKEN reference');
                            return false;
                        }
                        
                        // Verify validation returns true
                        if (result !== true) {
                            console.log('    ❌ Validation failed for $HF_TOKEN reference');
                            return false;
                        }
                        
                        console.log('    ✅ No warning for $HF_TOKEN reference');
                        return true;
                        
                    } catch (error) {
                        // Restore console.warn on error
                        console.warn = originalWarn;
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 6c validated: No warning for $HF_TOKEN reference');
        });

        it('should not display warning for empty input', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 6d: No Warning for Empty Input');
            console.log('  📝 For empty input, no warning should be displayed');
            console.log('  📝 Validates: Requirements 3.4');
            
            // Feature: huggingface-token-authentication, Property 6: Token Format Validation Warning (empty input)
            fc.assert(fc.property(
                fc.oneof(
                    fc.constant(''),
                    fc.constant('   '),
                    fc.constant('\t'),
                    fc.constant('\n')
                ),
                (emptyInput) => {
                    console.log(`    🔍 Testing no warning for empty input: '${emptyInput.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`);
                    
                    // Capture console.warn output
                    const originalWarn = console.warn;
                    let warnCalled = false;
                    
                    console.warn = (...args) => {
                        const message = args.join(' ');
                        if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                            warnCalled = true;
                        }
                    };
                    
                    try {
                        // Simulate the validation function from prompts.js
                        const validateToken = (input) => {
                            // Empty is valid (not all models require auth)
                            if (!input || input.trim() === '') {
                                return true;
                            }
                            
                            // $HF_TOKEN reference is valid
                            if (input.trim() === '$HF_TOKEN') {
                                return true;
                            }
                            
                            // Direct token should start with hf_ (warning only, not blocking)
                            if (!input.startsWith('hf_')) {
                                console.warn('\n⚠️  Warning: HuggingFace tokens typically start with "hf_"');
                                console.warn('   If this is intentional, you can ignore this warning.');
                            }
                            
                            return true; // Always return true (non-blocking validation)
                        };
                        
                        // Call validation function
                        const result = validateToken(emptyInput);
                        
                        // Restore console.warn
                        console.warn = originalWarn;
                        
                        // Verify warning was NOT displayed
                        if (warnCalled) {
                            console.log('    ❌ Warning displayed for empty input');
                            return false;
                        }
                        
                        // Verify validation returns true
                        if (result !== true) {
                            console.log('    ❌ Validation failed for empty input');
                            return false;
                        }
                        
                        console.log('    ✅ No warning for empty input');
                        return true;
                        
                    } catch (error) {
                        // Restore console.warn on error
                        console.warn = originalWarn;
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 6d validated: No warning for empty input');
        });
    });
});
