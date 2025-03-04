# Mermaid Test

This file contains a test mermaid diagram to verify the built-in zoom and pan functionality.

## Basic Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    C --> E[Enjoy]
    D --> B
    
    %% Styling classes
    classDef default fill:#1d2537,stroke:#00c3ff,stroke-width:1.5px,color:#fff
    classDef success fill:#00993320,stroke:#00ff95,stroke-width:1.5px
    classDef warning fill:#ffa20020,stroke:#ffa200,stroke-width:1.5px
    
    class C success
    class D warning
```

## Using Mermaid's Built-in Zoom and Pan

Mermaid diagrams now have built-in zoom and pan functionality:

1. **Mouse wheel** - Zoom in and out
2. **Click and drag** - Pan around the diagram
3. **Double-click** - Reset the view

Try it on any of the diagrams on this page!