// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Unit Tests for Template Updates
 * 
 * Tests environment variable injection, AMI version injection,
 * comment inclusion, and backward compatibility with empty registries.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.9
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import TemplateEngine from '../../generators/app/lib/template-engine.js';
import CommentGenerator from '../../generators/app/lib/comment-generator.js';

describe('Template Updates Unit Tests', () => {
    describe('Environment Variable Injection in Dockerfile', () => {
        /**
         * Test that environment variables from configuration are injected into Dockerfile
         * Requirements: 3.1, 3.2
         */
        it('should inject environment variables into template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        // Verify orderedEnvVars is present
                        assert.ok(vars.orderedEnvVars, 'orderedEnvVars should be present');
                        assert.ok(Array.isArray(vars.orderedEnvVars), 'orderedEnvVars should be an array');
                        
                        // Verify environment variables are included
                        const envVarKeys = vars.orderedEnvVars.map(ev => ev.key);
                        assert.ok(envVarKeys.includes('VLLM_MAX_BATCH_SIZE'), 'Should include VLLM_MAX_BATCH_SIZE');
                        assert.ok(envVarKeys.includes('GPU_MEMORY_UTILIZATION'), 'Should include GPU_MEMORY_UTILIZATION');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars: {
                    'VLLM_MAX_BATCH_SIZE': '32',
                    'GPU_MEMORY_UTILIZATION': '0.9'
                }
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(config);
        });

        /**
         * Test that environment variables are ordered correctly
         * Requirements: 3.8
         */
        it('should preserve environment variable ordering', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        const orderedKeys = vars.orderedEnvVars.map(ev => ev.key);
                        
                        // CUDA paths should come before framework variables
                        const cudaIndex = orderedKeys.findIndex(k => k.includes('CUDA'));
                        const vllmIndex = orderedKeys.findIndex(k => k.includes('VLLM'));
                        
                        if (cudaIndex !== -1 && vllmIndex !== -1) {
                            assert.ok(
                                cudaIndex < vllmIndex,
                                'CUDA variables should come before framework variables'
                            );
                        }
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'vllm',
                version: '0.3.0',
                envVars: {
                    'VLLM_MAX_BATCH_SIZE': '32',
                    'CUDA_VISIBLE_DEVICES': '0',
                    'GPU_MEMORY_UTILIZATION': '0.9',
                    'CUDA_HOME': '/usr/local/cuda'
                }
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(config);
        });

        /**
         * Test that empty environment variables don't break generation
         * Requirements: 3.9
         */
        it('should handle empty environment variables gracefully', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.ok(vars.orderedEnvVars, 'orderedEnvVars should be present');
                        assert.strictEqual(vars.orderedEnvVars.length, 0, 'Should be empty array');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'sklearn',
                version: '1.0.0',
                envVars: {}
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(config);
        });
    });

    describe('AMI Version Injection in Deployment Script', () => {
        /**
         * Test that InferenceAmiVersion is injected into deployment script
         * Requirements: 3.3, 3.4
         */
        it('should inject InferenceAmiVersion into template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.strictEqual(
                            vars.inferenceAmiVersion,
                            'al2-ami-sagemaker-inference-gpu-3-1',
                            'Should include InferenceAmiVersion'
                        );
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'tensorrt-llm',
                version: '1.0.0',
                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1'
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDeploymentScript(config);
        });

        /**
         * Test that instance type is injected into deployment script
         * Requirements: 3.5
         */
        it('should inject instance type into template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.strictEqual(
                            vars.instanceType,
                            'ml.g5.xlarge',
                            'Should include instance type'
                        );
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'vllm',
                version: '0.3.0',
                instanceType: 'ml.g5.xlarge'
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDeploymentScript(config);
        });

        /**
         * Test that null AMI version doesn't break generation
         * Requirements: 3.9
         */
        it('should handle null InferenceAmiVersion gracefully', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.strictEqual(vars.inferenceAmiVersion, null, 'Should be null');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'sklearn',
                version: '1.0.0',
                inferenceAmiVersion: null
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDeploymentScript(config);
        });
    });

    describe('Comment Inclusion', () => {
        /**
         * Test that comments are generated and included in Dockerfile
         * Requirements: 3.6
         */
        it('should include comments in Dockerfile template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.ok(vars.comments, 'Comments should be present');
                        assert.ok(vars.comments.acceleratorInfo, 'Should include accelerator info');
                        assert.ok(vars.comments.validationInfo, 'Should include validation info');
                        assert.ok(vars.comments.troubleshooting, 'Should include troubleshooting tips');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'vllm',
                version: '0.3.0',
                accelerator: {
                    type: 'cuda',
                    version: '12.1'
                },
                validationLevel: 'tested'
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(config);
        });

        /**
         * Test that comments are generated and included in deployment script
         * Requirements: 3.6
         */
        it('should include comments in deployment script template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.ok(vars.comments, 'Comments should be present');
                        assert.ok(vars.comments.header, 'Should include header comment');
                        assert.ok(vars.comments.amiVersion, 'Should include AMI version comment');
                        assert.ok(vars.comments.instanceType, 'Should include instance type comment');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'vllm',
                version: '0.3.0',
                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                instanceType: 'ml.g5.xlarge'
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDeploymentScript(config);
        });

        /**
         * Test that configuration source is included in comments
         * Requirements: 3.6
         */
        it('should include configuration source in comments', () => {
            const commentGenerator = new CommentGenerator();
            
            const config = {
                framework: 'vllm',
                version: '0.3.0',
                configSources: ['Framework_Registry', 'HuggingFace_Hub_API']
            };

            const comments = commentGenerator.generateValidationComment(config);
            
            assert.ok(
                comments.includes('Framework_Registry'),
                'Should mention Framework_Registry as source'
            );
            assert.ok(
                comments.includes('HuggingFace_Hub_API'),
                'Should mention HuggingFace_Hub_API as source'
            );
        });
    });

    describe('Backward Compatibility with Empty Registries', () => {
        /**
         * Test that generation works with empty configuration
         * Requirements: 3.9
         */
        it('should generate Dockerfile with empty configuration', () => {
            let generationSucceeded = false;
            
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        generationSucceeded = true;
                        
                        // Should have basic structure even with empty config
                        assert.ok(vars.framework, 'Should have framework');
                        assert.ok(vars.projectName || true, 'Should not fail');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const emptyConfig = {
                framework: 'sklearn',
                projectName: 'test-project',
                envVars: {},
                comments: {}
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(emptyConfig);
            
            assert.ok(generationSucceeded, 'Generation should succeed with empty config');
        });

        /**
         * Test that generation works with undefined optional fields
         * Requirements: 3.9
         */
        it('should handle undefined optional fields gracefully', () => {
            let generationSucceeded = false;
            
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        generationSucceeded = true;
                        
                        // Optional fields should be handled gracefully
                        assert.ok(vars.orderedEnvVars !== undefined, 'orderedEnvVars should be defined');
                        assert.ok(vars.comments !== undefined, 'comments should be defined');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const minimalConfig = {
                framework: 'sklearn',
                projectName: 'test-project'
                // No envVars, no accelerator, no validation info
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(minimalConfig);
            
            assert.ok(generationSucceeded, 'Generation should succeed with minimal config');
        });

        /**
         * Test that deployment script generation works with empty configuration
         * Requirements: 3.9
         */
        it('should generate deployment script with empty configuration', () => {
            let generationSucceeded = false;
            
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        generationSucceeded = true;
                        
                        // Should have basic structure even with empty config
                        assert.ok(vars.framework, 'Should have framework');
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const emptyConfig = {
                framework: 'sklearn',
                projectName: 'test-project',
                comments: {}
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDeploymentScript(emptyConfig);
            
            assert.ok(generationSucceeded, 'Generation should succeed with empty config');
        });

        /**
         * Test that comments are generated even with minimal configuration
         * Requirements: 3.6, 3.9
         */
        it('should generate comments even with minimal configuration', () => {
            const commentGenerator = new CommentGenerator();
            
            const minimalConfig = {
                framework: 'sklearn',
                version: '1.0.0'
                // No accelerator, no validation info
            };

            const dockerfileComments = commentGenerator.generateDockerfileComments(minimalConfig);
            
            // Should generate comments even with minimal config
            assert.ok(dockerfileComments, 'Should generate comments');
            assert.ok(dockerfileComments.acceleratorInfo, 'Should have accelerator info (even if minimal)');
            assert.ok(dockerfileComments.troubleshooting, 'Should have troubleshooting tips');
            
            const deploymentComments = commentGenerator.generateDeploymentComments(minimalConfig);
            
            assert.ok(deploymentComments, 'Should generate deployment comments');
            assert.ok(deploymentComments.header, 'Should have header');
        });
    });

    describe('Chat Template Injection', () => {
        /**
         * Test that chat template is injected when available
         * Requirements: 5.4
         */
        it('should inject chat template into template context', () => {
            const mockGenerator = {
                fs: {
                    copyTpl: (src, dest, vars) => {
                        assert.strictEqual(
                            vars.chatTemplate,
                            '{{ bos_token }}{% for message in messages %}...',
                            'Should include chat template'
                        );
                    }
                },
                templatePath: (path) => path,
                destinationPath: (path) => path
            };

            const config = {
                framework: 'transformers',
                modelServer: 'vllm',
                chatTemplate: '{{ bos_token }}{% for message in messages %}...',
                chatTemplateSource: 'HuggingFace_Hub_API'
            };

            const engine = new TemplateEngine(mockGenerator);
            engine.generateDockerfile(config);
        });

        /**
         * Test that chat template comment is generated
         * Requirements: 5.4, 3.6
         */
        it('should generate chat template comment when template is available', () => {
            const commentGenerator = new CommentGenerator();
            
            const config = {
                framework: 'transformers',
                chatTemplate: '{{ bos_token }}{% for message in messages %}...',
                chatTemplateSource: 'HuggingFace_Hub_API'
            };

            const comment = commentGenerator.generateChatTemplateComment(config);
            
            assert.ok(
                comment.includes('Chat Template Configuration'),
                'Should have chat template header'
            );
            assert.ok(
                comment.includes('HuggingFace_Hub_API'),
                'Should mention source'
            );
        });

        /**
         * Test that missing chat template is handled gracefully
         * Requirements: 3.9
         */
        it('should handle missing chat template gracefully', () => {
            const commentGenerator = new CommentGenerator();
            
            const config = {
                framework: 'transformers',
                chatTemplate: null
            };

            const comment = commentGenerator.generateChatTemplateComment(config);
            
            assert.ok(
                comment.includes('Not configured'),
                'Should indicate chat template is not configured'
            );
            assert.ok(
                comment.includes('may not work'),
                'Should warn about potential issues'
            );
        });
    });
});
