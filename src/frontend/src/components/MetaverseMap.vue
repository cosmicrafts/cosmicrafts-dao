<template>
  <div id="metaverse-map">
    <svg ref="svgCanvas" class="layer main-map"></svg>
    <div class="layer ui-overlay">
      <div id="tooltip" style="opacity: 0;"></div>
      <button id="reset-zoom" @click="resetZoom">Reset Zoom</button>
      <div id="size-control">
        <label for="entity-size">Entity Size:</label>
        <input
          type="range"
          id="entity-size"
          min="0.1"
          max="30"
          v-model="entitySize"
          @input="updateSizes"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { useCanisterStore } from "@/stores/canister";
import entityIcon from "@/assets/webp/map/planet.webp";

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1000;

export default {
  name: "MetaverseMap",
  data() {
    return {
      rawEntities: [],
      previousEntities: new Map(),
      zoomBehavior: null,
      entitySize: 5,
      currentTransform: d3.zoomIdentity,
      pollingInterval: null,
    };
  },
  mounted() {
    this.fetchEntities(); // Initial fetch
    this.initializeZoom();
    this.startPolling();
    this.startSimulation(); // Start interpolation loop
  },
  methods: {
    async fetchEntities() {
      try {
        const canisterStore = useCanisterStore();
        const cosmicrafts = await canisterStore.get("cosmicrafts");
        const entitiesData = await cosmicrafts.export_entities();

        this.updateEntities(entitiesData);
      } catch (error) {
        console.error("Error fetching entities:", error);
      }
    },

    initializeZoom() {
      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 20])
        .on("zoom", (event) => {
          this.currentTransform = event.transform;
          d3.select(".main-map").attr("transform", event.transform);
        });
    },

    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.fetchEntities(); // Fetch data every second
      }, 100);
    },

    startSimulation() {
      const fps = 60; // Frames per second
      const dt = 1 / fps; // Time step per frame (in seconds)

      const simulateMovement = () => {
        this.rawEntities.forEach((entity) => {
          // Skip entities without a target position
          if (!entity.target_position || entity.target_position.length === 0) return;

          const target = entity.target_position[0];
          const dx = target.x - entity.position.x;
          const dy = target.y - entity.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const moveX = (dx / distance) * Math.min(entity.speed * dt, distance);
            const moveY = (dy / distance) * Math.min(entity.speed * dt, distance);

            // Update position
            entity.position.x += moveX;
            entity.position.y += moveY;

            // Snap to target if close enough
            if (distance <= entity.speed * dt) {
              entity.position.x = target.x;
              entity.position.y = target.y;
              entity.target_position = []; // Clear target once reached
            }
          }
        });

        // Re-render entities
        this.renderEntities(this.rawEntities);

        // Continue simulation
        requestAnimationFrame(simulateMovement);
      };

      simulateMovement(); // Start the simulation loop
    },

    updateEntities(newEntities) {
      const entityMap = new Map();

      newEntities.forEach((entity) => {
        const previous = this.previousEntities.get(entity.id);

        if (previous) {
          // Correct the position if there's a large discrepancy
          const dx = entity.position.x - previous.position.x;
          const dy = entity.position.y - previous.position.y;
          const discrepancy = Math.sqrt(dx * dx + dy * dy);

          if (discrepancy > entity.speed) {
            // Snap to backend position if too far off
            previous.position.x = entity.position.x;
            previous.position.y = entity.position.y;
          }

          // Retain previous position for smooth interpolation
          entity.position.x = previous.position.x;
          entity.position.y = previous.position.y;
        }

        entityMap.set(entity.id, entity);
      });

      // Update memory
      this.previousEntities = entityMap;
      this.rawEntities = Array.from(entityMap.values());
    },

    renderEntities(entitiesData) {
      const svg = d3.select(this.$refs.svgCanvas);
      const width = window.innerWidth;
      const height = window.innerHeight;

      svg.attr("width", width).attr("height", height).selectAll("*").remove();

      const container = svg.append("g");

      const xScale = d3.scaleLinear().domain([0, MAP_WIDTH]).range([0, width]);
      const yScale = d3.scaleLinear().domain([0, MAP_HEIGHT]).range([height, 0]);

      const tooltip = d3.select("#tooltip");

      container
        .selectAll(".entity")
        .data(entitiesData)
        .join("image")
        .attr("class", "entity")
        .attr("x", (d) => xScale(d.position.x) - this.entitySize / 2)
        .attr("y", (d) => yScale(d.position.y) - this.entitySize / 2)
        .attr("width", this.entitySize)
        .attr("height", this.entitySize)
        .attr("xlink:href", entityIcon)
        .on("mouseover", (event, d) => {
          const [x, y] = d3.pointer(event);
          const transformed = this.currentTransform.invert([x, y]);

          let tooltipContent = `
            <b>ID:</b> ${d.id}<br>
            <b>Type:</b> ${d.entity_type}<br>
            <b>Position:</b> (${d.position.x.toFixed(2)}, ${d.position.y.toFixed(2)})<br>
          `;

          tooltip
            .style("opacity", 1)
            .html(tooltipContent)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      svg.call(this.zoomBehavior);
    },

    updateSizes() {
      this.renderEntities(this.rawEntities);
    },

    resetZoom() {
      const svg = d3.select(this.$refs.svgCanvas);
      svg.call(this.zoomBehavior.transform, d3.zoomIdentity);
    },
  },
  beforeDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
};
</script>


<style scoped>
/* Same CSS as before */
#metaverse-map {
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.main-map {
  z-index: 1;
}

.ui-overlay {
  z-index: 2;
}

#tooltip {
  position: absolute;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  pointer-events: none;
  font-size: 1rem;
  color: #000;
}

#reset-zoom {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#reset-zoom:hover {
  background-color: #555;
}

#size-control {
  position: absolute;
  bottom: 50px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.023);
  padding: 10px;
  border-radius: 8px;
}

#size-control label {
  font-size: 14px;
  color: #ffffff;
}

#size-control input {
  margin-left: 10px;
}
</style>