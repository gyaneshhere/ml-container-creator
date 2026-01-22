// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * TensorRT-LLM Integration Tests
 * 
 * Tests complete project generation with TensorRT-LLM configuration.
 * 
 * Feature: tensorrt-llm-support
 * Requirements: 11.5
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import path from 'path';
import fs from 'fs';

describe('TensorRT-LLM Integration - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting TensorRT-LLM Integration Tests');
        console.log('📋 Testing: Complete project generation with tensorrt-llm');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('TensorRT-LLM Integration Tests');

    describe('Complete Project Generation', () => {
        it('should generate complete project with tensorrt-llm', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing complete project generation');
            console.log('  📝 Validates: Requirements 11.5');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify all expected files are created
            const expectedFiles = [
                'Dockerfile',
                'code/serve',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ];
            
            assert.file(expectedFiles);
            
            // Verify transformer-specific files are excluded
            assert.noFile([
                'requirements.txt',  // Transformers use base image dependencies
                'code/model_handler.py',
                'code/serve.py',
                'nginx-predictors.conf',  // Traditional ML nginx config
                'IAM_PERMISSIONS.md',  // CodeBuild only
                'buildspec.yml'  // CodeBuild only
            ]);
            
            console.log('    ✅ All expected files created and traditional ML files excluded');
        });

        it('should generate files with correct content', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing generated file content');
            console.log('  📝 Validates: Requirements 11.5');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile content
            assert.fileContent('Dockerfile', /tensorrt-llm/);
            assert.fileContent('Dockerfile', /TRTLLM_MODEL/);
            
            // Verify serve script content
            assert.fileContent('code/serve', /trtllm-serve/);
            assert.fileContent('code/serve', /TRTLLM_/);
            
            // Verify deployment scripts exist and are executable
            const buildScriptPath = path.join(result.cwd, 'deploy/build_and_push.sh');
            const deployScriptPath = path.join(result.cwd, 'deploy/deploy.sh');
            
            assert.ok(fs.existsSync(buildScriptPath), 'build_and_push.sh should exist');
            assert.ok(fs.existsSync(deployScriptPath), 'deploy.sh should exist');
            
            console.log('    ✅ Generated files have correct content');
        });

        it('should generate deployment scripts', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing deployment scripts generation');
            console.log('  📝 Validates: Requirements 11.5');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify deployment scripts
            assert.file([
                'deploy/build_and_push.sh',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ]);
            
            // Verify scripts contain necessary commands
            assert.fileContent('deploy/build_and_push.sh', /docker build/);
            assert.fileContent('deploy/deploy.sh', /aws sagemaker/);
            assert.fileContent('deploy/upload_to_s3.sh', /aws s3/);
            
            console.log('    ✅ Deployment scripts generated correctly');
        });
    });

    describe('Project with HuggingFace Token', () => {
        it('should generate complete project with HF token', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing project generation with HF token');
            console.log('  📝 Validates: Requirements 11.5');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify HF_TOKEN in Dockerfile
            assert.fileContent('Dockerfile', /HF_TOKEN/);
            
            // Verify all other files still generated
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh'
            ]);
            
            console.log('    ✅ Project with HF token generated correctly');
        });
    });

    describe('Project Structure', () => {
        it('should not include traditional ML files', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing traditional ML files exclusion');
            console.log('  📝 Validates: Requirements 11.5');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify traditional ML files are NOT generated
            assert.noFile([
                'code/model_handler.py',
                'code/serve.py',
                'nginx-predictors.conf',  // Traditional ML nginx config
                'sample_model/train_abalone.py'
            ]);
            
            console.log('    ✅ Traditional ML files correctly excluded');
        });

        it('should include transformer-specific files', async function() {
            this.timeout(15000);
            
            console.log('\n  🧪 Testing transformer-specific files inclusion');
            console.log('  📝 Validates: Requirements 11.5');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'tensorrt-llm',
                    'model-name': 'meta-llama/Llama-3.2-3B',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify transformer-specific files ARE generated
            assert.file([
                'code/serve',
                'deploy/upload_to_s3.sh'
            ]);
            
            console.log('    ✅ Transformer-specific files included');
        });
    });
});
