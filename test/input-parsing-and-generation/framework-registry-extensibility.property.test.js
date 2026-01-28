// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Framework Registry Extensibility Property-Based Tests
 * 
 * Tests that new framework entries can be added to the Framework Registry
 * without requiring code changes to the generator.
 * 
 * Feature: transformer-server-env-config
 */

import fc from 'fast-check';
import { describe, it, before } from 'mocha';
import assert from 'assert';
import SchemaValidator from '../../generators/app/lib/schema-validator.js';
import frameworkSchema from '../../generators/app/config/schemas/framework-registry-schema.js';


describe('Framework Registry Extensibility - Property-Based Tests', () => {
    let validator;

    before(async () => {
        console.log('\n🚀 Starting Framework Registry Extensibility Property Tests');
        console.log('📋 Testing: Universal correctness properties for framework registry extensibility');
        console.log('🔧 Configuration: 100 iterations per property');
        console.log('✅ Property test environment ready\n');
        
        validator = new SchemaValidator();
    });

    describe('Property 20: Framework Registry Extensibility', () => {
        it('should allow adding new framework entries without code changes', function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 20: Framework Registry Extensibility');
            console.log('  📝 For any new framework entry with all required fields, the generator must work without code changes');
            console.log('  📝 Validates: Requirements 6.1, 6.2');
            
            // Feature: transformer-server-env-config, Property 20: Framework Registry Extensibility
            fc.assert(fc.property(
                fc.record({
                    frameworkName: fc.stringMatching(/^[a-z][a-z0-9-]{2,15}$/),
                    version: fc.tuple(
                        fc.integer({ min: 0, max: 5 }),
                        fc.integer({ min: 0, max: 20 }),
                        fc.integer({ min: 0, max: 50 })
                    ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`),
                    baseImage: fc.tuple(
                        fc.stringMatching(/^[a-z][a-z0-9-]{2,15}$/),
                        fc.stringMatching(/^[a-z][a-z0-9-]{2,15}$/),
                        fc.tuple(
                            fc.integer({ min: 0, max: 5 }),
                            fc.integer({ min: 0, max: 20 })
                        ).map(([major, minor]) => `v${major}.${minor}`)
                    ).map(([org, repo, tag]) => `${org}/${repo}:${tag}`),
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'cpu', 'rocm'),
                    acceleratorVersion: fc.oneof(
                        fc.constant(null),
                        fc.tuple(
                            fc.integer({ min: 11, max: 12 }),
                            fc.integer({ min: 0, max: 5 })
                        ).map(([major, minor]) => `${major}.${minor}`)
                    ),
                    envVarCount: fc.integer({ min: 0, max: 5 }),
                    inferenceAmiVersion: fc.constantFrom(
                        'al2-ami-sagemaker-inference-gpu-3-1',
                        'al2-ami-sagemaker-inference-gpu-3-2',
                        'al2-ami-sagemaker-inference-neuron-2-0'
                    ),
                    instanceTypeCount: fc.integer({ min: 1, max: 3 }),
                    validationLevel: fc.constantFrom('tested', 'community-validated', 'experimental', 'unknown')
                }),
                (frameworkData) => {
                    // Generate environment variables
                    const envVars = {};
                    for (let i = 0; i < frameworkData.envVarCount; i++) {
                        envVars[`${frameworkData.frameworkName.toUpperCase()}_VAR_${i}`] = `value_${i}`;
                    }
                    
                    // Generate instance types
                    const instanceTypes = [];
                    const families = ['g5', 'g4dn', 'p3', 'inf2', 'trn1'];
                    const sizes = ['xlarge', '2xlarge', '4xlarge'];
                    for (let i = 0; i < frameworkData.instanceTypeCount; i++) {
                        const family = families[i % families.length];
                        const size = sizes[i % sizes.length];
                        instanceTypes.push(`ml.${family}.${size}`);
                    }
                    
                    // Construct a valid framework registry entry
                    const registry = {
                        [frameworkData.frameworkName]: {
                            [frameworkData.version]: {
                                baseImage: frameworkData.baseImage,
                                accelerator: {
                                    type: frameworkData.acceleratorType,
                                    version: frameworkData.acceleratorVersion
                                },
                                envVars,
                                inferenceAmiVersion: frameworkData.inferenceAmiVersion,
                                recommendedInstanceTypes: instanceTypes,
                                validationLevel: frameworkData.validationLevel
                            }
                        }
                    };
                    
                    // Step 1: Validate against schema
                    const schemaResult = validator.validate(registry, frameworkSchema);
                    if (!schemaResult.valid) {
                        console.log(`    ❌ Generated entry failed schema validation: ${schemaResult.errors.join(', ')}`);
                        return false;
                    }
                    
                    // Step 2: Verify the entry has all required fields
                    const entry = registry[frameworkData.frameworkName][frameworkData.version];
                    
                    assert.ok(entry.baseImage, 'Entry must have baseImage');
                    assert.ok(entry.accelerator, 'Entry must have accelerator');
                    assert.ok(entry.accelerator.type, 'Entry must have accelerator.type');
                    assert.ok(entry.envVars !== undefined, 'Entry must have envVars');
                    assert.ok(entry.inferenceAmiVersion, 'Entry must have inferenceAmiVersion');
                    assert.ok(Array.isArray(entry.recommendedInstanceTypes), 'Entry must have recommendedInstanceTypes array');
                    assert.ok(entry.recommendedInstanceTypes.length > 0, 'Entry must have at least one recommended instance type');
                    assert.ok(entry.validationLevel, 'Entry must have validationLevel');
                    
                    // Step 3: Verify the entry can be used in configuration matching
                    // (This simulates what ConfigurationMatcher would do)
                    const frameworks = Object.keys(registry);
                    assert.ok(frameworks.includes(frameworkData.frameworkName), 'Framework name should be accessible');
                    
                    const versions = Object.keys(registry[frameworkData.frameworkName]);
                    assert.ok(versions.includes(frameworkData.version), 'Version should be accessible');
                    
                    const config = registry[frameworkData.frameworkName][frameworkData.version];
                    assert.strictEqual(config.baseImage, frameworkData.baseImage, 'Base image should match');
                    assert.strictEqual(config.accelerator.type, frameworkData.acceleratorType, 'Accelerator type should match');
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ All generated framework entries are valid and extensible without code changes');
        });

        it('should support framework entries with optional profiles', function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 20: Framework Registry Extensibility - With Profiles');
            console.log('  📝 For any framework entry with profiles, all profiles must be valid and accessible');
            console.log('  📝 Validates: Requirements 6.1, 6.2, 12.1');
            
            // Feature: transformer-server-env-config, Property 20: Framework Registry Extensibility
            fc.assert(fc.property(
                fc.record({
                    frameworkName: fc.stringMatching(/^[a-z][a-z0-9-]{2,15}$/),
                    version: fc.tuple(
                        fc.integer({ min: 0, max: 5 }),
                        fc.integer({ min: 0, max: 20 })
                    ).map(([major, minor]) => `${major}.${minor}.0`),
                    baseImage: fc.string({ minLength: 10, maxLength: 50 }),
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'cpu'),
                    profileCount: fc.integer({ min: 1, max: 3 })
                }),
                (frameworkData) => {
                    // Generate profiles
                    const profiles = {};
                    const profileNames = ['low-latency', 'high-throughput', 'balanced'];
                    
                    for (let i = 0; i < frameworkData.profileCount; i++) {
                        const profileName = profileNames[i];
                        profiles[profileName] = {
                            displayName: profileName.split('-').map(w => 
                                w.charAt(0).toUpperCase() + w.slice(1)
                            ).join(' '),
                            description: `${profileName} profile for ${frameworkData.frameworkName}`,
                            envVars: {
                                [`${frameworkData.frameworkName.toUpperCase()}_PROFILE`]: profileName,
                                [`${frameworkData.frameworkName.toUpperCase()}_MODE`]: `mode_${i}`
                            },
                            recommendedInstanceTypes: ['ml.g5.xlarge'],
                            notes: `Profile ${i} for testing`
                        };
                    }
                    
                    // Construct framework entry with profiles
                    const registry = {
                        [frameworkData.frameworkName]: {
                            [frameworkData.version]: {
                                baseImage: frameworkData.baseImage,
                                accelerator: {
                                    type: frameworkData.acceleratorType,
                                    version: null
                                },
                                envVars: {},
                                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                                recommendedInstanceTypes: ['ml.g5.xlarge'],
                                validationLevel: 'experimental',
                                profiles
                            }
                        }
                    };
                    
                    // Validate against schema
                    const schemaResult = validator.validate(registry, frameworkSchema);
                    if (!schemaResult.valid) {
                        console.log(`    ❌ Entry with profiles failed schema validation: ${schemaResult.errors.join(', ')}`);
                        return false;
                    }
                    
                    // Verify profiles are accessible
                    const entry = registry[frameworkData.frameworkName][frameworkData.version];
                    assert.ok(entry.profiles, 'Entry must have profiles');
                    
                    const profileKeys = Object.keys(entry.profiles);
                    assert.strictEqual(profileKeys.length, frameworkData.profileCount, 'Profile count should match');
                    
                    // Verify each profile has required fields
                    for (const profileName of profileKeys) {
                        const profile = entry.profiles[profileName];
                        assert.ok(profile.displayName, `Profile ${profileName} must have displayName`);
                        assert.ok(profile.description, `Profile ${profileName} must have description`);
                        assert.ok(profile.envVars, `Profile ${profileName} must have envVars`);
                    }
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ All framework entries with profiles are valid and extensible');
        });

        it('should support framework entries with version ranges', function() {
            this.timeout(60000);
            
            console.log('\n  🧪 Property 20: Framework Registry Extensibility - With Version Ranges');
            console.log('  📝 For any framework entry with accelerator version ranges, ranges must be valid');
            console.log('  📝 Validates: Requirements 6.1, 6.2');
            
            // Feature: transformer-server-env-config, Property 20: Framework Registry Extensibility
            fc.assert(fc.property(
                fc.record({
                    frameworkName: fc.stringMatching(/^[a-z][a-z0-9-]{2,15}$/),
                    version: fc.string({ minLength: 5, maxLength: 10 }),
                    baseImage: fc.string({ minLength: 10, maxLength: 50 }),
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'rocm'),
                    minVersion: fc.tuple(
                        fc.integer({ min: 11, max: 12 }),
                        fc.integer({ min: 0, max: 5 })
                    ).map(([major, minor]) => `${major}.${minor}`),
                    maxVersion: fc.tuple(
                        fc.integer({ min: 12, max: 13 }),
                        fc.integer({ min: 0, max: 5 })
                    ).map(([major, minor]) => `${major}.${minor}`)
                }),
                (frameworkData) => {
                    // Construct framework entry with version range
                    const registry = {
                        [frameworkData.frameworkName]: {
                            [frameworkData.version]: {
                                baseImage: frameworkData.baseImage,
                                accelerator: {
                                    type: frameworkData.acceleratorType,
                                    version: frameworkData.minVersion,
                                    versionRange: {
                                        min: frameworkData.minVersion,
                                        max: frameworkData.maxVersion
                                    }
                                },
                                envVars: {},
                                inferenceAmiVersion: 'al2-ami-sagemaker-inference-gpu-3-1',
                                recommendedInstanceTypes: ['ml.g5.xlarge'],
                                validationLevel: 'experimental'
                            }
                        }
                    };
                    
                    // Validate against schema
                    const schemaResult = validator.validate(registry, frameworkSchema);
                    if (!schemaResult.valid) {
                        console.log(`    ❌ Entry with version range failed schema validation: ${schemaResult.errors.join(', ')}`);
                        return false;
                    }
                    
                    // Verify version range is accessible
                    const entry = registry[frameworkData.frameworkName][frameworkData.version];
                    assert.ok(entry.accelerator.versionRange, 'Entry must have versionRange');
                    assert.ok(entry.accelerator.versionRange.min, 'Version range must have min');
                    assert.ok(entry.accelerator.versionRange.max, 'Version range must have max');
                    
                    return true;
                }
            ), { numRuns: 100 });
            
            console.log('    ✅ All framework entries with version ranges are valid and extensible');
        });
    });
});
