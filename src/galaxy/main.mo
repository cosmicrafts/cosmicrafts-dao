import PseudoRandomX "mo:xtended-random/PseudoRandomX";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";


actor {
  // Stable variable to store the galaxy
  stable var galaxy: ?Galaxy = null;

  // Types
  public type Galaxy = {
      id: Text;
      name: Text;
      starClusters: [StarCluster];
      resources: Resources;
  };

  public type StarCluster = {
      id: Text;
      name: Text;
      coordinates: { x: Int; y: Int };
      stars: [Star];
      resources: Resources;
  };

  public type Star = {
      id: Text;
      name: Text;
      coordinates: { x: Int; y: Int };
      planets: [Planet];
      asteroidBelts: [AsteroidBelt];
      resources: Resources;
  };

  public type Planet = {
      id: Text;
      name: Text;
      coordinates: { x: Int; y: Int };
      moons: [Moon];
      resources: Resources;
  };

  public type Moon = {
      id: Text;
      name: Text;
      coordinates: { x: Int; y: Int };
      resources: Resources;
  };

  public type AsteroidBelt = {
      id: Text;
      name: Text;
      coordinates: { x: Int; y: Int };
      resources: Resources;
  };

  public type Resources = {
      minable: { energy: Nat; matter: Nat };
      maximum: { energy: Nat; matter: Nat };
  };

  // Generate a new pseudorandom generator
  private func newPRNG(): PseudoRandomX.PseudoRandomGenerator {
      let timeNow: Nat64 = Nat64.fromIntWrap(Time.now());
      let seed: Nat32 = Nat32.fromNat(Nat64.toNat(timeNow) % 100_000_000); // Extract a 32-bit seed from the current time
      return PseudoRandomX.fromSeed(seed, #xorshift32); // Initialize the pseudo-random generator
  };

  // Generate the galaxy
  public func generateGalaxy(numClusters: Nat): async Galaxy {
      let prng = newPRNG();
      var starClusters: [StarCluster] = [];
      
      // Use getCurrentSeed for generating a unique Galaxy ID
      let galaxyIdSeed = prng.getCurrentSeed();
      let galaxyId = "Galaxy-" # Nat32.toText(galaxyIdSeed);

      for (i in Iter.range(1, numClusters)) {
          let cluster = generateStarCluster(i, prng);
          starClusters := Array.append(starClusters, [cluster]);
      };

      let newGalaxy: Galaxy = {
          id = galaxyId;
          name = "Milky Way";
          starClusters;
          resources = {
              minable = { energy = 0; matter = 0 };
              maximum = { energy = 0; matter = 0 };
          }; // Will update as clusters are added
      };

      galaxy := ?newGalaxy;
      return newGalaxy;
  };

  // Generate a star cluster
  private func generateStarCluster(id: Nat, prng: PseudoRandomX.PseudoRandomGenerator): StarCluster {
    let name = "Star Cluster #" # Nat.toText(id);
    let coordinates = { x = prng.nextInt(-10_000, 10_000); y = prng.nextInt(-10_000, 10_000) };
    var stars: [Star] = [];

    let numStars = prng.nextNat(5, 15); // Each cluster has 5-15 stars
    for (i in Iter.range(1, numStars)) {
      let star = generateStar(i, prng);
      stars := Array.append(stars, [star]);
    };

    return {
        id = "Cluster-" # Nat.toText(id);
        name;
        coordinates;
        stars;
        resources = {
            minable = { energy = 0; matter = 0 };
            maximum = { energy = 0; matter = 0 };
        }; // Placeholder, updated later
    };
  };

  // Generate a star
  private func generateStar(id: Nat, prng: PseudoRandomX.PseudoRandomGenerator): Star {
    let name = "Star #" # Nat.toText(id);
    let coordinates = { x = prng.nextInt(-1_000, 1_000); y = prng.nextInt(-1_000, 1_000) };
    var planets: [Planet] = [];
    var asteroidBelts: [AsteroidBelt] = [];

    // Generate planets
    let numPlanets = prng.nextNat(1, 10); // Each star has 1-10 planets
    for (i in Iter.range(1, numPlanets)) {
      let planet = generatePlanet(i, prng);
      planets := Array.append(planets, [planet]);
    };

    // Generate asteroid belts
    let numBelts = prng.nextNat(1, 3); // Each star has 1-3 asteroid belts
    for (i in Iter.range(1, numBelts)) {
      let belt = generateAsteroidBelt(i, prng);
      asteroidBelts := Array.append(asteroidBelts, [belt]);
    };

    return {
        id = "Star-" # Nat.toText(id);
        name;
        coordinates;
        planets;
        asteroidBelts;
        resources = {
            minable = { energy = 0; matter = 0 };
            maximum = { energy = 0; matter = 0 };
        }; // Placeholder, updated later
    };
  };

  // Generate a planet
  private func generatePlanet(id: Nat, prng: PseudoRandomX.PseudoRandomGenerator): Planet {
    let name = "Planet #" # Nat.toText(id);
    let coordinates = { x = prng.nextInt(-500, 500); y = prng.nextInt(-500, 500) };
    var moons: [Moon] = [];

    // Generate moons
    let numMoons = prng.nextNat(0, 3); // Each planet has 0-3 moons
    for (i in Iter.range(1, numMoons)) {
      let moon = generateMoon(i, prng);
      moons := Array.append(moons, [moon]);
    };

    return {
        id = "Planet-" # Nat.toText(id);
        name;
        coordinates;
        moons;
        resources = {
            minable = { energy = prng.nextNat(10, 100); matter = prng.nextNat(50, 200) };
            maximum = { energy = 200; matter = 500 };
        };
    };
  };

  // Generate a moon
  private func generateMoon(id: Nat, prng: PseudoRandomX.PseudoRandomGenerator): Moon {
    return {
        id = "Moon-" # Nat.toText(id);
        name = "Moon #" # Nat.toText(id);
        coordinates = { x = prng.nextInt(-50, 50); y = prng.nextInt(-50, 50) };
        resources = {
            minable = { energy = prng.nextNat(5, 50); matter = prng.nextNat(20, 100) };
            maximum = { energy = 50; matter = 100 };
        };
    };
  };

  // Generate an asteroid belt
  private func generateAsteroidBelt(id: Nat, prng: PseudoRandomX.PseudoRandomGenerator): AsteroidBelt {
    return {
        id = "Belt-" # Nat.toText(id);
        name = "Asteroid Belt #" # Nat.toText(id);
        coordinates = { x = prng.nextInt(-1_000, 1_000); y = prng.nextInt(-1_000, 1_000) };
        resources = {
            minable = { energy = 0; matter = prng.nextNat(100, 1_000) };
            maximum = { energy = 0; matter = 2_000 };
        };
    };
  };

  
};
