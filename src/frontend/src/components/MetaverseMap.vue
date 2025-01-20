<template>
  <div id="metaverse-map">
    <svg ref="svgCanvas"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "MetaverseMap",
  props: {
    entitiesPath: {
      type: String,
      required: false,
      default: "/src/pages/entities.json", // Default path to entities.json
    },
  },
  data() {
    return {
      rawEntities: "", // Raw data fetched from entitiesPath
    };
  },
  mounted() {
    this.fetchEntities();
  },
  methods: {
    async fetchEntities() {
      try {
        const response = await fetch(this.entitiesPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch entities.json: HTTP ${response.status}`);
        }
        this.rawEntities = await response.text();
        console.log("Raw Entities Data:", this.rawEntities);

        const parsedEntities = this.parseEntities(this.rawEntities);
        this.renderMap(parsedEntities);
      } catch (error) {
        console.error("Error fetching or parsing entities.json:", error);
      }
    },
    parseEntities(rawData) {
      if (!rawData) {
        console.warn("No raw data provided.");
        return [];
      }

      try {
        // Match each "record {...}" block
        const records = rawData.match(/record\s*\{[^}]+\}/g);

        if (!records) {
          throw new Error("No records found in the data.");
        }

        console.log("Matched Records:", records);

        // Parse each record
        const entities = records.map((record) => {
          // Extract numbers and strings
          const parts = record.match(/([\d.]+)\s*:\s*float64|"(.*?)"/g);

          if (!parts || parts.length < 3) {
            throw new Error(`Invalid record format: ${record}`);
          }

          console.log("Parsed Record Parts:", parts);

          return [
            parseFloat(parts[0].split(":")[0]), // X coordinate
            parseFloat(parts[1].split(":")[0]), // Y coordinate
            parts[2].replace(/"/g, ""), // Entity name
          ];
        });

        // Optionally filter entities to a manageable subset
        const filteredEntities = entities.slice(0, 500); // Render first 500 entities for better performance
        console.log("Parsed and Filtered Entities:", filteredEntities);
        return filteredEntities;
      } catch (error) {
        console.error("Failed to parse entities:", error);
        return [];
      }
    },
    renderMap(entities) {
  const svg = d3.select(this.$refs.svgCanvas);
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Set up SVG canvas
  svg.attr("width", width).attr("height", height).selectAll("*").remove();

  // Define scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(entities, (d) => d[0]))
    .range([50, width - 50]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(entities, (d) => d[1]))
    .range([height - 50, 50]);

  // Create a container for zooming and panning
  const container = svg.append("g");

  // Render entities
  container.selectAll("circle")
    .data(entities)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[0]))
    .attr("cy", (d) => yScale(d[1]))
    .attr("r", 5)
    .attr("fill", (d) => {
      // Color code by radius
      const radius = Math.sqrt(d[0] ** 2 + d[1] ** 2);
      return d3.interpolateRainbow(radius / 100); // Adjust 100 based on your data
    })
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .append("title")
    .text((d) => d[2]);

  // Draw concentric circles to highlight the pattern
  const maxRadius = Math.max(...entities.map((d) => Math.sqrt(d[0] ** 2 + d[1] ** 2)));
  const circleSteps = 10; // Number of circles to draw
  for (let i = 1; i <= circleSteps; i++) {
    const radius = (maxRadius / circleSteps) * i;
    container.append("circle")
      .attr("cx", xScale(0))
      .attr("cy", yScale(0))
      .attr("r", xScale(radius) - xScale(0))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");
  }

  // Add zoom and pan
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .on("zoom", (event) => {
      container.attr("transform", event.transform);
    });

  svg.call(zoom);

  // Set initial zoom
  const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1.5);
  svg.call(zoom.transform, initialTransform);
},
  },
};
</script>

<style scoped>
#metaverse-map {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000; /* Full black background */
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
svg {
  border: 1px solid #444; /* Subtle border for the SVG canvas */
}
</style>
