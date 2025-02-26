import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Char "mo:base/Char";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import SHA224 "./SHA224";
import CRC32 "./CRC32";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Hash "mo:base/Hash";
import Nat32 "mo:base/Nat32";
import Random "mo:base/Random";
import Nat "mo:base/Nat";
import Types "./types";

module {
	private let symbols = [
			'0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
	];
	private let base : Nat8 = 0x10;

	/// Convert bytes array to hex string.       
	/// E.g `[255,255]` to "ffff"
	private func encode(array : [Nat8]) : Text {
			Array.foldLeft<Nat8, Text>(array, "", func (accum, u8) {
					accum # nat8ToText(u8);
			});
	};

	/// Convert a byte to hex string.
	/// E.g `255` to "ff"
	private func nat8ToText(u8: Nat8) : Text {
			let c1 = symbols[Nat8.toNat((u8/base))];
			let c2 = symbols[Nat8.toNat((u8%base))];
			return Char.toText(c1) # Char.toText(c2);
	};

	/// Return the account identifier of the Principal.
	public func accountToText(account : Types.Account) : Text {
		let digest = SHA224.Digest();
		digest.write([10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100]:[Nat8]); // b"\x0Aaccount-id"
		let blob = Principal.toBlob(account.owner);
		digest.write(Blob.toArray(blob));

		let effectiveSubaccount : Blob = switch (account.subaccount) {
			case null Blob.fromArray([]);
			case (?_elem) _elem;
		};

		digest.write(Blob.toArray(effectiveSubaccount)); // subaccount

		let hash_bytes = digest.sum();

		let crc = CRC32.crc32(hash_bytes);
		let aid_bytes = Array.append<Nat8>(crc, hash_bytes);

		return encode(aid_bytes);
	};

	public func pushIntoArray<X>(elem: X, array: [X]) : [X] {
		let buffer = Buffer.fromArray<X>(array);
    buffer.add(elem);
		return Buffer.toArray(buffer);
	};

	public func nullishCoalescing<X>(elem: ?X, default: X) : X {
		switch(elem) {
      case null return default;
      case (?_elem) return _elem;
    };
	};

	public func compareAccounts(a: Types.Account, b: Types.Account): {#less; #equal; #greater} {
		return Text.compare(accountToText(a), accountToText(b));
	};

	public func natToBytes(n: Nat): [Nat8] {
	var bytes = Buffer.Buffer<Nat8>(0);
	var num = n;
	while (num > 0) {
		bytes.add(Nat8.fromNat(num % 256));
		num := num / 256;
	};
	return Buffer.toArray(bytes);
	};

	public func _natHash(a: Nat): Hash.Hash {
	let byteArray = natToBytes(a);
	var hash: Hash.Hash = 0;
	for (i in Iter.range(0, byteArray.size() - 1)) {
		hash := (hash * 31 + Nat32.fromNat(Nat8.toNat(byteArray[i])));
	};
	return hash;
	};

	// NFT Metadata
	// NFT Metadata Initialization with general info
	public func initDeck(): [(Text, Nat, Nat, Nat, Text, Text)] {
	return [
		("Blackbird", 30, 120, 1, "A stealth fighter designed for reconnaissance and hit-and-run tactics.", "url_to_blackbird_image"),
		("Warhawk", 30, 180, 3, "A heavy assault fighter built for long-range engagements.", "url_to_warhawk_image"),
		("Tigershark", 10, 100, 2, "A nimble and fast fighter ideal for quick strikes.", "url_to_tigershark_image"),
		("Devastator", 20, 120, 1, "A mid-range fighter equipped with powerful energy weapons.", "url_to_devastator_image"),
		("Barracuda", 20, 140, 2, "A fighter optimized for high-speed pursuits and interceptions.", "url_to_barracuda_image"),
		("Farragut", 10, 220, 1, "An advanced fighter capable of dominating the battlefield with superior firepower.", "url_to_farragut_image")
	];
	};


      public func generateUUID64() : async Nat {
        let randomBytes = await Random.blob();
        var uuid : Nat = 0;
        let byteArray = Blob.toArray(randomBytes);
        for (i in Iter.range(0, 7)) {
            uuid := Nat.add(Nat.bitshiftLeft(uuid, 8), Nat8.toNat(byteArray[i]));
        };
        uuid := uuid % 2147483647;
        return uuid;
	};


};