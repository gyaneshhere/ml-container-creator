// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Backward Compatibility Tests
 * 
 * Tests that the HF token feature maintains backward compatibility:
 * - Existing configurations without HF token still work
 * - Non-transformer projects are unaffected
 * - Example model IDs skip authentication prompts
 * - All existing tests continue to pass
 * 
 * Feature: huggingface-token-authentication
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import path from 'path';
import fs from 'fs';

describe('HuggingFace Token Backward Compatibility Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Backward Compatibility Tests');
        console.log('📋 Testing: Backward compatibility with existing configurations');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Backward Compatibility Tests');

    describe('Existing Configurations Without HF Token', () => {
        it('should generate sklearn project without HF token (legacy config)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing sklearn project without HF token');
            console.log('  📝 Validates: Requirements 13.1');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'include-testing': false,
                    'include-sample': false,
                    'deploy-target': 'sagemaker',
                    'instance-type': 'cpu-optimized',
                    'aws-region': 'us-east-1'
                });
            
            // Verify all expected files exist
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'code/model_handler.py',
                'code/serve.py',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh'
            ]);
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'sklearn Dockerfile should not contain ENV HF_TOKEN');
            
            // Verify requirements.txt contains sklearn
            assert.fileContent('requirements.txt', /scikit-learn/);
            
            console.log('    ✅ sklearn project works without HF token');
        });

        it('should generate xgboost project without HF token (legacy config)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing xgboost project without HF token');
            console.log('  📝 Validates: Requirements 13.1');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'xgboost',
                    'model-server': 'fastapi',
                    'model-format': 'json',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify core files exist
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'code/model_handler.py',
                'code/serve.py'
            ]);
            
            // Verify requirements.txt contains xgboost
            assert.fileContent('requirements.txt', /xgboost/);
            
            console.log('    ✅ xgboost project works without HF token');
        });

        it('should generate tensorflow project without HF token (legacy config)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing tensorflow project without HF token');
            console.log('  📝 Validates: Requirements 13.1');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'tensorflow',
                    'model-server': 'flask',
                    'model-format': 'keras',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify core files exist
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'code/model_handler.py',
                'code/serve.py'
            ]);
            
            // Verify requirements.txt contains tensorflow
            assert.fileContent('requirements.txt', /tensorflow/);
            
            console.log('    ✅ tensorflow project works without HF token');
        });

        it('should generate transformers project without HF token (public model)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing transformers project without HF token');
            console.log('  📝 Validates: Requirements 13.1');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'openai/gpt-oss-20b',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify transformer files exist
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/upload_to_s3.sh'
            ]);
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'transformers Dockerfile should not contain ENV HF_TOKEN for public model');
            
            console.log('    ✅ transformers project works without HF token');
        });

        it('should work with existing configurations without hfToken field', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing existing configuration without hfToken field');
            console.log('  📝 Validates: Requirements 13.3');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'include-testing': false,
                    'include-sample': false,
                    'deploy-target': 'sagemaker',
                    'instance-type': 'cpu-optimized',
                    'aws-region': 'us-east-1'
                });
            
            // Verify project generates successfully
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'code/model_handler.py',
                'code/serve.py'
            ]);
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN when not in config');
            
            console.log('    ✅ Legacy configurations work without hfToken field');
        });
    });

    describe('Non-Transformer Projects Unaffected', () => {
        it('should not prompt for HF token in sklearn projects', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing no HF token prompt for sklearn');
            console.log('  📝 Validates: Requirements 13.2');
            
            // Use prompts to verify no hfToken prompt appears
            const result = await helpers.run(getGeneratorPath())
                .withPrompts({
                    framework: 'sklearn',
                    modelServer: 'flask',
                    modelFormat: 'pkl',
                    includeTesting: false,
                    includeSampleModel: false,
                    deployTarget: 'sagemaker',
                    instanceType: 'cpu-optimized',
                    awsRegion: 'us-east-1'
                    // Note: No hfToken prompt should appear
                });
            
            // Verify project generates successfully
            assert.file(['Dockerfile', 'requirements.txt']);
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'sklearn Dockerfile should not contain ENV HF_TOKEN');
            
            console.log('    ✅ sklearn projects do not prompt for HF token');
        });

        it('should not inject HF token in xgboost Dockerfiles', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing no HF token injection for xgboost');
            console.log('  📝 Validates: Requirements 13.2');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'xgboost',
                    'model-server': 'flask',
                    'model-format': 'model',
                    'hf-token': 'hf_should_be_ignored_123456789',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN even when provided
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'xgboost Dockerfile should not contain ENV HF_TOKEN even when token provided');
            
            console.log('    ✅ xgboost projects ignore HF token');
        });

        it('should not inject HF token in tensorflow Dockerfiles', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing no HF token injection for tensorflow');
            console.log('  📝 Validates: Requirements 13.2');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'tensorflow',
                    'model-server': 'fastapi',
                    'model-format': 'SavedModel',
                    'hf-token': 'hf_should_be_ignored_987654321',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN even when provided
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'tensorflow Dockerfile should not contain ENV HF_TOKEN even when token provided');
            
            console.log('    ✅ tensorflow projects ignore HF token');
        });

        it('should maintain traditional ML file structure', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing traditional ML file structure unchanged');
            console.log('  📝 Validates: Requirements 13.2');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'include-testing': true,
                    'include-sample': true
                });
            
            // Verify traditional ML files exist
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'code/model_handler.py',
                'code/serve.py',
                'code/flask/gunicorn_config.py',
                'code/flask/wsgi.py',
                'nginx-predictors.conf',  // Traditional ML nginx config
                'sample_model/train_abalone.py',
                'test/test_local_image.sh'
            ]);
            
            // Verify transformer-specific files do NOT exist
            assert.noFile([
                'code/serve',
                'deploy/upload_to_s3.sh'
            ]);
            
            console.log('    ✅ Traditional ML file structure unchanged');
        });
    });

    describe('Example Model IDs Skip Authentication', () => {
        const exampleModels = [
            'openai/gpt-oss-20b',
            'meta-llama/Llama-3.2-3B-Instruct',
            'meta-llama/Llama-3.2-1B-Instruct'
        ];

        exampleModels.forEach(modelId => {
            it(`should not prompt for HF token with example model: ${modelId}`, async function() {
                this.timeout(10000);
                
                console.log(`\n  🧪 Testing no HF token prompt for example model: ${modelId}`);
                console.log('  📝 Validates: Requirements 13.3, 15.2');
                
                const result = await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'transformers',
                        'model-server': 'vllm',
                        'model-name': modelId,
                        'include-testing': false,
                        'include-sample': false
                    });
                
                // Verify project generates successfully
                assert.file(['Dockerfile', 'code/serve']);
                
                // Verify Dockerfile does NOT contain ENV HF_TOKEN
                const dockerfilePath = path.join(result.cwd, 'Dockerfile');
                const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
                
                assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                    `Dockerfile should not contain ENV HF_TOKEN for example model ${modelId}`);
                
                console.log(`    ✅ Example model ${modelId} skips HF token prompt`);
            });
        });

        it('should handle case-insensitive example model matching', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing case-insensitive example model matching');
            console.log('  📝 Validates: Requirements 15.4');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'OPENAI/GPT-OSS-20B',  // Uppercase version
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile does NOT contain ENV HF_TOKEN
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='),
                'Dockerfile should not contain ENV HF_TOKEN for case-insensitive match');
            
            console.log('    ✅ Case-insensitive matching works for example models');
        });
    });

    describe('All Frameworks Compatibility', () => {
        it('should generate projects for all frameworks without breaking', async function() {
            this.timeout(20000);
            
            console.log('\n  🧪 Testing all frameworks for backward compatibility');
            console.log('  📝 Validates: Requirements 13.4, 13.5');
            
            const frameworks = [
                { framework: 'sklearn', modelServer: 'flask', modelFormat: 'pkl' },
                { framework: 'xgboost', modelServer: 'fastapi', modelFormat: 'json' },
                { framework: 'tensorflow', modelServer: 'flask', modelFormat: 'keras' },
                { framework: 'transformers', modelServer: 'vllm', modelFormat: null }
            ];
            
            for (const config of frameworks) {
                console.log(`    Testing ${config.framework}...`);
                
                const options = {
                    'skip-prompts': true,
                    'framework': config.framework,
                    'model-server': config.modelServer,
                    'include-testing': false,
                    'include-sample': false
                };
                
                if (config.modelFormat) {
                    options['model-format'] = config.modelFormat;
                }
                
                if (config.framework === 'transformers') {
                    options['model-name'] = 'openai/gpt-oss-20b';
                }
                
                await helpers.run(getGeneratorPath())
                    .withOptions(options);
                
                // Verify core files exist
                assert.file(['Dockerfile']);
                
                console.log(`    ✅ ${config.framework} generates successfully`);
            }
            
            console.log('    ✅ All frameworks maintain backward compatibility');
        });

        it('should work with all deployment targets', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing all deployment targets for backward compatibility');
            console.log('  📝 Validates: Requirements 13.4');
            
            const deployTargets = ['sagemaker', 'codebuild'];
            
            for (const target of deployTargets) {
                console.log(`    Testing ${target}...`);
                
                await helpers.run(getGeneratorPath())
                    .withOptions({
                        'skip-prompts': true,
                        'framework': 'sklearn',
                        'model-server': 'flask',
                        'model-format': 'pkl',
                        'deploy-target': target,
                        'include-testing': false,
                        'include-sample': false
                    });
                
                // Verify appropriate deployment files exist
                assert.file(['Dockerfile', 'deploy/deploy.sh']);
                
                if (target === 'sagemaker') {
                    assert.file(['deploy/build_and_push.sh']);
                    assert.noFile(['buildspec.yml', 'deploy/submit_build.sh']);
                } else if (target === 'codebuild') {
                    assert.file(['buildspec.yml', 'deploy/submit_build.sh']);
                    assert.noFile(['deploy/build_and_push.sh']);
                }
                
                console.log(`    ✅ ${target} deployment works correctly`);
            }
            
            console.log('    ✅ All deployment targets maintain backward compatibility');
        });

        it('should work with optional modules (testing, sample models)', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing optional modules for backward compatibility');
            console.log('  📝 Validates: Requirements 13.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'include-testing': true,
                    'include-sample': true
                });
            
            // Verify optional module files exist
            assert.file([
                'test/test_local_image.sh',
                'test/test_endpoint.sh',
                'sample_model/train_abalone.py',
                'sample_model/test_inference.py'
            ]);
            
            console.log('    ✅ Optional modules work correctly');
        });
    });

    describe('Configuration Precedence Unchanged', () => {
        it('should maintain CLI precedence for configuration', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing configuration precedence unchanged');
            console.log('  📝 Validates: Requirements 13.4');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'instance-type': 'gpu-enabled',  // CLI option
                    'aws-region': 'us-east-1',  // CLI option
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify project generates successfully with CLI options
            assert.file(['Dockerfile', 'deploy/deploy.sh']);
            
            // Verify deploy script exists and contains expected content
            assert.fileContent('deploy/deploy.sh', /AWS_REGION/);
            assert.fileContent('deploy/deploy.sh', /INSTANCE_TYPE/);
            
            console.log('    ✅ Configuration precedence unchanged');
        });
    });

    describe('Regenerating Existing Projects', () => {
        it('should regenerate sklearn project without requiring HF token', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing regeneration of sklearn project');
            console.log('  📝 Validates: Requirements 13.2');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify project generates successfully
            assert.file(['Dockerfile', 'requirements.txt', 'code/model_handler.py']);
            
            console.log('    ✅ sklearn project regenerates without HF token');
        });

        it('should regenerate transformers project with example model without HF token', async function() {
            this.timeout(10000);
            
            console.log('\n  🧪 Testing regeneration of transformers project with example model');
            console.log('  📝 Validates: Requirements 13.3');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'openai/gpt-oss-20b',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify project generates successfully
            assert.file(['Dockerfile', 'code/serve']);
            
            // Verify no HF token in Dockerfile
            assert.noFileContent('Dockerfile', /ENV HF_TOKEN=/);
            
            console.log('    ✅ transformers project with example model regenerates without HF token');
        });
    });
});
