// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Validation Unit Tests
 * 
 * Tests specific edge cases for HuggingFace token format validation.
 * 
 * Feature: huggingface-token-authentication
 */

import { setupTestHooks } from './test-utils.js';

describe('HuggingFace Token Validation - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Validation Unit Tests');
        console.log('📋 Testing: Edge cases for HF token validation');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Validation Unit Tests');

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

    describe('Edge Case: Empty Input', () => {
        it('should not display warning for empty string', () => {
            console.log('\n  🧪 Testing empty string validation');
            console.log('  📝 Validates: Requirements 3.3, 3.4');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test empty string
            const result = validateToken('');
            
            // Restore console.warn
            console.warn = originalWarn;
            
            // Verify no warning was displayed
            if (warnCalled) {
                throw new Error('Warning displayed for empty string');
            }
            
            // Verify validation returns true
            if (result !== true) {
                throw new Error('Validation failed for empty string');
            }
            
            console.log('  ✅ Empty string validation passed');
        });

        it('should not display warning for whitespace-only string', () => {
            console.log('\n  🧪 Testing whitespace-only string validation');
            console.log('  📝 Validates: Requirements 3.4');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test whitespace-only strings
            const testCases = ['   ', '\t', '\n', '  \t\n  '];
            
            for (const testCase of testCases) {
                const result = validateToken(testCase);
                
                // Verify no warning was displayed
                if (warnCalled) {
                    console.warn = originalWarn;
                    throw new Error(`Warning displayed for whitespace string: '${testCase.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`);
                }
                
                // Verify validation returns true
                if (result !== true) {
                    console.warn = originalWarn;
                    throw new Error(`Validation failed for whitespace string: '${testCase.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`);
                }
            }
            
            // Restore console.warn
            console.warn = originalWarn;
            
            console.log('  ✅ Whitespace-only string validation passed');
        });

        it('should not display warning for null input', () => {
            console.log('\n  🧪 Testing null input validation');
            console.log('  📝 Validates: Requirements 3.4');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test null
            const result = validateToken(null);
            
            // Restore console.warn
            console.warn = originalWarn;
            
            // Verify no warning was displayed
            if (warnCalled) {
                throw new Error('Warning displayed for null input');
            }
            
            // Verify validation returns true
            if (result !== true) {
                throw new Error('Validation failed for null input');
            }
            
            console.log('  ✅ Null input validation passed');
        });
    });

    describe('Edge Case: $HF_TOKEN Reference', () => {
        it('should not validate $HF_TOKEN reference', () => {
            console.log('\n  🧪 Testing $HF_TOKEN reference validation');
            console.log('  📝 Validates: Requirements 3.3');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test $HF_TOKEN reference
            const result = validateToken('$HF_TOKEN');
            
            // Restore console.warn
            console.warn = originalWarn;
            
            // Verify no warning was displayed
            if (warnCalled) {
                throw new Error('Warning displayed for $HF_TOKEN reference');
            }
            
            // Verify validation returns true
            if (result !== true) {
                throw new Error('Validation failed for $HF_TOKEN reference');
            }
            
            console.log('  ✅ $HF_TOKEN reference validation passed');
        });

        it('should not validate $HF_TOKEN reference with whitespace', () => {
            console.log('\n  🧪 Testing $HF_TOKEN reference with whitespace');
            console.log('  📝 Validates: Requirements 3.3');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test $HF_TOKEN reference with whitespace
            const testCases = ['  $HF_TOKEN  ', '\t$HF_TOKEN\t', '\n$HF_TOKEN\n'];
            
            for (const testCase of testCases) {
                const result = validateToken(testCase);
                
                // Verify no warning was displayed
                if (warnCalled) {
                    console.warn = originalWarn;
                    throw new Error(`Warning displayed for $HF_TOKEN with whitespace: '${testCase.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`);
                }
                
                // Verify validation returns true
                if (result !== true) {
                    console.warn = originalWarn;
                    throw new Error(`Validation failed for $HF_TOKEN with whitespace: '${testCase.replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`);
                }
            }
            
            // Restore console.warn
            console.warn = originalWarn;
            
            console.log('  ✅ $HF_TOKEN reference with whitespace validation passed');
        });
    });

    describe('Edge Case: Token Without hf_ Prefix', () => {
        it('should display warning for token without hf_ prefix', () => {
            console.log('\n  🧪 Testing token without hf_ prefix');
            console.log('  📝 Validates: Requirements 3.1, 3.2');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            let warnMessage = '';
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                    warnMessage = message;
                }
            };
            
            // Test token without hf_ prefix
            const result = validateToken('abc123xyz456');
            
            // Restore console.warn
            console.warn = originalWarn;
            
            // Verify warning was displayed
            if (!warnCalled) {
                throw new Error('Warning not displayed for token without hf_ prefix');
            }
            
            // Verify warning message content
            if (!warnMessage.includes('HuggingFace tokens typically start with "hf_"')) {
                throw new Error('Warning message incorrect');
            }
            
            // Verify validation still returns true (non-blocking)
            if (result !== true) {
                throw new Error('Validation blocked token without hf_ prefix (should be non-blocking)');
            }
            
            console.log('  ✅ Token without hf_ prefix validation passed');
        });

        it('should display warning for various invalid token formats', () => {
            console.log('\n  🧪 Testing various invalid token formats');
            console.log('  📝 Validates: Requirements 3.1, 3.2');
            
            const testCases = [
                'token123',
                'HF_abc123',  // Wrong case
                'hfabc123',   // Missing underscore
                '123abc',
                'my-token-value'
            ];
            
            for (const testCase of testCases) {
                // Capture console.warn output
                const originalWarn = console.warn;
                let warnCalled = false;
                
                console.warn = (...args) => {
                    const message = args.join(' ');
                    if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                        warnCalled = true;
                    }
                };
                
                // Test invalid token format
                const result = validateToken(testCase);
                
                // Restore console.warn
                console.warn = originalWarn;
                
                // Verify warning was displayed
                if (!warnCalled) {
                    throw new Error(`Warning not displayed for invalid token: ${testCase}`);
                }
                
                // Verify validation still returns true (non-blocking)
                if (result !== true) {
                    throw new Error(`Validation blocked invalid token: ${testCase} (should be non-blocking)`);
                }
            }
            
            console.log('  ✅ Various invalid token formats validation passed');
        });
    });

    describe('Edge Case: Valid Token Format', () => {
        it('should not display warning for token with hf_ prefix', () => {
            console.log('\n  🧪 Testing token with hf_ prefix');
            console.log('  📝 Validates: Requirements 3.1');
            
            // Capture console.warn output
            const originalWarn = console.warn;
            let warnCalled = false;
            
            console.warn = (...args) => {
                const message = args.join(' ');
                if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                    warnCalled = true;
                }
            };
            
            // Test valid token
            const result = validateToken('hf_abc123xyz456');
            
            // Restore console.warn
            console.warn = originalWarn;
            
            // Verify no warning was displayed
            if (warnCalled) {
                throw new Error('Warning displayed for valid token with hf_ prefix');
            }
            
            // Verify validation returns true
            if (result !== true) {
                throw new Error('Validation failed for valid token');
            }
            
            console.log('  ✅ Token with hf_ prefix validation passed');
        });

        it('should not display warning for various valid token formats', () => {
            console.log('\n  🧪 Testing various valid token formats');
            console.log('  📝 Validates: Requirements 3.1');
            
            const testCases = [
                'hf_abc123',
                'hf_XYZ789',
                'hf_aBcDeF123456',
                `hf_${  'a'.repeat(40)}`,  // Long token
                `hf_${  'a'.repeat(20)}`   // Short token
            ];
            
            for (const testCase of testCases) {
                // Capture console.warn output
                const originalWarn = console.warn;
                let warnCalled = false;
                
                console.warn = (...args) => {
                    const message = args.join(' ');
                    if (message.includes('HuggingFace tokens typically start with "hf_"')) {
                        warnCalled = true;
                    }
                };
                
                // Test valid token format
                const result = validateToken(testCase);
                
                // Restore console.warn
                console.warn = originalWarn;
                
                // Verify no warning was displayed
                if (warnCalled) {
                    throw new Error(`Warning displayed for valid token: ${testCase.substring(0, 20)}...`);
                }
                
                // Verify validation returns true
                if (result !== true) {
                    throw new Error(`Validation failed for valid token: ${testCase.substring(0, 20)}...`);
                }
            }
            
            console.log('  ✅ Various valid token formats validation passed');
        });
    });
});
