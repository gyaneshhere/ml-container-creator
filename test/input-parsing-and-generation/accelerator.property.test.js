// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Accelerator Validation Property-Based Tests
 * 
 * Tests universal correctness properties for accelerator validation.
 * 
 * Feature: transformer-server-env-config
 * 
 * Consolidates:
 * - accelerator-validation.property.test.js
 * - accelerator-validator-extensibility.property.test.js
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';
import assert from 'assert';
import CudaValidator from '../../generators/app/lib/cuda-validator.js';
import NeuronValidator from '../../generators/app/lib/neuron-validator.js';
import CpuValidator from '../../generators/app/lib/cpu-validator.js';
import RocmValidator from '../../generators/app/lib/rocm-validator.js';

describe('Accelerator Validation Properties', () => {
    let validators;

    before(() => {
        validators = {
            cuda: new CudaValidator(),
            neuron: new NeuronValidator(),
            cpu: new CpuValidator(),
            rocm: new RocmValidator()
        };
    });

    setupTestHooks('Accelerator Validation Properties');

    describe('CUDA Version Compatibility Properties', () => {
        it('should validate CUDA version compatibility using major.minor versioning', function() {
            this.timeout(10000);
            
            fc.assert(fc.property(
                fc.record({
                    requiredMajor: fc.integer({ min: 11, max: 13 }),
                    requiredMinor: fc.integer({ min: 0, max: 9 }),
                    providedMajor: fc.integer({ min: 11, max: 13 }),
                    providedMinor: fc.integer({ min: 0, max: 9 })
                }),
                (testData) => {
                    const requiredVersion = `${testData.requiredMajor}.${testData.requiredMinor}`;
                    const providedVersion = `${testData.providedMajor}.${testData.providedMinor}`;
                    
                    const frameworkConfig = {
                        accelerator: {
                            type: 'cuda',
                            version: requiredVersion
                        }
                    };
                    
                    const instanceConfig = {
                        accelerator: {
                            type: 'cuda',
                            versions: [providedVersion]
                        }
                    };
                    
                    const validator = validators.cuda;
                    const result = validator.validate(frameworkConfig, instanceConfig);
                    
                    const shouldBeCompatible = 
                        testData.providedMajor === testData.requiredMajor &&
                        testData.providedMinor >= testData.requiredMinor;
                    
                    assert.strictEqual(result.compatible, shouldBeCompatible,
                        `CUDA ${providedVersion} should ${shouldBeCompatible ? 'be' : 'not be'} compatible with ${requiredVersion}`);
                    
                    if (shouldBeCompatible) {
                        assert(result.info, 'Compatible result should have info message');
                    } else {
                        assert(result.error, 'Incompatible result should have error message');
                    }
                    
                    return true;
                }
            ), { numRuns: 20 });
        });
    });

    describe('Neuron SDK Version Compatibility Properties', () => {
        it('should validate Neuron SDK version compatibility using semantic versioning', function() {
            this.timeout(10000);
            
            fc.assert(fc.property(
                fc.record({
                    requiredMajor: fc.integer({ min: 2, max: 3 }),
                    requiredMinor: fc.integer({ min: 0, max: 20 }),
                    requiredPatch: fc.integer({ min: 0, max: 9 }),
                    providedMajor: fc.integer({ min: 2, max: 3 }),
                    providedMinor: fc.integer({ min: 0, max: 20 }),
                    providedPatch: fc.integer({ min: 0, max: 9 })
                }),
                (testData) => {
                    const requiredVersion = `${testData.requiredMajor}.${testData.requiredMinor}.${testData.requiredPatch}`;
                    const providedVersion = `${testData.providedMajor}.${testData.providedMinor}.${testData.providedPatch}`;
                    
                    const frameworkConfig = {
                        accelerator: {
                            type: 'neuron',
                            version: requiredVersion
                        }
                    };
                    
                    const instanceConfig = {
                        accelerator: {
                            type: 'neuron',
                            versions: [providedVersion]
                        }
                    };
                    
                    const validator = validators.neuron;
                    const result = validator.validate(frameworkConfig, instanceConfig);
                    
                    const shouldBeCompatible = 
                        testData.providedMajor === testData.requiredMajor &&
                        testData.providedMinor >= testData.requiredMinor;
                    
                    assert.strictEqual(result.compatible, shouldBeCompatible,
                        `Neuron SDK ${providedVersion} should ${shouldBeCompatible ? 'be' : 'not be'} compatible with ${requiredVersion}`);
                    
                    if (shouldBeCompatible) {
                        assert(result.info, 'Compatible result should have info message');
                    } else {
                        assert(result.error, 'Incompatible result should have error message');
                    }
                    
                    return true;
                }
            ), { numRuns: 20 });
        });
    });

    describe('ROCm Version Compatibility Properties', () => {
        it('should validate ROCm version compatibility using semantic versioning', function() {
            this.timeout(10000);
            
            fc.assert(fc.property(
                fc.record({
                    requiredMajor: fc.integer({ min: 5, max: 6 }),
                    requiredMinor: fc.integer({ min: 0, max: 9 }),
                    requiredPatch: fc.integer({ min: 0, max: 9 }),
                    providedMajor: fc.integer({ min: 5, max: 6 }),
                    providedMinor: fc.integer({ min: 0, max: 9 }),
                    providedPatch: fc.integer({ min: 0, max: 9 })
                }),
                (testData) => {
                    const requiredVersion = `${testData.requiredMajor}.${testData.requiredMinor}.${testData.requiredPatch}`;
                    const providedVersion = `${testData.providedMajor}.${testData.providedMinor}.${testData.providedPatch}`;
                    
                    const frameworkConfig = {
                        accelerator: {
                            type: 'rocm',
                            version: requiredVersion
                        }
                    };
                    
                    const instanceConfig = {
                        accelerator: {
                            type: 'rocm',
                            versions: [providedVersion]
                        }
                    };
                    
                    const validator = validators.rocm;
                    const result = validator.validate(frameworkConfig, instanceConfig);
                    
                    const shouldBeCompatible = 
                        testData.providedMajor === testData.requiredMajor &&
                        testData.providedMinor >= testData.requiredMinor;
                    
                    assert.strictEqual(result.compatible, shouldBeCompatible,
                        `ROCm ${providedVersion} should ${shouldBeCompatible ? 'be' : 'not be'} compatible with ${requiredVersion}`);
                    
                    if (shouldBeCompatible) {
                        assert(result.info, 'Compatible result should have info message');
                    } else {
                        assert(result.error, 'Incompatible result should have error message');
                    }
                    
                    return true;
                }
            ), { numRuns: 20 });
        });
    });

    describe('CPU Compatibility Properties', () => {
        it('should always validate CPU as compatible regardless of version', function() {
            this.timeout(10000);
            
            fc.assert(fc.property(
                fc.record({
                    version: fc.string({ minLength: 1, maxLength: 20 })
                }),
                (testData) => {
                    const frameworkConfig = {
                        accelerator: {
                            type: 'cpu',
                            version: testData.version
                        }
                    };
                    
                    const instanceConfig = {
                        accelerator: {
                            type: 'cpu',
                            versions: [testData.version]
                        }
                    };
                    
                    const validator = validators.cpu;
                    const result = validator.validate(frameworkConfig, instanceConfig);
                    
                    assert.strictEqual(result.compatible, true,
                        'CPU should always be compatible');
                    assert(result.info, 'CPU result should have info message');
                    
                    return true;
                }
            ), { numRuns: 20 });
        });
    });

    describe('Accelerator Type Matching Properties', () => {
        it('should validate when accelerator types match', function() {
            this.timeout(10000);
            
            fc.assert(fc.property(
                fc.record({
                    acceleratorType: fc.constantFrom('cuda', 'neuron', 'cpu', 'rocm'),
                    version: fc.tuple(
                        fc.integer({ min: 0, max: 10 }),
                        fc.integer({ min: 0, max: 99 }),
                        fc.integer({ min: 0, max: 99 })
                    ).map(([major, minor, patch]) => `${major}.${minor}.${patch}`)
                }),
                (testData) => {
                    const frameworkConfig = {
                        accelerator: {
                            type: testData.acceleratorType,
                            version: testData.version
                        }
                    };
                    
                    const instanceConfig = {
                        accelerator: {
                            type: testData.acceleratorType,
                            versions: [testData.version]
                        }
                    };
                    
                    const validator = validators[testData.acceleratorType];
                    const result = validator.validate(frameworkConfig, instanceConfig);
                    
                    assert(typeof result === 'object', 'Validation result must be an object');
                    assert(typeof result.compatible === 'boolean', 
                        'Validation result must have compatible boolean');
                    
                    if (testData.acceleratorType === 'cpu') {
                        assert.strictEqual(result.compatible, true,
                            'CPU should always be compatible');
                    }
                    
                    return true;
                }
            ), { numRuns: 20 });
        });
    });
});
