#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Analyze Test Performance
 * 
 * Reads test results from JSON and generates performance report.
 * Usage: npm run test:perf
 */

import fs from 'fs';
import path from 'path';

const SLOW_TEST_THRESHOLD = 1000; // 1 second
const VERY_SLOW_THRESHOLD = 5000; // 5 seconds

function analyzeTestResults(resultsPath) {
    if (!fs.existsSync(resultsPath)) {
        console.error('❌ Test results file not found:', resultsPath);
        console.error('   Run: npm test -- --reporter json > test-results.json');
        process.exit(1);
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    // Extract test data
    const tests = results.tests || [];
    const stats = results.stats || {};
    
    // Categorize tests by speed
    const slowTests = tests.filter(t => t.duration >= SLOW_TEST_THRESHOLD);
    const verySlowTests = tests.filter(t => t.duration >= VERY_SLOW_THRESHOLD);
    const fastTests = tests.filter(t => t.duration < SLOW_TEST_THRESHOLD);
    
    // Calculate statistics
    const totalDuration = tests.reduce((sum, t) => sum + (t.duration || 0), 0);
    const avgDuration = totalDuration / tests.length;
    
    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('📊 Test Performance Report');
    console.log('='.repeat(80));
    
    console.log('\n📈 Overall Statistics:');
    console.log(`   Total Tests: ${tests.length}`);
    console.log(`   Passing: ${stats.passes || 0}`);
    console.log(`   Failing: ${stats.failures || 0}`);
    console.log(`   Pending: ${stats.pending || 0}`);
    console.log(`   Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    console.log(`   Average Duration: ${Math.round(avgDuration)}ms`);
    
    console.log('\n⚡ Speed Distribution:');
    console.log(`   Fast (<1s): ${fastTests.length} tests (${((fastTests.length / tests.length) * 100).toFixed(1)}%)`);
    console.log(`   Slow (1-5s): ${slowTests.length - verySlowTests.length} tests (${(((slowTests.length - verySlowTests.length) / tests.length) * 100).toFixed(1)}%)`);
    console.log(`   Very Slow (>5s): ${verySlowTests.length} tests (${((verySlowTests.length / tests.length) * 100).toFixed(1)}%)`);
    
    if (verySlowTests.length > 0) {
        console.log('\n🐌 Very Slow Tests (>5s):');
        verySlowTests
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)
            .forEach((test, i) => {
                console.log(`   ${i + 1}. ${test.duration}ms - ${test.fullTitle}`);
            });
    }
    
    if (slowTests.length > 0 && verySlowTests.length < 10) {
        console.log('\n⚠️  Slow Tests (1-5s):');
        slowTests
            .filter(t => t.duration < VERY_SLOW_THRESHOLD)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)
            .forEach((test, i) => {
                console.log(`   ${i + 1}. ${test.duration}ms - ${test.fullTitle}`);
            });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (verySlowTests.length > 0) {
        console.log('   • Investigate very slow tests (>5s) - they may be hanging or inefficient');
    }
    if (slowTests.length > tests.length * 0.2) {
        console.log('   • More than 20% of tests are slow - consider optimization');
    }
    if (avgDuration > 500) {
        console.log('   • Average test duration is high - consider reducing test complexity');
    }
    if (slowTests.length === 0) {
        console.log('   ✅ All tests are fast! Great job!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('');
}

// Run analysis
const resultsPath = process.argv[2] || 'test-results.json';
analyzeTestResults(resultsPath);
