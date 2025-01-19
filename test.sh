#!/bin/bash
# Integration Testing Script

echo "=== Integration Test: Player Registration ==="
dfx canister call galaxy register_player '("TestPlayer")'
dfx canister call galaxy get_player

echo "=== Integration Test: Create and Claim Planet ==="
dfx canister call galaxy create_planet '("TestPlanet", 1:nat64)'
dfx canister call galaxy claim_planet '(1:nat64)'

echo "=== Integration Test: Build Shipyard and Scout ==="
dfx canister call galaxy build_structure '(1:nat64, variant { Shipyard })'
dfx canister call galaxy build_ship '(1:nat64, variant { Scout })'

echo "=== Integration Test: Tick Operations ==="
dfx canister call galaxy start_tick
sleep 5
dfx canister call galaxy get_tick_count
dfx canister call galaxy stop_tick

echo "=== Integration Test Complete ==="
