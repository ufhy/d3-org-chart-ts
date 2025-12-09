# 📊 D3 Org Chart - TypeScript Edition

A fully type-safe TypeScript implementation of the D3-based organizational chart library.

> **Original Source**: This project is based on [bumbeishvili/org-chart](https://github.com/bumbeishvili/org-chart)  
> Converted to TypeScript with full type safety and modern tooling.
> Generate using [Claude Code](https://claude.com/product/claude-code) and [Antigravity](https://antigravity.google/) `:sweat_smile:`

![D3.js](https://img.shields.io/badge/D3.js-v7-orange)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646cff)

---

## ✨ Features

- ✅ **100% TypeScript** - Fully typed with comprehensive type definitions
- 🎨 **Highly Customizable** - Complete control over node appearance and behavior
- 📱 **Responsive** - Works seamlessly on all screen sizes
- 🔍 **Interactive** - Zoom, pan, expand/collapse nodes with smooth animations
- 📤 **Export Ready** - Export to SVG or PNG formats
- ⚡ **Performance Optimized** - Handles large organizational hierarchies efficiently
- 🎯 **IntelliSense Support** - Full IDE autocomplete for all methods and properties
- 🔧 **Flexible Layouts** - Multiple layout options (top, bottom, left, right)
- 📦 **Compact Mode** - Space-efficient compact layout for large trees
- 🎭 **Custom Styling** - Full control over node content, buttons, and connections

---

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install

# Using bun
bun install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the demo.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## 📖 Basic Usage

```typescript
import { OrgChart } from './org-chart/d3-org-chart'

const data = [
  { id: '1', name: 'CEO', position: 'Chief Executive Officer' },
  { id: '2', parentId: '1', name: 'CTO', position: 'Chief Technology Officer' },
  { id: '3', parentId: '1', name: 'CFO', position: 'Chief Financial Officer' },
  { id: '4', parentId: '2', name: 'Dev Lead', position: 'Development Lead' }
]

const chart = new OrgChart()
  .container('#chart')
  .data(data)
  .nodeWidth(() => 250)
  .nodeHeight(() => 120)
  .render()
```

---

## 🎨 Live Demo Features

The included demo (`src/main.ts`) showcases:

- 📸 **Avatar Images** - Profile pictures for each employee
- 🎨 **Department Colors** - Color-coded by department
- 🔘 **Interactive Buttons** - Expand/collapse with node counts
- 📊 **Sample Data** - Pre-populated organizational structure
- 🖱️ **Full Interaction** - Click, zoom, pan, and navigate
- 💾 **Export Options** - SVG and PNG export functionality
- 🎛️ **Control Panel** - Compact mode, expand/collapse all, fit to screen

---

## 🔧 Core API Methods

### Configuration

```typescript
chart
  .container('#chart')           // Set container element
  .data(data)                    // Set hierarchical data
  .nodeWidth(() => 280)          // Set node width
  .nodeHeight(() => 150)         // Set node height
  .compact(false)                // Enable/disable compact mode
  .layout('top')                 // Set layout direction
  .childrenMargin(() => 50)      // Margin between parent and children
  .siblingsMargin(() => 20)      // Margin between siblings
  .neighbourMargin(() => 80)     // Margin between neighbor nodes
```

### Rendering

```typescript
chart.render()                   // Initial render
chart.update(params)             // Update with new data
chart.clear()                    // Clear the chart
```

### Navigation & Interaction

```typescript
chart.fit()                      // Fit chart to screen
chart.zoomIn()                   // Zoom in
chart.zoomOut()                  // Zoom out
chart.initialZoom(1.5)          // Set initial zoom level
```

### Expand/Collapse

```typescript
chart.expandAll()                // Expand all nodes
chart.collapseAll()              // Collapse all nodes
chart.setExpanded(nodeId, true)  // Expand specific node
```

### Export

```typescript
chart.exportSvg()                // Export as SVG
chart.exportImg({                // Export as PNG
  full: true,
  save: true,
  backgroundColor: '#ffffff'
})
```

### Event Handlers

```typescript
chart
  .onNodeClick((node) => {
    console.log('Clicked:', node.data)
    return node
  })
  .onExpandOrCollapse((node) => {
    console.log('Toggled:', node.data)
    return node
  })
  .onZoom((event) => {
    console.log('Zoom:', event.transform)
  })
```

---

## 🎨 Customization

### Custom Node Content

```typescript
chart.nodeContent((node) => `
  <div class="custom-node">
    <img src="${node.data.avatar}" alt="${node.data.name}">
    <h3>${node.data.name}</h3>
    <p>${node.data.position}</p>
    <span>${node.data.department}</span>
  </div>
`)
```

### Custom Button Content

```typescript
chart.buttonContent(({ node, state }) => `
  <div class="expand-button">
    <span>${node.children ? '−' : '+'}</span>
    <span>${node.data._directSubordinates || 0}</span>
  </div>
`)
```

### Custom Styling

```typescript
chart
  .nodeWidth(() => 280)
  .nodeHeight(() => 150)
  .childrenMargin(() => 50)
  .siblingsMargin(() => 20)
  .compactMarginBetween(() => 35)
  .compactMarginPair(() => 30)
```

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | ~5.9.3 | Type-safe JavaScript |
| **D3.js** | v7 | Data visualization core |
| **Vite** | Rolldown 7.2.5 | Build tool & dev server |
| **d3-flextree** | ^2.1.2 | Flexible tree layout algorithm |
| **d3-hierarchy** | ^3.1.2 | Hierarchical data structures |
| **d3-zoom** | ^3.0.0 | Zoom and pan behavior |
| **d3-selection** | ^3.0.0 | DOM manipulation |

---

## 🏗️ Project Structure

```
org-chart/
├── src/
│   ├── org-chart/
│   │   ├── d3-org-chart.ts          # Main chart implementation
│   │   ├── types.d.ts               # TypeScript type definitions
│   │   └── generated_org_data.json  # Sample data
│   ├── main.ts                      # Demo application
│   └── style.css                    # Global styles
├── public/                          # Static assets
├── dist/                            # Build output
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── README.md                        # This file
└── USAGE.md                         # Detailed API documentation
```

---

## 📚 Documentation

- **[USAGE.md](USAGE.md)** - Complete API reference and advanced usage
- **[src/main.ts](src/main.ts)** - Full working example with all features
- **[src/org-chart/types.d.ts](src/org-chart/types.d.ts)** - TypeScript type definitions

---

## 🎯 TypeScript Features

### Full Type Safety

```typescript
// All methods are fully typed
const chart = new OrgChart()
  .container('#chart')              // string | HTMLElement
  .data(data)                       // OrgChartNodeData[]
  .nodeWidth((node) => 250)         // NodeAccessor<number>
  .onNodeClick((node) => node)      // NodeClickCallback
```

### Custom Type Extensions

The library includes comprehensive type definitions:

- `OrgChartNodeData` - Node data structure
- `OrgChartNode` - Extended hierarchy node
- `Connection` - Custom node connections
- `LayoutType` - Layout directions
- `NodeAccessor<T>` - Generic node accessor
- `PatternifyParams` - D3 selection extension
- And many more...

### IntelliSense Support

Full autocomplete support in modern IDEs:
- Method signatures
- Parameter types
- Return types
- JSDoc documentation

---

## 🔄 Data Format

Your data should be an array of objects with `id` and `parentId` properties:

```typescript
interface OrgChartNodeData {
  id: string | number
  parentId?: string | number
  
  // Custom properties
  name?: string
  position?: string
  department?: string
  email?: string
  image?: string
  [key: string]: any  // Any additional properties
}
```

**Example:**

```typescript
const data = [
  { 
    id: '1', 
    name: 'John Doe', 
    position: 'CEO',
    department: 'Executive',
    email: 'john@company.com'
  },
  { 
    id: '2', 
    parentId: '1',
    name: 'Jane Smith', 
    position: 'CTO',
    department: 'Technology'
  }
]
```

---

## 🎮 Interactive Controls

The demo includes these controls:

| Button | Action |
|--------|--------|
| **Compact** | Switch to compact layout mode |
| **Horizontal** | Switch to horizontal layout mode |
| **Expand All** | Expand all collapsed nodes |
| **Collapse All** | Collapse all expanded nodes |
| **Fit to Screen** | Auto-fit chart to viewport |
| **Export SVG** | Download chart as SVG |
| **Export PNG** | Download chart as PNG |

---

## 🎨 Styling

The chart is fully customizable via CSS. Key classes:

```css
.node-card          /* Node container */
.node-header        /* Node header section */
.node-avatar        /* Avatar image */
.node-body          /* Node content area */
.node-name          /* Employee name */
.node-position      /* Job position */
.node-department    /* Department */
.button-content     /* Expand/collapse button */
```

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

## 📝 License

Based on the original [d3-org-chart](https://github.com/bumbeishvili/org-chart) library by [bumbeishvili](https://github.com/bumbeishvili).

---

## 🙏 Acknowledgments

- **Original Library**: [bumbeishvili/org-chart](https://github.com/bumbeishvili/org-chart)
- **D3.js Team**: For the amazing visualization library
- **TypeScript Team**: For the powerful type system
- **Vite Team**: For the blazing-fast build tool

---

## 📞 Support & Resources

- 📖 **API Documentation**: See [USAGE.md](USAGE.md)
- 💡 **Examples**: Check [src/main.ts](src/main.ts)
- 🐛 **Original Issues**: [GitHub Issues](https://github.com/bumbeishvili/org-chart/issues)
- 🌟 **Original Repository**: [bumbeishvili/org-chart](https://github.com/bumbeishvili/org-chart)

---

## 🚀 Getting Started Checklist

- [ ] Clone or download this repository
- [ ] Run `npm install` or `bun install`
- [ ] Run `npm run dev` to start development server
- [ ] Open http://localhost:5173 in your browser
- [ ] Explore the demo and interactive controls
- [ ] Check `src/main.ts` for implementation examples
- [ ] Read `USAGE.md` for detailed API documentation
- [ ] Customize node content and styling for your needs
- [ ] Build for production with `npm run build`

---

**Made with ❤️ using TypeScript and D3.js**

*TypeScript conversion and enhancements by the community*
