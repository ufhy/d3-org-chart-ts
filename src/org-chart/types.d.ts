import { HierarchyNode } from 'd3-hierarchy';
import { Selection } from 'd3-selection';
import { ZoomBehavior, D3ZoomEvent } from 'd3-zoom';
import { FlextreeLayout } from 'd3-flextree';

// ============================================================================
// Core Data Structures
// ============================================================================

/**
 * Base data interface for organization chart nodes
 * Supports flexible id/parentId property naming and custom properties
 */
export interface OrgChartNodeData {
  // ID properties (flexible naming)
  nodeId?: string | number;
  id?: string | number;
  parentNodeId?: string | number;
  parentId?: string | number;

  // Runtime state flags
  _expanded?: boolean;
  _centered?: boolean;
  _highlighted?: boolean;
  _upToTheRootHighlighted?: boolean;
  _pagingButton?: boolean;
  _pagingStep?: number;
  _directSubordinates?: number;
  _totalSubordinates?: number;
  _directSubordinatesPaging?: number;
  _filteredOut?: boolean;
  _centeredWithDescendants?: boolean;
  _children?: any[];

  // Depth property
  depth?: number;

  // Allow any custom properties
  [key: string]: any;
}

/**
 * Extended hierarchy node with layout-specific properties
 */
/**
 * Extended hierarchy node with layout-specific properties
 */
export interface OrgChartNode<Datum = any> extends HierarchyNode<Datum & OrgChartNodeData> {
  // Position coordinates
  x: number;
  y: number;
  x0?: number;
  y0?: number;

  // Dimensions
  width: number;
  height: number;

  // Compact layout properties
  flexCompactDim?: [number, number];
  firstCompact?: boolean;
  firstCompactNode?: OrgChartNode<Datum>;
  compactEven?: boolean;
  row?: number;

  // Collapsed children
  _children?: OrgChartNode<Datum>[];

  // Paging button visibility
  _pagingButton?: boolean;

  // Override parent/children types to be OrgChartNode
  // Using 'this' type to maintain type compatibility with HierarchyNode
  parent: OrgChartNode<Datum> | null;  // Explicit naming is clearer than 'this' with generics
  children?: OrgChartNode<Datum>[];
}

/**
 * Connection between two nodes (for custom relationships)
 */
export interface Connection<Datum = any> {
  from: string | number;
  to: string | number;
  label?: string;
  _source?: OrgChartNode<Datum>;
  _target?: OrgChartNode<Datum>;
}

// ============================================================================
// Callback & Accessor Types
// ============================================================================

/**
 * Generic accessor function for extracting values from nodes
 */
/**
 * Generic accessor function for extracting values from nodes
 */
export type NodeAccessor<Result, Datum = any> = (node: OrgChartNode<Datum>) => Result;

/**
 * Accessor that can work with raw data
 */
export type DataAccessor<Result, Datum = any> = (data: Datum) => Result;

/**
 * Zoom event callbacks
 */
export type ZoomCallback<Datum = any> = (event: D3ZoomEvent<SVGSVGElement, Datum>) => void;

/**
 * Node interaction callbacks
 */
export type NodeClickCallback<Datum = any> = (node: OrgChartNode<Datum>) => void;
export type NodeExpandCollapseCallback<Datum = any> = (node: OrgChartNode<Datum>) => void;

/**
 * Node content generators (return HTML strings)
 */
export type NodeContentCallback<Datum = any> = (node: OrgChartNode<Datum>) => string;

/**
 * Button content callback with state context
 */
export interface ButtonContentArgs<Datum = any> {
  node: OrgChartNode<Datum>;
  state: OrgChartAttrs<Datum>;
}
export type ButtonContentCallback<Datum = any> = (args: ButtonContentArgs<Datum>) => string;

/**
 * Paging button callback
 */
export type PagingButtonCallback<Datum = any> = (
  node: OrgChartNode<Datum>,
  index: number,
  array: OrgChartNode<Datum>[],
  state: OrgChartAttrs<Datum>
) => string;

/**
 * Node update callbacks for DOM manipulation
 */
