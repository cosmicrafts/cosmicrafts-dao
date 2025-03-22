#!/usr/bin/env python3
import subprocess
import json
import time

# Canister IDs
BACKEND_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai"
MARKETPLACE_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai"

def run_command(command, silent=False):
    """Execute a shell command and return its output."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if not silent:
            print(result.stdout)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(f"Error message: {e.stderr}")
        return None

def get_user_identity():
    """Get the current dfx identity principal."""
    print("🔍 Getting user identity...")
    principal = run_command("dfx identity get-principal", silent=True).strip()
    print(f"✅ Current identity: {principal}")
    return principal

def register_nft_collection():
    """Register the backend canister as an NFT collection in the marketplace."""
    print(f"\n🚀 Registering NFT canister {BACKEND_CANISTER_ID} in the marketplace...")
    
    # Call the registerCollection function in the marketplace canister
    command = f'dfx canister call {MARKETPLACE_CANISTER_ID} registerCollection "principal \\"{BACKEND_CANISTER_ID}\\""'
    result = run_command(command)
    
    if "variant { ok }" in result:
        print(f"✅ NFT canister successfully registered in the marketplace!")
    else:
        print(f"⚠️ Registration result: {result}")
    
    return result

def mint_nft_chest(user_principal, quality):
    """Mint an NFT chest with the specified quality for the user using admin function."""
    print(f"\n🔨 Minting NFT chest with quality {quality}...")
    
    # Call the admin function with MintChest in the backend canister
    command = f'dfx canister call {BACKEND_CANISTER_ID} admin "(variant {{ MintChest = record {{ principal \\"{user_principal}\\"; {quality} : nat; }} }})"'
    result = run_command(command)
    
    if "true" in result:
        # Extract token ID from result
        # Format is like: (true, "NFT minted. Transaction ID: 123")
        token_id = None
        try:
            token_id_part = result.split("Transaction ID: ")[1].split('"')[0]
            token_id = int(token_id_part)
            print(f"✅ Successfully minted NFT chest with token ID: {token_id}")
        except:
            print(f"✅ NFT minted successfully, but couldn't extract token ID from: {result}")
            return None
        return token_id
    else:
        print(f"❌ Failed to mint NFT: {result}")
        return None

def list_nft(user_principal, token_id, price):
    """List an NFT on the marketplace using the non-custodial model."""
    print(f"\n📝 Listing NFT with token ID {token_id} for {price} tokens...")
    
    # Call the listNFT function in the marketplace canister
    command = f'dfx canister call {MARKETPLACE_CANISTER_ID} listNFT "(principal \\"{BACKEND_CANISTER_ID}\\", {token_id}, {price})"'
    result = run_command(command)
    
    if result and "variant { ok" in result:
        try:
            listing_id = result.split("variant { ok = ")[1].split(" }")[0]
            print(f"✅ NFT successfully listed with listing ID: {listing_id}")
            return listing_id
        except:
            print(f"✅ NFT listed successfully, but couldn't extract listing ID from: {result}")
            return None
    else:
        if result:
            print(f"❌ Failed to list NFT: {result}")
        else:
            print(f"❌ Failed to list NFT: No result returned")
        return None

def main():
    print("=" * 50)
    print("🚀 NFT & Marketplace Interaction Script")
    print("=" * 50)
    
    # 1. Get user identity
    user_principal = get_user_identity()
    
    # 2. Register NFT collection
    register_nft_collection()
    
    # 3. Mint 4 NFT chests with different qualities
    nft_qualities = [1, 2, 3, 4]
    minted_tokens = []
    
    for quality in nft_qualities:
        token_id = mint_nft_chest(user_principal, quality)
        if token_id:
            minted_tokens.append((token_id, quality))
        time.sleep(1)  # Small delay between mints
    
    # 4. List the minted NFTs using non-custodial model
    if minted_tokens:
        print("\n📋 Listing NFTs on the marketplace...")
        listed_tokens = []
        
        for token_id, quality in minted_tokens:
            # Price based on quality (just an example)
            price = quality * 100_000_000  # Higher quality = higher price
            listing_id = list_nft(user_principal, token_id, price)
            if listing_id:
                listed_tokens.append((token_id, quality, listing_id))
            time.sleep(1)  # Small delay between listings
            
        print(f"\n✅ Successfully listed {len(listed_tokens)} out of {len(minted_tokens)} NFTs")
        
        # Display summary of listed NFTs
        if listed_tokens:
            print("\n📊 Listed NFTs Summary:")
            for token_id, quality, listing_id in listed_tokens:
                print(f"   Token ID: {token_id} (Quality: {quality}) - Listing ID: {listing_id}")
    else:
        print("❌ No NFTs were successfully minted. Cannot proceed with listing.")
    
    print("\n✅ Script execution completed!")

if __name__ == "__main__":
    main() 