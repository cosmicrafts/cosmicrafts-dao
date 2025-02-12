#!/bin/bash

set -e  # Exit immediately if a command fails

# NNS install
echo "Installing NNS..."
dfx nns install
dfx deploy backend

# [To-do] Send ICP to default wallet


# Stake neuron with 10 ICP and extract Neuron ID
echo "Staking neuron..."
quill --pem-file identity.pem neuron-stake --name "cosmic" --amount 100 > msg.json
IC_URL=http://127.0.0.1:8080 quill send msg.json --insecure-local-dev-mode --yes | tee output.log

# Extract Neuron ID from output
NEURON_ID=$(grep -oP 'Successfully staked ICP in neuron \K[0-9]+' output.log)

if [ -z "$NEURON_ID" ]; then
    echo "❌ Failed to extract Neuron ID. Check the output manually."
    exit 1
fi

echo "✅ Extracted Neuron ID: $NEURON_ID"

# Set 1-year dissolve delay
echo "Setting dissolve delay for Neuron $NEURON_ID..."
quill --pem-file identity.pem neuron-manage "$NEURON_ID" --additional-dissolve-delay-seconds 31536000 > msg.json
IC_URL=http://127.0.0.1:8080 quill send msg.json --insecure-local-dev-mode --yes

# Top up canister wallet with 50 ICP
echo "Topping up canister..."
dfx ledger top-up bnz7o-iuaaa-aaaaa-qaaaa-cai --amount 50

# Deposit cycles into multiple canisters
for canister in bkyz2-fmaaa-aaaaa-qaaaq-cai qaa6y-5yaaa-aaaaa-aaafa-cai; do
  echo "Transferring cycles to $canister..."
  dfx canister deposit-cycles 200000000000000 $canister
done

# Prepare NNS root
echo "Preparing NNS root..."
dfx sns prepare-canisters add-nns-root bkyz2-fmaaa-aaaaa-qaaaq-cai

# Submit SNS proposal using extracted Neuron ID
echo "Submitting SNS proposal with Neuron ID: $NEURON_ID..."
dfx sns propose --neuron-id "$NEURON_ID" sns_init.yaml

echo "✅ All tasks completed successfully!"
