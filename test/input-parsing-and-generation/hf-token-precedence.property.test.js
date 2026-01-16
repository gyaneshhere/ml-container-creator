// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Parameter Precedence Property-Based Tests
 * 
 * Tests the correctness properties for HuggingFace token parameter precedence.
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

describe('HuggingFace Token Parameter Precedence - Property-Based Tests', () => {
    let tempDir;
    let mockGenerator;

    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Parameter Precedence Property Tests');
        console.log('📋 Testing: Universal correctness properties for HF token precedence');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Parameter Precedence Properties');

    beforeEach(() => {
        // Create a temporary directory for each test
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-token-precedence-test-'));
        
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

    describe('Property 12: Parameter Precedence - CLI Over Config', () => {
        it('should give CLI option precedence over config file for hfToken', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 12: Parameter Precedence - CLI Over Config');
            console.log('  📝 For any configuration where hfToken is provided through both CLI and config file, the CLI value should take precedence');
            console.log('  📝 Validates: Requirements 7.1');
            
            // Feature: huggingface-token-authentication, Property 12: Parameter Precedence - CLI Over Config
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (cliToken, configToken) => {
                    // Ensure tokens are different
                    fc.pre(cliToken !== configToken);
                    
                    console.log('    🔍 Testing CLI precedence: CLI token vs config token');
                    
                    try {
                        // Create config file with one token
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
                        
                        // Set CLI option with different token
                        mockGenerator.options['hf-token'] = cliToken;
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
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
            
            console.log('  ✅ Property 12 validated: CLI option precedence over config file working correctly');
        });

        it('should give CLI option precedence over config file for $HF_TOKEN references', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 12b: CLI Precedence for Environment Variable References');
            console.log('  📝 When both CLI and config file have "$HF_TOKEN", CLI should take precedence');
            console.log('  📝 Validates: Requirements 7.1');
            
            // Feature: huggingface-token-authentication, Property 12: Parameter Precedence - CLI Over Config (env var refs)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (directToken) => {
                    console.log('    🔍 Testing CLI precedence: CLI $HF_TOKEN vs config direct token');
                    
                    // Set up environment variable
                    const originalValue = process.env.HF_TOKEN;
                    process.env.HF_TOKEN = directToken;
                    
                    try {
                        // Create config file with direct token
                        const configFileConfig = {
                            projectName: 'precedence-test',
                            framework: 'transformers',
                            modelServer: 'vllm',
                            modelName: 'meta-llama/Llama-2-7b-hf',
                            instanceType: 'gpu-enabled',
                            hfToken: 'hf_different_token_12345678901234567890',
                            includeSampleModel: false,
                            includeTesting: false
                        };
                        
                        const configPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(configPath, JSON.stringify(configFileConfig, null, 2));
                        
                        // Set CLI option with $HF_TOKEN reference
                        mockGenerator.options['hf-token'] = '$HF_TOKEN';
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Get final configuration (this should resolve $HF_TOKEN)
                        const finalConfig = configManager.getFinalConfiguration();
                        
                        // Verify CLI $HF_TOKEN reference was resolved and takes precedence
                        if (finalConfig.hfToken !== directToken) {
                            console.log(`    ❌ CLI precedence failed: expected resolved token '${directToken.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        console.log('    ✅ CLI precedence for $HF_TOKEN reference validated');
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
            
            console.log('  ✅ Property 12b validated: CLI precedence for $HF_TOKEN references working correctly');
        });

        it('should give CLI option precedence over custom config file', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 12c: CLI Precedence Over Custom Config File');
            console.log('  📝 CLI option should take precedence over ml-container.config.json');
            console.log('  📝 Validates: Requirements 7.1');
            
            // Feature: huggingface-token-authentication, Property 12: Parameter Precedence - CLI Over Config (custom config)
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    fc.constant('$HF_TOKEN'),
                    fc.constant('')
                ),
                fc.oneof(
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    fc.constant('$HF_TOKEN'),
                    fc.constant('')
                ),
                async (cliToken, configToken) => {
                    // Ensure tokens are different
                    fc.pre(cliToken !== configToken);
                    
                    console.log('    🔍 Testing CLI precedence over custom config');
                    
                    try {
                        // Create custom config file
                        const customConfig = {
                            projectName: 'custom-config-test',
                            framework: 'transformers',
                            modelServer: 'sglang',
                            modelName: 'openai/gpt-oss-20b',
                            instanceType: 'gpu-enabled',
                            hfToken: configToken,
                            includeSampleModel: false,
                            includeTesting: false
                        };
                        
                        const customConfigPath = path.join(tempDir, 'ml-container.config.json');
                        fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 2));
                        
                        // Set CLI option
                        mockGenerator.options['hf-token'] = cliToken;
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Get explicit configuration (before resolution)
                        const explicitConfig = configManager.getExplicitConfiguration();
                        
                        // Verify CLI token is in explicit config (takes precedence)
                        if (explicitConfig.hfToken !== cliToken) {
                            console.log(`    ❌ CLI precedence failed: expected '${cliToken}', got '${explicitConfig.hfToken}'`);
                            return false;
                        }
                        
                        console.log('    ✅ CLI precedence over custom config validated');
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
            
            console.log('  ✅ Property 12c validated: CLI precedence over custom config file working correctly');
        });
    });

    describe('Property 13: Parameter Precedence - Config Over Prompt', () => {
        it('should give config file precedence over prompt answers for hfToken', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 13: Parameter Precedence - Config Over Prompt');
            console.log('  📝 For any configuration where hfToken is provided through both config file and prompt, the config file value should take precedence');
            console.log('  📝 Validates: Requirements 7.2, 7.3');
            
            // Feature: huggingface-token-authentication, Property 13: Parameter Precedence - Config Over Prompt
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (configToken, promptToken) => {
                    // Ensure tokens are different
                    fc.pre(configToken !== promptToken);
                    
                    console.log('    🔍 Testing config precedence: config token vs prompt token');
                    
                    try {
                        // Create config file with one token
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
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Simulate prompt answers with different token
                        const promptAnswers = {
                            hfToken: promptToken
                        };
                        
                        // Get final configuration (config should override prompt)
                        const finalConfig = configManager.getFinalConfiguration(promptAnswers);
                        
                        // Verify config token takes precedence over prompt
                        if (finalConfig.hfToken !== configToken) {
                            console.log(`    ❌ Config precedence failed: expected config token '${configToken.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Config precedence validated');
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
            
            console.log('  ✅ Property 13 validated: Config file precedence over prompt answers working correctly');
        });

        it('should give config file precedence over prompt for $HF_TOKEN references', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 13b: Config Precedence for Environment Variable References');
            console.log('  📝 When config file has "$HF_TOKEN" and prompt has direct token, config should take precedence');
            console.log('  📝 Validates: Requirements 7.2, 7.3');
            
            // Feature: huggingface-token-authentication, Property 13: Parameter Precedence - Config Over Prompt (env var refs)
            await fc.assert(fc.asyncProperty(
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                async (envToken, promptToken) => {
                    // Ensure tokens are different
                    fc.pre(envToken !== promptToken);
                    
                    console.log('    🔍 Testing config precedence: config $HF_TOKEN vs prompt direct token');
                    
                    // Set up environment variable
                    const originalValue = process.env.HF_TOKEN;
                    process.env.HF_TOKEN = envToken;
                    
                    try {
                        // Create config file with $HF_TOKEN reference
                        const configFileConfig = {
                            projectName: 'precedence-test',
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
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Simulate prompt answers with direct token
                        const promptAnswers = {
                            hfToken: promptToken
                        };
                        
                        // Get final configuration (config $HF_TOKEN should be resolved and override prompt)
                        const finalConfig = configManager.getFinalConfiguration(promptAnswers);
                        
                        // Verify config $HF_TOKEN reference was resolved and takes precedence
                        if (finalConfig.hfToken !== envToken) {
                            console.log(`    ❌ Config precedence failed: expected resolved token '${envToken.substring(0, 20)}...', got '${finalConfig.hfToken ? `${finalConfig.hfToken.substring(0, 20)  }...` : 'null'}'`);
                            return false;
                        }
                        
                        // Restore environment
                        if (originalValue !== undefined) {
                            process.env.HF_TOKEN = originalValue;
                        } else {
                            delete process.env.HF_TOKEN;
                        }
                        
                        console.log('    ✅ Config precedence for $HF_TOKEN reference validated');
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
            
            console.log('  ✅ Property 13b validated: Config precedence for $HF_TOKEN references working correctly');
        });

        it('should give config file precedence over empty prompt answers', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 13c: Config Precedence Over Empty Prompts');
            console.log('  📝 When config file has hfToken and prompt is empty, config should take precedence');
            console.log('  📝 Validates: Requirements 7.2, 7.3');
            
            // Feature: huggingface-token-authentication, Property 13: Parameter Precedence - Config Over Prompt (empty prompts)
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    fc.constant('$HF_TOKEN')
                ),
                async (configToken) => {
                    console.log('    🔍 Testing config precedence over empty prompt');
                    
                    try {
                        // Create config file with token
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
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Simulate prompt answers with empty token
                        const promptAnswers = {
                            hfToken: ''
                        };
                        
                        // Get final configuration (config should override empty prompt)
                        const finalConfig = configManager.getFinalConfiguration(promptAnswers);
                        
                        // Verify config token takes precedence over empty prompt
                        // Note: If configToken is $HF_TOKEN, it should remain as-is (not resolved yet)
                        const expectedToken = configToken === '$HF_TOKEN' ? configToken : configToken;
                        if (finalConfig.hfToken !== expectedToken && finalConfig.hfToken !== null) {
                            // Allow null if $HF_TOKEN env var is not set
                            if (configToken === '$HF_TOKEN' && finalConfig.hfToken === null) {
                                console.log('    ✅ Config precedence validated (env var not set, resolved to null)');
                                return true;
                            }
                            console.log(`    ❌ Config precedence failed: expected '${expectedToken}', got '${finalConfig.hfToken}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Config precedence over empty prompt validated');
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
            
            console.log('  ✅ Property 13c validated: Config precedence over empty prompts working correctly');
        });
    });

    describe('Property 10: Configuration Suppresses Prompts', () => {
        it('should skip hfToken prompt when provided via CLI option', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 10: Configuration Suppresses Prompts');
            console.log('  📝 For any configuration where hfToken is provided via CLI option or config file, the Generator should skip the HF_TOKEN prompt');
            console.log('  📝 Validates: Requirements 5.3, 6.3');
            
            // Feature: huggingface-token-authentication, Property 10: Configuration Suppresses Prompts
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    fc.constant('$HF_TOKEN'),
                    fc.constant('')
                ),
                async (cliToken) => {
                    console.log('    🔍 Testing prompt suppression with CLI token');
                    
                    try {
                        // Set CLI option
                        mockGenerator.options['hf-token'] = cliToken;
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Get explicit configuration
                        const explicitConfig = configManager.getExplicitConfiguration();
                        
                        // Verify hfToken is in explicit config (which means prompt should be skipped)
                        if (explicitConfig.hfToken !== cliToken) {
                            console.log(`    ❌ CLI token not in explicit config: expected '${cliToken}', got '${explicitConfig.hfToken}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Prompt suppression validated for CLI option');
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
            
            console.log('  ✅ Property 10 validated: CLI option suppresses prompts correctly');
        });

        it('should skip hfToken prompt when provided via config file', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Property 10b: Config File Suppresses Prompts');
            console.log('  📝 When hfToken is provided in config file, prompt should be skipped');
            console.log('  📝 Validates: Requirements 6.3');
            
            // Feature: huggingface-token-authentication, Property 10: Configuration Suppresses Prompts (config file)
            await fc.assert(fc.asyncProperty(
                fc.oneof(
                    fc.stringMatching(/^hf_[a-zA-Z0-9]{20,50}$/),
                    fc.constant('$HF_TOKEN'),
                    fc.constant('')
                ),
                async (configToken) => {
                    console.log('    🔍 Testing prompt suppression with config file token');
                    
                    try {
                        // Create config file with token
                        const configFileConfig = {
                            projectName: 'prompt-suppression-test',
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
                        
                        // Create ConfigManager and load configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Get explicit configuration
                        const explicitConfig = configManager.getExplicitConfiguration();
                        
                        // Verify hfToken is in explicit config (which means prompt should be skipped)
                        if (explicitConfig.hfToken !== configToken) {
                            console.log(`    ❌ Config token not in explicit config: expected '${configToken}', got '${explicitConfig.hfToken}'`);
                            return false;
                        }
                        
                        console.log('    ✅ Prompt suppression validated for config file');
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
            
            console.log('  ✅ Property 10b validated: Config file suppresses prompts correctly');
        });

        it('should not suppress prompt when hfToken is not provided in any configuration source', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Property 10c: No Suppression Without Configuration');
            console.log('  📝 When hfToken is not provided via CLI or config, prompt should not be suppressed');
            console.log('  📝 Validates: Requirements 5.3, 6.3');
            
            // Feature: huggingface-token-authentication, Property 10: Configuration Suppresses Prompts (no suppression)
            await fc.assert(fc.asyncProperty(
                fc.constant(true),
                async (_) => {
                    console.log('    🔍 Testing no prompt suppression without configuration');
                    
                    try {
                        // Create ConfigManager without any hfToken configuration
                        const configManager = new ConfigManager(mockGenerator);
                        await configManager.loadConfiguration();
                        
                        // Get explicit configuration
                        const explicitConfig = configManager.getExplicitConfiguration();
                        
                        // Verify hfToken is NOT in explicit config (which means prompt should NOT be skipped)
                        if (explicitConfig.hfToken !== undefined && explicitConfig.hfToken !== null) {
                            console.log(`    ❌ hfToken unexpectedly in explicit config: ${explicitConfig.hfToken}`);
                            return false;
                        }
                        
                        console.log('    ✅ No prompt suppression validated');
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
            
            console.log('  ✅ Property 10c validated: Prompts not suppressed without configuration');
        });
    });
});
