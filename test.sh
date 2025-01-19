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
run_command "dfx canister call galaxy remove_star_system '(3:nat64)'" || echo "No star system to remove"

# Player Registration
log "Player Registration Test"
run_command 'dfx canister call galaxy register_player "(\"TestPlayer\")" || true'
run_command 'dfx canister call galaxy get_player'

# Generate a Star System
log "Generating Star System"
star_system_output=$(run_command 'dfx canister call galaxy generate_star_system "(\"Test System\")"')
star_system_id=$(echo "$star_system_output" | grep -oE '[0-9]+')
echo "Generated Star System ID: $star_system_id"

# Create a Planet
log "Creating Planet"
planet_output=$(run_command "dfx canister call galaxy create_planet \"(\\\"TestPlanet\\\", $star_system_id:nat64)\"")
planet_id=$(echo "$planet_output" | grep -oE '[0-9]+')
echo "Created Planet ID: $planet_id"

# Update Planet Coordinates
log "Updating Planet Coordinates"
run_command "dfx canister call galaxy update_planet_coordinates \"($planet_id:nat64, record { x = 50.0; y = 50.0 })\""

# Fleet Management
log "Fleet Management Test"
fleet_output=$(run_command "dfx canister call galaxy create_fleet")
fleet_id=$(echo "$fleet_output" | grep -oE '[0-9]+')
echo "Created Fleet ID: $fleet_id"

run_command "dfx canister call galaxy move_fleet \"($fleet_id:nat64, record { x = 100.0; y = 100.0 })\""
run_command "dfx canister call galaxy remove_fleet \"($fleet_id:nat64)\""

# Building Management
log "Building Management Test"
building_output=$(run_command "dfx canister call galaxy build_structure \"($planet_id:nat64, variant { Shipyard })\"")
building_id=$(echo "$building_output" | grep -oE '[0-9]+')
echo "Built Structure ID: $building_id"

run_command "dfx canister call galaxy move_building \"($building_id:nat64, record { x = 200.0; y = 200.0 })\""
run_command "dfx canister call galaxy remove_building \"($building_id:nat64)\""

# Nearby Queries
log "Nearby Queries Test"
run_command "dfx canister call galaxy nearby_planets \"(0.0, 0.0, 100.0:float64)\""
run_command "dfx canister call galaxy nearby_fleets \"(0.0, 0.0, 100.0:float64)\""
run_command "dfx canister call galaxy nearby_buildings \"(0.0, 0.0, 100.0:float64)\""

# RStar Features
log "RStar Features Test"
run_command "dfx canister call galaxy planets_in_area \"(record { lower = record { x = 0.0; y = 0.0 }; upper = record { x = 100.0; y = 100.0 } })\""
run_command "dfx canister call galaxy nearest_star_system \"(50.0, 50.0)\""

log "Integration Test Complete"
