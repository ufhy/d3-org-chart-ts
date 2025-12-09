import './style.css'
import { OrgChart } from './org-chart/d3-org-chart'
import data from './org-chart/generated_org_data.json'
import type { OrgChartNodeData } from './org-chart/types'

// Setup the app container
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="org-chart-container">
    <div class="header">
      <h1>Organization Chart</h1>
      <div class="controls">
        <button id="compact" class="btn">Compact</button>
        <button id="horizontal" class="btn">Horizontal</button>
        <button id="expand-all" class="btn">Expand All</button>
        <button id="collapse-all" class="btn">Collapse All</button>
        <button id="fit-chart" class="btn">Fit to Screen</button>
        <button id="export-svg" class="btn">Export SVG</button>
        <button id="export-png" class="btn">Export PNG</button>
      </div>
    </div>
    <div id="chart"></div>
  </div>
`

const dataList = data as OrgChartNodeData[]

// Initialize the org chart
const chart = new OrgChart<OrgChartNodeData>()
  .container('#chart')
  .data(dataList)
  .compact(false)
  .nodeWidth(() => 280)
  .nodeHeight(() => 150)
  .childrenMargin(() => 50)
  .compactMarginBetween(() => 35)
  .compactMarginPair(() => 30)
  .neighbourMargin(() => 50)
  .siblingsMargin(() => 20)
  .nodeContent((d) => {
    const color = getColorByDepartment(d.data.department || 'Default')
    return `
      <div class="node-card" style="border-color: ${color}">
        <div class="node-header" style="background: ${color}">
          <img src="${d.data.image || 'https://i.pravatar.cc/150'}"
               alt="${d.data.name}"
               class="node-avatar"
               onerror="this.src='https://i.pravatar.cc/150?img=68'">
        </div>
        <div class="node-body">
          <div class="node-name">${d.data.name || 'N/A'}</div>
          <div class="node-position">${d.data.position || 'N/A'}</div>
          <div class="node-department">${d.data.department || 'N/A'}</div>
          <div class="node-email">${d.data.email || 'N/A'}</div>
        </div>
      </div>
    `
  })
  .buttonContent(({ node }: { node: any; state: any }) => {
    return `
      <div class="button-content">
        <span class="button-icon">
          ${node.children ? '−' : '+'}
        </span>
        <span class="button-count">
          ${node.data._directSubordinates || 0}
        </span>
      </div>
    `
  })
  .onNodeClick((d: any) => {
    console.log('Node clicked:', d.data)
    return d
  })
  .render()

// Helper function to get color by department
function getColorByDepartment(department: string): string {
  const colors: Record<string, string> = {
    'Executive': '#6366f1',
    'Technology': '#8b5cf6',
    'Finance': '#ec4899',
    'Marketing': '#f59e0b',
    'Default': '#6b7280'
  }
  return colors[department] || colors['Default']
}

// Setup button event handlers
document.getElementById('compact')?.addEventListener('click', () => {
  chart.compact(true).render()
})
document.getElementById('horizontal')?.addEventListener('click', () => {
  chart.compact(false).render()
})
document.getElementById('expand-all')?.addEventListener('click', () => {
  chart.expandAll()
  chart.fit()
})

document.getElementById('collapse-all')?.addEventListener('click', () => {
  chart.collapseAll()
  chart.fit()
})

document.getElementById('fit-chart')?.addEventListener('click', () => {
  chart.fit()
})

document.getElementById('export-svg')?.addEventListener('click', () => {
  chart.exportSvg()
})

document.getElementById('export-png')?.addEventListener('click', () => {
  chart.exportImg({
    full: true,
    save: true,
    backgroundColor: '#ffffff'
  })
})

// Add some styles for better appearance
const style = document.createElement('style')
style.textContent = `
  .org-chart-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }

  .header {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header h1 {
    margin: 0 0 15px 0;
    color: #1f2937;
    font-size: 24px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn {
    padding: 8px 16px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn:hover {
    background: #4f46e5;
  }

  #chart {
    flex: 1;
    overflow: hidden;
  }

  .node-card {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 8px;
    border: 3px solid;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .node-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .node-header {
    padding: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .node-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid white;
    object-fit: cover;
  }

  .node-body {
    padding: 12px 15px 15px;
    text-align: center;
  }

  .node-name {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .node-position {
    font-size: 14px;
    color: #6366f1;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .node-department {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .node-email {
    font-size: 11px;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .button-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .button-icon {
    font-size: 20px;
    font-weight: bold;
    color: black;
  }

  .button-count {
    font-size: 11px;
    color: white;
    margin-top: 2px;
  }
`
document.head.appendChild(style)

console.log('✅ Org Chart initialized with', data.length, 'nodes')
