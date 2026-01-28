#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# Script to remove verbose console.log statements from test files
# Keeps only error/failure logging

echo "Removing verbose test logging..."

# Find all test files
find test/input-parsing-and-generation -name "*.test.js" -o -name "*.property.test.js" | while read file; do
    echo "Processing: $file"
    
    # Remove common verbose logging patterns
    # Keep the file if sed makes changes
    sed -i.bak \
        -e '/console\.log.*🧪 Test #/d' \
        -e '/console\.log.*📍 Test Suite:/d' \
        -e '/console\.log.*🔍 Testing/d' \
        -e '/console\.log.*✅.*passed/d' \
        -e '/console\.log.*✅.*correct/d' \
        -e '/console\.log.*✅.*working/d' \
        -e '/console\.log.*✅.*validated/d' \
        -e '/console\.log.*📝 Validates:/d' \
        -e '/console\.log.*🚀 Starting/d' \
        -e '/console\.log.*📋 Testing:/d' \
        -e '/console\.log.*🔧 Configuration:/d' \
        -e '/console\.log.*✅.*environment ready/d' \
        -e '/console\.log.*✅ Property.*validated:/d' \
        "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
done

echo "Done! Verbose logging removed from test files."
