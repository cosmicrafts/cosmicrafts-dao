import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";

module Set {
    public type HashSet<T> = HashMap.HashMap<T, Bool>;

    // Create a new HashSet with an initial size
    public func new<T>(initialSize: Nat, eqFn: (T, T) -> Bool, hashFn: T -> Hash.Hash): HashSet<T> {
        return HashMap.HashMap<T, Bool>(initialSize, eqFn, hashFn);
    };

    // Add an element to the set
    public func put<T>(set: HashSet<T>, key: T): () {
        set.put(key, true);
    };

    // Check if an element is in the set
    public func contains<T>(set: HashSet<T>, key: T): Bool {
        return set.get(key) != null;
    };

    // Convert the set to an array of elements
    public func toArray<T>(set: HashSet<T>): [T] {
        // Convert iterator to an array
        return Iter.toArray(set.keys());
    };
}