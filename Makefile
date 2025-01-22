# Makefile
build:
	cargo build --target wasm32-unknown-unknown --release -p backend
	candid-extractor target/wasm32-unknown-unknown/release/backend.wasm > backend.did
	dfx canister install backend