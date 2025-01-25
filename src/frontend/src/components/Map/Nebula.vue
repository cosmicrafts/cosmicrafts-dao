<template>
      <svg :width="width" :height="height" class="nebula">
        <defs>
          <!-- Noise Filter with Turbulence and Displacement -->
          <filter :id="filterId">
            <feTurbulence
              type="fractalNoise"
              :baseFrequency="noiseFrequency"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              :scale="displacementScale"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur :stdDeviation="blurAmount" />
          </filter>
    
          <!-- Gradient for Nebula Color -->
          <radialGradient :id="gradientId" cx="50%" cy="50%" r="50%">
            <stop offset="0%" :stop-color="colorStart" />
            <stop offset="100%" :stop-color="colorEnd" stop-opacity="0" />
          </radialGradient>
        </defs>
    
        <!-- Procedural Nebula Path -->
        <path
          :d="nebulaPath"
          :fill="`url(#${gradientId})`"
          :filter="`url(#${filterId})`"
          :opacity="opacity"
        />
      </svg>
    </template>
    
    <script>
    export default {
      name: "Nebula",
      props: {
        width: { type: Number, default: 1920 },
        height: { type: Number, default: 1080 },
        size: { type: Number, default: 0.1 },
        // Procedural Parameters
        noiseFrequency: { type: Number, default: 0.02 },
        displacementScale: { type: Number, default: 50 },
        blurAmount: { type: Number, default: 15 },
        colorStart: { type: String, default: "rgba(100, 80, 255, 0.8)" },
        colorEnd: { type: String, default: "rgba(200, 100, 255, 0.2)" },
        opacity: { type: Number, default: 0.7 },
      },
      data() {
        return {
          filterId: `nebula-filter-${Math.random().toString(36).substr(2, 9)}`,
          gradientId: `nebula-gradient-${Math.random().toString(36).substr(2, 9)}`,
          nebulaPath: "",
        };
      },
      created() {
        this.generateNebulaPath();
      },
      methods: {
        generateNebulaPath() {
          const centerX = this.width / 2;
          const centerY = this.height / 2;
          const radiusX = this.width * this.size;
          const radiusY = this.height * this.size;
          const points = [];
    
          // Generate randomized control points
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radiusX + this.random(-50, 50);
            const y = centerY + Math.sin(angle) * radiusY + this.random(-50, 50);
            points.push({ x, y });
          }
    
          // Create smooth SVG path
          this.nebulaPath = this.createSmoothPath(points);
        },
        createSmoothPath(points) {
          let path = `M ${points[0].x} ${points[0].y}`;
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y;
            const cp2x = curr.x - (curr.x - prev.x) * 0.5;
            const cp2y = curr.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
          }
          return path + " Z";
        },
        random(min, max) {
          return Math.random() * (max - min) + min;
        },
      },
    };
    </script>
    
    <style scoped>
    .nebula {
      position: absolute;
      pointer-events: none;
      mix-blend-mode: screen;
    }
    </style>