export type NodeUpdateCallback<Datum = any> = (
  this: SVGGElement,
  node: OrgChartNode<Datum>,
  index: number,
  groups: SVGGElement[] | ArrayLike<SVGGElement>
) => void;

export type NodeEnterCallback<Datum = any> = (node: OrgChartNode<Datum>) => OrgChartNode<Datum>;
export type NodeExitCallback<Datum = any> = (node: OrgChartNode<Datum>) => OrgChartNode<Datum>;

/**
 * Link update callback for DOM manipulation
 */
export type LinkUpdateCallback<Datum = any> = (
  this: SVGPathElement,
  node: OrgChartNode<Datum>,
  index: number,
  groups: SVGPathElement[] | ArrayLike<SVGPathElement>
) => void;

/**
 * Defs (SVG definitions) generator callback
 */
export type DefsCallback<Datum = any> = (
  state: OrgChartAttrs<Datum>,
  connections: Connection<Datum>[]
) => string;

export type ConnectionsUpdateCallback<Datum = any> = (
  this: SVGPathElement,
  d: Connection<Datum>,
  i: number,
  arr: SVGPathElement[] | ArrayLike<SVGPathElement>
) => void;

// ============================================================================
// Layout System Types
// ============================================================================

/**
 * Supported layout directions
 */
export type LayoutType = 'top' | 'left' | 'right' | 'bottom';

/**
 * Parameters for coordinate transformations
 */
export interface PositionParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Point coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Compact dimension sizing functions
 */
export interface CompactDimension<Datum = any> {
  sizeColumn: (node: OrgChartNode<Datum>) => number;
  sizeRow: (node: OrgChartNode<Datum>) => number;
  reverse: <T>(arr: T[]) => T[];
}

/**
 * Layout-specific coordinate and rendering functions
 */
export interface LayoutBinding<Datum = any> {
  // Node boundary positions
  nodeLeftX: (node: OrgChartNode<Datum>) => number;
  nodeRightX: (node: OrgChartNode<Datum>) => number;
  nodeTopY: (node: OrgChartNode<Datum>) => number;
  nodeBottomY: (node: OrgChartNode<Datum>) => number;

  // Animation entry points
  nodeJoinX: (params: PositionParams) => number;
  nodeJoinY: (params: PositionParams) => number;

  // Link connection points
  linkJoinX: (params: PositionParams) => number;
  linkJoinY: (params: PositionParams) => number;
  linkX: (node: OrgChartNode<Datum>) => number;
  linkY: (node: OrgChartNode<Datum>) => number;
  linkParentX: (node: OrgChartNode<Datum>) => number;
  linkParentY: (node: OrgChartNode<Datum>) => number;

  // Compact layout link positions
  linkCompactXStart: (node: OrgChartNode<Datum>) => number;
  linkCompactYStart: (node: OrgChartNode<Datum>) => number;
  compactLinkMidX: (node: OrgChartNode<Datum>, state: OrgChartAttrs<Datum>) => number;
  compactLinkMidY: (node: OrgChartNode<Datum>, state: OrgChartAttrs<Datum>) => number;

  // Button positioning
  buttonX: (node: OrgChartNode<Datum>) => number;
  buttonY: (node: OrgChartNode<Datum>) => number;

  // Transform functions
  centerTransform: (params: { root: OrgChartNode<Datum>; rootMargin: number; scale: number; centerX: number; centerY: number }) => string;
  nodeUpdateTransform: (node: OrgChartNode<Datum>, state: OrgChartAttrs<Datum>) => string;
  zoomTransform: (transform: { x: number; y: number; k: number }) => string;

  // Flex layout
  nodeFlexSize: (params: {
    height: number;
    width: number;
    siblingsMargin: number;
    childrenMargin: number;
    state: OrgChartAttrs<Datum>;
    node: OrgChartNode<Datum>;
  }) => [number, number];

  // Compact dimensions
  compactDimension: CompactDimension<Datum>;

  // Link path generators
  diagonal: (
    source: Point,
    target: Point,
    mid?: Point | null,
    offsets?: { sy?: number; ty?: number }
  ) => string;

  hdiagonal?: (
    source: Point,
    target: Point,
    mid?: Point | null,
    offsets?: { sx?: number; tx?: number }
  ) => string;

