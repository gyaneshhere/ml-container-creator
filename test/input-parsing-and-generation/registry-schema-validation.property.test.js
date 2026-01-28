// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Schema Validation Property-Based Tests
 * 
 * Tests the correctness properties for registry schema validation.
 * Each property validates universal behavior across many generated inputs.
 * 
 * Feature: transformer-server-env-config
 */

import fc from 'fast-check';
import { describe, it, before } from 'mocha';
import SchemaValidator from '../../generators/app/lib/schema-validator.js';
import frameworkSchema from '../../generators/app/config/schemas/framework-registry-schema.js';
import modelSchema from '../../generators/app/config/schemas/model-registry-schema.js';
import instanceSchema from '../../generators/app/config/schemas/instance-accelerator-mapping-schema.js';

describe('Registry Schema Validation - Property-Based Tests', () => {
    let validator;

    before(async () => {
        
        validator = new SchemaValidator();
    });

    describe('Property 1: Registry Schema Validation', () => {
        it('should validate that all required fields are present in Framework Registry entries', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 1: Registry Schema Validation - Framework Registry');
            console.log('  📝 For any Framework_Registry entry, all required fields must be present and valid');
            
            // Feature: transformer-server-env-config, Property 1: Registry Schema Validation
            fc.assert(fc.property(
                // Generate valid framework registry entries
                fc.record({
                    frameworkName: fc.stringMatching(/^[a-z0-9-]+$/),
                    version: fc.tuple(
                        fc.integer({ min: 0, max: 10 }),
                        fc.integer({ min: 0, max: 99 }),
                        fc.integer({ min: 0, max: 99 })
                    ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
                    baseImage: fc.string({ minLength: 1, maxLength: 100 }),
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'cpu', 'rocm'),
                    acceleratorVersion: fc.oneof(
                        fc.constant(null),
                        fc.string({ minLength: 1, maxLength: 20 })
                    ),
                    envVars: fc.dictionary(
                        fc.stringMatching(/^[A-Z_][A-Z0-9_]*$/),
                        fc.string()
                    ),
                    inferenceAmiVersion: fc.string({ minLength: 1, maxLength: 100 }),
                    recommendedInstanceTypes: fc.array(
                        fc.stringMatching(/^ml\.[a-z0-9]+\.[a-z0-9]+$/),
                        { minLength: 1, maxLength: 5 }
                    ),
                    validationLevel: fc.constantFrom('tested', 'community-validated', 'experimental', 'unknown')
                }),
                (entry) => {
                    // Construct a valid framework registry entry
                    const registry = {
                        [entry.frameworkName]: {
                            [entry.version]: {
                                baseImage: entry.baseImage,
                                accelerator: {
                                    type: entry.acceleratorType,
                                    version: entry.acceleratorVersion
                                },
                                envVars: entry.envVars,
                                inferenceAmiVersion: entry.inferenceAmiVersion,
                                recommendedInstanceTypes: entry.recommendedInstanceTypes,
                                validationLevel: entry.validationLevel
                            }
                        }
                    };
                    
                    // Validate against schema
                    const result = validator.validate(registry, frameworkSchema);
                    
                    // All valid entries should pass validation
                    if (!result.valid) {
                        console.log(`    ❌ Valid entry failed validation: ${result.errors.join(', ')}`);
                        return false;
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
            
        });

        it('should reject Framework Registry entries missing required fields', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 1: Registry Schema Validation - Missing Required Fields');
            console.log('  📝 For any Framework_Registry entry missing required fields, validation must fail');
            
            // Feature: transformer-server-env-config, Property 1: Registry Schema Validation
            fc.assert(fc.property(
                fc.record({
                    frameworkName: fc.stringMatching(/^[a-z0-9-]+$/),
                    version: fc.tuple(
                        fc.integer({ min: 0, max: 10 }),
                        fc.integer({ min: 0, max: 10 }),
                        fc.integer({ min: 0, max: 10 })
                    ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
                    // Randomly omit required fields
                    includeBaseImage: fc.boolean(),
                    includeAccelerator: fc.boolean(),
                    includeEnvVars: fc.boolean(),
                    includeInferenceAmi: fc.boolean(),
                    includeInstanceTypes: fc.boolean(),
                    includeValidationLevel: fc.boolean()
                }),
                (config) => {
                    // Skip if all fields are included (that's the valid case)
                    if (config.includeBaseImage && config.includeAccelerator && 
                        config.includeEnvVars && config.includeInferenceAmi && 
                        config.includeInstanceTypes && config.includeValidationLevel) {
                        return true; // Skip this case
                    }
                    
                    // Construct an incomplete entry
                    const entry = {};
                    
                    if (config.includeBaseImage) {
                        entry.baseImage = 'test-image:latest';
                    }
                    if (config.includeAccelerator) {
                        entry.accelerator = { type: 'cuda' };
                    }
                    if (config.includeEnvVars) {
                        entry.envVars = {};
                    }
                    if (config.includeInferenceAmi) {
                        entry.inferenceAmiVersion = 'al2-ami-test';
                    }
                    if (config.includeInstanceTypes) {
                        entry.recommendedInstanceTypes = ['ml.g5.xlarge'];
                    }
                    if (config.includeValidationLevel) {
                        entry.validationLevel = 'experimental';
                    }
                    
                    const registry = {
                        [config.frameworkName]: {
                            [config.version]: entry
                        }
                    };
                    
                    // Validate against schema
                    const result = validator.validate(registry, frameworkSchema);
                    
                    // Incomplete entries should fail validation
                    if (result.valid) {
                        console.log('    ❌ Incomplete entry passed validation (should fail)');
                        return false;
                    }
                    
                    // Should have error messages about missing fields
                    if (result.errors.length === 0) {
                        console.log('    ❌ No error messages for incomplete entry');
                        return false;
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
            
        });

        it('should validate that all required fields are present in Model Registry entries', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 1: Registry Schema Validation - Model Registry');
            console.log('  📝 For any Model_Registry entry, all required fields must be present and valid');
            
            // Feature: transformer-server-env-config, Property 1: Registry Schema Validation
            fc.assert(fc.property(
                fc.record({
                    modelId: fc.string({ minLength: 1, maxLength: 100 }),
                    family: fc.string({ minLength: 1, maxLength: 50 }),
                    chatTemplate: fc.oneof(
                        fc.constant(null),
                        fc.string({ minLength: 1, maxLength: 500 })
                    ),
                    requiresTemplate: fc.boolean(),
                    validationLevel: fc.constantFrom('tested', 'community-validated', 'experimental'),
                    frameworkCompatibility: fc.dictionary(
                        fc.stringMatching(/^[a-z0-9-]+$/),
                        fc.string({ minLength: 1, maxLength: 20 })
                    )
                }),
                (entry) => {
                    // Construct a valid model registry entry
                    const registry = {
                        [entry.modelId]: {
                            family: entry.family,
                            chatTemplate: entry.chatTemplate,
                            requiresTemplate: entry.requiresTemplate,
                            validationLevel: entry.validationLevel,
                            frameworkCompatibility: entry.frameworkCompatibility
                        }
                    };
                    
                    // Validate against schema
                    const result = validator.validate(registry, modelSchema);
                    
                    // All valid entries should pass validation
                    if (!result.valid) {
                        console.log(`    ❌ Valid entry failed validation: ${result.errors.join(', ')}`);
                        return false;
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
            
        });

        it('should validate that all required fields are present in Instance Accelerator Mapping entries', function() {
            this.timeout(30000);
            
            console.log('\n  🧪 Property 1: Registry Schema Validation - Instance Accelerator Mapping');
            console.log('  📝 For any Instance_Accelerator_Mapping entry, all required fields must be present and valid');
            
            // Feature: transformer-server-env-config, Property 1: Registry Schema Validation
            fc.assert(fc.property(
                fc.record({
                    instanceType: fc.tuple(
                        fc.stringMatching(/^[a-z0-9]+$/),
                        fc.stringMatching(/^[a-z0-9]+$/)
                    ).map(([family, size]) => `ml.${family}.${size}`),
                    family: fc.string({ minLength: 1, maxLength: 20 }),
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'cpu', 'rocm'),
                    hardware: fc.string({ minLength: 1, maxLength: 50 }),
                    architecture: fc.string({ minLength: 1, maxLength: 50 }),
                    versions: fc.oneof(
                        fc.constant(null),
                        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
                    ),
                    defaultVersion: fc.oneof(
                        fc.constant(null),
                        fc.string({ minLength: 1, maxLength: 20 })
                    ),
                    memory: fc.integer({ min: 1, max: 1024 }).map(gb => `${gb} GB`),
                    vcpus: fc.integer({ min: 1, max: 96 })
                }),
                (entry) => {
                    // Construct a valid instance mapping entry
                    const registry = {
                        [entry.instanceType]: {
                            family: entry.family,
                            accelerator: {
                                type: entry.acceleratorType,
                                hardware: entry.hardware,
                                architecture: entry.architecture,
                                versions: entry.versions,
                                default: entry.defaultVersion
                            },
                            memory: entry.memory,
                            vcpus: entry.vcpus
                        }
                    };
                    
                    // Validate against schema
                    const result = validator.validate(registry, instanceSchema);
                    
                    // All valid entries should pass validation
                    if (!result.valid) {
                        console.log(`    ❌ Valid entry failed validation: ${result.errors.join(', ')}`);
                        return false;
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
            
        });
    });
});
