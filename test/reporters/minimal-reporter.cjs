// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Minimal Test Reporter
 * 
 * Shows only: test number, test name, and outcome
 * No dependencies - uses Mocha's built-in Base reporter
 */

const Mocha = require('mocha');
const { reporters } = Mocha;
const { Base } = reporters;

class MinimalReporter extends Base {
    constructor(runner, options) {
        super(runner, options);
        
        let testNumber = 0;
        let passes = 0;
        let failures = 0;
        let pending = 0;
        const failedTests = [];
        
        // Track suite progress
        let totalTests = 0;
        let completedTests = 0;
        
        runner.on('start', () => {
            console.log('');
        });
        
        // Count total tests
        runner.on('suite', (suite) => {
            totalTests += suite.tests.length;
        });
        
        runner.on('pass', (test) => {
            testNumber++;
            completedTests++;
            passes++;
            
            const progress = this.getProgressBar(completedTests, totalTests);
            console.log(`${progress} ✓ ${testNumber}. ${test.title} (${test.duration}ms)`);
        });
        
        runner.on('fail', (test, err) => {
            testNumber++;
            completedTests++;
            failures++;
            
            const progress = this.getProgressBar(completedTests, totalTests);
            console.log(`${progress} ✗ ${testNumber}. ${test.title}`);
            
            failedTests.push({
                number: testNumber,
                title: test.fullTitle(),
                error: err.message,
                stack: err.stack
            });
        });
        
        runner.on('pending', (test) => {
            testNumber++;
            completedTests++;
            pending++;
            
            const progress = this.getProgressBar(completedTests, totalTests);
            console.log(`${progress} ○ ${testNumber}. ${test.title}`);
        });
        
        runner.on('end', () => {
            console.log('');
            console.log('─'.repeat(80));
            console.log(`Summary: ${passes} passing, ${failures} failing, ${pending} pending`);
            console.log(`Total: ${testNumber} tests in ${runner.stats.duration}ms`);
            
            if (failedTests.length > 0) {
                console.log('');
                console.log('Failed Tests:');
                console.log('─'.repeat(80));
                
                failedTests.forEach(test => {
                    console.log(`\n${test.number}. ${test.title}`);
                    console.log(`   ${test.error}`);
                    
                    if (process.env.SHOW_STACK) {
                        console.log(`\n${test.stack}`);
                    }
                });
            }
            
            console.log('');
        });
    }
    
    getProgressBar(current, total) {
        const percentage = Math.floor((current / total) * 100);
        const barLength = 20;
        const filled = Math.floor((current / total) * barLength);
        const empty = barLength - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `[${bar}] ${percentage}%`;
    }
}

module.exports = MinimalReporter;
