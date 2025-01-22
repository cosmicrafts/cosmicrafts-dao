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
import entityIcon from "@/assets/icons/entity.svg";


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
    const canisterStore = useCanisterStore();
    const cosmicrafts = await canisterStore.get("cosmicrafts");

    // Fetch entities from the canister
    const entitiesData = await cosmicrafts.export_entities();
   //console.log("Fetched raw entities:", entitiesData);

    this.rawEntities = entitiesData; // Store raw data
    const parsedEntities = this.parseEntities(entitiesData);
    this.renderMap(parsedEntities);
  } catch (error) {
    console.error("Error fetching or parsing entities:", error);
  }
},

parseEntities(entitiesData) {
  if (!Array.isArray(entitiesData)) {
    console.error("Invalid entity data format. Expected an array.");
    return [];
  }

  return entitiesData.map(([x, y, metadata], index) => {
    //console.log(`Raw metadata for entity ${index}:`, metadata); // Log raw metadata

    let parsedMetadata;
    try {
      // Attempt to parse metadata as JSON
      parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    } catch (e) {
      console.warn(`Metadata for entity ${index} is not valid JSON. Falling back to manual parsing.`, metadata);

      // If metadata is not valid JSON, treat it as a plain string and parse it manually
      parsedMetadata = this.parsePlainMetadata(metadata);
    }

    // Return the parsed entity
    return {
      x,
      y,
      id: parsedMetadata.id || `Entity-${index}`,
      type: parsedMetadata.type || "Unknown",
      category: parsedMetadata.category || "Uncategorized",
      subcategory: parsedMetadata.subcategory || "",
      size: parsedMetadata.size || "Unknown",
      owner: parsedMetadata.owner || "Unknown",
      timestamp: parsedMetadata.timestamp || null,
      zone: parsedMetadata.zone || "Unknown",
      resources: parsedMetadata.attributes?.resources || [],
      tags: parsedMetadata.attributes?.tags || [],
      parent: parsedMetadata.parent || "None",
    };
  });
},

parsePlainMetadata(metadata) {
  // If metadata is not a string, return it as-is
  if (typeof metadata !== "string") {
    return metadata;
  }

  // Attempt to parse plain string metadata (e.g., "Parent: r3rsz-p63rl-iduno-glman-l2mi5-4cnok-nktnr-yivow-yp7sl-adcf2-xqe")
  const metadataParts = metadata.split(":");
  if (metadataParts.length === 2) {
    const [key, value] = metadataParts;
    return {
      [key.trim().toLowerCase()]: value.trim(),
    };
  }

  // If the metadata cannot be parsed, return a default object
  return {
    id: `Invalid-Metadata-${Math.random().toString(36).substring(7)}`,
    type: "Unknown",
    category: "Uncategorized",
    subcategory: "",
    size: "Unknown",
    owner: "Unknown",
    timestamp: null,
    zone: "Unknown",
    resources: [],
    tags: [],
    parent: "None",
  };
}


,
    renderMap(entities) {
  const svg = d3.select(this.$refs.svgCanvas);
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;

  svg.attr("width", width).attr("height", height).selectAll("*").remove();

  // Define gradients and patterns in <defs>
  const defs = svg.append("defs");

  // Galaxy gradient
  defs.append("radialGradient")
    .attr("id", "galaxy-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%")
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#000000", opacity: 1 }, // Black hole center
      { offset: "16%", color: "#000000", opacity: 0 },
      { offset: "28%", color: "#611F6B", opacity: 0.3 },
      { offset: "64%", color: "#333FB3", opacity: 0.25 },
      { offset: "88%", color: "#000000", opacity: 0.4 },
      { offset: "100%", color: "0876F4", opacity: 0 }, // Fade to black
    ])
    .join("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color)
    .attr("stop-opacity", (d) => d.opacity);

  // Create the zoomable container group
  const container = svg.append("g");

  // Add the galaxy background to the zoomable container
  container.append("rect")
    .attr("x", -width) // Make the background larger than the viewport for better visuals
    .attr("y", -height)
    .attr("width", 3 * width)
    .attr("height", 3 * height)
    .attr("fill", "url(#galaxy-gradient)");

  // Determine the coordinate bounds
  const xDomain = d3.extent(entities, (d) => d.x);
  const yDomain = d3.extent(entities, (d) => d.y);

  // Adjust scales to maintain aspect ratio
  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range(aspectRatio >= 1 ? [50, width - 50] : [50, width - 50 * aspectRatio]);

  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .range(aspectRatio >= 1 ? [height - 50, 50] : [height - 50 * aspectRatio, 50]);

  // Render entities in the container
  this.renderEntities(container, entities, xScale, yScale);

  // Initialize zoom behavior
  this.zoomBehavior = d3
    .zoom()
    .scaleExtent([0.5, 20])
    .translateExtent([
      [-width, -height],
      [2 * width, 2 * height],
    ])
    .on("zoom", (event) => {
      container.attr("transform", event.transform); // Scale and move the container (and background)
    });

  svg.call(this.zoomBehavior);

  // Reset the camera (initial transform)
  this.resetZoom();

  // Update on resize
  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newAspectRatio = newWidth / newHeight;

    svg.attr("width", newWidth).attr("height", newHeight);

    // Update background dimensions
    container.selectAll("rect")
      .attr("x", -newWidth)
      .attr("y", -newHeight)
      .attr("width", 3 * newWidth)
      .attr("height", 3 * newHeight);

    // Adjust scales to maintain aspect ratio
    const newXScale = d3
      .scaleLinear()
      .domain(xDomain)
      .range(
        newAspectRatio >= 1
          ? [50, newWidth - 50]
          : [50, newWidth - 50 * newAspectRatio]
      );

    const newYScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range(
        newAspectRatio >= 1
          ? [newHeight - 50, 50]
          : [newHeight - 50 * newAspectRatio, 50]
      );

    // Re-render entities with updated scales
    this.renderEntities(container, entities, newXScale, newYScale);
  });
},
    renderEntities(container, entities, xScale, yScale) {
      container
        .selectAll(".entity")
        .data(entities)
        .join("image")
        .attr("class", "entity")
        .attr("x", (d) => xScale(d.x) - this.entitySize / 2) // Center the SVG
        .attr("y", (d) => yScale(d.y) - this.entitySize / 2) // Center the SVG
        .attr("width", this.entitySize) // Dynamically set width
        .attr("height", this.entitySize) // Dynamically set height
        .attr("xlink:href", entityIcon) // Use imported SVG
        .on("mouseover", (event, d) => {
  d3.select("#tooltip")
    .style("opacity", 1)
    .html(`
      <b>ID:</b> ${d.id}<br>
      <b>Type:</b> ${d.type}<br>
      <b>Category:</b> ${d.category} - ${d.subcategory}<br>
      <b>Size:</b> ${d.size}<br>
      <b>Zone:</b> ${d.zone}<br>
      <b>Owner:</b> ${d.owner}<br>
      <b>Resources:</b> ${d.resources.length > 0 ? d.resources.join(", ") : "None"}<br>
      <b>Tags:</b> ${d.tags.length > 0 ? d.tags.join(", ") : "None"}<br>
      <b>Coordinates:</b> (${d.x}, ${d.y})
    `)
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 50}px`);
})

        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", `${event.pageX + 1}px`)
            .style("top", `${event.pageY - 30}px`);
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