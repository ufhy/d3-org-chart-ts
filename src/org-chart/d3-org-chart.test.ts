import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrgChart } from './d3-org-chart'
import type { OrgChartNodeData } from './types'

describe('OrgChart Class', () => {
  let chart: OrgChart
  let sampleData: OrgChartNodeData[]

  beforeEach(() => {
    // Mock window object - compatible with both Vitest and Bun
    globalThis.window = {
      innerHeight: 600
    } as any

    // Mock document.createElement for canvas context
    const mockContext = {
      font: '',
      measureText: vi.fn((text: string) => ({
        width: text.length * 8
      }))
    }

    globalThis.document = {
      createElement: vi.fn((tag: string) => {
        if (tag === 'canvas') {
          return {
            getContext: vi.fn(() => mockContext)
          }
        }
        return {}
      })
    } as any

    chart = new OrgChart()
    sampleData = [
      { id: '1', name: 'CEO', position: 'Chief Executive Officer' },
      { id: '2', parentId: '1', name: 'CTO', position: 'Chief Technology Officer' },
      { id: '3', parentId: '1', name: 'CFO', position: 'Chief Financial Officer' },
      { id: '4', parentId: '2', name: 'Dev Lead', position: 'Development Lead' }
    ]
  })

  describe('Initialization', () => {
    it('should create instance with default attributes', () => {
      expect(chart).toBeInstanceOf(OrgChart)
      // compact defaults to true
      expect(chart.compact()).toBe(true)
      expect(chart.layout()).toBe('top')
      // duration is a number (400)
      expect(chart.duration()).toBe(400)
    })

    it('should support fluent API chaining', () => {
      const result = chart
        .compact(true)
        .layout('left')
        .duration(500)

      expect(result).toBe(chart)
      expect(chart.compact()).toBe(true)
      expect(chart.layout()).toBe('left')
      expect(chart.duration()).toBe(500)
    })

    it('should have default scale extent', () => {
      // scaleExtent returns an array directly
      const extent = chart.scaleExtent()
      expect(Array.isArray(extent)).toBe(true)
      // Default is [0.001, 20] not [0.1, 10]
      expect(extent).toEqual([0.001, 20])
    })

    it('should have default root margin', () => {
      // rootMargin returns a number directly
      expect(chart.rootMargin()).toBe(40)
    })
  })

  describe('Data Processing', () => {
    it('should accept and store data', () => {
      chart.data(sampleData)

      const storedData = chart.data()
      expect(storedData).toEqual(sampleData)
    })

    it('should handle empty data array', () => {
      chart.data([])

      const storedData = chart.data()
      expect(storedData).toEqual([])
    })

    it('should return null when no data is set', () => {
      const data = chart.data()
      expect(data).toBeNull()
    })
  })

  describe('Configuration - Layout', () => {
    it('should set and get layout', () => {
      chart.layout('bottom')
      expect(chart.layout()).toBe('bottom')
    })

    it('should accept all valid layout types', () => {
      const layouts: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right']

      layouts.forEach(layout => {
        chart.layout(layout)
        expect(chart.layout()).toBe(layout)
      })
    })

    it('should set compact mode', () => {
      chart.compact(true)
      expect(chart.compact()).toBe(true)

      chart.compact(false)
      expect(chart.compact()).toBe(false)
    })
  })

  describe('Configuration - Dimensions', () => {
    it('should set and get node width function', () => {
      const widthFn = () => 300
      chart.nodeWidth(widthFn)

      const retrievedFn = chart.nodeWidth()
      expect(typeof retrievedFn).toBe('function')
      expect(retrievedFn({} as any)).toBe(300)
    })

    it('should set and get node height function', () => {
      const heightFn = () => 200
      chart.nodeHeight(heightFn)

      const retrievedFn = chart.nodeHeight()
      expect(typeof retrievedFn).toBe('function')
      expect(retrievedFn({} as any)).toBe(200)
    })

    it('should set SVG dimensions', () => {
      chart.svgWidth(1200)
      chart.svgHeight(800)

      expect(chart.svgWidth()).toBe(1200)
      expect(chart.svgHeight()).toBe(800)
    })
  })

  describe('Configuration - Margins', () => {
    it('should set and get children margin', () => {
      const marginFn = () => 60
      chart.childrenMargin(marginFn)

      const retrievedFn = chart.childrenMargin()
      expect(typeof retrievedFn).toBe('function')
      expect(retrievedFn({} as any)).toBe(60)
    })

    it('should set and get siblings margin', () => {
      const marginFn = () => 30
      chart.siblingsMargin(marginFn)

      const retrievedFn = chart.siblingsMargin()
      expect(typeof retrievedFn).toBe('function')
      expect(retrievedFn({} as any)).toBe(30)
    })

    it('should set and get neighbour margin', () => {
      const marginFn = () => 50
      chart.neighbourMargin(marginFn)

      const retrievedFn = chart.neighbourMargin()
      expect(typeof retrievedFn).toBe('function')
      expect(retrievedFn({} as any, {} as any)).toBe(50)
    })

    it('should set root margin', () => {
      chart.rootMargin(100)
      expect(chart.rootMargin()).toBe(100)
    })
  })

  describe('Configuration - Zoom', () => {
    it('should set scale extent', () => {
      chart.scaleExtent([0.5, 3])

      const extent = chart.scaleExtent()
      expect(extent).toEqual([0.5, 3])
    })

    it('should set initial zoom level', () => {
      // initialZoom is a setter-only method (no getter)
      // It sets the zoom level and returns this for chaining
      const result = chart.initialZoom(0.8)
      expect(result).toBe(chart)
    })
  })

  describe('Configuration - Styling', () => {
    it('should set default font', () => {
      chart.defaultFont('Arial')
      expect(chart.defaultFont()).toBe('Arial')
    })

    it('should set duration', () => {
      chart.duration(600)
      expect(chart.duration()).toBe(600)
    })

    it('should set link Y offset', () => {
      chart.linkYOffset(10)
      expect(chart.linkYOffset()).toBe(10)
    })
  })

  describe('Configuration - Connections', () => {
    it('should set and get connections', () => {
      const connections = [
        { from: '1', to: '2', label: 'Reports to' }
      ]

      chart.connections(connections)
      expect(chart.connections()).toEqual(connections)
    })

    it('should handle empty connections array', () => {
      chart.connections([])
      expect(chart.connections()).toEqual([])
    })
  })

  describe('Fluent API', () => {
    it('should chain multiple configuration calls', () => {
      const result = chart
        .layout('left')
        .compact(true)
        .duration(500)
        .rootMargin(50)
        .defaultFont('Roboto')
        .initialZoom(0.9)

      expect(result).toBe(chart)
      expect(chart.layout()).toBe('left')
      expect(chart.compact()).toBe(true)
      expect(chart.duration()).toBe(500)
      expect(chart.rootMargin()).toBe(50)
      expect(chart.defaultFont()).toBe('Roboto')
      // initialZoom is setter-only, no getter to test
    })
  })
})
