// File: src/marketplace/result_wrapper.mo
import Result "mo:base/Result";

module {
    // Wrapper around the Result type that serializes according to Candid expectations
    public type Result<T, E> = {
        #ok : T;
        #err : E;
    };

    // Convert from the standard Result to our wrapper
    public func fromResult<T, E>(result: Result.Result<T, E>) : Result<T, E> {
        switch (result) {
            case (#ok(value)) { #ok(value) };
            case (#err(error)) { #err(error) };
        }
    };

    // Convert from our wrapper to the standard Result
    public func toResult<T, E>(result: Result<T, E>) : Result.Result<T, E> {
        switch (result) {
            case (#ok(value)) { #ok(value) };
            case (#err(error)) { #err(error) };
        }
    };

    // Helper for creating ok results
    public func ok<T, E>(value: T) : Result<T, E> {
        #ok(value)
    };

    // Helper for creating error results
    public func err<T, E>(error: E) : Result<T, E> {
        #err(error)
    };
} 