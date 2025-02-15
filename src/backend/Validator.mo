module Validator {
  public func validateGame(timeInSeconds: Nat, score: Nat) : (Bool, Text) {
      let maxScoreRate: Nat = 550000 / (5 * 60);
      let maxPlausibleScore: Nat = maxScoreRate * timeInSeconds;
      let isScoreValid: Bool = score <= maxPlausibleScore;

      if (isScoreValid) {
          return (true, "Game is valid");
      } else {
          return (false, "Score is not valid");
      }
  };
}