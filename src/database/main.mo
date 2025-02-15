import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";
import Prim "mo:prim";

actor class Database() = this {

    public type ComponentId = Nat64;
    public type EntityId = Nat64;

    public type Position = {
        x : Float;
        y : Float;
        z : Float;
    };

    public type Velocity = {
        x : Float;
        y : Float;
        z : Float;
    };

    public type Health = {
        current : Int32;
        max : Int32;
    };

    public type Spatial = {
        x : Float;
        y : Float;
        z : Float;
    };

    public type Component = {
        #Position : Position;
        #Velocity : Velocity;
        #Health : Health;
        #Spatial : Spatial;
    };

    public type ComponentUpdate = {
        entity_id : EntityId;
        component_id : ComponentId;
        component_data : Blob;
        timestamp : Nat64;
    };

    // ** Component Storage (Entity_ID + Component_ID → Blob) **
    private stable var component_store : Trie.Trie<Text, Blob> = Trie.empty();

    // ** Update Log for Reconstruction **
    private stable var update_log : Trie.Trie<Nat64, Blob> = Trie.empty();
    private stable var next_log_id : Nat64 = 0;

    // ** Core Update Receiver (Called from Rust Canister) **
    public shared (msg) func receive_update(update_blob : Blob) : async () {
        switch (decode_component_update(update_blob)) {
            case (?update) {
                let key = Nat64.toText(update.entity_id) # "_" # Nat64.toText(update.component_id);
                component_store := Trie.put(component_store, key, Text.equal, update.component_data).0;

                update_log := Trie.put(update_log, next_log_id, Nat64.equal, update_blob).0;
                next_log_id += 1;
            };
            case _ {
                Debug.print("❌ Failed to decode ComponentUpdate");
            };
        };
    };

    // ** Helper: Decodes ComponentUpdate from Blob **
    private func decode_component_update(blob : Blob) : ?ComponentUpdate {
        let decoded_args = Prim.decodeBlob(blob);
        switch (decoded_args) {
            case (?decoded) {
                if (decoded.size() == 4) {
                    let entity_id = decoded[0].Nat64;
                    let component_id = decoded[1].Nat64;
                    let component_data = decoded[2].Blob;
                    let timestamp = decoded[3].Nat64;
                    ?{ entity_id; component_id; component_data; timestamp };
                } else { null };
            };
            case _ { null };
        };
    };

    // ** Retrieves a Component for an Entity **
    public query func get_component(entity_id : EntityId, component_id : ComponentId) : async ?Component {
        let key = Nat64.toText(entity_id) # "_" # Nat64.toText(component_id);
        switch (Trie.find(component_store, key, Text.equal)) {
            case (?data) { decode_component(component_id, data) };
            case _ { null };
        }
    };

    // ** Helper: Decodes Raw Blob into Correct Component Type **
    private func decode_component(component_id : ComponentId, data : Blob) : ?Component {
        let decoded = Prim.decodeBlob(data);
        switch (decoded) {
            case (?decoded_vals) {
                switch (component_id) {
                    case (1) { 
                        if (decoded_vals.size() == 3) {
                            ?#Position { x = decoded_vals[0].Float; y = decoded_vals[1].Float; z = decoded_vals[2].Float };
                        } else { null };
                    };
                    case (2) { 
                        if (decoded_vals.size() == 3) {
                            ?#Velocity { x = decoded_vals[0].Float; y = decoded_vals[1].Float; z = decoded_vals[2].Float };
                        } else { null };
                    };
                    case (3) { 
                        if (decoded_vals.size() == 2) {
                            ?#Health { current = decoded_vals[0].Int32; max = decoded_vals[1].Int32 };
                        } else { null };
                    };
                    case (4) { 
                        if (decoded_vals.size() == 3) {
                            ?#Spatial { x = decoded_vals[0].Float; y = decoded_vals[1].Float; z = decoded_vals[2].Float };
                        } else { null };
                    };
                    case (_) { null };
                };
            };
            case _ { null };
        }
    };

    // ** Retrieves Component Updates Since a Given Timestamp **
    public query func get_updates_since(timestamp : Nat64) : async [Blob] {
        let updates = Iter.filter(Trie.iter(update_log), func ((ts, _)) { ts >= timestamp });
        Array.map(Iter.toArray(updates), func ((_, blob)) { blob });
    };
};
