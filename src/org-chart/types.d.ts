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
export interface OrgChartNode extends HierarchyNode<OrgChartNodeData> {
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
  firstCompactNode?: OrgChartNode;
  compactEven?: boolean;
  row?: number;

  // Collapsed children
  _children?: OrgChartNode[];

  // Paging button visibility
  _pagingButton?: boolean;

  // Override parent/children types to be OrgChartNode
  // Using 'this' type to maintain type compatibility with HierarchyNode
  parent: this | null;
  children?: this[];
}

/**
 * Connection between two nodes (for custom relationships)
 */
export interface Connection {
  from: string | number;
  to: string | number;
  label?: string;
  _source?: OrgChartNode;
  _target?: OrgChartNode;
}

// ============================================================================
// Callback & Accessor Types
// ============================================================================

/**
 * Generic accessor function for extracting values from nodes
 */
export type NodeAccessor<T> = (node: OrgChartNode) => T;

/**
 * Accessor that can work with raw data
 */
export type DataAccessor<T> = (data: OrgChartNodeData) => T;

/**
 * Zoom event callbacks
 */
export type ZoomCallback = (event: D3ZoomEvent<SVGSVGElement, OrgChartNodeData>) => void;

/**
 * Node interaction callbacks
 */
export type NodeClickCallback = (node: OrgChartNode) => OrgChartNode;
export type NodeExpandCollapseCallback = (node: OrgChartNode) => OrgChartNode;

/**
 * Node content generators (return HTML strings)
 */
export type NodeContentCallback = (node: OrgChartNode) => string;

/**
 * Button content callback with state context
 */
export interface ButtonContentArgs {
  node: OrgChartNode;
  state: OrgChartAttrs;
}
export type ButtonContentCallback = (args: ButtonContentArgs) => string;

/**
 * Paging button callback
 */
export type PagingButtonCallback = (
  node: OrgChartNode,
  index: number,
  array: OrgChartNode[],
  state: OrgChartAttrs
) => string;

/**
 * Node update callbacks for DOM manipulation
 */
export type NodeUpdateCallback = (
  this: SVGGElement,
  node: OrgChartNode,
  index: number,
  groups: SVGGElement[] | ArrayLike<SVGGElement>
) => void;

export type NodeEnterCallback = (node: OrgChartNode) => OrgChartNode;
export type NodeExitCallback = (node: OrgChartNode) => OrgChartNode;

/**
 * Link update callback for DOM manipulation
 */
export type LinkUpdateCallback = (
  this: SVGPathElement,
  node: OrgChartNode,
  index: number,
  groups: SVGPathElement[] | ArrayLike<SVGPathElement>
) => void;

/**
 * Defs (SVG definitions) generator callback
 */
export type DefsCallback = (
  state: OrgChartAttrs,
  connections: Connection[]
) => string;

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
export interface CompactDimension {
  sizeColumn: (node: OrgChartNode) => number;
  sizeRow: (node: OrgChartNode) => number;
  reverse: <T>(arr: T[]) => T[];
}

/**
 * Layout-specific coordinate and rendering functions
 */
export interface LayoutBinding {
  // Node boundary positions
  nodeLeftX: (node: OrgChartNode) => number;
  nodeRightX: (node: OrgChartNode) => number;
  nodeTopY: (node: OrgChartNode) => number;
  nodeBottomY: (node: OrgChartNode) => number;

  // Animation entry points
  nodeJoinX: (params: PositionParams) => number;
  nodeJoinY: (params: PositionParams) => number;

  // Link connection points
  linkJoinX: (params: PositionParams) => number;
  linkJoinY: (params: PositionParams) => number;
  linkX: (node: OrgChartNode) => number;
  linkY: (node: OrgChartNode) => number;
  linkParentX: (node: OrgChartNode) => number;
  linkParentY: (node: OrgChartNode) => number;

  // Compact layout link positions
  linkCompactXStart: (node: OrgChartNode) => number;
  linkCompactYStart: (node: OrgChartNode) => number;
  compactLinkMidX: (node: OrgChartNode, state: OrgChartAttrs) => number;
  compactLinkMidY: (node: OrgChartNode, state: OrgChartAttrs) => number;

  // Button positioning
  buttonX: (node: OrgChartNode) => number;
  buttonY: (node: OrgChartNode) => number;

  // Transform functions
  centerTransform: (params: { root: OrgChartNode; rootMargin: number; scale: number; centerX: number; centerY: number }) => string;
  nodeUpdateTransform: (node: OrgChartNode, state: OrgChartAttrs) => string;
  zoomTransform: (transform: { x: number; y: number; k: number }) => string;

