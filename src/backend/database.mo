import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";

actor {
    public type Player = {
        username: Text;
        createdAt: Time.Time;
    };

    // Stable storage for users
    stable var _users: [(Principal, Player)] = [];
    var users = HashMap.HashMap<Principal, Player>(10, Principal.equal, Principal.hash);

    // On canister init/load, restore users from stable var
    system func preupgrade() {
        _users := users.entries();
    };
    system func postupgrade() {
        users := HashMap.fromIter(_users.vals(), 0, Principal.equal, Principal.hash);
    };

    // Query the current caller's player data
    public query ({ caller }) func getPlayer() : async ?Player {
        users.get(caller)
    };

    // Register a new user with a username
    public shared ({ caller }) func signup(username: Text) : async Result.Result<Player, Text> {
        switch (users.get(caller)) {
            case (?_) { return #err("User already exists"); };
            case null {
                let player: Player = {
                    username = username;
                    createdAt = Time.now();
                };
                users.put(caller, player);
                return #ok(player);
            }
        }
    };
} 