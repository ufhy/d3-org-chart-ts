# D3 Org Chart - Usage Guide

> **Original Source**: This project is based on [bumbeishvili/org-chart](https://github.com/bumbeishvili/org-chart)  
> Converted to TypeScript with full type safety and modern tooling.

---

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install

# Using bun (recommended)
bun install
```

### Development

```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

Buka browser di `http://localhost:5173`

### Build

```bash
# Using npm
npm run build

# Using bun
bun run build
```

Output akan ada di folder `dist/`

---

## 📖 Basic Usage

### 1. Import the Library

```typescript
import { OrgChart } from './js/d3/d3-org-chart'
import type { OrgChartNodeData } from './js/d3/types'
```

### 2. Prepare Your Data

```typescript
const data: OrgChartNodeData[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'CEO',
    department: 'Executive'
  },
  {
    id: '2',
    parentId: '1',  // Links to parent node
    name: 'Jane Smith',
    position: 'CTO',
    department: 'Technology'
  }
  // ... more nodes
]
```

**Required Fields:**
- `id`: Unique identifier (string or number)
- `parentId`: ID of parent node (omit for root node)

**Optional Fields:**
- Any custom properties you want (name, position, email, etc.)

### 3. Initialize the Chart

```typescript
const chart = new OrgChart()
  .container('#chart')           // CSS selector for container
  .data(data)                    // Your org data
  .nodeWidth(() => 280)          // Node width in pixels
  .nodeHeight(() => 150)         // Node height in pixels
  .render()                      // Render the chart
```

---

## 🎨 Customization

### Node Content

Customize how each node looks:

```typescript
chart.nodeContent((node) => {
  return `
    <div class="custom-node">
      <h3>${node.data.name}</h3>
      <p>${node.data.position}</p>
    </div>
  `
})
```

### Button Content

Customize expand/collapse buttons:

```typescript
chart.buttonContent(({ node }) => {
  return `
    <div>
      ${node.children ? '−' : '+'}
      (${node.data._directSubordinates || 0})
    </div>
  `
})
```

### Layout Configuration

```typescript
chart
  .childrenMargin(() => 50)         // Vertical spacing between levels
  .siblingsMargin(() => 20)         // Horizontal spacing between siblings
  .neighbourMargin(() => 50)        // Spacing between non-sibling neighbors
  .compactMarginBetween(() => 35)   // Compact layout margins
  .compactMarginPair(() => 30)      // Compact layout pair margins
```

### Layout Direction

```typescript
chart.layout('top')    // top, bottom, left, or right
```

### Compact Mode

```typescript
chart.compact(true)    // Enable compact layout
```

---

## 🔧 Methods

### Navigation

```typescript
chart.fit()              // Fit chart to screen
chart.zoomIn()           // Zoom in
chart.zoomOut()          // Zoom out
chart.initialZoom(0.8)   // Set initial zoom level
```

### Expand/Collapse

```typescript
chart.expandAll()                    // Expand all nodes
chart.collapseAll()                  // Collapse all nodes
chart.expand(node)                   // Expand specific node
chart.collapse(node)                 // Collapse specific node
chart.setExpanded('nodeId', true)    // Set expansion by ID
```

### Centering

```typescript
chart.setCentered('nodeId')  // Center on specific node
```

### Highlighting

```typescript
chart.setHighlighted('nodeId')              // Highlight a node
chart.setUpToTheRootHighlighted('nodeId')   // Highlight path to root
chart.clearHighlighting()                   // Clear all highlights
```

### Data Manipulation

```typescript
// Add new node
chart.addNode({
  id: 'new-id',
  parentId: 'parent-id',
  name: 'New Employee'
})

// Remove node
chart.removeNode('nodeId')
```

### Export

```typescript
// Export as SVG
chart.exportSvg()

// Export as PNG
chart.exportImg({
  full: true,              // Export full chart (not just visible area)
  save: true,              // Auto-download
  scale: 2,                // Image quality (higher = better quality)
  backgroundColor: '#fff'  // Background color
})
```

---

## 📊 Events

### Node Click

```typescript
chart.onNodeClick((node) => {
  console.log('Clicked:', node.data)
  // Do something with the clicked node
  return node
})
```

### Expand/Collapse

```typescript
chart.onExpandOrCollapse((node) => {
  console.log('Expanded/Collapsed:', node.data)
  return node
})
```

### Zoom Events

```typescript
chart
  .onZoomStart((event) => {
    console.log('Zoom started')
  })
  .onZoom((event) => {
    console.log('Zooming:', event.transform)
  })
  .onZoomEnd((event) => {
    console.log('Zoom ended')
  })
```

---

## 🎯 Advanced Features

### Custom Node IDs

By default, the chart looks for `id` and `parentId` properties. You can customize:

```typescript
chart
  .nodeId((d) => d.employeeId)      // Use custom ID field
  .parentNodeId((d) => d.managerId) // Use custom parent ID field
```

### Dynamic Sizing

```typescript
chart
  .nodeWidth((node) => {
    // Different widths based on node level
    return node.depth === 0 ? 350 : 280
  })
  .nodeHeight((node) => {
    // Different heights based on data
    return node.data.hasLongBio ? 200 : 150
  })
```

### Connections (Custom Links)

```typescript
const connections = [
  {
    from: 'node1',
    to: 'node2',
    label: 'Reports to'
  }
]

chart.connections(connections)
```

### Custom Styles with Callbacks

```typescript
chart
  .nodeUpdate(function(node) {
    // 'this' refers to the SVG element
    d3.select(this)
      .style('opacity', node.data.isActive ? 1 : 0.5)
  })
  .linkUpdate(function(node) {
    d3.select(this)
      .style('stroke', node.data._highlighted ? 'red' : '#ccc')
  })
```

---

## 💡 Tips & Best Practices

### 1. Performance

- For large datasets (>500 nodes), consider:
  - Using paging with `pagingStep()`
  - Starting with collapsed nodes
  - Limiting initial expand level with `initialExpandLevel`

```typescript
chart
  .initialExpandLevel(2)     // Only expand 2 levels initially
  .pagingStep(() => 10)      // Show 10 nodes per page
```

### 2. Responsive Design

```typescript
// Update chart on window resize
window.addEventListener('resize', () => {
  chart.fit()
})
```

### 3. TypeScript Integration

```typescript
// Define custom data interface
interface EmployeeData extends OrgChartNodeData {
  id: string
  parentId?: string
  name: string
  position: string
  department: string
  salary?: number
  startDate?: string
}

const data: EmployeeData[] = [...]
```

### 4. Styling

The chart uses inline styles, but you can override with CSS:

```css
.node-card {
  /* Your custom styles */
}

.node-button-g {
  /* Custom button styles */
}
```

---

## 🐛 Common Issues

### Issue: Chart not visible

**Solution:** Make sure the container has explicit width/height:

```css
#chart {
  width: 100%;
  height: 600px;
}
```

### Issue: Nodes overlap

**Solution:** Increase spacing margins:

```typescript
chart
  .childrenMargin(() => 80)
  .siblingsMargin(() => 40)
```

### Issue: TypeScript errors

**Solution:** Use type assertions or proper types:

```typescript
chart.nodeContent((node: any) => {
  // Your content
})
```

---

## 📚 Full Example

See [src/main.ts](src/main.ts) for a complete working example with:
- ✅ Sample data (12 employees)
- ✅ Custom node styling with avatars
- ✅ Department-based colors
- ✅ Interactive buttons (expand, collapse, fit, export)
- ✅ Event handlers
- ✅ Responsive design

---

## 📦 Package Information

- **D3 Version**: v7.x
- **TypeScript**: 100% type-safe
- **Zero Errors**: Fully typed conversion
- **Browser Support**: Modern browsers (ES2022+)

---

## 🤝 Contributing

This is a TypeScript conversion of the original [org-chart](https://github.com/bumbeishvili/org-chart) library.

### Goals Achieved

- ✅ Zero TypeScript compilation errors
- ✅ Full type safety with strict mode
- ✅ Comprehensive type definitions (500+ lines)
- ✅ Maintained all original functionality
- ✅ Added IntelliSense support
- ✅ Modern build tooling with Vite

---

## 📄 License

Based on the original [d3-org-chart](https://github.com/bumbeishvili/org-chart) library by [bumbeishvili](https://github.com/bumbeishvili).

---

## 🙏 Acknowledgments

- **Original Library**: [bumbeishvili/org-chart](https://github.com/bumbeishvili/org-chart)
- **D3.js Team**: For the amazing visualization library
- **TypeScript Team**: For the powerful type system
- **Vite Team**: For the blazing-fast build tool

