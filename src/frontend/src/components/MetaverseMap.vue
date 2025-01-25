<template>
  <div id="metaverse-map">
    <!-- Background Layer -->
    <Stars :count="1000" class="layer background-stars" />
    
    <!-- Nebula Layer -->
    <Nebula class="layer nebulas" />
    
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
import Stars from "@/components/Map/Stars.vue";
import Nebula from "@/components/Map/Nebula.vue";

export default {
  components: { Stars, Nebula },
  name: "MetaverseMap",
  data() {
    return {
      rawEntities: "",
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
        const parsedEntities = this.parseEntities(entitiesData);
        this.renderMap(parsedEntities);
      } catch (error) {
        console.error("Error fetching or parsing entities:", error);
      }
    },

    initializeZoom() {
      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 20])
        .on('zoom', (event) => {
          this.currentTransform = event.transform;
          d3.select('.background-stars').attr('transform', event.transform);
          d3.select('.nebulas').attr('transform', event.transform);
          d3.select('.main-map').attr('transform', event.transform);
        });
    },

    parseEntities(entitiesData) {
      if (!Array.isArray(entitiesData)) {
        console.error("Invalid entity data format. Expected an array of objects.");
        return [];
      }

      return entitiesData.map((entity) => {
        const { id, metadata, owner_id, entity_type, coords } = entity;
        let parsedMetadata;
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch {
          parsedMetadata = { description: metadata };
        }

        return {
          id,
          x: coords[0] || 0,
          y: coords[1] || 0,
          type: Object.keys(entity_type)[0],
          name: parsedMetadata.name || "Unnamed Entity",
          description: parsedMetadata.description || "No description available",
          owner: owner_id.toText(),
          resources: parsedMetadata.resources || [],
          size: parsedMetadata.size || 10,
        };
      });
    },

    renderMap(entities) {
      const svg = d3.select(this.$refs.svgCanvas);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      svg.attr("width", width).attr("height", height).selectAll("*").remove();

      const defs = svg.append("defs");
      defs.append("radialGradient")
        .attr("id", "galaxy-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .selectAll("stop")
        .data([
          { offset: "0%", color: "#000000", opacity: 1 },
          { offset: "16%", color: "#000000", opacity: 0 },
          { offset: "28%", color: "#611F6B", opacity: 0.3 },
          { offset: "64%", color: "#333FB3", opacity: 0.25 },
          { offset: "88%", color: "#000000", opacity: 0.4 },
          { offset: "100%", color: "0876F4", opacity: 0 },
        ])
        .join("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color)
        .attr("stop-opacity", (d) => d.opacity);

      const container = svg.append("g");
      container.append("rect")
        .attr("x", -width)
        .attr("y", -height)
        .attr("width", 3 * width)
        .attr("height", 3 * height)
        .attr("fill", "url(#galaxy-gradient)");

      const xDomain = d3.extent(entities, (d) => d.x);
      const yDomain = d3.extent(entities, (d) => d.y);

      const xScale = d3.scaleLinear()
        .domain(xDomain)
        .range(aspectRatio >= 1 ? [50, width - 50] : [50, width - 50 * aspectRatio]);

      const yScale = d3.scaleLinear()
        .domain(yDomain)
        .range(aspectRatio >= 1 ? [height - 50, 50] : [height - 50 * aspectRatio, 50]);

      this.renderEntities(container, entities, xScale, yScale);
      svg.call(this.zoomBehavior);

      window.addEventListener("resize", () => this.handleResize(entities, xDomain, yDomain));
    },

    renderEntities(container, entities, xScale, yScale) {
      const tooltip = d3.select("#tooltip");
      const tooltipPadding = 10;
      const tooltipWidth = 300;
      const tooltipHeight = 150;

      container.selectAll(".entity")
        .data(entities)
        .join("image")
        .attr("class", "entity")
        .attr("x", (d) => xScale(d.x) - this.entitySize / 2)
        .attr("y", (d) => yScale(d.y) - this.entitySize / 2)
        .attr("width", this.entitySize)
        .attr("height", this.entitySize)
        .attr("xlink:href", entityIcon)
        .on("mouseover", (event, d) => {
          const [x, y] = d3.pointer(event);
          const transformed = this.currentTransform.invert([x, y]);
          
          let tooltipContent = this.generateTooltipContent(d);
          
          // Calculate position considering viewport boundaries
          let left = event.pageX + tooltipPadding;
          let top = event.pageY - tooltipPadding;
          
          if (left + tooltipWidth > window.innerWidth) {
            left = event.pageX - tooltipWidth - tooltipPadding;
          }
          if (top + tooltipHeight > window.innerHeight) {
            top = event.pageY - tooltipHeight - tooltipPadding;
          }

          tooltip
            .style("opacity", 1)
            .html(tooltipContent)
            .style("left", `${left}px`)
            .style("top", `${top}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    },

    generateTooltipContent(d) {
      let content = `
        <b>ID:</b> ${d.id}<br>
        <b>Name:</b> ${d.name}<br>
        <b>Type:</b> ${d.type}<br>
        <b>Description:</b> ${d.description}<br>
        <b>Size:</b> ${d.size}<br>
        <b>Owner:</b> ${d.owner}<br>
        <b>Coordinates:</b> (${d.x}, ${d.y})<br>
      `;

      if (d.type === "Star") {
        content += `
          <b>Star Type:</b> ${d.star_type}<br>
          <b>Temperature:</b> ${d.temperature} K<br>
          <b>Luminosity:</b> ${d.luminosity}<br>
        `;
      } else if (d.type === "StarCluster") {
        content += `
          <b>Cluster Type:</b> ${d.cluster_type}<br>
          <b>Radius:</b> ${d.radius} light-years<br>
        `;
      }

      return content;
    },

    handleResize(entities, xDomain, yDomain) {
      const svg = d3.select(this.$refs.svgCanvas);
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newAspectRatio = newWidth / newHeight;

      svg.attr("width", newWidth).attr("height", newHeight);

      const container = svg.select("g");
      container.select("rect")
        .attr("x", -newWidth)
        .attr("y", -newHeight)
        .attr("width", 3 * newWidth)
        .attr("height", 3 * newHeight);

      const newXScale = d3.scaleLinear()
        .domain(xDomain)
        .range(newAspectRatio >= 1 ? [50, newWidth - 50] : [50, newWidth - 50 * newAspectRatio]);

      const newYScale = d3.scaleLinear()
        .domain(yDomain)
        .range(newAspectRatio >= 1 ? [newHeight - 50, 50] : [newHeight - 50 * newAspectRatio, 50]);

      this.renderEntities(container, entities, newXScale, newYScale);
    },

    updateSizes() {
      const svg = d3.select(this.$refs.svgCanvas);
      const container = svg.select("g");
      const entities = this.parseEntities(this.rawEntities);

      const xScale = d3.scaleLinear()
        .domain(d3.extent(entities, (d) => d.x))
        .range([50, window.innerWidth - 50]);

      const yScale = d3.scaleLinear()
        .domain(d3.extent(entities, (d) => d.y))
        .range([window.innerHeight - 50, 50]);

      this.renderEntities(container, entities, xScale, yScale);
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

  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

}

.background-stars { z-index: 1; }
.nebulas { z-index: 2; }
.main-map { z-index: 3; }
.ui-overlay { z-index: 4; }

.nebula {
  mix-blend-mode: screen;
}

svg {
  mix-blend-mode: screen;
}

#tooltip {
  position: absolute;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  background: #222222;
  border: 1px solid #333;
  border-radius: 8px;
  pointer-events: none;
  font-size: 1rem;
  color: rgb(255, 255, 255);
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
  background-color: #ffffff;
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