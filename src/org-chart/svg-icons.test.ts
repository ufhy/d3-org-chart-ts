import { describe, it, expect } from 'vitest'
import { createIconSVG, getLayoutIcon, SVG_ICONS } from './svg-icons'

describe('SVG Icons', () => {
  describe('createIconSVG', () => {
    it('should create SVG with icon path and count', () => {
      const result = createIconSVG(SVG_ICONS.chevronRight, 5)

      expect(result).toContain('<svg')
      expect(result).toContain('width="8"')
      expect(result).toContain('height="8"')
      expect(result).toContain('>5</span>')
      expect(result).toContain(SVG_ICONS.chevronRight)
    })

    it('should apply margin-left when provided', () => {
      const result = createIconSVG(SVG_ICONS.chevronDown, 3, '10px')

      expect(result).toContain('margin-left:10px')
    })

    it('should handle zero count', () => {
      const result = createIconSVG(SVG_ICONS.chevronUp, 0)

      expect(result).toContain('>0</span>')
    })

    it('should use default margin-left of 0 when not provided', () => {
      const result = createIconSVG(SVG_ICONS.chevronLeft, 2)

      expect(result).toContain('margin-left:0')
    })
  })

  describe('getLayoutIcon', () => {
    it('should return chevronLeft for left layout with children', () => {
      const result = getLayoutIcon('left', true)
      expect(result).toBe(SVG_ICONS.chevronLeft)
    })

    it('should return chevronRight for left layout without children', () => {
      const result = getLayoutIcon('left', false)
      expect(result).toBe(SVG_ICONS.chevronRight)
    })

    it('should return chevronRight for right layout with children', () => {
      const result = getLayoutIcon('right', true)
      expect(result).toBe(SVG_ICONS.chevronRight)
    })

    it('should return chevronLeft for right layout without children', () => {
      const result = getLayoutIcon('right', false)
      expect(result).toBe(SVG_ICONS.chevronLeft)
    })

    it('should return chevronUp for top layout with children', () => {
      const result = getLayoutIcon('top', true)
      expect(result).toBe(SVG_ICONS.chevronUp)
    })

    it('should return chevronDown for top layout without children', () => {
      const result = getLayoutIcon('top', false)
      expect(result).toBe(SVG_ICONS.chevronDown)
    })

    it('should return chevronDown for bottom layout with children', () => {
      const result = getLayoutIcon('bottom', true)
      expect(result).toBe(SVG_ICONS.chevronDown)
    })

    it('should return chevronUp for bottom layout without children', () => {
      const result = getLayoutIcon('bottom', false)
      expect(result).toBe(SVG_ICONS.chevronUp)
    })
  })

  describe('SVG_ICONS constants', () => {
    it('should have all required icon paths', () => {
      expect(SVG_ICONS.chevronLeft).toBeDefined()
      expect(SVG_ICONS.chevronRight).toBeDefined()
      expect(SVG_ICONS.chevronUp).toBeDefined()
      expect(SVG_ICONS.chevronDown).toBeDefined()
    })

    it('should have valid SVG path data', () => {
      expect(SVG_ICONS.chevronLeft).toContain('<path')
      expect(SVG_ICONS.chevronRight).toContain('<path')
      expect(SVG_ICONS.chevronUp).toContain('<path')
      expect(SVG_ICONS.chevronDown).toContain('<path')
    })
  })
})
