// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Mock Generator Helper
 * 
 * Provides minimal mock generator objects for unit testing ConfigManager
 * and other generator components without running the full Yeoman generator.
 */

import path from 'path';

/**
 * Creates a mock generator object with minimal required properties
 * @param {Object} options - Options to pass to the generator
 * @param {Array} args - Positional arguments to pass to the generator
 * @param {string} destinationRoot - Destination root directory
 * @returns {Object} Mock generator object
 */
export function createMockGenerator(options = {}, args = [], destinationRoot = process.cwd()) {
    return {
        options,
        args,
        destinationRoot: () => destinationRoot,
        destinationPath: (filepath) => {
            if (!filepath) return destinationRoot;
            return path.join(destinationRoot, filepath);
        },
        env: {
            error: (message) => {
                throw new Error(message);
            }
        },
        config: {
            getAll: () => ({}),
            save: () => {}
        },
        fs: {
            exists: (_) => false,
            read: (_) => '',
            write: (_) => {},
            copyTpl: () => {}
        }
    };
}

/**
 * Creates a mock generator with specific CLI options
 * @param {Object} cliOptions - CLI options to set
 * @returns {Object} Mock generator object
 */
export function createMockGeneratorWithOptions(cliOptions) {
    return createMockGenerator(cliOptions, []);
}

/**
 * Creates a mock generator with positional arguments
 * @param {Array} args - Positional arguments
 * @returns {Object} Mock generator object
 */
export function createMockGeneratorWithArgs(args) {
    return createMockGenerator({}, args);
}

/**
 * Creates a mock generator with environment variables set
 * @param {Object} envVars - Environment variables to set
 * @returns {Object} Mock generator object with env vars set
 */
export function createMockGeneratorWithEnv(envVars) {
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
        process.env[key] = value;
    });
    
    return createMockGenerator({}, []);
}

/**
 * Cleans up environment variables after test
 * @param {Array<string>} envVarNames - Names of environment variables to clean up
 */
export function cleanupEnvVars(envVarNames) {
    envVarNames.forEach(name => {
        delete process.env[name];
    });
}

/**
 * Creates a mock generator with a custom destination root
 * @param {string} destinationRoot - Custom destination root
 * @returns {Object} Mock generator object
 */
export function createMockGeneratorWithDestination(destinationRoot) {
    return createMockGenerator({}, [], destinationRoot);
}

export default {
    createMockGenerator,
    createMockGeneratorWithOptions,
    createMockGeneratorWithArgs,
    createMockGeneratorWithEnv,
    cleanupEnvVars,
    createMockGeneratorWithDestination
};
