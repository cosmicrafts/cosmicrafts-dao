#!/usr/bin/env bash

set -euo pipefail

# SNS Canister IDs
CANISTERS=(
  "ajuq4-ruaaa-aaaaa-qaaga-cai"  # Governance
  "aovwi-4maaa-aaaaa-qaagq-cai"  # Index
  "ahw5u-keaaa-aaaaa-qaaha-cai"  # Ledger
  "aax3a-h4aaa-aaaaa-qaahq-cai"  # Root
  "c5kvi-uuaaa-aaaaa-qaaia-cai"  # Swap
)

# Amount of cycles to deposit (180T = 180000000000000 cycles)
CYCLE_AMOUNT=180000000000000

for CANISTER in "${CANISTERS[@]}"; do
    echo "💰 Depositing $CYCLE_AMOUNT cycles into $CANISTER..."
    dfx canister deposit-cycles "$CYCLE_AMOUNT" "$CANISTER"
done

echo "✅ Cycle deposits complete!"
