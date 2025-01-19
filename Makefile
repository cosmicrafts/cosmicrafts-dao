# Makefile
build:
	cargo build --target wasm32-unknown-unknown --release -p galaxy
	candid-extractor target/wasm32-unknown-unknown/release/galaxy.wasm > galaxy.did
	dfx canister install galaxy