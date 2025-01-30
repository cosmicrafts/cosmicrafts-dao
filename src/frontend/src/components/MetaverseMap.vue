<script setup lang="ts">

<<<<<<< HEAD
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
      const svg = d3.select(this.$refs.svgCanvas);
      
      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 20]) // Min and max zoom levels
        .translateExtent([
          [-window.innerWidth, -window.innerHeight], // Min bounds
          [2 * window.innerWidth, 2 * window.innerHeight], // Max bounds
        ])
        .on("zoom", (event) => {
          this.currentTransform = event.transform;
          this.applyZoomTransform(event.transform);
        });

      // Apply the initial zoom transform
      svg.call(this.zoomBehavior);
    },

    applyZoomTransform(transform) {
      // Apply the same transform to all layers
      d3.select('.background-stars').attr('transform', transform);
      d3.select('.nebulas').attr('transform', transform);
      d3.select('.main-map').attr('transform', transform);

      // Update entity positions relative to the zoom transform
      this.updateEntityPositions(transform);
    },

    updateEntityPositions(transform) {
      const entities = d3.selectAll(".entity");
      entities.attr("transform", (d) => {
        const [x, y] = transform.apply([d.x, d.y]);
        return `translate(${x - this.entitySize / 2}, ${y - this.entitySize / 2})`;
      });
    },

    resetZoom() {
      const svg = d3.select(this.$refs.svgCanvas);
      svg.transition()
        .duration(750) // Smooth transition
        .call(this.zoomBehavior.transform, d3.zoomIdentity); // Reset to initial state
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
          { offset: "0%", color: "#000000", opacity: .1 },
          { offset: "16%", color: "#000000", opacity: 1 },
          { offset: "28%", color: "#611F6B", opacity: 1 },
          { offset: "64%", color: "#333FB3", opacity: 1 },
          { offset: "88%", color: "#000000", opacity: 1 },
          { offset: "100%", color: "0876F4", opacity: 1 },
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

  },
};
=======
>>>>>>> Vue
</script>

<template>
  <div ref="gameContainer" class="game-container"></div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style>
