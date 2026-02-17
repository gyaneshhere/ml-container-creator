// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const assert = require('assert');
const TemplateManager = require('../generators/app/lib/template-manager');

describe('TemplateManager', () => {
    describe('getIgnorePatterns', () => {
        it('should exclude transformer files for sklearn projects', () => {
            const answers = {
                framework: 'sklearn',
                modelServer: 'flask',
                includeSampleModel: true,
                includeTesting: true
            };
            
            const manager = new TemplateManager(answers);
            const patterns = manager.getIgnorePatterns();
            
            assert(patterns.includes('**/code/serve'));
            assert(patterns.includes('**/deploy/upload_to_s3.sh'));
            assert(!patterns.includes('**/code/model_handler.py'));
        });

        it('should exclude traditional ML files for transformer projects', () => {
            const answers = {
                framework: 'transformers',
                modelServer: 'vllm',
                includeSampleModel: false,
                includeTesting: true
            };
            
            const manager = new TemplateManager(answers);
            const patterns = manager.getIgnorePatterns();
            
            assert(patterns.includes('**/code/model_handler.py'));
            assert(patterns.includes('**/code/serve.py'));
            assert(patterns.includes('**/nginx.conf**'));
            assert(!patterns.includes('**/code/serve'));
        });

        it('should exclude Flask files when not using Flask', () => {
            const answers = {
                framework: 'sklearn',
                modelServer: 'fastapi',
                includeSampleModel: false,
                includeTesting: false
            };
            
            const manager = new TemplateManager(answers);
            const patterns = manager.getIgnorePatterns();
            
            assert(patterns.includes('**/code/flask/**'));
        });

        it('should exclude optional modules when not selected', () => {
            const answers = {
                framework: 'sklearn',
                modelServer: 'flask',
                includeSampleModel: false,
                includeTesting: false
            };
            
            const manager = new TemplateManager(answers);
            const patterns = manager.getIgnorePatterns();
            
            assert(patterns.includes('**/sample_model/**'));
            assert(patterns.includes('**/test/**'));
        });
    });

    describe('validate', () => {
        it('should pass validation for supported configurations', () => {
            const answers = {
                framework: 'sklearn',
                modelServer: 'flask',
                deployTarget: 'sagemaker',
                instanceType: 'cpu-optimized',
                awsRegion: 'us-east-1',
                includeTesting: true,
                testTypes: ['local-model-cli']
            };
            
            const manager = new TemplateManager(answers);
            assert.doesNotThrow(() => manager.validate());
        });

        it('should throw error for unsupported framework', () => {
            const answers = {
                framework: 'pytorch',
                modelServer: 'flask',
                deployTarget: 'sagemaker',
                instanceType: 'cpu-optimized',
                awsRegion: 'us-east-1'
            };
            
            const manager = new TemplateManager(answers);
            assert.throws(() => manager.validate(), /pytorch not implemented yet/);
        });

        it('should throw error for unsupported model server', () => {
            const answers = {
                framework: 'sklearn',
                modelServer: 'torchserve',
                deployTarget: 'sagemaker',
                instanceType: 'cpu-optimized',
                awsRegion: 'us-east-1'
            };
            
            const manager = new TemplateManager(answers);
            assert.throws(() => manager.validate(), /torchserve not implemented yet/);
        });
    });
});