// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Template Engine - Unit Tests
 * 
 * Tests the TemplateEngine class functionality including:
 * - Environment variable injection
 * - Comment inclusion
 * - Variable ordering preservation
 * - Chat template injection
 * 
 * Validates: Requirements 3.1, 3.2, 3.6, 3.8
 */

import { describe, it } from 'mocha';
import assert from 'assert';
import TemplateEngine from '../../generators/app/lib/template-engine.js';

describe('Template Engine - Unit Tests', () => {
    describe('generateDockerfile', () => {
        it('should inject environment variables into template', () => {
            const envVars = {
                VLLM_MAX_BATCH_SIZE: '32',
                VLLM_GPU_MEMORY_UTILIZATION: '0.9',
                CUDA_VISIBLE_DEVICES: '0'
            };
            
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.ok(receivedVars, 'Template variables should be set');
            assert.deepStrictEqual(receivedVars.envVars, envVars);
        });

        it('should include comments in template variables', () => {
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars: { TEST_VAR: 'value' }
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.ok(receivedVars.comments, 'Comments should be included');
            assert.ok(receivedVars.comments.acceleratorInfo, 'Accelerator info comment should be included');
            assert.ok(receivedVars.comments.envVarExplanations, 'Env var explanations should be included');
            assert.ok(receivedVars.comments.validationInfo, 'Validation info should be included');
            assert.ok(receivedVars.comments.troubleshooting, 'Troubleshooting tips should be included');
        });

        it('should preserve environment variable ordering', () => {
            const envVars = {
                VLLM_MAX_BATCH_SIZE: '32',
                LD_LIBRARY_PATH: '/usr/local/cuda/lib64',
                CUDA_VISIBLE_DEVICES: '0',
                PATH: '/usr/local/bin',
                VLLM_GPU_MEMORY_UTILIZATION: '0.9'
            };
            
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.ok(receivedVars.orderedEnvVars, 'Ordered env vars should be set');
            assert.ok(Array.isArray(receivedVars.orderedEnvVars), 'Ordered env vars should be an array');
            
            // System paths should come first
            const orderedKeys = receivedVars.orderedEnvVars.map(item => item.key);
            const ldLibraryPathIndex = orderedKeys.indexOf('LD_LIBRARY_PATH');
            const pathIndex = orderedKeys.indexOf('PATH');
            const vllmMaxBatchIndex = orderedKeys.indexOf('VLLM_MAX_BATCH_SIZE');
            
            assert.ok(ldLibraryPathIndex < vllmMaxBatchIndex, 'LD_LIBRARY_PATH should come before VLLM variables');
            assert.ok(pathIndex < vllmMaxBatchIndex, 'PATH should come before VLLM variables');
        });

        it('should inject chat template when present', () => {
            const chatTemplate = '{{ bos_token }}{% for message in messages %}...{% endfor %}';
            
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars: {},
                chatTemplate,
                chatTemplateSource: 'HuggingFace_Hub_API'
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.strictEqual(receivedVars.chatTemplate, chatTemplate);
            assert.strictEqual(receivedVars.chatTemplateSource, 'HuggingFace_Hub_API');
            assert.ok(receivedVars.comments.chatTemplate, 'Chat template comment should be included');
        });

        it('should handle empty environment variables', () => {
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars: {}
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.ok(receivedVars, 'Template variables should be set');
            assert.deepStrictEqual(receivedVars.envVars, {});
            assert.ok(Array.isArray(receivedVars.orderedEnvVars), 'Ordered env vars should be an array');
            assert.strictEqual(receivedVars.orderedEnvVars.length, 0, 'Ordered env vars should be empty');
        });

        it('should pass all configuration fields to template', () => {
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                baseImage: 'vllm/vllm-openai:v0.3.0',
                accelerator: {
                    type: 'cuda',
                    version: '12.1'
                },
                envVars: {
                    VLLM_MAX_BATCH_SIZE: '32'
                },
                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                validationLevel: 'tested'
            };
            
            templateEngine.generateDockerfile(config);
            
            assert.strictEqual(receivedVars.framework, 'vllm');
            assert.strictEqual(receivedVars.version, '0.3.0');
            assert.strictEqual(receivedVars.baseImage, 'vllm/vllm-openai:v0.3.0');
            assert.deepStrictEqual(receivedVars.accelerator, config.accelerator);
            assert.strictEqual(receivedVars.inferenceAmiVersion, 'al2-ami-sagemaker-inference-gpu-3-1');
            assert.strictEqual(receivedVars.validationLevel, 'tested');
        });
    });

    describe('generateDeploymentScript', () => {
        it('should inject AMI version into template', () => {
            const inferenceAmiVersion = 'al2-ami-sagemaker-inference-gpu-3-1';
            
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                inferenceAmiVersion
            };
            
            templateEngine.generateDeploymentScript(config);
            
            assert.strictEqual(receivedVars.inferenceAmiVersion, inferenceAmiVersion);
        });

        it('should inject instance type into template', () => {
            const instanceType = 'ml.g5.xlarge';
            
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                instanceType
            };
            
            templateEngine.generateDeploymentScript(config);
            
            assert.strictEqual(receivedVars.instanceType, instanceType);
        });

        it('should include comments in deployment script template', () => {
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                instanceType: 'ml.g5.xlarge'
            };
            
            templateEngine.generateDeploymentScript(config);
            
            assert.ok(receivedVars.comments, 'Comments should be included');
            assert.ok(receivedVars.comments.header, 'Header comment should be included');
            assert.ok(receivedVars.comments.amiVersion, 'AMI version comment should be included');
            assert.ok(receivedVars.comments.instanceType, 'Instance type comment should be included');
            assert.ok(receivedVars.comments.configSource, 'Config source comment should be included');
        });

        it('should pass all configuration fields to deployment script template', () => {
            let receivedVars = null;
            const mockGenerator = {
                fs: {
                    copyTpl: (templatePath, destPath, templateVars) => {
                        receivedVars = templateVars;
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                instanceType: 'ml.g5.xlarge',
                accelerator: {
                    type: 'cuda',
                    version: '12.1'
                },
                validationLevel: 'tested',
                configSources: ['Framework_Registry']
            };
            
            templateEngine.generateDeploymentScript(config);
            
            assert.strictEqual(receivedVars.framework, 'vllm');
            assert.strictEqual(receivedVars.version, '0.3.0');
            assert.strictEqual(receivedVars.inferenceAmiVersion, 'al2-ami-sagemaker-inference-gpu-3-1');
            assert.strictEqual(receivedVars.instanceType, 'ml.g5.xlarge');
            assert.deepStrictEqual(receivedVars.accelerator, config.accelerator);
            assert.strictEqual(receivedVars.validationLevel, 'tested');
            assert.deepStrictEqual(receivedVars.configSources, ['Framework_Registry']);
        });
    });

    describe('_getOrderedEnvVars', () => {
        it('should order system paths first', () => {
            const mockGenerator = {
                fs: { copyTpl: () => {} },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            
            const envVars = {
                VLLM_MAX_BATCH_SIZE: '32',
                LD_LIBRARY_PATH: '/usr/local/cuda/lib64',
                SOME_OTHER_VAR: 'value',
                PATH: '/usr/local/bin'
            };
            
            const ordered = templateEngine._getOrderedEnvVars(envVars);
            
            const keys = ordered.map(item => item.key);
            const ldLibraryPathIndex = keys.indexOf('LD_LIBRARY_PATH');
            const pathIndex = keys.indexOf('PATH');
            const vllmIndex = keys.indexOf('VLLM_MAX_BATCH_SIZE');
            
            assert.ok(ldLibraryPathIndex < vllmIndex, 'LD_LIBRARY_PATH should come before VLLM variables');
            assert.ok(pathIndex < vllmIndex, 'PATH should come before VLLM variables');
        });

        it('should order CUDA variables before framework variables', () => {
            const mockGenerator = {
                fs: { copyTpl: () => {} },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            
            const envVars = {
                VLLM_MAX_BATCH_SIZE: '32',
                CUDA_VISIBLE_DEVICES: '0',
                VLLM_GPU_MEMORY_UTILIZATION: '0.9',
                NVIDIA_VISIBLE_DEVICES: 'all'
            };
            
            const ordered = templateEngine._getOrderedEnvVars(envVars);
            
            const keys = ordered.map(item => item.key);
            const cudaIndex = keys.indexOf('CUDA_VISIBLE_DEVICES');
            const nvidiaIndex = keys.indexOf('NVIDIA_VISIBLE_DEVICES');
            const vllmMaxBatchIndex = keys.indexOf('VLLM_MAX_BATCH_SIZE');
            const vllmGpuIndex = keys.indexOf('VLLM_GPU_MEMORY_UTILIZATION');
            
            assert.ok(cudaIndex < vllmMaxBatchIndex, 'CUDA variables should come before VLLM variables');
            assert.ok(nvidiaIndex < vllmGpuIndex, 'NVIDIA variables should come before VLLM variables');
        });

        it('should preserve all environment variables', () => {
            const mockGenerator = {
                fs: { copyTpl: () => {} },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            
            const envVars = {
                VAR1: 'value1',
                VAR2: 'value2',
                VAR3: 'value3',
                VAR4: 'value4'
            };
            
            const ordered = templateEngine._getOrderedEnvVars(envVars);
            
            assert.strictEqual(ordered.length, 4, 'All env vars should be preserved');
            
            const keys = ordered.map(item => item.key);
            assert.ok(keys.includes('VAR1'), 'VAR1 should be present');
            assert.ok(keys.includes('VAR2'), 'VAR2 should be present');
            assert.ok(keys.includes('VAR3'), 'VAR3 should be present');
            assert.ok(keys.includes('VAR4'), 'VAR4 should be present');
            
            // Verify values are correct
            ordered.forEach(item => {
                assert.strictEqual(item.value, envVars[item.key], `Value for ${item.key} should match`);
            });
        });

        it('should handle empty environment variables', () => {
            const mockGenerator = {
                fs: { copyTpl: () => {} },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            
            const ordered = templateEngine._getOrderedEnvVars({});
            
            assert.ok(Array.isArray(ordered), 'Should return an array');
            assert.strictEqual(ordered.length, 0, 'Should be empty');
        });

        it('should sort alphabetically within same priority', () => {
            const mockGenerator = {
                fs: { copyTpl: () => {} },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };
            
            const templateEngine = new TemplateEngine(mockGenerator);
            
            const envVars = {
                VLLM_Z_VAR: 'z',
                VLLM_A_VAR: 'a',
                VLLM_M_VAR: 'm'
            };
            
            const ordered = templateEngine._getOrderedEnvVars(envVars);
            
            const keys = ordered.map(item => item.key);
            const aIndex = keys.indexOf('VLLM_A_VAR');
            const mIndex = keys.indexOf('VLLM_M_VAR');
            const zIndex = keys.indexOf('VLLM_Z_VAR');
            
            assert.ok(aIndex < mIndex, 'VLLM_A_VAR should come before VLLM_M_VAR');
            assert.ok(mIndex < zIndex, 'VLLM_M_VAR should come before VLLM_Z_VAR');
        });
    });
});
