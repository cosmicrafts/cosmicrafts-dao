# Makefile
build:
	cargo build --target wasm32-unknown-unknown --release -p backend
	cargo build --target wasm32-unknown-unknown --release -p game
	candid-extractor target/wasm32-unknown-unknown/release/backend.wasm > backend.did