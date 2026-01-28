// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * CodeBuild Property-Based Tests
 * 
 * Tests universal correctness properties for CodeBuild feature.
 * 
 * Feature: codebuild-deployment
 * 
 * Consolidates:
 * - codebuild-input-validation.property.test.js
 * - codebuild-configuration-parsing.property.test.js
 * - codebuild-parameter-precedence.property.test.js
 * - codebuild-conditional-prompting.property.test.js
 */

import fc from 'fast-check';
import { setupTestHooks } from './test-utils.js';
import ConfigManager, { ValidationError } from '../../generators/app/lib/config-manager.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('CodeBuild Properties', () => {
    let tempDir;
    let mockGenerator;

    setupTestHooks('CodeBuild Properties');

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codebuild-property-test-'));
        
        mockGenerator = {
            destinationPath: (filePath = '') => path.join(tempDir, filePath),
            options: {},
            args: [],
            env: {
                error: (message) => {
                    throw new Error(message);
                }
            }
        };
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    describe('Deployment Target Validation Properties', () => {
        it('should validate deployment target values correctly for all inputs', () => {
            const configManager = new ConfigManager(mockGenerator);
            const validTargets = ['sagemaker', 'codebuild'];
            
            fc.assert(fc.property(
                fc.constantFrom(...validTargets),
                (deployTarget) => {
                    try {
                        configManager._validateParameterValue('deployTarget', deployTarget, {});
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            ), { numRuns: 20 });
            
            const invalidTargetGenerator = fc.string().filter(s => 
                s.length > 0 && !validTargets.includes(s)
            );
            
            fc.assert(fc.property(
                invalidTargetGenerator,
                (invalidTarget) => {
                    try {
                        configManager._validateParameterValue('deployTarget', invalidTarget, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasUnsupportedMessage = error.message.includes('Unsupported deployment target');
                            const hasTargetValue = error.message.includes(invalidTarget);
                            const hasSupportedTargets = validTargets.every(target => error.message.includes(target));
                            
                            return hasUnsupportedMessage && hasTargetValue && hasSupportedTargets;
                        }
                        return false;
                    }
                }
            ), { numRuns: 20 });
        });
    });

    describe('CodeBuild Compute Type Validation Properties', () => {
        it('should validate CodeBuild compute type values correctly for all inputs', () => {
            const configManager = new ConfigManager(mockGenerator);
            const validComputeTypes = ['BUILD_GENERAL1_SMALL', 'BUILD_GENERAL1_MEDIUM', 'BUILD_GENERAL1_LARGE'];
            
            fc.assert(fc.property(
                fc.constantFrom(...validComputeTypes),
                (computeType) => {
                    try {
                        configManager._validateParameterValue('codebuildComputeType', computeType, {});
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            ), { numRuns: 20 });
            
            const invalidComputeTypeGenerator = fc.string().filter(s => 
                s.length > 0 && !validComputeTypes.includes(s)
            );
            
            fc.assert(fc.property(
                invalidComputeTypeGenerator,
                (invalidComputeType) => {
                    try {
                        configManager._validateParameterValue('codebuildComputeType', invalidComputeType, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasUnsupportedMessage = error.message.includes('Unsupported CodeBuild compute type');
                            const hasComputeTypeValue = error.message.includes(invalidComputeType);
                            const hasSupportedTypes = validComputeTypes.every(type => error.message.includes(type));
                            
                            return hasUnsupportedMessage && hasComputeTypeValue && hasSupportedTypes;
                        }
                        return false;
                    }
                }
            ), { numRuns: 20 });
        });
    });

    describe('CodeBuild Project Name Validation Properties', () => {
        it('should validate CodeBuild project names according to AWS naming constraints', () => {
            const configManager = new ConfigManager(mockGenerator);
            
            const validProjectNameGenerator = fc.string({
                minLength: 2,
                maxLength: 255
            }).filter(s => {
                if (!/^[a-zA-Z0-9]/.test(s)) return false;
                if (!/^[a-zA-Z0-9\-_]+$/.test(s)) return false;
                return true;
            });
            
            fc.assert(fc.property(
                validProjectNameGenerator,
                (projectName) => {
                    try {
                        configManager._validateParameterValue('codebuildProjectName', projectName, {});
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            ), { numRuns: 20 });
            
            const invalidStartCharGenerator = fc.string({
                minLength: 2,
                maxLength: 50
            }).filter(s => {
                if (/^[a-zA-Z0-9]/.test(s)) return false;
                if (!/^.[\w-]*$/.test(s)) return false;
                return true;
            });
            
            fc.assert(fc.property(
                invalidStartCharGenerator,
                (projectName) => {
                    try {
                        configManager._validateParameterValue('codebuildProjectName', projectName, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasInvalidMessage = error.message.includes('Invalid CodeBuild project name');
                            const hasProjectNameValue = error.message.includes(projectName);
                            const hasConstraints = error.message.includes('start with a letter or number');
                            
                            return hasInvalidMessage && hasProjectNameValue && hasConstraints;
                        }
                        return false;
                    }
                }
            ), { numRuns: 20 });
            
            const invalidCharGenerator = fc.string({
                minLength: 2,
                maxLength: 50
            }).filter(s => {
                if (!/^[a-zA-Z0-9]/.test(s)) return false;
                if (/^[a-zA-Z0-9\-_]+$/.test(s)) return false;
                return true;
            });
            
            fc.assert(fc.property(
                invalidCharGenerator,
                (projectName) => {
                    try {
                        configManager._validateParameterValue('codebuildProjectName', projectName, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasInvalidMessage = error.message.includes('Invalid CodeBuild project name');
                            const hasProjectNameValue = error.message.includes(projectName);
                            const hasCharConstraints = error.message.includes('letters, numbers, hyphens, and underscores');
                            
                            return hasInvalidMessage && hasProjectNameValue && hasCharConstraints;
                        }
                        return false;
                    }
                }
            ), { numRuns: 20 });
        });

        it('should reject project names that are too short or too long', () => {
            const configManager = new ConfigManager(mockGenerator);
            
            const tooShortGenerator = fc.string({
                minLength: 0,
                maxLength: 1
            }).filter(s => s.length < 2);
            
            fc.assert(fc.property(
                tooShortGenerator,
                (projectName) => {
                    if (projectName === '') {
                        return true;
                    }
                    
                    try {
                        configManager._validateParameterValue('codebuildProjectName', projectName, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasInvalidMessage = error.message.includes('Invalid CodeBuild project name');
                            const hasLengthConstraint = error.message.includes('2-255 characters');
                            
                            return hasInvalidMessage && hasLengthConstraint;
                        }
                        return false;
                    }
                }
            ), { numRuns: 10 });
            
            const tooLongGenerator = fc.string({
                minLength: 256,
                maxLength: 300
            });
            
            fc.assert(fc.property(
                tooLongGenerator,
                (projectName) => {
                    try {
                        configManager._validateParameterValue('codebuildProjectName', projectName, {});
                        return false;
                    } catch (error) {
                        if (error instanceof ValidationError) {
                            const hasInvalidMessage = error.message.includes('Invalid CodeBuild project name');
                            const hasLengthConstraint = error.message.includes('2-255 characters');
                            
                            return hasInvalidMessage && hasLengthConstraint;
                        }
                        return false;
                    }
                }
            ), { numRuns: 10 });
        });
    });

    describe('Error Message Consistency Properties', () => {
        it('should provide consistent error message format across all validation failures', () => {
            const configManager = new ConfigManager(mockGenerator);
            
            const testCases = [
                {
                    parameter: 'deployTarget',
                    generator: fc.string().filter(s => s.length > 0 && !['sagemaker', 'codebuild'].includes(s)),
                    expectedErrorType: 'Unsupported deployment target'
                },
                {
                    parameter: 'codebuildComputeType',
                    generator: fc.string().filter(s => s.length > 0 && !['BUILD_GENERAL1_SMALL', 'BUILD_GENERAL1_MEDIUM', 'BUILD_GENERAL1_LARGE'].includes(s)),
                    expectedErrorType: 'Unsupported CodeBuild compute type'
                },
                {
                    parameter: 'codebuildProjectName',
                    generator: fc.string().filter(s => s.length > 0 && !/^[a-zA-Z0-9][a-zA-Z0-9\-_]{1,254}$/.test(s)),
                    expectedErrorType: 'Invalid CodeBuild project name'
                }
            ];
            
            testCases.forEach(({ parameter, generator, expectedErrorType }) => {
                fc.assert(fc.property(
                    generator,
                    (invalidValue) => {
                        try {
                            configManager._validateParameterValue(parameter, invalidValue, {});
                            return false;
                        } catch (error) {
                            if (error instanceof ValidationError) {
                                if (error.parameter !== parameter) return false;
                                if (error.value !== invalidValue) return false;
                                if (!error.message.includes(expectedErrorType)) return false;
                                if (!error.message.includes(invalidValue)) return false;
                                if (error.message.length < 20 || error.message.length > 500) return false;
                                
                                return true;
                            }
                            return false;
                        }
                    }
                ), { numRuns: 10 });
            });
        });
    });

    describe('Edge Cases and Boundary Values', () => {
        it('should handle edge cases and boundary values correctly', () => {
            const configManager = new ConfigManager(mockGenerator);
            
            const falsyValues = [null, undefined, '', false, 0];
            
            falsyValues.forEach(falsyValue => {
                ['deployTarget', 'codebuildComputeType', 'codebuildProjectName'].forEach(parameter => {
                    try {
                        configManager._validateParameterValue(parameter, falsyValue, {});
                    } catch (error) {
                        throw new Error(`Falsy values should not be validated for ${parameter}`);
                    }
                });
            });
            
            const boundaryProjectNames = [
                'ab',
                'A'.repeat(255),
                'a1',
                '1a',
                'a_',
                'a-'
            ];
            
            boundaryProjectNames.forEach(projectName => {
                try {
                    configManager._validateParameterValue('codebuildProjectName', projectName, {});
                } catch (error) {
                    throw new Error(`Boundary project name should be valid: ${projectName}`);
                }
            });
        });
    });
});
