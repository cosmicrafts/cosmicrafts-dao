<template>
  <div id="metaverse-map">
    <svg ref="svgCanvas"></svg>
    <div id="tooltip" style="opacity: 0;"></div>
    <button id="reset-zoom" @click="resetZoom">Reset Zoom</button>
    <!-- Sliders for dynamic size control -->
    <div id="size-control">
      <label for="entity-size">Entity Size:</label>
      <input
        type="range"
        id="entity-size"
        min="0.01"
        max="30"
        v-model="entitySize"
        @input="updateSizes"
      />
    </div>
  </div>
</template>


<script>
import * as d3 from "d3";
import { useCanisterStore } from "@/stores/canister";

export default {
  name: "MetaverseMap",
  data() {
    return {
      rawEntities: "", // Raw data fetched from the canister
      zoomBehavior: null,
      entitySize: 5, // Default size for entities
    };
  },
  mounted() {
    this.fetchEntities();
  },
  methods: {
    async fetchEntities() {
      try {
        // Get the Cosmicrafts canister instance
        const canisterStore = useCanisterStore();
        const cosmicrafts = await canisterStore.get("cosmicrafts");

        // Fetch entities from the canister
        const entitiesData = await cosmicrafts.export_entities();
        this.rawEntities = entitiesData; // Store raw data
        const parsedEntities = this.parseEntities(entitiesData);
        this.renderMap(parsedEntities);
      } catch (error) {
        console.error("Error fetching or parsing entities:", error);
      }
    },
    parseEntities(entitiesData) {
      // Ensure data is an array and map to usable format
      if (!Array.isArray(entitiesData)) {
        console.error("Invalid entity data format");
        return [];
      }
      return entitiesData.map(([x, y, name]) => ({ x, y, name }));
    },
    renderMap(entities) {
      const svg = d3.select(this.$refs.svgCanvas);
      const width = window.innerWidth;
      const height = window.innerHeight;

      svg.attr("width", width).attr("height", height).selectAll("*").remove();

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(entities, (d) => d.x))
        .range([50, width - 50]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(entities, (d) => d.y))
        .range([height - 50, 50]);

      const container = svg.append("g");

      this.renderEntities(container, entities, xScale, yScale);

      // Zoom behavior
      this.zoomBehavior = d3
        .zoom()
        .scaleExtent([0.5, 20])
        .translateExtent([
          [-width, -height],
          [2 * width, 2 * height],
        ])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        });

      svg.call(this.zoomBehavior);

      // Initialize zoom level
      const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1.5);
      svg.call(this.zoomBehavior.transform, initialTransform);
    },
    renderEntities(container, entities, xScale, yScale) {
      container
        .selectAll(".entity")
        .data(entities)
        .join("circle")
        .attr("class", "entity")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", this.entitySize) // Use the entitySize for radius
        .attr("fill", "blue")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`Entity: ${d.name}<br>X: ${d.x}<br>Y: ${d.y}`)
            .style("left", `${event.pageX + 1}px`)
            .style("top", `${event.pageY - 200}px`);
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", `${event.pageX + 1}px`)
            .style("top", `${event.pageY - 200}px`);
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
    },
    updateSizes() {
      // Re-render entities with the updated size
      const svg = d3.select(this.$refs.svgCanvas);
      const container = svg.select("g");
      const entities = this.parseEntities(this.rawEntities);

      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(entities, (d) => d.x))
        .range([50, window.innerWidth - 50]);

      const yScale = d3
        .scaleLinear()
        .domain(d3.extent(entities, (d) => d.y))
        .range([window.innerHeight - 50, 50]);

      this.renderEntities(container, entities, xScale, yScale);
    },
    resetZoom() {
      // Reset zoom to initial state
      const svg = d3.select(this.$refs.svgCanvas);
      svg.call(this.zoomBehavior.transform, d3.zoomIdentity);
    },
  },
};

</script>
<style scoped>
#metaverse-map {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}
svg {
  border: 1px solid #444;
}
#tooltip {
  position: absolute;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  pointer-events: none;
  font-size: 12px;
  color: black;
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
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
}
#size-control label {
  font-size: 14px;
  color: #333;
}
#size-control input {
  margin-left: 10px;
}

</style>