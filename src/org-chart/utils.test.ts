import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrgChart } from './d3-org-chart'

describe('OrgChart Utility Functions', () => {
  let chart: OrgChart

  beforeEach(() => {
    // Mock window object
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
  })

  describe('groupBy', () => {
    it('should group array by accessor function', () => {
      const data = [
        { id: 1, dept: 'Tech', name: 'Alice' },
        { id: 2, dept: 'Tech', name: 'Bob' },
        { id: 3, dept: 'HR', name: 'Charlie' }
      ]

      const result = chart.groupBy(
        data,
        (item) => item.dept,
        (group) => group.length
      )

      expect(result).toEqual([
        ['Tech', 2],
        ['HR', 1]
      ])
    })

    it('should handle empty array', () => {
      const result = chart.groupBy([], (item: any) => item.key, (group) => group)
      expect(result).toEqual([])
    })

    it('should apply aggregator function correctly', () => {
      const data = [
        { id: 1, category: 'A', value: 10 },
        { id: 2, category: 'A', value: 20 },
        { id: 3, category: 'B', value: 30 }
      ]

      const result = chart.groupBy(
        data,
        (item) => item.category,
        (group) => group.reduce((sum, item) => sum + item.value, 0)
      )

      expect(result).toEqual([
        ['A', 30],
        ['B', 30]
      ])
    })

    it('should handle single item per group', () => {
      const data = [
        { id: 1, type: 'X' },
        { id: 2, type: 'Y' },
        { id: 3, type: 'Z' }
      ]

      const result = chart.groupBy(
        data,
        (item) => item.type,
        (group) => group[0]
      )

      expect(result).toHaveLength(3)
      expect(result[0][0]).toBe('X')
      expect(result[1][0]).toBe('Y')
      expect(result[2][0]).toBe('Z')
    })

    it('should convert numeric keys to strings', () => {
      const data = [
        { id: 1, level: 1 },
        { id: 2, level: 1 },
        { id: 3, level: 2 }
      ]

      const result = chart.groupBy(
        data,
        (item) => item.level,
        (group) => group.length
      )

      expect(result).toEqual([
        ['1', 2],
        ['2', 1]
      ])
    })
  })

  describe('getTextWidth', () => {
    let mockContext: any

    beforeEach(() => {
      // Mock canvas context
      mockContext = {
        font: '',
        measureText: vi.fn((text: string) => ({
          width: text.length * 8 // Simple mock: 8px per character
        }))
      }

      // Mock document.createElement for canvas
      globalThis.document = {
        createElement: vi.fn(() => ({
          getContext: vi.fn(() => mockContext)
        }))
      } as any
    })

    it('should measure text width with default params', () => {
      const width = chart.getTextWidth('Hello', {
        ctx: mockContext
      })

      expect(width).toBe(40) // 5 characters * 8px
      expect(mockContext.measureText).toHaveBeenCalledWith('Hello')
    })

    it('should handle empty string', () => {
      const width = chart.getTextWidth('', {
        ctx: mockContext
      })

      expect(width).toBe(0)
    })

    it('should apply font parameters', () => {
      chart.getTextWidth('Test', {
        fontSize: 16,
        fontWeight: '700',
        defaultFont: 'Arial',
        ctx: mockContext
      })

      expect(mockContext.font).toContain('16px')
      expect(mockContext.font).toContain('700')
      expect(mockContext.font).toContain('Arial')
    })

    it('should use default font parameters when not provided', () => {
      chart.getTextWidth('Sample', {
        ctx: mockContext
      })

      // Default fontSize is 14, fontWeight is "400", defaultFont is "Helvetice"
      expect(mockContext.font).toContain('14px')
    })

    it('should measure longer text correctly', () => {
      const longText = 'This is a longer text string'
      const width = chart.getTextWidth(longText, {
        ctx: mockContext
      })

      expect(width).toBe(longText.length * 8)
      expect(mockContext.measureText).toHaveBeenCalledWith(longText)
    })
  })
})
