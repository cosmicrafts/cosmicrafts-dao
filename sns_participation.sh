#!/usr/bin/env bash

set -euo pipefail

# SNS Sale Canister
SNS_SALE_CANISTER_ID="b77ix-eeaaa-aaaaa-qaada-cai"

# Number of participants & ICP per participant
NUM_PARTICIPANTS="${1:-10}" # Default 10 participants
ICP_PER_PARTICIPANT="${2:-10}" # Default 10 ICP
ICP_PER_PARTICIPANT_E8S=$((ICP_PER_PARTICIPANT * 100000000)) # Convert to e8s

echo "🚀 Starting SNS Sale Participation for ${NUM_PARTICIPANTS} participants"

# Start from main identity
dfx identity use default
MAIN_IDENT=$(dfx identity whoami)

for (( i=0; i<NUM_PARTICIPANTS; i++ )); do
  PARTICIPANT="participant-$(printf "%03d" $i)"
  echo "🔄 Creating and using identity: $PARTICIPANT"

  dfx identity new --storage-mode=plaintext "$PARTICIPANT" 2>/dev/null || true
  dfx identity use "$PARTICIPANT"

  # Get account ID
  ACCOUNT_ID=$(dfx ledger account-id)
  echo "💰 Funding $PARTICIPANT ($ACCOUNT_ID) with ${ICP_PER_PARTICIPANT} ICP"
  dfx identity use "$MAIN_IDENT"
  dfx ledger transfer --memo 0 --icp "$((ICP_PER_PARTICIPANT * 2))" "$ACCOUNT_ID"
  dfx identity use "$PARTICIPANT"

  # Wait for balance to update
  while [[ "$(dfx ledger balance)" == "0.00000000 ICP" ]]; do sleep 1; done

  # ✅ Request ticket to participate in SNS sale
  echo "🎟️ Requesting sale ticket for $PARTICIPANT..."
  RESPONSE=$(dfx canister call "$SNS_SALE_CANISTER_ID" new_sale_ticket "(record {subaccount=null; amount_icp_e8s=${ICP_PER_PARTICIPANT_E8S}})")

  # Extract ticket creation time & ID
  TICKET_CREATION_TIME=$(echo "$RESPONSE" | grep -oP 'creation_time = \K[0-9_]+' | tr -d '_')
  TICKET_ID=$(echo "$RESPONSE" | grep -oP 'ticket_id = \K[0-9_]+' | tr -d '_')

  if [[ -z "$TICKET_CREATION_TIME" || -z "$TICKET_ID" ]]; then
    echo "❌ ERROR: Failed to get ticket for $PARTICIPANT"
    exit 1
  fi
  echo "✅ Ticket ($TICKET_ID) created with creation time $TICKET_CREATION_TIME"

  # ✅ Finalize participation by paying for the ticket
  echo "💸 Paying for SNS swap ticket..."
  dfx canister call "$SNS_SALE_CANISTER_ID" pay "(record {amount_icp_e8s=${ICP_PER_PARTICIPANT_E8S}; ticket_creation_time=${TICKET_CREATION_TIME}; ticket_id=${TICKET_ID}})"

  echo "✅ Participation successful for $PARTICIPANT"

done

# Restore original identity
dfx identity use "$MAIN_IDENT"
echo "🎉 All participants have joined the SNS sale!"
