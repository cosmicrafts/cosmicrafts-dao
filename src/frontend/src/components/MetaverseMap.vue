<template>
  <div id="metaverse-map">
    <!-- Main Map Canvas -->
    <svg ref="svgCanvas" class="layer main-map"></svg>
    
    <!-- UI Overlay -->
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

// Define MAP_WIDTH and MAP_HEIGHT
const MAP_WIDTH = 1000; // Match the value from your Rust backend
const MAP_HEIGHT = 1000; // Match the value from your Rust backend

export default {
  name: "MetaverseMap",
  data() {
    return {
      rawEntities: [],
      zoomBehavior: null,
      entitySize: 5,
      currentTransform: d3.zoomIdentity,
    };
  },
  mounted() {
    this.fetchEntities();
    this.initializeZoom();
  },
  methods: {
    async fetchEntities() {
      try {
        const canisterStore = useCanisterStore();
        const cosmicrafts = await canisterStore.get("cosmicrafts");
        const entitiesData = await cosmicrafts.export_entities();
        this.rawEntities = entitiesData;
        this.renderEntities(entitiesData);
      } catch (error) {
        console.error("Error fetching entities:", error);
      }
    },

    initializeZoom() {
      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 20])
        .on('zoom', (event) => {
          this.currentTransform = event.transform;
          d3.select('.main-map').attr('transform', event.transform);
        });
    },

    renderEntities(entitiesData) {
      const svg = d3.select(this.$refs.svgCanvas);
      const width = window.innerWidth;
      const height = window.innerHeight;

      svg.attr("width", width).attr("height", height).selectAll("*").remove();

      const container = svg.append("g");

      const xScale = d3.scaleLinear()
        .domain([0, MAP_WIDTH]) // Use MAP_WIDTH
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, MAP_HEIGHT]) // Use MAP_HEIGHT
        .range([height, 0]);

      const tooltip = d3.select("#tooltip");

      container.selectAll(".entity")
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
};
</script>

<style scoped>
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

.main-map { z-index: 1; }
.ui-overlay { z-index: 2; }

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