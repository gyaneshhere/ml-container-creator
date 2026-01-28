// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Comment Generator - Configuration Source Attribution Property-Based Tests
 * 
 * Tests Property 8: Configuration Source Attribution
 * For any generated file, comments must include the source of each configuration element
 * (Framework_Registry, HuggingFace_Hub_API, Model_Registry, or default).
 * 
 * Feature: transformer-server-env-config
 * Validates: Requirements 3.6
 */

import fc from 'fast-check';
import { describe, it, before } from 'mocha';
import assert from 'assert';
import CommentGenerator from '../../generators/app/lib/comment-generator.js';

describe('Comment Generator - Configuration Source Attribution Property Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting Comment Generator Source Attribution Property Tests');
        console.log('📋 Testing: Property 8 - Configuration Source Attribution');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    describe('Property 8: Configuration Source Attribution', () => {
        it('should include configuration sources in Dockerfile comments', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Dockerfile');
            console.log('  📝 For any configuration with sources,');
            console.log('  📝 Dockerfile comments must include all configuration sources');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate configuration sources (at least one)
                fc.array(
                    fc.constantFrom(
                        'Framework_Registry',
                        'HuggingFace_Hub_API',
                        'Model_Registry',
                        'Default'
                    ),
                    { minLength: 1, maxLength: 4 }
                ).map(arr => [...new Set(arr)]),  // Ensure unique sources
                // Generate framework and version
                fc.record({
                    framework: fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                    version: fc.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+$/),
                    validationLevel: fc.constantFrom('tested', 'community-validated', 'experimental', 'unknown')
                }),
                (configSources, metadata) => {
                    // Build configuration
                    const config = {
                        framework: metadata.framework,
                        version: metadata.version,
                        configSources: configSources,
                        validationLevel: metadata.validationLevel,
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        },
                        envVars: {
                            TEST_VAR: 'test-value'
                        },
                        inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                        instanceType: 'ml.g5.xlarge',
                        generatedAt: '2024-01-26'
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const comments = commentGenerator.generateDockerfileComments(config);
                    
                    // Verify validation info includes sources
                    assert.ok(
                        comments.validationInfo,
                        'Validation info should be present'
                    );
                    
                    // Verify all sources are mentioned in validation info
                    configSources.forEach(source => {
                        assert.ok(
                            comments.validationInfo.includes(source),
                            `Validation info should mention source: ${source}`
                        );
                    });
                    
                    // Verify "Configuration Sources:" header is present
                    assert.ok(
                        comments.validationInfo.includes('Configuration Sources:'),
                        'Validation info should have "Configuration Sources:" header'
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Dockerfile comments include all configuration sources');
        });

        it('should include configuration sources in deployment script comments', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Deployment Scripts');
            console.log('  📝 For any configuration with sources,');
            console.log('  📝 deployment script comments must include all configuration sources');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate configuration sources (at least one)
                fc.array(
                    fc.constantFrom(
                        'Framework_Registry',
                        'HuggingFace_Hub_API',
                        'Model_Registry',
                        'Default'
                    ),
                    { minLength: 1, maxLength: 4 }
                ).map(arr => [...new Set(arr)]),  // Ensure unique sources
                // Generate framework and version
                fc.record({
                    framework: fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                    version: fc.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+$/),
                    instanceType: fc.constantFrom('ml.g5.xlarge', 'ml.g5.2xlarge', 'ml.p3.2xlarge', 'ml.inf2.xlarge')
                }),
                (configSources, metadata) => {
                    // Build configuration
                    const config = {
                        framework: metadata.framework,
                        version: metadata.version,
                        configSources: configSources,
                        instanceType: metadata.instanceType,
                        inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        },
                        generatedAt: '2024-01-26'
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const comments = commentGenerator.generateDeploymentComments(config);
                    
                    // Verify config source comment is present
                    assert.ok(
                        comments.configSource,
                        'Config source comment should be present'
                    );
                    
                    // Verify all sources are mentioned
                    configSources.forEach(source => {
                        assert.ok(
                            comments.configSource.includes(source),
                            `Config source comment should mention: ${source}`
                        );
                    });
                    
                    // Verify "Configuration Sources:" header is present
                    assert.ok(
                        comments.configSource.includes('Configuration Sources:'),
                        'Config source comment should have "Configuration Sources:" header'
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Deployment script comments include all configuration sources');
        });

        it('should attribute environment variables to their source', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Environment Variables');
            console.log('  📝 For any environment variable configuration,');
            console.log('  📝 comments must indicate the source of the env vars');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate configuration source
                fc.constantFrom(
                    'Framework_Registry',
                    'HuggingFace_Hub_API',
                    'Model_Registry',
                    'Default configuration'
                ),
                // Generate env vars
                fc.dictionary(
                    fc.stringMatching(/^[A-Z_]+$/),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    { minKeys: 1, maxKeys: 5 }
                ),
                // Generate framework
                fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                (source, envVars, framework) => {
                    // Build configuration
                    const config = {
                        framework: framework,
                        version: '1.0.0',
                        configSources: [source],
                        envVars: envVars,
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        }
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const comments = commentGenerator.generateEnvVarComments(config);
                    
                    // Verify comments are generated
                    assert.ok(
                        comments,
                        'Environment variable comments should be generated'
                    );
                    
                    // Verify at least one comment section exists
                    const commentSections = Object.values(comments);
                    assert.ok(
                        commentSections.length > 0,
                        'At least one comment section should exist'
                    );
                    
                    // Verify source is mentioned in at least one comment section
                    const allComments = commentSections.join('\n');
                    assert.ok(
                        allComments.includes('Source:'),
                        'Comments should include "Source:" attribution'
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Environment variable comments include source attribution');
        });

        it('should indicate when using default configuration', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Default Configuration');
            console.log('  📝 For any configuration without explicit sources,');
            console.log('  📝 comments must indicate default configuration is being used');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate framework and version
                fc.record({
                    framework: fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                    version: fc.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+$/),
                    instanceType: fc.constantFrom('ml.g5.xlarge', 'ml.g5.2xlarge', 'ml.p3.2xlarge')
                }),
                (metadata) => {
                    // Build configuration with no explicit sources
                    const config = {
                        framework: metadata.framework,
                        version: metadata.version,
                        configSources: [],  // Empty sources
                        instanceType: metadata.instanceType,
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        },
                        generatedAt: '2024-01-26'
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const deploymentComments = commentGenerator.generateDeploymentComments(config);
                    
                    // Verify config source comment mentions default
                    assert.ok(
                        deploymentComments.configSource,
                        'Config source comment should be present'
                    );
                    
                    assert.ok(
                        deploymentComments.configSource.includes('Default') ||
                        deploymentComments.configSource.includes('default'),
                        'Config source comment should mention default configuration'
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Comments indicate when default configuration is used');
        });

        it('should include chat template source attribution', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Chat Template');
            console.log('  📝 For any configuration with a chat template,');
            console.log('  📝 comments must indicate the source of the chat template');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate chat template source
                fc.constantFrom(
                    'HuggingFace_Hub_API',
                    'Model_Registry',
                    'Default'
                ),
                // Generate chat template
                fc.string({ minLength: 10, maxLength: 100 }),
                // Generate framework
                fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                (chatTemplateSource, chatTemplate, framework) => {
                    // Build configuration
                    const config = {
                        framework: framework,
                        version: '1.0.0',
                        chatTemplate: chatTemplate,
                        chatTemplateSource: chatTemplateSource,
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        }
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const comments = commentGenerator.generateDockerfileComments(config);
                    
                    // Verify chat template comment is present
                    assert.ok(
                        comments.chatTemplate,
                        'Chat template comment should be present'
                    );
                    
                    // Verify source is mentioned
                    assert.ok(
                        comments.chatTemplate.includes('Source:'),
                        'Chat template comment should include "Source:" attribution'
                    );
                    
                    assert.ok(
                        comments.chatTemplate.includes(chatTemplateSource),
                        `Chat template comment should mention source: ${chatTemplateSource}`
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Chat template comments include source attribution');
        });

        it('should indicate when chat template is not configured', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 8: Configuration Source Attribution - Missing Chat Template');
            console.log('  📝 For any configuration without a chat template,');
            console.log('  📝 comments must indicate that chat template is not configured');
            console.log('  📝 Validates: Requirements 3.6');
            
            // Feature: transformer-server-env-config, Property 8: Configuration Source Attribution
            fc.assert(fc.property(
                // Generate framework
                fc.constantFrom('vllm', 'tensorrt-llm', 'sglang', 'transformers'),
                (framework) => {
                    // Build configuration without chat template
                    const config = {
                        framework: framework,
                        version: '1.0.0',
                        chatTemplate: null,  // No chat template
                        accelerator: {
                            type: 'cuda',
                            version: '12.1'
                        }
                    };
                    
                    // Generate comments
                    const commentGenerator = new CommentGenerator();
                    const comments = commentGenerator.generateDockerfileComments(config);
                    
                    // Verify chat template comment is present
                    assert.ok(
                        comments.chatTemplate,
                        'Chat template comment should be present even when not configured'
                    );
                    
                    // Verify it indicates not configured
                    assert.ok(
                        comments.chatTemplate.includes('Not configured') ||
                        comments.chatTemplate.includes('not configured'),
                        'Chat template comment should indicate it is not configured'
                    );
                    
                    // Verify it includes a note about manual configuration
                    assert.ok(
                        comments.chatTemplate.includes('manual') ||
                        comments.chatTemplate.includes('Manual'),
                        'Chat template comment should mention manual configuration may be needed'
                    );
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ Comments indicate when chat template is not configured');
        });
    });
});
