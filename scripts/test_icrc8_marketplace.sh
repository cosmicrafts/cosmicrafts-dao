#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display section titles
display_title() {
    echo -e "\n${BLUE}===================================================================${NC}"
    echo -e "${BLUE}                      $1${NC}"
    echo -e "${BLUE}===================================================================${NC}"
}

# Function to run a dfx command and display the result
run_command() {
    echo -e "\n${YELLOW}> $1${NC}"
    eval "$1"
    local STATUS=$?
    local OUTPUT=$?
    if [ $STATUS -eq 0 ]; then
        echo -e "${GREEN}✅ Command succeeded${NC}"
    else
        echo -e "${RED}❌ Command failed with status $STATUS${NC}"
    fi
    return $STATUS
}

# Function to extract first minted token ID from the output
extract_token_id() {
    local output=$1
    # Extract first token ID from mintDeck response
    local token_id=$(echo "$output" | grep -o 'vec { [^}]*' | grep -o '[0-9]\+ : nat' | head -1 | grep -o '[0-9]\+')
    echo "$token_id"
}

# Function to extract NFT owner from response
extract_owner() {
    local output=$1
    # Extract owner principal from response
    local owner=$(echo "$output" | grep -o 'owner = principal "[^"]*"' | head -1 | grep -o '"[^"]*"' | tr -d '"')
    echo "$owner"
}

# Function to extract ask ID from response
extract_ask_id() {
    local output=$1
    # Extract ask ID from createNFTAsk response
    local ask_id=$(echo "$output" | grep -o 'ok = [0-9]\+' | grep -o '[0-9]\+')
    echo "$ask_id"
}

# Store canister IDs
BACKEND_ID=$(dfx canister id backend)
MARKETPLACE_ID=$(dfx canister id marketplace)

echo "Backend canister ID: $BACKEND_ID"
echo "Marketplace canister ID: $MARKETPLACE_ID"
PRINCIPAL_ID=$(dfx identity get-principal)
echo "Your principal ID: $PRINCIPAL_ID"

# Set up the testing workflow
display_title "ICRC-8 Marketplace Testing Workflow"

# 1. Check marketplace stats to see current state
display_title "1. Checking Marketplace Stats"
MARKET_STATS=$(dfx canister call $MARKETPLACE_ID getMarketplaceStats '()')
echo "$MARKET_STATS"

# 2. Register the backend canister as an approved token
display_title "2. Registering Backend Canister with Marketplace"
REGISTER_RESULT=$(dfx canister call $MARKETPLACE_ID addApprovedToken "(principal \"$BACKEND_ID\")")
echo "$REGISTER_RESULT"

# Check if there was an unauthorized error and handle it
if [[ "$REGISTER_RESULT" == *"Unauthorized"* ]]; then
    echo -e "${YELLOW}⚠️  Registration requires admin rights. Continuing with the test...${NC}"
fi

# 3. Check if it was added by getting marketplace stats again
display_title "3. Verifying Registration"
UPDATED_STATS=$(dfx canister call $MARKETPLACE_ID getMarketplaceStats '()')
echo "$UPDATED_STATS"

# 4. Mint an NFT deck using the backend's mintDeck function
display_title "4. Minting NFT Deck"
MINT_RESULT=$(dfx canister call $BACKEND_ID mintDeck '()')
echo "$MINT_RESULT"

# Check if minting was successful
if [[ "$MINT_RESULT" == *"Deck minted and stored successfully"* ]]; then
    echo -e "${GREEN}✅ Deck minted successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Minting result status unclear, continuing...${NC}"
fi

# 5. Get the minted NFTs
display_title "5. Viewing Minted NFTs"
NFT_RESULT=$(dfx canister call $BACKEND_ID getNFTs "(principal \"$PRINCIPAL_ID\")")
echo "$NFT_RESULT"

# Extract token IDs from the result
TOKEN_ID_1=$(echo "$NFT_RESULT" | grep -o 'record { [0-9]\+ : nat;' | head -1 | grep -o '[0-9]\+')
TOKEN_ID_2=$(echo "$NFT_RESULT" | grep -o 'record { [0-9]\+ : nat;' | head -2 | tail -1 | grep -o '[0-9]\+')

echo -e "${GREEN}Found Token IDs: $TOKEN_ID_1, $TOKEN_ID_2${NC}"

# If no token IDs found, use default values
if [ -z "$TOKEN_ID_1" ]; then
    TOKEN_ID_1=1
    echo -e "${YELLOW}⚠️ Could not extract first token ID, using default value (1)${NC}"
fi

if [ -z "$TOKEN_ID_2" ]; then
    TOKEN_ID_2=2
    echo -e "${YELLOW}⚠️ Could not extract second token ID, using default value (2)${NC}"
fi

# 6. Create an ask (listing) for one of the NFTs
display_title "6. Creating Ask (Listing)"
echo -e "${YELLOW}Creating ask for token ID: $TOKEN_ID_1${NC}"
ASK_RESULT=$(dfx canister call $MARKETPLACE_ID createNFTAsk "(principal \"$BACKEND_ID\", $TOKEN_ID_1, 1_000_000_000)")
echo "$ASK_RESULT"

