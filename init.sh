#!/bin/bash

set -e  # Exit immediately if a command fails

# Track progress
STAKED=false
DISSOLVE_SET=false
NEURON_ID=""

install_nns() {
  echo "Installing NNS..."
  dfx nns install
  dfx deploy backend
}

stake_neuron() {
  if [ "$STAKED" = true ]; then
    echo "✅ Neuron already staked with ID: $NEURON_ID"
    return
  fi

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
  STAKED=true
}

set_dissolve_delay() {
  stake_neuron  # Ensure neuron is staked

  if [ "$DISSOLVE_SET" = true ]; then
    echo "✅ Dissolve delay already set for Neuron ID: $NEURON_ID"
    return
  fi

  echo "Setting 1-year dissolve delay for Neuron $NEURON_ID..."
  quill --pem-file identity.pem neuron-manage "$NEURON_ID" --additional-dissolve-delay-seconds 31536000 > msg.json
  IC_URL=http://127.0.0.1:8080 quill send msg.json --insecure-local-dev-mode --yes

  DISSOLVE_SET=true
}

top_up_canister() {
  echo "Topping up canister with 50 ICP..."
  dfx ledger top-up bnz7o-iuaaa-aaaaa-qaaaa-cai --amount 50
}

deposit_cycles() {
  echo "Depositing cycles..."
  for canister in bkyz2-fmaaa-aaaaa-qaaaq-cai qaa6y-5yaaa-aaaaa-aaafa-cai; do
    echo "Transferring cycles to $canister..."
    dfx canister deposit-cycles 200000000000000 $canister
  done
}

prepare_nns_root() {
  echo "Preparing NNS root..."
  dfx sns prepare-canisters add-nns-root bkyz2-fmaaa-aaaaa-qaaaq-cai
}

submit_sns_proposal() {
  set_dissolve_delay  # Ensure neuron is staked & dissolve delay is set

  echo "Submitting SNS proposal with Neuron ID: $NEURON_ID..."
  dfx sns propose --neuron-id "$NEURON_ID" sns_init.yaml
}

run_from_step() {
  case $1 in
    1) install_nns; stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    2) stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    3) set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    4) top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    5) deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    6) prepare_nns_root; submit_sns_proposal ;;
    7) submit_sns_proposal ;;
    8) install_nns; stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    9) echo "Exiting script. Goodbye!"; exit 0 ;;
    *) echo "❌ Invalid option. Please try again." ;;
  esac
}

while true; do
  echo ""
  echo "=============================="
  echo "  Select an Action to Perform"
  echo "=============================="
  echo "1) Install NNS & Deploy Backend"
  echo "2) Stake Neuron (100 ICP)"
  echo "3) Set 1-Year Dissolve Delay"
  echo "4) Top Up Canister with 50 ICP"
  echo "5) Deposit Cycles into Canisters"
  echo "6) Prepare NNS Root"
  echo "7) Submit SNS Proposal"
  echo "8) Run All Steps"
  echo "9) Exit"
  echo "=============================="
  read -p "Enter your choice: " choice

  run_from_step "$choice"
done
