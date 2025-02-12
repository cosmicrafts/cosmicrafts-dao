from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519
import base64

# 🔹 Your base64-encoded private key
private_key_base64 = "N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q=="

# 🔹 Decode base64
private_key_bytes = base64.b64decode(private_key_base64)

# 🔹 If the key is 64 bytes, extract the **first 32 bytes**
if len(private_key_bytes) == 64:
    private_key_bytes = private_key_bytes[:32]  # Ed25519 private key is 32 bytes

# 🔹 Ensure it's exactly 32 bytes
if len(private_key_bytes) != 32:
    raise ValueError("Invalid Ed25519 key length. Expected 32 bytes.")

# 🔹 Create an Ed25519 private key object
private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_key_bytes)

# 🔹 Save it in the correct PEM format
pem_data = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption(),
)

# 🔥 Save to file
with open("identity.pem", "wb") as pem_file:
    pem_file.write(pem_data)

print("✅  PEM saved as identity.pem")
