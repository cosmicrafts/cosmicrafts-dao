#!/bin/bash

set -e  # Exit immediately if a command fails

# Track progress
STAKED=false
DISSOLVE_SET=false
NEURON_ID=""

log() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

error_handler() {
  log "❌ ERROR: $1"
  exit 1
}

get_identity_pem() {
  IDENTITY_NAME=$(dfx identity whoami)
  IDENTITY_PEM="$HOME/.config/dfx/identity/$IDENTITY_NAME/identity.pem"

  if [ ! -f "$IDENTITY_PEM" ]; then
    error_handler "❌ Identity file not found for $IDENTITY_NAME at $IDENTITY_PEM"
  fi

  echo "$IDENTITY_PEM"
}

install_nns() {
  log "Installing NNS..."
  dfx nns install
  ./bin/icp_transfer --to "$(dfx ledger account-id)" --amount 10000
  dfx deploy backend
}

stake_neuron() {
  if [ "$STAKED" = true ]; then
    log "✅ Neuron already staked: $NEURON_ID"
    return
  fi

  IDENTITY_PEM=$(get_identity_pem)
  log "Using identity: $(dfx identity whoami) ($IDENTITY_PEM)"
  
  log "Staking neuron..."
  quill --pem-file "$IDENTITY_PEM" neuron-stake --name "cosmic" --amount 100 > msg.json
  IC_URL=http://127.0.0.1:8080 quill send msg.json --insecure-local-dev-mode --yes | tee output.log

  NEURON_ID=$(grep -oP 'Successfully staked ICP in neuron \K[0-9]+' output.log || echo "")

  if [ -z "$NEURON_ID" ]; then
    error_handler "❌ Failed to extract Neuron ID"
  fi

  log "✅ Neuron ID: $NEURON_ID"
  STAKED=true
}

set_dissolve_delay() {
  stake_neuron  # Ensure neuron is staked

  if [ "$DISSOLVE_SET" = true ]; then
    log "✅ Dissolve delay already set for Neuron ID: $NEURON_ID"
    return
  fi

  IDENTITY_PEM=$(get_identity_pem)
  log "Using identity: $(dfx identity whoami) ($IDENTITY_PEM)"

  log "Setting 1-year dissolve delay for Neuron $NEURON_ID..."
  quill --pem-file "$IDENTITY_PEM" neuron-manage "$NEURON_ID" --additional-dissolve-delay-seconds 31536000 > msg.json
  IC_URL=http://127.0.0.1:8080 quill send msg.json --insecure-local-dev-mode --yes

  DISSOLVE_SET=true
}

top_up_canister() {
  log "Topping up canister with 50 ICP..."
  dfx ledger top-up bnz7o-iuaaa-aaaaa-qaaaa-cai --amount 50
}

deposit_cycles() {
  log "Depositing cycles..."
  for canister in bkyz2-fmaaa-aaaaa-qaaaq-cai qaa6y-5yaaa-aaaaa-aaafa-cai; do
    log "Transferring cycles to $canister..."
    dfx canister deposit-cycles 200000000000000 $canister
  done
}

prepare_nns_root() {
  log "Preparing NNS root..."
  dfx sns prepare-canisters add-nns-root bkyz2-fmaaa-aaaaa-qaaaq-cai
}

submit_sns_proposal() {
  set_dissolve_delay  # Ensure neuron is staked & dissolve delay is set

  log "Submitting SNS proposal with Neuron ID: $NEURON_ID..."
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
    9) log "Exiting script. Goodbye!"; exit 0 ;;
    *) log "❌ Invalid option. Please try again." ;;
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