# Check if we got a TokenSpecNotSupported error
if [[ "$ASK_RESULT" == *"TokenSpecNotSupported"* ]]; then
    echo -e "${YELLOW}⚠️  Backend canister not approved. This might be because we don't have admin rights.${NC}"
    echo -e "${YELLOW}⚠️  In a real setup, make sure the backend canister is approved by an admin.${NC}"
fi

# Try to extract ask ID from successful response
ASK_ID=$(echo "$ASK_RESULT" | grep -o "ok = [0-9]\+" | grep -o "[0-9]\+")
if [ -n "$ASK_ID" ]; then
    echo -e "${GREEN}✅ Ask created with ID: $ASK_ID${NC}"
else
    ASK_ID=1  # Use a default if creation failed
    echo -e "${YELLOW}⚠️ Could not create ask or extract ask ID, using default value (1) for future steps${NC}"
fi

# 7. Get all active asks to see the listing
display_title "7. Viewing Active Asks"
ACTIVE_ASKS=$(dfx canister call $MARKETPLACE_ID getAllActiveAsks '(100, 0)')
echo "$ACTIVE_ASKS"

# 8. Try creating an advanced ask with proper record syntax
display_title "8. Creating Advanced Ask"
echo -e "${YELLOW}Creating advanced ask for token ID: $TOKEN_ID_2${NC}"

# Use the correct Candid syntax for records
ADVANCED_ASK_RESULT=$(dfx canister call $MARKETPLACE_ID createAdvancedNFTAsk "(principal \"$BACKEND_ID\", $TOKEN_ID_2, 2_000_000_000, record { broker = null; allowList = null; startDate = null; endDate = null; feeSchema = null; memo = null })")
echo "$ADVANCED_ASK_RESULT"

# 9. Create an unsolicited offer automatically
display_title "9. Creating Unsolicited Offer"
# We need target owner and token ID - using our own principal and token ID for test purposes
echo -e "${YELLOW}Creating unsolicited offer for token ID: $TOKEN_ID_1 to owner: $PRINCIPAL_ID${NC}"

OFFER_RESULT=$(dfx canister call $MARKETPLACE_ID createUnsolicitedOffer "(principal \"$BACKEND_ID\", $TOKEN_ID_1, 500_000_000, principal \"$PRINCIPAL_ID\")")
echo "$OFFER_RESULT"

# 10. Buy an NFT automatically if we have a valid ask ID
display_title "10. Buying an NFT"
if [ -n "$ASK_ID" ] && [ "$ASK_ID" != "1" ]; then
    echo -e "${YELLOW}Buying NFT with ask ID: $ASK_ID${NC}"
    BUY_RESULT=$(dfx canister call $MARKETPLACE_ID buyNFT "($ASK_ID)")
    echo "$BUY_RESULT"
else
    echo -e "${YELLOW}Skipping NFT purchase because no valid ask ID was found${NC}"
fi

# 11. Check marketplace stats again to see the changes
display_title "11. Final Marketplace Stats"
FINAL_STATS=$(dfx canister call $MARKETPLACE_ID getMarketplaceStats '()')
echo "$FINAL_STATS"

# 12. End an ask if we have a valid ask ID
display_title "12. Ending an Ask"
if [ -n "$ASK_ID" ] && [ "$ASK_ID" != "1" ]; then
    echo -e "${YELLOW}Ending ask with ID: $ASK_ID${NC}"
    END_RESULT=$(dfx canister call $MARKETPLACE_ID icrc8_ask "(vec { opt variant { end_ask = $ASK_ID } })")
    echo "$END_RESULT"
else
    echo -e "${YELLOW}Skipping ask ending because no valid ask ID was found${NC}"
fi

# Display testing summary
display_title "ICRC-8 Marketplace Testing Complete"
echo -e "${GREEN}The testing workflow has completed automatically.${NC}"
echo -e "During the test, we:"
echo -e "- Attempted to register the backend canister as an approved token"
echo -e "- Minted NFTs using the backend's mintDeck function"
echo -e "- Retrieved token IDs: $TOKEN_ID_1, $TOKEN_ID_2"
echo -e "- Attempted to create NFT listings using both simple and advanced methods"
echo -e "- Viewed active listings in the marketplace"
echo -e "- Attempted to create an unsolicited offer"
if [ -n "$ASK_ID" ] && [ "$ASK_ID" != "1" ]; then
    echo -e "- Attempted to buy an NFT with ask ID: $ASK_ID"
    echo -e "- Attempted to end an ask with ID: $ASK_ID"
fi

echo -e "\n${YELLOW}Note: Some operations might have failed depending on your canister's state and implementation.${NC}"
echo -e "${YELLOW}This is expected if you don't have admin rights or if the backend canister wasn't previously approved.${NC}"
echo -e "${YELLOW}In a production environment, ensure that the backend canister is approved by an admin before testing.${NC}" 