  // Coordinate swap for layout transformations
  swap: (node: OrgChartNode<Datum>) => void;
}

// ============================================================================
// Main Configuration Interface
// ============================================================================

/**
 * Calculated properties derived from configuration
 */
export interface CalcProperties {
  id: string;
  chartWidth: number;
  chartHeight: number;
  centerX: number;
  centerY: number;
}

/**
 * Text measurement parameters
 */
export interface TextMeasurementParams {
  fontSize?: string | number;
  fontWeight?: string;
  defaultFont: string;
  ctx: CanvasRenderingContext2D;
}

/**
 * Complete chart configuration and state
 */
export interface OrgChartAttrs<Datum = any> {
  // ========== Internal/Private Properties ==========
  id: string;
  firstDraw: boolean;
  ctx: CanvasRenderingContext2D;
  initialExpandLevel: number;
  nodeDefaultBackground: string;
  lastTransform: { x: number; y: number; k: number };
  allowedNodesCount: Record<string, number>;
  zoomBehavior: ZoomBehavior<SVGSVGElement, Datum> | null;
  generateRoot: ((data: Datum[]) => OrgChartNode<Datum>) | null;

  // Calculated properties
  calc?: CalcProperties;

  // Hierarchy data
  allNodes?: OrgChartNode<Datum>[];
  root?: OrgChartNode<Datum>;

  // Flextree layout instance
  flexTreeLayout?: FlextreeLayout<Datum>;

  // ========== SVG Elements ==========
  svg?: Selection<SVGSVGElement, unknown, null, undefined>;
  chart?: Selection<SVGGElement, unknown, null, undefined>;
  centerG?: Selection<SVGGElement, unknown, null, undefined>;
  linksWrapper?: Selection<SVGGElement, unknown, null, undefined>;
  nodesWrapper?: Selection<SVGGElement, unknown, null, undefined>;
  connectionsWrapper?: Selection<SVGGElement, unknown, null, undefined>;
  defsWrapper?: Selection<SVGGElement, unknown, null, undefined>;

  // ========== Public Configuration ==========
  svgWidth: number;
  svgHeight: number;
  container: string | HTMLElement;
  data: Datum[] | null;
  connections: Connection<Datum>[];
  defaultFont: string;

  // ========== Data Accessors ==========
  nodeId: DataAccessor<string | number, Datum>;
  parentNodeId: DataAccessor<string | number, Datum>;

  // ========== Layout Configuration ==========
  rootMargin: number;
  nodeWidth: NodeAccessor<number, Datum>;
  nodeHeight: NodeAccessor<number, Datum>;
  neighbourMargin: (node1: OrgChartNode<Datum>, node2: OrgChartNode<Datum>) => number;
  siblingsMargin: NodeAccessor<number, Datum>;
  childrenMargin: NodeAccessor<number, Datum>;
  compactMarginPair: NodeAccessor<number, Datum>;
  compactMarginBetween: NodeAccessor<number, Datum>;

  // ========== Button Configuration ==========
  nodeButtonWidth: NodeAccessor<number, Datum>;
  nodeButtonHeight: NodeAccessor<number, Datum>;
  nodeButtonX: NodeAccessor<number, Datum>;
  nodeButtonY: NodeAccessor<number, Datum>;

  // ========== Behavior Configuration ==========
  linkYOffset: number;
  pagingStep: NodeAccessor<number, Datum>;
  minPagingVisibleNodes: NodeAccessor<number, Datum>;
  scaleExtent: [number, number];
  duration: number;
  imageName: string;
  setActiveNodeCentered: boolean;
  layout: LayoutType;
  compact: boolean;

  // ========== Zoom Behavior ==========
  createZoom: (node: OrgChartNode<Datum>) => ZoomBehavior<SVGSVGElement, Datum>;

  // ========== Event Callbacks ==========
  onZoomStart: ZoomCallback<Datum>;
  onZoom: ZoomCallback<Datum>;
  onZoomEnd: ZoomCallback<Datum>;
  onNodeClick: NodeClickCallback<Datum>;
  onExpandOrCollapse: NodeExpandCollapseCallback<Datum>;

