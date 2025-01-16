// File: src/utils/generateEvent.js
export function generateEvent(previousState = {}) {
      // Seed values for procedural generation (optional)
      const randomNumber = Math.random();
      const actionCount = Math.floor(randomNumber * 4) + 1; // 1-4 actions
    
      // Generate dynamic title and narrative
      const titles = ["Mysterious Asteroid", "Derelict Spaceship", "Alien Transmission", "Space Debris Field"];
      const narratives = [
        "You encounter a strange object in deep space. It seems to pulse with energy...",
        "A damaged ship is drifting in the void, its hull scorched and broken.",
        "Your sensors pick up a faint signal. It could be a distress call or a trap.",
        "A field of debris floats in the distance, remnants of a recent battle.",
      ];
    
      // Pick a random title and narrative
      const title = titles[Math.floor(randomNumber * titles.length)];
      const narrative = narratives[Math.floor(randomNumber * narratives.length)];
    
      // Generate random actions
      const actions = Array.from({ length: actionCount }, (_, i) => ({
        label: `Action ${i + 1}`,
        next: `generatedScene_${Date.now()}_${i}`, // Unique scene ID
      }));
    
      // Return the generated event
      return {
        id: previousState.id + 1 || 1,
        title,
        narrative,
        audioUrl: null, // Optional TTS audio generation can be added later
        actions,
      };
    }
    