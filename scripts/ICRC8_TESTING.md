# ICRC-8 Marketplace Testing Guide

This guide explains how to test the integration between the ICRC-8 marketplace and your backend canister that implements ICRC-7 (NFTs) and ICRC-1 (Stardust tokens).

## Prerequisites

Before using the testing script, make sure you have:

1. Python 3.8 or later installed
2. IC SDK agent library (`ic-py` package)
3. Your local or IC deployment of both canisters up and running
4. Canister IDs for both the backend and marketplace canisters

Install the required Python packages:

```bash
pip install ic-py 
```

## Script Overview

The `icrc8_marketplace_test.py` script provides a command-line interface to test various marketplace operations:

- Minting NFTs (creating test NFT deck)
- Viewing NFTs owned by a user
- Registering a collection with the marketplace
- Creating asks (listings) for NFTs
- Creating advanced asks with additional options
- Viewing active listings
- Buying NFTs
- Creating unsolicited offers
- Encumbering and unencumbering asks
- Viewing marketplace statistics

## Basic Usage

```bash
python3 icrc8_marketplace_test.py --backend-id <backend_canister_id> --marketplace-id <marketplace_canister_id> --action <action_name> [additional_args]
```

## Example Workflow

Below is a typical testing workflow:

### 1. Mint NFTs

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action mint-nft
```

### 2. View Your NFTs

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action get-nfts
```

### 3. Register Your Backend Canister with the Marketplace

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action add-approved-token --collection-id bkyz2-fmaaa-aaaaa-qaaaq-cai
```

### 4. Create an Ask (Listing)

Replace `<token_id>` with the ID of one of your NFTs:

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action create-ask --collection-id bkyz2-fmaaa-aaaaa-qaaaq-cai --token-id <token_id> --price 1000000000
```

### 5. View Active Asks

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action get-asks
```

### 6. Buy an NFT

Replace `<ask_id>` with the ID of an active ask:

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action buy-nft --ask-id <ask_id>
```

### 7. Create an Unsolicited Offer

Replace `<token_id>` with the ID of the NFT and `<owner_principal>` with the owner's principal ID:

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action unsolicited-offer --collection-id bkyz2-fmaaa-aaaaa-qaaaq-cai --token-id <token_id> --price 1000000000 --recipient <owner_principal>
```

### 8. View Marketplace Statistics

```bash
python3 icrc8_marketplace_test.py --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action get-stats
```

## Using an Identity

If you need to use a specific identity instead of anonymous:

```bash
python3 icrc8_marketplace_test.py --pem /path/to/your/identity.pem --backend-id bkyz2-fmaaa-aaaaa-qaaaq-cai --marketplace-id be2us-64aaa-aaaaa-qaabq-cai --action <action_name>
```

## Advanced Operations

For more complex operations like encumbering asks or creating advanced asks with custom parameters, see the script's help:

```bash
python3 icrc8_marketplace_test.py --help
```

## Troubleshooting

- Make sure your canister IDs are correct
- Ensure that your backend canister implements the ICRC-7 standard properly
- Check that the marketplace canister implements ICRC-8 standard features
- Verify that the candid files are correctly located or provide the proper paths
- If you're getting connection errors, ensure your `dfx` replica is running

## Notes on Implementation

- The script assumes that your backend canister has a `mintDeck()` method that creates NFTs
- For successful NFT listings, the backend canister must be registered as an approved token on the marketplace
- This script is designed for testing purposes and may need adjustments for production use 