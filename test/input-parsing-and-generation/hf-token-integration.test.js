// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Integration Tests
 * 
 * End-to-end tests for complete HF token project generation.
 * Tests all input methods (CLI, config file, prompt) and validates
 * that generated Dockerfiles contain correct ENV directives.
 * 
 * Feature: huggingface-token-authentication
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import path from 'path';
import fs from 'fs';

describe('HuggingFace Token Integration Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Integration Tests');
        console.log('📋 Testing: End-to-end project generation with HF token');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Integration Tests');

    describe('CLI Option Integration', () => {
        it('should generate complete project with --hf-token CLI option', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing complete project generation with CLI --hf-token');
            console.log('  📝 Validates: Requirements 11.1');
            
            const testToken = 'hf_cli_test_token_123456789012345678';
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': testToken,
                    'include-testing': false,
                    'include-sample': false,
                    'deploy-target': 'sagemaker',
                    'instance-type': 'gpu-enabled',
                    'aws-region': 'us-east-1'
                });
            
            // Verify all core files exist
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ]);
            
            // Verify Dockerfile contains correct ENV directive
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${testToken}"`), 
                'Dockerfile should contain ENV HF_TOKEN with CLI token value');
            
            // Verify ENV is in correct location (after OPTION_MODEL, before COPY)
            const optionModelPos = dockerfileContent.indexOf('ENV OPTION_MODEL=');
            const hfTokenPos = dockerfileContent.indexOf('ENV HF_TOKEN=');
            const copyPos = dockerfileContent.indexOf('COPY code/serve');
            
            assert.ok(optionModelPos < hfTokenPos && hfTokenPos < copyPos,
                'ENV HF_TOKEN should be between OPTION_MODEL and COPY');
            
            console.log('    ✅ Complete project generated with CLI --hf-token');
        });

        it('should generate project with $HF_TOKEN reference via CLI', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing project generation with $HF_TOKEN reference via CLI');
            console.log('  📝 Validates: Requirements 11.4');
            
            // Set environment variable for resolution
            const originalEnv = process.env.HF_TOKEN;
            process.env.HF_TOKEN = 'hf_env_resolved_token_123456789';
            
            try {
                const result = await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': 'sglang',
                        'model-name': 'meta-llama/Llama-3.2-3B-Instruct',
                        'hf-token': '$HF_TOKEN',
                        'include-testing': false,
                        'include-sample': false
                    });
                
                // Verify Dockerfile exists
                assert.file(['Dockerfile']);
                
                // Verify Dockerfile contains resolved token value (not $HF_TOKEN)
                const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                
                assert.ok(dockerfileContent.includes('ENV HF_TOKEN="hf_env_resolved_token_123456789"'),
                    'Dockerfile should contain resolved token value');
                assert.ok(!dockerfileContent.includes('ENV HF_TOKEN="$HF_TOKEN"'),
                    'Dockerfile should not contain literal $HF_TOKEN');
                
                console.log('    ✅ Project generated with resolved $HF_TOKEN reference');
            } finally {
                // Restore environment
                if (originalEnv !== undefined) {
                    process.env.HF_TOKEN = originalEnv;
                } else {
                    delete process.env.HF_TOKEN;
                }
            }
        });

        it('should generate project without hfToken when not provided via CLI', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing project generation without hfToken via CLI');
            console.log('  📝 Validates: Requirements 11.5');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'openai/gpt-oss-20b',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN when token not provided');
            
            console.log('    ✅ Project generated without ENV HF_TOKEN when not provided');
        });
    });

    describe('Config File Integration', () => {
        it('should generate complete project with hfToken in config file', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing complete project generation with config file hfToken');
            console.log('  📝 Validates: Requirements 11.2');
            
            const testToken = 'hf_config_test_token_987654321098765';
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': testToken,
                    'include-testing': false,
                    'include-sample': false,
                    'deploy-target': 'sagemaker',
                    'instance-type': 'gpu-enabled',
                    'aws-region': 'us-west-2'
                });
            
            // Verify all core files exist
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ]);
            
            // Verify Dockerfile contains correct ENV directive
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${testToken}"`),
                'Dockerfile should contain ENV HF_TOKEN with config file token value');
            
            console.log('    ✅ Complete project generated with config file hfToken');
        });

        it('should generate project with $HF_TOKEN reference in config file', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing project generation with $HF_TOKEN in config file');
            console.log('  📝 Validates: Requirements 11.4');
            
            // Set environment variable for resolution
            const originalEnv = process.env.HF_TOKEN;
            process.env.HF_TOKEN = 'hf_config_env_token_555555555';
            
            try {
                const result = await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': 'sglang',
                        'model-name': 'meta-llama/Llama-3.2-1B-Instruct',
                        'hf-token': '$HF_TOKEN',
                        'include-testing': false,
                        'include-sample': false,
                        'instance-type': 'gpu-enabled'
                    });
                
                // Verify Dockerfile contains resolved token value
                const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                
                assert.ok(dockerfileContent.includes('ENV HF_TOKEN="hf_config_env_token_555555555"'),
                    'Dockerfile should contain resolved token value from config file');
                
                console.log('    ✅ Project generated with resolved $HF_TOKEN from config file');
            } finally {
                // Restore environment
                if (originalEnv !== undefined) {
                    process.env.HF_TOKEN = originalEnv;
                } else {
                    delete process.env.HF_TOKEN;
                }
            }
        });

        it('should generate project without hfToken when not in config file', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing project generation without hfToken in config file');
            console.log('  📝 Validates: Requirements 11.5');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'openai/gpt-oss-20b',
                    'include-testing': false,
                    'include-sample': false,
                    'instance-type': 'gpu-enabled'
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN when not in config file');
            
            console.log('    ✅ Project generated without ENV HF_TOKEN when not in config');
        });
    });

    describe('Prompt Input Integration', () => {
        it('should generate complete project with hfToken from prompt', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing complete project generation with prompt hfToken');
            console.log('  📝 Validates: Requirements 11.3');
            
            const testToken = 'hf_prompt_test_token_111222333444555';
            
            const result = await helpers.run(getGeneratorPath())
                .withPrompts({
                    framework: 'transformers',
                    modelServer: 'vllm',
                    modelName: 'Custom (enter manually)',
                    customModelName: 'meta-llama/Llama-2-13b-hf',
                    hfToken: testToken,
                    includeTesting: false,
                    includeSampleModel: false,
                    deployTarget: 'sagemaker',
                    instanceType: 'gpu-enabled',
                    awsRegion: 'eu-west-1'
                });
            
            // Verify all core files exist
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ]);
            
            // Verify Dockerfile contains correct ENV directive
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${testToken}"`),
                'Dockerfile should contain ENV HF_TOKEN with prompt token value');
            
            console.log('    ✅ Complete project generated with prompt hfToken');
        });

        it('should generate project with empty hfToken from prompt', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing project generation with empty hfToken from prompt');
            console.log('  📝 Validates: Requirements 11.5');
            
            const result = await helpers.run(getGeneratorPath())
                .withPrompts({
                    framework: 'transformers',
                    modelServer: 'sglang',
                    modelName: 'Custom (enter manually)',
                    customModelName: 'openai/gpt-oss-20b',
                    hfToken: '',  // Empty token
                    includeTesting: false,
                    includeSampleModel: false,
                    instanceType: 'gpu-enabled'
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN when prompt token is empty');
            
            console.log('    ✅ Project generated without ENV HF_TOKEN when prompt empty');
        });
    });

    describe('Complete Workflow Validation', () => {
        it('should generate fully functional transformer project with all files', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing complete transformer project generation');
            console.log('  📝 Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5');
            
            const testToken = 'hf_complete_workflow_token_999888777';
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': testToken,
                    'include-testing': true,
                    'include-sample': false,
                    'deploy-target': 'sagemaker',
                    'instance-type': 'gpu-enabled',
                    'aws-region': 'us-east-1'
                });
            
            // Verify all expected files exist
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh',
                'test/test_endpoint.sh'
            ]);
            
            // Verify Dockerfile content
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Check ENV HF_TOKEN
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${testToken}"`),
                'Dockerfile should contain ENV HF_TOKEN');
            
            // Check other required directives
            assert.ok(dockerfileContent.includes('ENV OPTION_MODEL='),
                'Dockerfile should contain ENV OPTION_MODEL');
            assert.ok(dockerfileContent.includes('COPY code/serve'),
                'Dockerfile should contain COPY code/serve');
            assert.ok(dockerfileContent.includes('ENTRYPOINT'),
                'Dockerfile should contain ENTRYPOINT');
            
            // Verify serve script exists and is executable
            const servePath = path.join(result.cwd, 'code/serve');
            assert.ok(fs.existsSync(servePath), 'serve script should exist');
            
            // Verify deployment scripts exist
            assert.file(['deploy/deploy.sh', 'deploy/upload_to_s3.sh']);
            
            console.log('    ✅ Complete transformer project generated successfully');
        });

        it('should handle all model servers with hfToken', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing hfToken with all model servers');
            
            const modelServers = ['vllm', 'sglang'];
            const testToken = 'hf_multi_server_token_123456789';
            
            for (const server of modelServers) {
                console.log(`    Testing ${server}...`);
                
                const result = await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': server,
                        'model-name': 'meta-llama/Llama-2-7b-hf',
                        'hf-token': testToken,
                        'include-testing': false,
                        'include-sample': false
                    });
                
                // Verify Dockerfile contains ENV HF_TOKEN for each server
                const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                
                assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${testToken}"`),
                    `Dockerfile should contain ENV HF_TOKEN for ${server}`);
                
                console.log(`    ✅ ${server} works with hfToken`);
            }
            
            console.log('    ✅ All model servers work with hfToken');
        });

        it('should generate correct deployment scripts', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing deployment script generation');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': 'hf_test_token_123',
                    'include-testing': false,
                    'include-sample': false,
                    'instance-type': 'gpu-enabled'
                });
            
            // Verify deployment scripts exist
            assert.file(['deploy/deploy.sh', 'deploy/upload_to_s3.sh']);
            
            console.log('    ✅ Deployment scripts generated correctly');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle very long token values', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing very long token value');
            
            // Generate a very long token (100 characters)
            const longToken = `hf_${  'a'.repeat(97)}`;
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': longToken,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile contains the long token
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${longToken}"`),
                'Dockerfile should handle very long token values');
            
            console.log('    ✅ Very long token handled correctly');
        });

        it('should handle tokens with special characters', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing token with special characters');
            
            const specialToken = 'hf_abc-123_XYZ.789';
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': specialToken,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile contains the token with special characters
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(dockerfileContent.includes(`ENV HF_TOKEN="${specialToken}"`),
                'Dockerfile should handle tokens with special characters');
            
            console.log('    ✅ Token with special characters handled correctly');
        });

        it('should handle whitespace-only token as empty', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing whitespace-only token');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': '   ',  // Whitespace only
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN for whitespace-only token');
            
            console.log('    ✅ Whitespace-only token treated as empty');
        });
    });
});
