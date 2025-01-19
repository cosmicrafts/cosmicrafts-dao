#!/bin/bash
# Integration Test Script for Cosmicrafts DAO with Data Cleanup

set -e # Exit on errors

# Helper functions
log() { echo "=== $1 ==="; }
run_command() {
    echo "Running: $1"
    output=$(eval "$1" 2>&1)
    if [ $? -ne 0 ]; then
        echo "Error: $output"
        exit 1
    fi
    echo "$output"
    echo "$output" # Return output for ID extraction
}

# Clean up old data (if applicable)
log "Cleaning up old data"
run_command "dfx build"
run_command "candid-extractor target/wasm32-unknown-unknown/release/galaxy.wasm > galaxy.did"
run_command "dfx deploy"