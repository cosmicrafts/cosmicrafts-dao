import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Buffer "mo:base/Buffer";

module {
    // Custom hash function for Nat values
    public func natHash(n: Nat): Hash.Hash {
        let byteArray = natToBytes(n);
        var hash: Hash.Hash = 0;
        for (b in byteArray.vals()) {
            hash := hash *% 31 +% Nat32.fromNat(Nat8.toNat(b));
        };
        return hash;
    };

    // Helper function to convert Nat to bytes
    public func natToBytes(n: Nat): [Nat8] {
        var bytes = Buffer.Buffer<Nat8>(0);
        var num = n;
        
        // Handle the case where n is 0
        if (num == 0) {
            bytes.add(0);
            return Buffer.toArray(bytes);
        };
        
        while (num > 0) {
            bytes.add(Nat8.fromNat(num % 256));
            num := num / 256;
        };
        return Buffer.toArray(bytes);
    };

    // Equality function for Nat
    public func natEqual(a: Nat, b: Nat): Bool {
        return a == b;
    };
} 