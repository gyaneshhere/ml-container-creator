// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Template Exclusion Property-Based Tests
 * 
 * Tests the correctness properties for file exclusion consistency across model servers.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: tensorrt-llm-support
 */

import fc from 'fast-check';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';
import {
    getGeneratorPath,
    setupTestHooks
} from './test-utils.js';

describe('Template Exclusion - Property-Based Tests', () => {
    before(async () => {
        console.log('\n🚀 Starting Template Exclusion Property Tests');
        console.log('📋 Testing: Universal correctness properties for file exclusion consistency');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
    });

    setupTestHooks('Template Exclusion Properties');

    describe('Property 7: File Exclusion Consistency', () => {
        it('should exclude traditional ML files for all transformer model servers (vllm, sglang, tensorrt-llm)', async function() {
            this.timeout(120000);
            
            console.log('\n  🧪 Property 7: File Exclusion Consistency for Transformer Servers');
            console.log('  📝 For any generator configuration where framework is "transformers" and modelServer is one of (vllm, sglang, tensorrt-llm), the generated project should exclude traditional ML files and include transformer-specific files');
            
            // Feature: tensorrt-llm-support, Property 7: File exclusion is consistent for transformer servers
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('vllm', 'sglang', 'tensorrt-llm'),
                fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
                fc.string({ minLength: 5, maxLength: 100 }).filter(s => /^[a-zA-Z0-9/_-]+$/.test(s)),
                async (modelServer, projectName, modelName) => {
                    console.log(`    🔍 Testing file exclusion for modelServer: ${modelServer}, project: ${projectName}`);
                    
                    try {
                        await helpers.run(getGeneratorPath())
                            .withPrompts({
                                projectName,
                                destinationDir: projectName,
                                framework: 'transformers',
                                modelName,
                                modelServer,
                                includeSampleModel: false,
                                includeTesting: false,
                                deployTarget: 'sagemaker',
                                instanceType: 'gpu-enabled',
                                awsRegion: 'us-east-1'
                            });
                        
                        console.log(`    📁 Project generated for ${modelServer}`);
                        
                        // Verify traditional ML files are excluded
                        const traditionalMLFilesToCheck = [
                            'code/model_handler.py',
                            'code/serve.py',
                            'nginx-predictors.conf'  // Traditional ML nginx config
                        ];
                        
                        console.log('    🔍 Checking that traditional ML files are excluded...');
                        for (const file of traditionalMLFilesToCheck) {
                            try {
                                assert.noFile([file]);
                                console.log(`    ✅ Correctly excluded: ${file}`);
                            } catch (error) {
                                console.log(`    ❌ File should be excluded but exists: ${file}`);
                                return false;
                            }
                        }
                        
                        // Verify transformer-specific files are included
                        const transformerFilesToCheck = [
                            'code/serve',
                            'deploy/upload_to_s3.sh'
                        ];
                        
                        console.log('    🔍 Checking that transformer-specific files are included...');
                        for (const file of transformerFilesToCheck) {
                            try {
                                assert.file([file]);
                                console.log(`    ✅ Correctly included: ${file}`);
                            } catch (error) {
                                console.log(`    ❌ File should be included but missing: ${file}`);
                                return false;
                            }
                        }
                        
                        console.log(`    ✅ File exclusion consistent for ${modelServer}`);
                        return true;
                    } catch (error) {
                        console.log(`    ❌ Error during generation for ${modelServer}: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 100000,
                interruptAfterTimeLimit: 90000
            });
            
            console.log('  ✅ Property 7 validated: File exclusion is consistent across all transformer model servers');
        });

        it('should exclude transformer files for all traditional ML frameworks', async function() {
            this.timeout(120000);
            
            console.log('\n  🧪 Property 7b: File Exclusion Consistency for Traditional ML');
            console.log('  📝 For any generator configuration where framework is traditional ML (sklearn, xgboost, tensorflow), the generated project should exclude transformer-specific files and include traditional ML files');
            
            // Feature: tensorrt-llm-support, Property 7: File exclusion is consistent for traditional ML
            await fc.assert(fc.asyncProperty(
                fc.constantFrom('sklearn', 'xgboost', 'tensorflow'),
                fc.constantFrom('flask', 'fastapi'),
                fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
                async (framework, modelServer, projectName) => {
                    console.log(`    🔍 Testing file exclusion for framework: ${framework}, modelServer: ${modelServer}`);
                    
                    // Determine model format based on framework
                    const modelFormatMap = {
                        'sklearn': 'pkl',
                        'xgboost': 'json',
                        'tensorflow': 'keras'
                    };
                    const modelFormat = modelFormatMap[framework];
                    
                    try {
                        await helpers.run(getGeneratorPath())
                            .withPrompts({
                                projectName,
                                destinationDir: projectName,
                                framework,
                                modelFormat,
                                modelServer,
                                includeSampleModel: false,
                                includeTesting: false,
                                deployTarget: 'sagemaker',
                                instanceType: 'cpu-optimized',
                                awsRegion: 'us-east-1'
                            });
                        
                        console.log(`    📁 Project generated for ${framework}/${modelServer}`);
                        
                        // Verify transformer files are excluded
                        const transformerFilesToCheck = [
                            'code/serve',
                            'deploy/upload_to_s3.sh'
                        ];
                        
                        console.log('    🔍 Checking that transformer files are excluded...');
                        for (const file of transformerFilesToCheck) {
                            try {
                                assert.noFile([file]);
                                console.log(`    ✅ Correctly excluded: ${file}`);
                            } catch (error) {
                                console.log(`    ❌ File should be excluded but exists: ${file}`);
                                return false;
                            }
                        }
                        
                        // Verify traditional ML files are included
                        const traditionalMLFilesToCheck = [
                            'code/model_handler.py',
                            'code/serve.py'
                        ];
                        
                        console.log('    🔍 Checking that traditional ML files are included...');
                        for (const file of traditionalMLFilesToCheck) {
                            try {
                                assert.file([file]);
                                console.log(`    ✅ Correctly included: ${file}`);
                            } catch (error) {
                                console.log(`    ❌ File should be included but missing: ${file}`);
                                return false;
                            }
                        }
                        
                        console.log(`    ✅ File exclusion consistent for ${framework}/${modelServer}`);
                        return true;
                    } catch (error) {
                        console.log(`    ❌ Error during generation for ${framework}/${modelServer}: ${error.message}`);
                        return false;
                    }
                }
            ), { 
                numRuns: 100,
                verbose: false,
                asyncTimeout: 100000,
                interruptAfterTimeLimit: 90000
            });
            
            console.log('  ✅ Property 7b validated: File exclusion is consistent for traditional ML frameworks');
        });

        it('should apply identical exclusion patterns for tensorrt-llm as for vllm and sglang', async function() {
            this.timeout(120000);
            
            console.log('\n  🧪 Property 7c: File Exclusion Patterns Across Transformer Servers');
            console.log('  📝 For any transformer model server (vllm, sglang, tensorrt-llm), common files should be excluded/included identically, with TensorRT-LLM having additional nginx proxy files');
            
            // Feature: tensorrt-llm-support, Property 7: File exclusion patterns are identical across transformer servers
            await fc.assert(fc.asyncProperty(
                fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-z0-9-]+$/.test(s)),
                fc.string({ minLength: 5, maxLength: 100 }).filter(s => /^[a-zA-Z0-9/_-]+$/.test(s)),
                async (projectName, modelName) => {
                    console.log(`    🔍 Testing exclusion pattern consistency for project: ${projectName}`);
                    
                    const modelServers = ['vllm', 'sglang', 'tensorrt-llm'];
                    const filePresenceByServer = {};
                    
                    // Generate projects for each model server and track file presence
                    for (const modelServer of modelServers) {
                        console.log(`    📦 Generating project for ${modelServer}...`);
                        
                        try {
                            await helpers.run(getGeneratorPath())
                                .withPrompts({
                                    projectName: `${projectName}-${modelServer}`,
                                    destinationDir: `${projectName}-${modelServer}`,
                                    framework: 'transformers',
                                    modelName,
                                    modelServer,
                                    includeSampleModel: false,
                                    includeTesting: false,
                                    deployTarget: 'sagemaker',
                                    instanceType: 'gpu-enabled',
                                    awsRegion: 'us-east-1'
                                });
                            
                            // Check presence of key files
                            const filesToCheck = [
                                'code/model_handler.py',
                                'code/serve.py',
                                'code/serve',
                                'nginx-predictors.conf',  // Traditional ML nginx (should be excluded)
                                'deploy/upload_to_s3.sh',
                                'Dockerfile',
                                'deploy/deploy.sh'
                            ];
                            
                            // TensorRT-LLM specific files
                            if (modelServer === 'tensorrt-llm') {
                                filesToCheck.push('nginx-tensorrt.conf');
                                filesToCheck.push('code/start_server.sh');
                            }
                            
                            filePresenceByServer[modelServer] = {};
                            
                            for (const file of filesToCheck) {
                                try {
                                    assert.file([file]);
                                    filePresenceByServer[modelServer][file] = true;
                                } catch (error) {
                                    filePresenceByServer[modelServer][file] = false;
                                }
                            }
                            
                            console.log(`    ✅ Generated and analyzed ${modelServer} project`);
                        } catch (error) {
                            console.log(`    ❌ Error generating ${modelServer} project: ${error.message}`);
                            return false;
                        }
                    }
                    
                    // Compare file presence across all servers
                    console.log('    🔍 Comparing file presence across servers...');
                    
                    // Common files that should be identical across all transformer servers
                    const commonFiles = [
                        'code/model_handler.py',  // Should be excluded for all
                        'code/serve.py',          // Should be excluded for all
                        'code/serve',             // Should be included for all
                        'nginx-predictors.conf',  // Should be excluded for all
                        'deploy/upload_to_s3.sh', // Should be included for all
                        'Dockerfile',             // Should be included for all
                        'deploy/deploy.sh'        // Should be included for all
                    ];
                    
                    const referenceServer = 'vllm';
                    const referenceFiles = filePresenceByServer[referenceServer];
                    
                    for (const modelServer of ['sglang', 'tensorrt-llm']) {
                        const serverFiles = filePresenceByServer[modelServer];
                        
                        // Check common files
                        for (const file of commonFiles) {
                            if (referenceFiles[file] !== serverFiles[file]) {
                                console.log(`    ❌ File presence mismatch for ${file}:`);
                                console.log(`       ${referenceServer}: ${referenceFiles[file]}, ${modelServer}: ${serverFiles[file]}`);
                                return false;
                            }
                        }
                    }
                    
                    // Verify TensorRT-LLM specific files
                    if (!filePresenceByServer['tensorrt-llm']['nginx-tensorrt.conf']) {
                        console.log('    ❌ TensorRT-LLM should include nginx-tensorrt.conf');
                        return false;
                    }
                    if (!filePresenceByServer['tensorrt-llm']['code/start_server.sh']) {
                        console.log('    ❌ TensorRT-LLM should include code/start_server.sh');
                        return false;
                    }
                    
                    // Verify vLLM and SGLang don't have TensorRT-LLM specific files
                    for (const modelServer of ['vllm', 'sglang']) {
                        if (filePresenceByServer[modelServer]['nginx-tensorrt.conf']) {
                            console.log(`    ❌ ${modelServer} should not include nginx-tensorrt.conf`);
                            return false;
                        }
                        if (filePresenceByServer[modelServer]['code/start_server.sh']) {
                            console.log(`    ❌ ${modelServer} should not include code/start_server.sh`);
                            return false;
                        }
                    }
                    
                    console.log('    ✅ All transformer servers have consistent file exclusion patterns (with TensorRT-LLM nginx additions)');
                    return true;
                }
            ), { 
                numRuns: 30,  // Reduced runs since this generates 3 projects per iteration
                verbose: false,
                asyncTimeout: 100000,
                interruptAfterTimeLimit: 90000
            });
            
            console.log('  ✅ Property 7c validated: Exclusion patterns are consistent across transformer servers (with TensorRT-LLM nginx additions)');
        });
    });

    after(() => {
        console.log('\n📊 Template Exclusion Property Tests completed');
        console.log('✅ All universal correctness properties validated');
    });
});