  // ========== Content Generators ==========
  nodeContent: NodeContentCallback<Datum>;
  buttonContent: ButtonContentCallback<Datum>;
  pagingButton: PagingButtonCallback<Datum>;
  defs: DefsCallback<Datum>;

  // ========== DOM Update Callbacks ==========
  nodeUpdate: NodeUpdateCallback<Datum>;
  nodeEnter: NodeEnterCallback<Datum>;
  nodeExit: NodeExitCallback<Datum>;
  linkUpdate: LinkUpdateCallback<Datum>;
  connectionsUpdate: ConnectionsUpdateCallback<Datum>;

  // ========== D3 Generators ==========
  linkGroupArc?: any;
  hdiagonal?: (s: Point, t: Point, m?: Point | null, offsets?: any) => string;
  diagonal?: (s: Point, t: Point, m?: Point | null, offsets?: any) => string;

  // ========== Layout Bindings ==========
  layoutBindings: Record<LayoutType, LayoutBinding<Datum>>;
}

// ============================================================================
// Export/Image Related Types
// ============================================================================

/**
 * Parameters for image export
 */
export interface ExportImageParams {
  full?: boolean;
  scale?: number;
  onLoad?: (img: HTMLImageElement) => void;
  save?: boolean;
  backgroundColor?: string;
}

/**
 * Parameters for image download
 */
export interface DownloadImageParams {
  node: SVGSVGElement | HTMLCanvasElement;
  scale?: number;
  imageName: string;
  isSvg?: boolean;
  save?: boolean;
  backgroundColor?: string;
  onAlreadySerialized?: (serialized: string) => void;
  onLoad?: (img: HTMLImageElement) => void;
}

/**
 * Parameters for fit operation
 */
export interface FitParams {
  animate?: boolean;
  nodes?: OrgChartNode[];
  scale?: boolean;
  onCompleted?: () => void;
}

/**
 * Parameters for zoom to bounds operation
 */
export interface ZoomToBoundsParams {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  params?: FitParams;
}

/**
 * Update parameters for render updates
 */
export interface UpdateParams {
  x0: number;
  y0: number;
  x?: number;
  y?: number;
  width: number;
  height: number;
}

// ============================================================================
// OrgChart Class Interface (for reference)
// ============================================================================

/**
 * Main OrgChart class interface
 * Note: Actual implementation uses dynamic getters/setters for all attrs properties
 */
export interface OrgChart<Datum = any> {
  // Core methods
  render(): this;
  update(params: UpdateParams): this;
  clear(): void;
  getChartState(): OrgChartAttrs<Datum>;

  // Data manipulation
  addNode(obj: Datum): this;
  removeNode(nodeId: string | number): this;

  // State management
  setExpanded(id: string | number, expandedFlag?: boolean): this;
  setCentered(nodeId: string | number): this;
  setHighlighted(nodeId: string | number | null): this;
  setUpToTheRootHighlighted(nodeId: string | number | null): this;
  clearHighlighting(): this;

  // Tree operations
  collapse(node: OrgChartNode<Datum>): this;
  expand(node: OrgChartNode<Datum>): this;
  collapseAll(): this;
  expandAll(): this;

  // Navigation
  fit(params?: FitParams): this;
  initialZoom(zoomLevel: number): this;
  zoomIn(): this;
  zoomOut(): this;

  // Export
  exportImg(params?: ExportImageParams): void;
  exportSvg(): void;
  fullscreen(elem?: HTMLElement): void;

  // Dynamic getters/setters for all attrs properties
  [key: string]: any;
}

// ============================================================================
// D3 Selection Extension
// ============================================================================

/**
 * Parameters for the patternify method
 */
export interface PatternifyParams {
  selector: string;
  tag: string;
  data?: any[] | ((d: any) => any[]);
}

/**
 * Module augmentation to add patternify method to d3-selection
 */
declare module 'd3-selection' {
  interface Selection<GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum> {
    /**
     * Custom patternify method for enter-update-exit pattern
     * @param params - Configuration object with selector, tag, and optional data
     * @returns Selection with the patternified elements
     */
    patternify(params: PatternifyParams): Selection<GElement, any, PElement, PDatum>;
  }
}

