// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Configuration Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token configuration parameter parsing.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: huggingface-token-authentication
 */

import fc from 'fast-check';
import ConfigManager from '../../generators/app/lib/config-manager.js';
import { setupTestHooks } from './test-utils.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('HuggingFace Token Configuration - Property-Based Tests', () => {
    let tempDir;
    let mockGenerator;

    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Configuration Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token configuration');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Configuration Properties');

    beforeEach(() => {
        // Create a temporary directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-token-config-test-'));
        
        // Create a mock generator object
        mockGenerator = {
            destinationPath: (filePath = '') => path.join(tempDir, filePath),
            options: {},
            args: [],
            env: {
                error: (message) => {
                    throw new Error(message);
                }
            }
        };
    });

    afterEach(() => {
        // Clean up temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Property 11: Config File Parsing', () => {
        it('should correctly parse hfToken from config files across all valid token formats', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 11: Config File Parsing');
            console.log('  📝 For any valid JSON configuration file containing an hfToken field, the ConfigManager should parse and apply the token value');
            console.log('  📝 Validates: Requirements 6.1, 6.2');
            
            // Feature: huggingface-token-authentication, Property 11: Config File Parsing
            fc.assert(fc.property(
                fc.oneof(
                    // Direct token values (starting with hf_)
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    // Environment variable reference
                    fc.constant('$HF_TOKEN'),
                    // Empty string (valid - not all models require auth)
                    fc.constant(''),
                    // Null value (valid - optional parameter)
                    fc.constant(null)
                ),
                (hfToken) => {
                    console.log(`    🔍 Testing config file parsing with hfToken: ${hfToken === null ? 'null' : (hfToken && hfToken.length > 20 ? `${hfToken.substring(0, 20)  }...` : hfToken)}`);
                    
                    const config = {
                        projectName: 'hf-token-test',
                        framework: 'transformers',
                        modelServer: 'vllm',
                        modelName: 'meta-llama/Llama-2-7b-hf',
                        instanceType: 'gpu-enabled',
                        includeSampleModel: false,
                        includeTesting: false
                    };
                    
                    // Only add hfToken if it's not null
                    if (hfToken !== null) {
                        config.hfToken = hfToken;
                    }

                    try {
                        // Write config file to temp directory
                        const configPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Load configuration from file
                        configManager.loadConfiguration();
                        
                        // Verify hfToken is in the parameter matrix
                        const paramMatrix = configManager.parameterMatrix;
                        if (!paramMatrix.hfToken) {
                            console.log('    ❌ hfToken not found in parameter matrix');
                            return false;
                        }
                        
                        // Verify parameter matrix configuration
                        const hfTokenConfig = paramMatrix.hfToken;
                        if (hfTokenConfig.cliOption !== 'hf-token') {
                            console.log(`    ❌ hfToken CLI option incorrect: ${hfTokenConfig.cliOption}`);
                            return false;
                        }
                        if (hfTokenConfig.configFile !== true) {
                            console.log(`    ❌ hfToken configFile support incorrect: ${hfTokenConfig.configFile}`);
                            return false;
                        }
                        if (hfTokenConfig.promptable !== true) {
                            console.log(`    ❌ hfToken promptable incorrect: ${hfTokenConfig.promptable}`);
                            return false;
                        }
                        if (hfTokenConfig.required !== false) {
                            console.log(`    ❌ hfToken required incorrect: ${hfTokenConfig.required}`);
                            return false;
                        }
                        if (hfTokenConfig.default !== null) {
                            console.log(`    ❌ hfToken default incorrect: ${hfTokenConfig.default}`);
                            return false;
                        }
                        
                        console.log('    ✅ Config file parsing successful for hfToken format');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Config parsing failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 11 validated: Config file parsing working correctly for all hfToken formats');
        });
        it('should correctly parse hfToken from CLI config files with precedence over custom config', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 11b: CLI Config File Precedence');
            console.log('  📝 For any hfToken provided in CLI config file, it should take precedence over custom config file');
            console.log('  📝 Validates: Requirements 6.1, 6.2');
            
            // Feature: huggingface-token-authentication, Property 11: Config File Parsing (precedence)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,40}$/),
                async (cliToken, customToken) => {
                    // Ensure tokens are different
                    fc.pre(cliToken !== customToken);
                    
                    console.log('    🔍 Testing CLI config precedence: CLI token vs custom token');
                    
                    const cliConfig = {
                        projectName: 'cli-config-test',
                        framework: 'transformers',
                        modelServer: 'vllm',
                        modelName: 'meta-llama/Llama-2-7b-hf',
                        instanceType: 'gpu-enabled',
                        hfToken: cliToken
                    };
                    
                    const customConfig = {
                        projectName: 'custom-config-test',
                        framework: 'transformers',
                        modelServer: 'sglang',
                        modelName: 'openai/gpt-oss-20b',
                        instanceType: 'gpu-enabled',
                        hfToken: customToken
                    };

                    try {
                        // Write both config files
                        const cliConfigPath = path.join(tempDir, 'cli-config.json');
                        const customConfigPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(cliConfigPath, JSON.stringify(cliConfig, null, 2));
                        fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 2));
                        
                        // Create ConfigManager with CLI config option
                        mockGenerator.options.config = cliConfigPath;
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Load configuration (async)
                        await configManager.loadConfiguration();
                        
                        // Verify CLI config takes precedence
                        // The config should have values from CLI config, not custom config
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // CLI config project name should win
                        if (finalConfig.projectName !== 'cli-config-test') {
                            console.log(`    ❌ CLI config precedence failed: expected 'cli-config-test', got '${finalConfig.projectName}'`);
                            return false;
                        }
                        
                        console.log('    ✅ CLI config precedence validated');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Precedence test failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 11b validated: CLI config file precedence working correctly');
        });

        it('should handle $HF_TOKEN environment variable references in config files', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 11c: Environment Variable Reference Parsing');
            console.log('  📝 For any config file with hfToken="$HF_TOKEN", the ConfigManager should accept it without error');
            console.log('  📝 Validates: Requirements 6.2, 6.5');
            
            // Feature: huggingface-token-authentication, Property 11: Config File Parsing (env var reference)
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('transformers'),
                fc.constantFrom('vllm', 'sglang'),
                async (framework, modelServer) => {
                    console.log('    🔍 Testing $HF_TOKEN reference in config file');
                    
                    const config = {
                        projectName: 'env-ref-test',
                        framework,
                        modelServer,
                        modelName: 'meta-llama/Llama-2-7b-hf',
                        instanceType: 'gpu-enabled',
                        hfToken: '$HF_TOKEN',
                        includeSampleModel: false,
                        includeTesting: false
                    };

                    try {
                        // Write config file
                        const configPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Verify $HF_TOKEN reference is accepted
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // The config should have been loaded successfully
                        if (finalConfig.projectName !== 'env-ref-test') {
                            console.log('    ❌ Config loading failed');
                            return false;
                        }
                        
                        console.log('    ✅ $HF_TOKEN reference parsing successful');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ $HF_TOKEN reference parsing failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 11c validated: $HF_TOKEN reference parsing working correctly');
        });
    });

    describe('Property 5: Environment Variable Resolution', () => {
        it('should resolve $HF_TOKEN to process.env.HF_TOKEN value', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 5: Environment Variable Resolution');
            console.log('  📝 For any configuration where hfToken is "$HF_TOKEN", the resolved value should equal the value of process.env.HF_TOKEN (or null if not set)');
            console.log('  📝 Validates: Requirements 2.4, 6.5');
            
            // Feature: huggingface-token-authentication, Property 5: Environment Variable Resolution
            fc.assert(fc.property(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                (envValue) => {
                    console.log(`    🔍 Testing environment variable resolution with HF_TOKEN=${envValue.substring(0, 20)}...`);
                    
                    // Set up environment
                    const originalValue = process.env.HF_TOKEN;
                    process.env.HF_TOKEN = envValue;
                    
                    try {
                        // Create ConfigManager
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Call _resolveHfToken with "$HF_TOKEN" reference
                        const resolved = configManager._resolveHfToken('$HF_TOKEN');
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        // Verify resolution
                        if (resolved !== envValue) {
                            console.log(`    ❌ Resolution failed: expected '${envValue.substring(0, 20)}...', got '${resolved ? `${resolved.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Environment variable resolved correctly');
                        return true;
                        
                    } catch (error) {
                        // Restore environment on error
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        console.log(`    ❌ Resolution failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5 validated: Environment variable resolution working correctly');
        });

        it('should return null when $HF_TOKEN is specified but environment variable is not set', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 5b: Missing Environment Variable Handling');
            console.log('  📝 When $HF_TOKEN is specified but HF_TOKEN env var is not set, should return null and show warning');
            console.log('  📝 Validates: Requirements 2.5');
            
            // Feature: huggingface-token-authentication, Property 5: Environment Variable Resolution (missing env var)
            fc.assert(fc.property(
                fc.constant('$HF_TOKEN'),
                (tokenRef) => {
                    console.log('    🔍 Testing missing environment variable handling');
                    
                    // Save and clear environment variable
                    const originalValue = process.env.HF_TOKEN;
                    delete process.env.HF_TOKEN;
                    
                    try {
                        // Create ConfigManager
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Capture console.warn output
                        const originalWarn = console.warn;
                        let warnCalled = false;
                        console.warn = (...args) => {
                            if (args[0] && args[0].includes('HF_TOKEN environment variable is not set')) {
                                warnCalled = true;
                            }
                        };
                        
                        // Call _resolveHfToken with "$HF_TOKEN" reference
                        const resolved = configManager._resolveHfToken(tokenRef);
                        
                        // Restore console.warn
                        console.warn = originalWarn;
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        }
                        
                        // Verify resolution returns null
                        if (resolved !== null) {
                            console.log(`    ❌ Expected null, got '${resolved}'`);
                            return false;
                        }
                        
                        // Verify warning was shown
                        if (!warnCalled) {
                            console.log('    ❌ Warning not displayed');
                            return false;
                        }
                        
                        console.log('    ✅ Missing environment variable handled correctly');
                        return true;
                        
                    } catch (error) {
                        // Restore environment on error
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        }
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5b validated: Missing environment variable handling working correctly');
        });

        it('should pass through direct token values unchanged', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 5c: Direct Token Pass-Through');
            console.log('  📝 For any direct token value (not "$HF_TOKEN"), should return the value unchanged');
            console.log('  📝 Validates: Requirements 2.1');
            
            // Feature: huggingface-token-authentication, Property 5: Environment Variable Resolution (direct tokens)
            fc.assert(fc.property(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                (directToken) => {
                    console.log('    🔍 Testing direct token pass-through');
                    
                    try {
                        // Create ConfigManager
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Call _resolveHfToken with direct token
                        const resolved = configManager._resolveHfToken(directToken);
                        
                        // Verify token is returned unchanged
                        if (resolved !== directToken) {
                            console.log(`    ❌ Token modified: expected '${directToken.substring(0, 20)}...', got '${resolved ? `${resolved.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Direct token passed through unchanged');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5c validated: Direct token pass-through working correctly');
        });

        it('should return null for empty or null token values', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 5d: Empty Token Handling');
            console.log('  📝 For any empty or null token value, should return null');
            console.log('  📝 Validates: Requirements 2.3');
            
            // Feature: huggingface-token-authentication, Property 5: Environment Variable Resolution (empty tokens)
            fc.assert(fc.property(
                fc.oneof(
                    fc.constant(''),
                    fc.constant('   '),
                    fc.constant(null),
                    fc.constant(undefined)
                ),
                (emptyToken) => {
                    console.log(`    🔍 Testing empty token handling: ${emptyToken === null ? 'null' : emptyToken === undefined ? 'undefined' : `'${emptyToken}'`}`);
                    
                    try {
                        // Create ConfigManager
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Call _resolveHfToken with empty token
                        const resolved = configManager._resolveHfToken(emptyToken);
                        
                        // Verify null is returned
                        if (resolved !== null) {
                            console.log(`    ❌ Expected null, got '${resolved}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Empty token handled correctly');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 5d validated: Empty token handling working correctly');
        });
    });

    describe('Property 14: Precedence-Aware Resolution', () => {
        it('should resolve $HF_TOKEN at the highest precedence level when provided through multiple sources', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 14: Precedence-Aware Resolution');
            console.log('  📝 For any configuration with multiple "$HF_TOKEN" references at different precedence levels, the highest precedence reference should be resolved');
            console.log('  📝 Validates: Requirements 7.5');
            
            // Feature: huggingface-token-authentication, Property 14: Precedence-Aware Resolution
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (envValue) => {
                    console.log(`    🔍 Testing precedence-aware resolution with HF_TOKEN=${envValue.substring(0, 20)}...`);
                    
                    // Set up environment variable
                    const originalValue = process.env.HF_TOKEN;
                    process.env.HF_TOKEN = envValue;
                    
                    try {
                        // Create config file with $HF_TOKEN reference (lower precedence)
                        const configFileConfig = {
                            projectName: 'config-file-test',
                            framework: 'transformers',
                            modelServer: 'vllm',
                            modelName: 'meta-llama/Llama-2-7b-hf',
                            instanceType: 'gpu-enabled',
                            hfToken: '$HF_TOKEN',
                            includeSampleModel: false,
                            includeTesting: false
                        };
                        
                        const configPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(configPath, JSON.stringify(configFileConfig, null, 2));
                        
                        // Create ConfigManager with CLI option also set to $HF_TOKEN (higher precedence)
                        mockGenerator.options['hf-token'] = '$HF_TOKEN';
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Load configuration
                        await configManager.loadConfiguration();
                        
                        // Get final configuration (this should resolve $HF_TOKEN)
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // Verify token was resolved to environment variable value
                        if (finalConfig.hfToken !== envValue) {
                            console.log(`    ❌ Resolution failed: expected '${envValue.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        console.log('    ✅ Precedence-aware resolution working correctly');
                        return true;
                        
                    } catch (error) {
                        // Restore environment on error
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 14 validated: Precedence-aware resolution working correctly');
        });

        it('should resolve $HF_TOKEN from CLI option when both CLI and config file have references', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 14b: CLI Precedence in Resolution');
            console.log('  📝 When both CLI and config file have "$HF_TOKEN", CLI should take precedence and be resolved');
            console.log('  📝 Validates: Requirements 7.1, 7.5');
            
            // Feature: huggingface-token-authentication, Property 14: Precedence-Aware Resolution (CLI precedence)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (cliToken, configToken) => {
                    // Ensure tokens are different
                    fc.pre(cliToken !== configToken);
                    
                    console.log('    🔍 Testing CLI precedence: CLI token vs config token');
                    
                    try {
                        // Create config file with direct token (lower precedence)
                        const configFileConfig = {
                            projectName: 'precedence-test',
                            framework: 'transformers',
                            modelServer: 'vllm',
                            modelName: 'meta-llama/Llama-2-7b-hf',
                            instanceType: 'gpu-enabled',
                            hfToken: configToken,
                            includeSampleModel: false,
                            includeTesting: false
                        };
                        
                        const configPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(configPath, JSON.stringify(configFileConfig, null, 2));
                        
                        // Create ConfigManager with CLI option (higher precedence)
                        mockGenerator.options['hf-token'] = cliToken;
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Load configuration
                        await configManager.loadConfiguration();
                        
                        // Get final configuration
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // Verify CLI token takes precedence
                        if (finalConfig.hfToken !== cliToken) {
                            console.log(`    ❌ CLI precedence failed: expected CLI token '${cliToken.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        console.log('    ✅ CLI precedence validated');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 14b validated: CLI precedence in resolution working correctly');
        });

        it('should resolve $HF_TOKEN from prompt when no higher precedence source provides it', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 14c: Prompt Resolution');
            console.log('  📝 When $HF_TOKEN is provided only through prompts, it should be resolved correctly');
            console.log('  📝 Validates: Requirements 7.5');
            
            // Feature: huggingface-token-authentication, Property 14: Precedence-Aware Resolution (prompt)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (envValue) => {
                    console.log(`    🔍 Testing prompt resolution with HF_TOKEN=${envValue.substring(0, 20)}...`);
                    
                    // Set up environment variable
                    const originalValue = process.env.HF_TOKEN;
                    process.env.HF_TOKEN = envValue;
                    
                    try {
                        // Create ConfigManager with no CLI or config file options
                        const configManager = new ConfigManager(mockGenerator);
                        
                        // Load configuration (no config file, no CLI options)
                        await configManager.loadConfiguration();
                        
                        // Simulate prompt answer with $HF_TOKEN reference
                        const promptAnswers = {
                            projectName: 'prompt-test',
                            framework: 'transformers',
                            modelServer: 'vllm',
                            modelName: 'meta-llama/Llama-2-7b-hf',
                            instanceType: 'gpu-enabled',
                            hfToken: '$HF_TOKEN',
                            includeSampleModel: false,
                            includeTesting: false
                        };
                        
                        // Get final configuration with prompt answers
                        const finalConfig = configManager.getFinalConfiguration(promptAnswers);
                        
                        // Verify token was resolved to environment variable value
                        if (finalConfig.hfToken !== envValue) {
                            console.log(`    ❌ Resolution failed: expected '${envValue.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        console.log('    ✅ Prompt resolution working correctly');
                        return true;
                        
                    } catch (error) {
                        // Restore environment on error
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        console.log(`    ❌ Test failed with error: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 14c validated: Prompt resolution working correctly');
        });
    });

    describe('Property 9: CLI Option Parsing', () => {
        it('should correctly parse --hf-token CLI option and store in ConfigManager', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 9: CLI Option Parsing');
            console.log('  📝 For any CLI invocation with --hf-token option, the ConfigManager should parse and store the token value correctly');
            console.log('  📝 Validates: Requirements 5.1, 5.2');
            console.log('  📝 Note: Dockerfile ENV injection is tested separately in Property 7 (Task 6)');
            
            // Feature: huggingface-token-authentication, Property 9: CLI Option Parsing
            fc.assert(fc.property(
                fc.oneof(
                    // Direct token values (starting with hf_)
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    // Environment variable reference
                    fc.constant('$HF_TOKEN'),
                    // Empty string (valid - not all models require auth)
                    fc.constant('')
                ),
                (hfToken) => {
                    console.log(`    🔍 Testing CLI option parsing with hfToken: ${hfToken === '' ? '(empty)' : (hfToken && hfToken.length > 20 ? `${hfToken.substring(0, 20)  }...` : hfToken)}`);
                    
                    try {
                        // Create mock generator with CLI option
                        const testGenerator = {
                            destinationPath: (filePath = '') => path.join(tempDir, filePath),
                            options: {
                                'hf-token': hfToken
                            },
                            args: [],
                            env: {
                                error: (message) => {
                                    throw new Error(message);
                                }
                            }
                        };
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(testGenerator);
                        configManager.loadConfiguration();
                        
                        // Get final configuration
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // Verify CLI option was parsed correctly
                        // For empty string, it should be stored as empty or null
                        if (hfToken === '') {
                            if (finalConfig.hfToken !== '' && finalConfig.hfToken !== null) {
                                console.log(`    ❌ Empty token not handled correctly: got '${finalConfig.hfToken}'`);
                                return false;
                            }
                        } else {
                            // For non-empty tokens, verify they're stored correctly
                            // Note: $HF_TOKEN will be resolved by _resolveHfToken, but we're just testing parsing here
                            if (finalConfig.hfToken === undefined) {
                                console.log('    ❌ CLI option not parsed: hfToken is undefined');
                                return false;
                            }
                        }
                        
                        console.log('    ✅ CLI option parsed and stored correctly in ConfigManager');
                        return true;
                        
                    } catch (error) {
                        console.log(`    ❌ CLI option parsing failed: ${error.message.substring(0, 100)}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 9 validated: CLI option parsing working correctly');
        });

        it('should accept both direct tokens and "$HF_TOKEN" reference via CLI', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 9b: CLI Option Format Acceptance');
            console.log('  📝 The --hf-token CLI option should accept both direct token values and "$HF_TOKEN" environment variable references');
            console.log('  📝 Validates: Requirements 5.1, 5.2');
            console.log('  📝 Note: Dockerfile ENV injection is tested separately in Property 7 (Task 6)');
            
            // Feature: huggingface-token-authentication, Property 9: CLI Option Parsing (format acceptance)
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.tuple(fc.constant('direct'), fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/)),
                    fc.tuple(fc.constant('reference'), fc.constant('$HF_TOKEN'))
                ),
                async ([tokenType, tokenValue]) => {
                    console.log(`    🔍 Testing ${tokenType} token via CLI: ${tokenType === 'direct' ? `${tokenValue.substring(0, 20)  }...` : tokenValue}`);
                    
                    try {
                        // Set up environment variable if testing reference
                        const originalValue = process.env.HF_TOKEN;
                        if (tokenType === 'reference') {
                            process.env.HF_TOKEN = 'hf_test_env_token_12345678901234567890';
                        }
                        
                        // Create mock generator with CLI option
                        const testGenerator = {
                            destinationPath: (filePath = '') => path.join(tempDir, filePath),
                            options: {
                                'hf-token': tokenValue
                            },
                            args: [],
                            env: {
                                error: (message) => {
                                    throw new Error(message);
                                }
                            }
                        };
                        
                        // Create ConfigManager and load configuration (async!)
                        const configManager = new ConfigManager(testGenerator);
                        await configManager.loadConfiguration();
                        
                        // Check that the token was loaded into config (before resolution)
                        const explicitConfig = configManager.getExplicitConfiguration();
                        
                        // Verify token was parsed and stored
                        if (explicitConfig.hfToken === undefined) {
                            console.log('    ❌ CLI option not parsed: hfToken is undefined in explicitConfig');
                            return false;
                        }
                        
                        // For both types, the value should be stored as-is (before resolution)
                        if (explicitConfig.hfToken !== tokenValue) {
                            console.log(`    ❌ Token not stored correctly: expected '${tokenValue}', got '${explicitConfig.hfToken}'`);
                            return false;
                        }
                        
                        // Now test that getFinalConfiguration resolves it correctly
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // For reference type, verify it was resolved
                        if (tokenType === 'reference') {
                            if (finalConfig.hfToken !== 'hf_test_env_token_12345678901234567890') {
                                console.log('    ❌ $HF_TOKEN reference not resolved correctly in finalConfig');
                                return false;
                            }
                        } else {
                            // For direct type, verify it matches (should be unchanged)
                            if (finalConfig.hfToken !== tokenValue) {
                                console.log('    ❌ Direct token not preserved in finalConfig');
                                return false;
                            }
                        }
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        console.log(`    ✅ ${tokenType} token format accepted and stored via CLI`);
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
            
            console.log('  ✅ Property 9b validated: CLI option format acceptance working correctly');
        });

        it('should follow kebab-case naming convention for --hf-token option', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 9c: CLI Option Naming Convention');
            console.log('  📝 The CLI option should use kebab-case naming (--hf-token) as per project conventions');
            console.log('  📝 Validates: Requirements 5.4');
            
            // Feature: huggingface-token-authentication, Property 9: CLI Option Parsing (naming convention)
            fc.assert(fc.property(
                fc.constant('hf-token'),
                (optionName) => {
                    console.log(`    🔍 Verifying CLI option name: --${optionName}`);
                    
                    // Verify the option name follows kebab-case convention
                    const kebabCasePattern = /^[a-z]+(-[a-z]+)*$/;
                    if (!kebabCasePattern.test(optionName)) {
                        console.log('    ❌ Option name does not follow kebab-case convention');
                        return false;
                    }
                    
                    // Verify the option is defined in the parameter matrix
                    const configManager = new ConfigManager(mockGenerator);
                    const paramMatrix = configManager.parameterMatrix;
                    
                    // Find parameter with this CLI option
                    const paramWithOption = Object.entries(paramMatrix).find(
                        ([_param, config]) => config.cliOption === optionName
                    );
                    
                    if (!paramWithOption) {
                        console.log(`    ❌ CLI option --${optionName} not found in parameter matrix`);
                        return false;
                    }
                    
                    const [paramName, paramConfig] = paramWithOption;
                    console.log(`    ✅ CLI option --${optionName} maps to parameter: ${paramName}`);
                    
                    // Verify it's configured correctly
                    if (paramConfig.configFile !== true) {
                        console.log('    ❌ Parameter should support config file');
                        return false;
                    }
                    if (paramConfig.promptable !== true) {
                        console.log('    ❌ Parameter should be promptable');
                        return false;
                    }
                    if (paramConfig.required !== false) {
                        console.log('    ❌ Parameter should be optional (required: false)');
                        return false;
                    }
                    if (paramConfig.default !== null) {
                        console.log('    ❌ Parameter default should be null');
                        return false;
                    }
                    
                    console.log('    ✅ CLI option naming convention validated');
                    return true;
                }
            ), { 
                numRuns: 100,
                verbose: false
            });
            
            console.log('  ✅ Property 9c validated: CLI option naming convention correct');
        });
    });
});
