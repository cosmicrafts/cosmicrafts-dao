<template>
  <div id="metaverse-map">
    <svg ref="svgCanvas"></svg>
    <div id="tooltip" style="opacity: 0;"></div>
    <button id="reset-zoom" @click="resetZoom">Reset Zoom</button>
  </div>
</template>

<script>
import * as d3 from "d3";
import { useCanisterStore } from '@/stores/canister';

export default {
  name: "MetaverseMap",
  data() {
    return {
      rawEntities: "", // Raw data fetched from canister
      zoomBehavior: null,
      isClustered: true, // Determines whether to show clusters or individual entities
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
        const cosmicrafts = await canisterStore.get('cosmicrafts');

        // Call the export_entities method from the canister
        const entitiesData = await cosmicrafts.export_entities();

        // Log the returned data for debugging
        //console.log("Entities data from canister:", JSON.stringify(entitiesData, null, 2));

        // Render the map with the parsed entities
        const parsedEntities = this.parseEntities(entitiesData);
        this.renderMap(parsedEntities);
      } catch (error) {
        console.error("Error fetching or parsing entities from canister:", error);
      }
    },
    parseEntities(entitiesData) {
      try {
        // Ensure the data is an array
        if (!Array.isArray(entitiesData)) {
          throw new Error("Expected an array of entities.");
        }

        // Map the data to the expected format
        return entitiesData.map((entity) => {
          return {
            x: entity[0], // First element is x (number)
            y: entity[1], // Second element is y (number)
            name: entity[2], // Third element is name (string)
          };
        });
      } catch (error) {
        console.error("Failed to parse entities:", error);
        return [];
      }
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

      // Initial rendering of clusters
      this.renderClusters(container, entities, xScale, yScale);

      this.zoomBehavior = d3
        .zoom()
        .scaleExtent([0.5, 20])
        .translateExtent([
          [-width, -height],
          [2 * width, 2 * height],
        ])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);

          const zoomLevel = event.transform.k;
          if (zoomLevel > 5 && this.isClustered) {
            this.isClustered = false;
            this.renderEntities(container, entities, xScale, yScale);
          } else if (zoomLevel <= 5 && !this.isClustered) {
            this.isClustered = true;
            this.renderClusters(container, entities, xScale, yScale);
          }
        });

      svg.call(this.zoomBehavior);

      // Initialize with a medium zoom level
      const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(1.5);
      svg.call(this.zoomBehavior.transform, initialTransform);
    },
    clusterEntities(entities) {
      const clusterSize = 0.05; // Adjust for more/less clustering
      const clusters = {};

      entities.forEach((entity) => {
        const key = `${Math.round(entity.x / clusterSize)},${Math.round(entity.y / clusterSize)}`;
        if (!clusters[key]) {
          clusters[key] = { x: entity.x, y: entity.y, count: 0 };
        }
        clusters[key].count += 1;
      });

      return Object.values(clusters);
    },
    renderClusters(container, entities, xScale, yScale) {
      const clusters = this.clusterEntities(entities);

      container
        .selectAll(".cluster")
        .data(clusters)
        .join("circle")
        .attr("class", "cluster")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => Math.sqrt(d.count) * 5) // Radius scales with count
        .attr("fill", "blue")
        .attr("opacity", 0.7)
        .on("mouseover", (event, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`Cluster Size: ${d.count}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
    },
    renderEntities(container, entities, xScale, yScale) {
      container
        .selectAll(".entity")
        .data(entities)
        .join("circle")
        .attr("class", "entity")
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", 5)
        .attr("fill", "blue")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`Entity: ${d.name}<br>X: ${d.x}<br>Y: ${d.y}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
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
</style>