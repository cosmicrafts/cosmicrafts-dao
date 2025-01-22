#!/bin/bash

# Prompt for the number of players to register
read -p "Enter the number of players to register: " num_players

# Validate input
if ! [[ "$num_players" =~ ^[1-9][0-9]*$ ]]; then
  echo "Invalid input. Please enter a positive integer."
  exit 1
fi

# Loop through the number of players
for ((i = 1; i <= num_players; i++)); do
  echo "Registering player$i..."

  # Call the signup method with the appropriate identity
  dfx canister call backend signup --identity "player$i" \
    "(\"player$i\", $i : nat32, null, \"en\")"

  # Check if the command succeeded
  if [ $? -eq 0 ]; then
    echo "Player$i registered successfully!"
  else
    echo "Failed to register player$i."
    exit 1
  fi
done

echo "All players registered successfully!"