  // Flex layout
  nodeFlexSize: (params: {
    height: number;
    width: number;
    siblingsMargin: number;
    childrenMargin: number;
    state: OrgChartAttrs;
    node: OrgChartNode;
  }) => [number, number];

  // Compact dimensions
  compactDimension: CompactDimension;

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
  swap: (node: OrgChartNode) => void;
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
export interface OrgChartAttrs {
  // ========== Internal/Private Properties ==========
  id: string;
  firstDraw: boolean;
  ctx: CanvasRenderingContext2D;
  initialExpandLevel: number;
  nodeDefaultBackground: string;
  lastTransform: { x: number; y: number; k: number };
  allowedNodesCount: Record<string, number>;
  zoomBehavior: ZoomBehavior<SVGSVGElement, OrgChartNodeData> | null;
  generateRoot: ((data: OrgChartNodeData[]) => OrgChartNode) | null;

  // Calculated properties
  calc?: CalcProperties;

  // Hierarchy data
  allNodes?: OrgChartNode[];
  root?: OrgChartNode;

  // Flextree layout instance
  flexTreeLayout?: FlextreeLayout<OrgChartNode>;

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
  data: OrgChartNodeData[] | null;
  connections: Connection[];
  defaultFont: string;

  // ========== Data Accessors ==========
  nodeId: DataAccessor<string | number>;
  parentNodeId: DataAccessor<string | number>;

  // ========== Layout Configuration ==========
  rootMargin: number;
  nodeWidth: NodeAccessor<number>;
  nodeHeight: NodeAccessor<number>;
  neighbourMargin: (node1: OrgChartNode, node2: OrgChartNode) => number;
  siblingsMargin: NodeAccessor<number>;
  childrenMargin: NodeAccessor<number>;
  compactMarginPair: NodeAccessor<number>;
  compactMarginBetween: NodeAccessor<number>;

  // ========== Button Configuration ==========
  nodeButtonWidth: NodeAccessor<number>;
  nodeButtonHeight: NodeAccessor<number>;
  nodeButtonX: NodeAccessor<number>;
  nodeButtonY: NodeAccessor<number>;

  // ========== Behavior Configuration ==========
  linkYOffset: number;
  pagingStep: NodeAccessor<number>;
  minPagingVisibleNodes: NodeAccessor<number>;
  scaleExtent: [number, number];
  duration: number;
  imageName: string;
  setActiveNodeCentered: boolean;
  layout: LayoutType;
  compact: boolean;

  // ========== Zoom Behavior ==========
  createZoom: (node: OrgChartNode) => ZoomBehavior<SVGSVGElement, OrgChartNodeData>;

  // ========== Event Callbacks ==========
  onZoomStart: ZoomCallback;
  onZoom: ZoomCallback;
  onZoomEnd: ZoomCallback;
  onNodeClick: NodeClickCallback;
  onExpandOrCollapse: NodeExpandCollapseCallback;

  // ========== Content Generators ==========
  nodeContent: NodeContentCallback;
  buttonContent: ButtonContentCallback;
  pagingButton: PagingButtonCallback;
  defs: DefsCallback;

  // ========== DOM Update Callbacks ==========
  nodeUpdate: NodeUpdateCallback;
  nodeEnter: NodeEnterCallback;
  nodeExit: NodeExitCallback;
  linkUpdate: LinkUpdateCallback;
  connectionsUpdate?: any;

  // ========== D3 Generators ==========
  linkGroupArc?: any;
  hdiagonal?: (s: any, t: any, m?: any, offsets?: any) => string;
  diagonal?: (s: any, t: any, m?: any, offsets?: any) => string;

  // ========== Layout Bindings ==========
  layoutBindings: Record<LayoutType, LayoutBinding>;
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
export interface OrgChart {
  // Core methods
  render(): this;
  update(params: UpdateParams): this;
  clear(): void;
  getChartState(): OrgChartAttrs;

  // Data manipulation
  addNode(obj: OrgChartNodeData): this;
  removeNode(nodeId: string | number): this;

  // State management
  setExpanded(id: string | number, expandedFlag?: boolean): this;
  setCentered(nodeId: string | number): this;
  setHighlighted(nodeId: string | number | null): this;
  setUpToTheRootHighlighted(nodeId: string | number | null): this;
  clearHighlighting(): this;

  // Tree operations
  collapse(node: OrgChartNode): this;
  expand(node: OrgChartNode): this;
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

