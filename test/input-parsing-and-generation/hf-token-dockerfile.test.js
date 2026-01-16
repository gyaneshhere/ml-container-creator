// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * HuggingFace Token Dockerfile Template Unit Tests
 * 
 * Tests specific scenarios for HuggingFace token injection into Dockerfile templates.
 * Focuses on ENV directive placement and transformers-only injection.
 * 
 * Feature: huggingface-token-authentication
 */

import { setupTestHooks, getGeneratorPath } from './test-utils.js';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('HuggingFace Token Dockerfile Template - Unit Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting HuggingFace Token Dockerfile Template Unit Tests');
        console.log('📋 Testing: Specific scenarios for HF token Dockerfile injection');
        console.log('✅ Test environment ready\n');
    });

    setupTestHooks('HuggingFace Token Dockerfile Template Unit Tests');

    describe('ENV Directive Placement', () => {
        it('should place ENV HF_TOKEN after OPTION_MODEL and before COPY', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing ENV directive placement in Dockerfile');
            console.log('  📝 Validates: Requirements 4.4');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Read Dockerfile content
            const path = await import('path');
            const fs = await import('fs');
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Find positions of key directives
            const optionModelPos = dockerfileContent.indexOf('ENV OPTION_MODEL=');
            const hfTokenPos = dockerfileContent.indexOf('ENV HF_TOKEN=');
            const copyPos = dockerfileContent.indexOf('COPY code/serve');
            
            // Verify all directives exist
            assert.ok(optionModelPos !== -1, 'ENV OPTION_MODEL should exist');
            assert.ok(hfTokenPos !== -1, 'ENV HF_TOKEN should exist');
            assert.ok(copyPos !== -1, 'COPY command should exist');
            
            // Verify correct order: OPTION_MODEL < HF_TOKEN < COPY
            assert.ok(optionModelPos < hfTokenPos, 'ENV OPTION_MODEL should come before ENV HF_TOKEN');
            assert.ok(hfTokenPos < copyPos, 'ENV HF_TOKEN should come before COPY command');
            
            console.log('    ✅ ENV directive placement correct');
        });

        it('should place ENV HF_TOKEN in correct location for vLLM', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing ENV directive placement for vLLM');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify ENV HF_TOKEN is present
            assert.fileContent('Dockerfile', /ENV HF_TOKEN=/);
            
            // Verify it's in the transformers section (after FROM)
            assert.fileContent('Dockerfile', /FROM.*\n[\s\S]*ENV OPTION_MODEL=[\s\S]*ENV HF_TOKEN=/);
            
            console.log('    ✅ ENV directive placement correct for vLLM');
        });

        it('should place ENV HF_TOKEN in correct location for SGLang', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing ENV directive placement for SGLang');
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'sglang',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify ENV HF_TOKEN is present
            assert.fileContent('Dockerfile', /ENV HF_TOKEN=/);
            
            // Verify it's in the transformers section (after FROM)
            assert.fileContent('Dockerfile', /FROM.*\n[\s\S]*ENV OPTION_MODEL=[\s\S]*ENV HF_TOKEN=/);
            
            console.log('    ✅ ENV directive placement correct for SGLang');
        });
    });

    describe('Transformers-Only Injection', () => {
        it('should only inject ENV HF_TOKEN in transformers Dockerfiles', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing ENV HF_TOKEN only in transformers section');
            console.log('  📝 Validates: Requirements 4.4');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Read Dockerfile content
            const path = await import('path');
            const fs = await import('fs');
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify ENV HF_TOKEN is present
            assert.ok(dockerfileContent.includes('ENV HF_TOKEN='), 'ENV HF_TOKEN should be present');
            
            // Verify it's in the transformers section (check for transformers-specific markers)
            assert.ok(dockerfileContent.includes('ENV OPTION_MODEL='), 'Should have OPTION_MODEL (transformers marker)');
            assert.ok(dockerfileContent.includes('COPY code/serve'), 'Should have serve script (transformers marker)');
            
            console.log('    ✅ ENV HF_TOKEN correctly in transformers section');
        });

        it('should not inject ENV HF_TOKEN in sklearn Dockerfiles', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing no ENV HF_TOKEN in sklearn Dockerfile');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'sklearn',
                    'model-server': 'flask',
                    'model-format': 'pkl',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Read Dockerfile content
            const path = await import('path');
            const fs = await import('fs');
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify ENV HF_TOKEN is NOT present
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='), 'ENV HF_TOKEN should not be present in sklearn Dockerfile');
            
            console.log('    ✅ ENV HF_TOKEN correctly excluded from sklearn Dockerfile');
        });

        it('should not inject ENV HF_TOKEN in xgboost Dockerfiles', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing no ENV HF_TOKEN in xgboost Dockerfile');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'xgboost',
                    'model-server': 'flask',
                    'model-format': 'json',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Read Dockerfile content
            const path = await import('path');
            const fs = await import('fs');
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify ENV HF_TOKEN is NOT present
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='), 'ENV HF_TOKEN should not be present in xgboost Dockerfile');
            
            console.log('    ✅ ENV HF_TOKEN correctly excluded from xgboost Dockerfile');
        });

        it('should not inject ENV HF_TOKEN in tensorflow Dockerfiles', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing no ENV HF_TOKEN in tensorflow Dockerfile');
            
            const result = await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'tensorflow',
                    'model-server': 'fastapi',
                    'model-format': 'keras',
                    'hf-token': 'hf_test123456789012345678901234567890',
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify Dockerfile exists
            assert.file(['Dockerfile']);
            
            // Read Dockerfile content
            const path = await import('path');
            const fs = await import('fs');
            const dockerfilePath = path.join(result.cwd, 'Dockerfile');
            const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
            
            // Verify ENV HF_TOKEN is NOT present
            assert.ok(!dockerfileContent.includes('ENV HF_TOKEN='), 'ENV HF_TOKEN should not be present in tensorflow Dockerfile');
            
            console.log('    ✅ ENV HF_TOKEN correctly excluded from tensorflow Dockerfile');
        });
    });

    describe('Token Value Injection', () => {
        it('should inject correct token value in ENV directive', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing correct token value injection');
            
            const testToken = 'hf_test123456789012345678901234567890';
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': testToken,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify exact token value is present
            assert.fileContent('Dockerfile', `ENV HF_TOKEN="${testToken}"`);
            
            console.log('    ✅ Token value correctly injected');
        });

        it('should handle tokens with special characters', async function() {
            this.timeout(5000);
            
            console.log('\n  🧪 Testing token with special characters');
            
            const testToken = 'hf_abc123-XYZ_789';
            
            await helpers.run(getGeneratorPath())
                .withOptions({
                    'skip-prompts': true,
                    'framework': 'transformers',
                    'model-server': 'vllm',
                    'model-name': 'meta-llama/Llama-2-7b-hf',
                    'hf-token': testToken,
                    'include-testing': false,
                    'include-sample': false
                });
            
            // Verify token with special characters is correctly injected
            assert.fileContent('Dockerfile', `ENV HF_TOKEN="${testToken}"`);
            
            console.log('    ✅ Token with special characters correctly injected');
        });
    });
});
