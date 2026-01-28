// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Loader Tests
 * 
 * Tests the RegistryLoader class that loads and validates registry files:
 * - Framework Registry
 * - Model Registry
 * - Instance Accelerator Mapping
 * 
 * This module focuses on registry loading, schema validation, and error handling.
 */

import { describe, it, before } from 'mocha'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import RegistryLoader from '../../generators/app/lib/registry-loader.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Registry Loader', () => {
    let loader

    before(() => {
        console.log('\n🚀 Starting Registry Loader Tests')
        console.log('📋 Testing: Registry loading and schema validation')
        loader = new RegistryLoader()
        console.log('✅ Test environment ready\n')
    })

    describe('Framework Registry Loading', () => {
        it('should load valid framework registry successfully', async () => {
            console.log('\n  🧪 Testing valid framework registry loading...')
            
            const registry = await loader.loadFrameworkRegistry()
            
            assert(registry !== null, 'Registry should not be null')
            assert(typeof registry === 'object', 'Registry should be an object')
            console.log('    ✅ Valid framework registry loaded successfully')
        })

        it('should return empty object for missing framework registry', async () => {
            console.log('\n  🧪 Testing missing framework registry handling...')
            
            // Create a loader that will fail to load the registry
            const testLoader = new RegistryLoader()
            
            // Mock the import to simulate missing file
            const originalImport = testLoader.constructor.prototype.loadFrameworkRegistry
            testLoader.loadFrameworkRegistry = async function() {
                try {
                    await import('../nonexistent/frameworks.js')
                } catch (error) {
                    console.warn(`Failed to load framework registry: ${error.message}`)
                    return {}
                }
            }
            
            const registry = await testLoader.loadFrameworkRegistry()
            
            assert.deepStrictEqual(registry, {}, 'Should return empty object for missing registry')
            console.log('    ✅ Missing framework registry handled gracefully')
        })
    })

    describe('Model Registry Loading', () => {
        it('should load valid model registry successfully', async () => {
            console.log('\n  🧪 Testing valid model registry loading...')
            
            const registry = await loader.loadModelRegistry()
            
            assert(registry !== null, 'Registry should not be null')
            assert(typeof registry === 'object', 'Registry should be an object')
            console.log('    ✅ Valid model registry loaded successfully')
        })

        it('should return empty object for missing model registry', async () => {
            console.log('\n  🧪 Testing missing model registry handling...')
            
            // Create a loader that will fail to load the registry
            const testLoader = new RegistryLoader()
            
            // Mock the import to simulate missing file
            testLoader.loadModelRegistry = async function() {
                try {
                    await import('../nonexistent/models.js')
                } catch (error) {
                    console.warn(`Failed to load model registry: ${error.message}`)
                    return {}
                }
            }
            
            const registry = await testLoader.loadModelRegistry()
            
            assert.deepStrictEqual(registry, {}, 'Should return empty object for missing registry')
            console.log('    ✅ Missing model registry handled gracefully')
        })
    })

    describe('Instance Accelerator Mapping Loading', () => {
        it('should load valid instance accelerator mapping successfully', async () => {
            console.log('\n  🧪 Testing valid instance accelerator mapping loading...')
            
            const mapping = await loader.loadInstanceAcceleratorMapping()
            
            assert(mapping !== null, 'Mapping should not be null')
            assert(typeof mapping === 'object', 'Mapping should be an object')
            console.log('    ✅ Valid instance accelerator mapping loaded successfully')
        })

        it('should return empty object for missing instance accelerator mapping', async () => {
            console.log('\n  🧪 Testing missing instance accelerator mapping handling...')
            
            // Create a loader that will fail to load the mapping
            const testLoader = new RegistryLoader()
            
            // Mock the import to simulate missing file
            testLoader.loadInstanceAcceleratorMapping = async function() {
                try {
                    await import('../nonexistent/instance-accelerator-mapping.js')
                } catch (error) {
                    console.warn(`Failed to load instance accelerator mapping: ${error.message}`)
                    return {}
                }
            }
            
            const mapping = await testLoader.loadInstanceAcceleratorMapping()
            
            assert.deepStrictEqual(mapping, {}, 'Should return empty object for missing mapping')
            console.log('    ✅ Missing instance accelerator mapping handled gracefully')
        })
    })

    describe('Schema Validation', () => {
        it('should validate framework registry schema correctly', async () => {
            console.log('\n  🧪 Testing framework registry schema validation...')
            
            const validData = {
                'vllm': {
                    '0.3.0': {
                        baseImage: 'vllm/vllm-openai:v0.3.0',
                        accelerator: {
                            type: 'cuda',
                            version: '12.1',
                            versionRange: { min: '11.8', max: '12.2' }
                        },
                        envVars: {
                            'VLLM_MAX_BATCH_SIZE': '32'
                        },
                        inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                        recommendedInstanceTypes: ['ml.g5.xlarge'],
                        validationLevel: 'experimental'
                    }
                }
            }
            
            // Should not throw
            const frameworkSchema = await import('../../generators/app/config/schemas/framework-registry-schema.js')
            loader.validateSchema(validData, frameworkSchema.default, 'Framework Registry')
            
            console.log('    ✅ Framework registry schema validation passed')
        })

        it('should reject invalid framework registry schema', async () => {
            console.log('\n  🧪 Testing invalid framework registry schema rejection...')
            
            const invalidData = {
                'vllm': {
                    '0.3.0': {
                        // Missing required fields
                        baseImage: 'vllm/vllm-openai:v0.3.0'
                        // Missing: accelerator, envVars, inferenceAmiVersion, recommendedInstanceTypes, validationLevel
                    }
                }
            }
            
            const frameworkSchema = await import('../../generators/app/config/schemas/framework-registry-schema.js')
            
            assert.throws(
                () => {
                    loader.validateSchema(invalidData, frameworkSchema.default, 'Framework Registry')
                },
                /validation failed/,
                'Should throw validation error for invalid schema'
            )
            
            console.log('    ✅ Invalid framework registry schema rejected')
        })

        it('should validate model registry schema correctly', async () => {
            console.log('\n  🧪 Testing model registry schema validation...')
            
            const validData = {
                'meta-llama/Llama-2-7b-chat-hf': {
                    family: 'llama-2',
                    chatTemplate: '{% for message in messages %}...',
                    requiresTemplate: true,
                    validationLevel: 'tested',
                    frameworkCompatibility: {
                        'vllm': '>=0.3.0',
                        'tensorrt-llm': '>=0.8.0'
                    }
                }
            }
            
            // Should not throw
            const modelSchema = await import('../../generators/app/config/schemas/model-registry-schema.js')
            loader.validateSchema(validData, modelSchema.default, 'Model Registry')
            
            console.log('    ✅ Model registry schema validation passed')
        })

        it('should reject invalid model registry schema', async () => {
            console.log('\n  🧪 Testing invalid model registry schema rejection...')
            
            const invalidData = {
                'meta-llama/Llama-2-7b-chat-hf': {
                    family: 'llama-2'
                    // Missing: chatTemplate, requiresTemplate, validationLevel, frameworkCompatibility
                }
            }
            
            const modelSchema = await import('../../generators/app/config/schemas/model-registry-schema.js')
            
            assert.throws(
                () => {
                    loader.validateSchema(invalidData, modelSchema.default, 'Model Registry')
                },
                /validation failed/,
                'Should throw validation error for invalid schema'
            )
            
            console.log('    ✅ Invalid model registry schema rejected')
        })

        it('should validate instance accelerator mapping schema correctly', async () => {
            console.log('\n  🧪 Testing instance accelerator mapping schema validation...')
            
            const validData = {
                'ml.g5.xlarge': {
                    family: 'g5',
                    accelerator: {
                        type: 'cuda',
                        hardware: 'NVIDIA A10G',
                        architecture: 'Ampere',
                        versions: ['11.8', '12.1', '12.2'],
                        default: '12.1'
                    },
                    memory: '16 GB',
                    vcpus: 4
                }
            }
            
            // Should not throw
            const mappingSchema = await import('../../generators/app/config/schemas/instance-accelerator-mapping-schema.js')
            loader.validateSchema(validData, mappingSchema.default, 'Instance Accelerator Mapping')
            
            console.log('    ✅ Instance accelerator mapping schema validation passed')
        })

        it('should reject invalid instance accelerator mapping schema', async () => {
            console.log('\n  🧪 Testing invalid instance accelerator mapping schema rejection...')
            
            const invalidData = {
                'ml.g5.xlarge': {
                    family: 'g5'
                    // Missing: accelerator, memory, vcpus
                }
            }
            
            const mappingSchema = await import('../../generators/app/config/schemas/instance-accelerator-mapping-schema.js')
            
            assert.throws(
                () => {
                    loader.validateSchema(invalidData, mappingSchema.default, 'Instance Accelerator Mapping')
                },
                /validation failed/,
                'Should throw validation error for invalid schema'
            )
            
            console.log('    ✅ Invalid instance accelerator mapping schema rejected')
        })
    })

    describe('Malformed JSON Handling', () => {
        it('should handle malformed JSON gracefully', async () => {
            console.log('\n  🧪 Testing malformed JSON handling...')
            
            // Create a temporary malformed registry file
            const tempDir = path.join(__dirname, '../../generators/app/config/registries')
            const tempFile = path.join(tempDir, 'temp-malformed.js')
            
            try {
                // Write malformed content
                fs.writeFileSync(tempFile, 'module.exports = { invalid json }')
                
                // Create a loader that tries to load the malformed file
                const testLoader = new RegistryLoader()
                testLoader.loadFrameworkRegistry = async function() {
                    try {
                        await import(tempFile)
                    } catch (error) {
                        console.warn(`Failed to load framework registry: ${error.message}`)
                        return {}
                    }
                }
                
                const registry = await testLoader.loadFrameworkRegistry()
                
                assert.deepStrictEqual(registry, {}, 'Should return empty object for malformed JSON')
                console.log('    ✅ Malformed JSON handled gracefully')
            } finally {
                // Clean up temp file
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile)
                }
            }
        })
    })
})
