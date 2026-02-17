// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-ml-container-creator:app', () => {
    describe('sklearn project generation', () => {
        beforeEach(async () => {
            await helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    projectName: 'test-sklearn-project',
                    destinationDir: './test-sklearn-project',
                    framework: 'sklearn',
                    modelFormat: 'pkl',
                    modelServer: 'flask',
                    includeSampleModel: true,
                    includeTesting: true,
                    testTypes: ['local-model-cli', 'local-model-server'],
                    deployTarget: 'sagemaker',
                    instanceType: 'cpu-optimized',
                    awsRegion: 'us-east-1'
                });
        });

        it('creates expected core files', () => {
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'nginx.conf',
                'code/model_handler.py',
                'code/serve.py',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh'
            ]);
        });

        it('creates sample model files when requested', () => {
            assert.file([
                'sample_model/train_abalone.py',
                'sample_model/test_inference.py'
            ]);
        });

        it('creates test files when requested', () => {
            assert.file([
                'test/test_local_image.sh',
                'test/test_model_handler.py',
                'test/test_endpoint.sh'
            ]);
        });

        it('creates Flask-specific files', () => {
            assert.file([
                'code/flask/wsgi.py',
                'code/flask/gunicorn_config.py'
            ]);
        });

        it('excludes transformer-specific files', () => {
            assert.noFile([
                'code/serve',
                'deploy/upload_to_s3.sh'
            ]);
        });
    });

    describe('transformers project generation', () => {
        beforeEach(async () => {
            await helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    projectName: 'test-transformer-project',
                    destinationDir: './test-transformer-project',
                    framework: 'transformers',
                    modelServer: 'vllm',
                    includeSampleModel: false,
                    includeTesting: true,
                    testTypes: ['hosted-model-endpoint'],
                    deployTarget: 'sagemaker',
                    instanceType: 'gpu-enabled',
                    awsRegion: 'us-east-1'
                });
        });

        it('creates expected core files', () => {
            assert.file([
                'Dockerfile',
                'code/serve',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh',
                'deploy/upload_to_s3.sh'
            ]);
        });

        it('excludes traditional ML files', () => {
            assert.noFile([
                'code/model_handler.py',
                'code/serve.py',
                'nginx.conf',
                'requirements.txt',
                'test/test_local_image.sh',
                'test/test_model_handler.py'
            ]);
        });

        it('excludes sample model (not applicable for transformers)', () => {
            assert.noFile([
                'sample_model/train_abalone.py',
                'sample_model/test_inference.py'
            ]);
        });

        it('excludes Flask-specific files', () => {
            assert.noFile([
                'code/flask/wsgi.py',
                'code/flask/gunicorn_config.py'
            ]);
        });
    });

    describe('minimal project generation', () => {
        beforeEach(async () => {
            await helpers.run(path.join(__dirname, '../generators/app'))
                .withPrompts({
                    projectName: 'minimal-project',
                    destinationDir: './minimal-project',
                    framework: 'xgboost',
                    modelFormat: 'json',
                    modelServer: 'fastapi',
                    includeSampleModel: false,
                    includeTesting: false,
                    deployTarget: 'sagemaker',
                    instanceType: 'cpu-optimized',
                    awsRegion: 'us-east-1'
                });
        });

        it('creates only essential files', () => {
            assert.file([
                'Dockerfile',
                'requirements.txt',
                'nginx.conf',
                'code/model_handler.py',
                'code/serve.py',
                'deploy/build_and_push.sh',
                'deploy/deploy.sh'
            ]);
        });

        it('excludes optional modules', () => {
            assert.noFile([
                'sample_model/train_abalone.py',
                'test/test_local_image.sh'
            ]);
        });

        it('excludes Flask-specific files for FastAPI', () => {
            assert.noFile([
                'code/flask/wsgi.py',
                'code/flask/gunicorn_config.py'
            ]);
        });
    });
});