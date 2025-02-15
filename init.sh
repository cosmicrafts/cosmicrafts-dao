#!/bin/bash

set -e  # Exit immediately if a command fails

# Track progress
STAKED=false
DISSOLVE_SET=false
NEURON_ID=""
PARTICIPANT_COUNT=10  # Number of participants
ICP_PER_PARTICIPANT=1000000

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
  log "Installing NNS, Dapp and transferring ICP..."
  dfx nns install
  # Create participant identities and get account IDs
  log "Creating and funding participant accounts..."
  > participant_accounts.txt  # Reset file
  for (( i=0; i<PARTICIPANT_COUNT; i++ )); do
    PARTICIPANT="participant-$(printf "%03d" $i)"

    # Create identity if it doesn't exist
    dfx identity new --storage-mode=plaintext "$PARTICIPANT" 2>/dev/null || true
    dfx identity use "$PARTICIPANT"

    # Get the account ID
    ACCOUNT_ID=$(dfx ledger account-id)
    echo "$PARTICIPANT $ACCOUNT_ID" >> participant_accounts.txt

    log "✅ $PARTICIPANT -> $ACCOUNT_ID"

    # Transfer ICP to each participant
    dfx identity use default  # Back to default identity
    ./bin/icp_transfer --to "$ACCOUNT_ID" --amount 1020000  # 1,020,000 ICP
  done

  dfx identity use default  # Reset back to default
  log "✅ All participants funded."

  # ✅ Add back the ICP transfer call for default identity
  log "Sending 100,000 ICP to the default identity..."
  ./bin/icp_transfer --to "$(dfx ledger account-id)" --amount 100000

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

participate_sns() {
  log "🔄 Waiting for SNS Swap Canister ($SNS_SWAP_CANISTER_ID) to be ready..."
  
  # Maximum wait time: 5 minutes (300 seconds)
  MAX_WAIT_TIME=300
  WAIT_INTERVAL=10
  ELAPSED_TIME=0

  while true; do
    RESPONSE=$(dfx canister call "$SNS_SWAP_CANISTER_ID" get_state "(record {})" 2>&1)
    
    # Check if response contains valid lifecycle (instead of being null)
    if echo "$RESPONSE" | grep -q "lifecycle"; then
      log "✅ SNS Swap Canister is ready!"
      break
    fi

    # Timeout handling
    if [ "$ELAPSED_TIME" -ge "$MAX_WAIT_TIME" ]; then
      log "❌ ERROR: SNS Swap Canister is still not available after 5 minutes. Something might have gone wrong!"
      exit 1
    fi

    log "⏳ Canister not ready yet... retrying in $WAIT_INTERVAL seconds."
    sleep $WAIT_INTERVAL
    ELAPSED_TIME=$((ELAPSED_TIME + WAIT_INTERVAL))
  done

  log "🔄 Participating in SNS Sale..."
  SNS_SWAP_CANISTER_ID="b77ix-eeaaa-aaaaa-qaada-cai"
  log "✅ Using SNS Swap Canister ID: $SNS_SWAP_CANISTER_ID"

  while read -r line; do
    PARTICIPANT=$(echo "$line" | awk '{print $1}')
    
    log "🔹 Switching to identity: $PARTICIPANT"
    dfx identity use "$PARTICIPANT"

    PRINCIPAL_ID=$(dfx identity get-principal)
    log "✅ Principal ID: $PRINCIPAL_ID"

    SWAP_CANISTER_ACCOUNT_ID=$(dfx ledger account-id --of-canister "$SNS_SWAP_CANISTER_ID" --subaccount-from-principal "$PRINCIPAL_ID")
    log "✅ Derived Swap Canister Account ID: $SWAP_CANISTER_ACCOUNT_ID"

    BALANCE=$(dfx ledger balance | awk '{print $1}')
    MIN_REQUIRED_ICP=100000

    if (( $(echo "$BALANCE < $MIN_REQUIRED_ICP" | bc -l) )); then
      log "❌ ERROR: $PARTICIPANT has insufficient ICP balance ($BALANCE ICP). Needs at least $MIN_REQUIRED_ICP ICP!"
      exit 1
    fi
    log "✅ $PARTICIPANT has sufficient balance: $BALANCE ICP"

    ICP_PER_PARTICIPANT_E8S=10000000000000

    log "🎟️ Requesting SNS Sale Ticket..."
    RESPONSE=$(dfx canister call "$SNS_SWAP_CANISTER_ID" new_sale_ticket "(record {subaccount=null; amount_icp_e8s=${ICP_PER_PARTICIPANT_E8S}})")

    TICKET_CREATION_TIME=$(echo "$RESPONSE" | grep -oP 'creation_time = \K[0-9_]+' | tr -d '_')
    TICKET_ID=$(echo "$RESPONSE" | grep -oP 'ticket_id = \K[0-9_]+' | tr -d '_')

    if [[ -z "$TICKET_CREATION_TIME" || -z "$TICKET_ID" ]]; then
      log "❌ ERROR: Failed to get SNS sale ticket for $PARTICIPANT"
      log "📝 Full Response: $RESPONSE"
      exit 1
    fi
    log "✅ Ticket ($TICKET_ID) created with creation time: $TICKET_CREATION_TIME"

    log "💸 Sending ${ICP_PER_PARTICIPANT_E8S} e8s (100,000 ICP) to Swap Canister..."
    TRANSFER_RESPONSE=$(dfx ledger transfer --memo "$TICKET_ID" --amount 100000 "$SWAP_CANISTER_ACCOUNT_ID")

    if [[ $? -ne 0 ]]; then
      log "❌ ERROR: Failed to transfer ICP for $PARTICIPANT"
      log "📝 Transfer Response: $TRANSFER_RESPONSE"
      exit 1
    fi
    log "✅ $PARTICIPANT successfully sent ICP."

    log "🔄 Notifying SNS Swap about the payment..."
    NOTIFY_RESPONSE=$(dfx canister call "$SNS_SWAP_CANISTER_ID" refresh_buyer_tokens "(record {confirmation_text=null; buyer=\"$(dfx identity get-principal)\"})")

    if [[ $? -ne 0 ]]; then
      log "❌ ERROR: Failed to notify SNS Swap!"
      log "📝 Notify Response: $NOTIFY_RESPONSE"
      exit 1
    fi
    log "✅ Payment confirmed with SNS Swap."

  done < participant_accounts.txt

  dfx identity use default
  log "🎉 All participants have successfully joined the SNS Sale!"
}


run_from_step() {
  case $1 in
    1) install_nns; stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal; participate_sns ;;
    2) stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    3) set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    4) top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    5) deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    6) prepare_nns_root; submit_sns_proposal ;;
    7) submit_sns_proposal ;;
    8) install_nns; stake_neuron; set_dissolve_delay; top_up_canister; deposit_cycles; prepare_nns_root; submit_sns_proposal ;;
    9) log "Exiting script. Goodbye!"; exit 0 ;;
    10) participate_sns ;;
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
  echo "10) Participate in SNS Sale"
  echo "=============================="
  read -p "Enter your choice: " choice

  run_from_step "$choice"
done

