/**
 * Original source code from: https://github.com/bumbeishvili/org-chart
 */

import { selection, select } from "d3-selection";
import { max, min, sum, cumsum } from "d3-array";
import { tree, stratify } from "d3-hierarchy";
import { zoom, zoomIdentity, zoomTransform, type D3ZoomEvent } from "d3-zoom";
import { flextree } from 'd3-flextree';
import { linkHorizontal } from 'd3-shape';
import 'd3-transition';
import { createIconSVG, getLayoutIcon } from './svg-icons';
import type {
    OrgChartAttrs,
    OrgChartNode,
    OrgChartNodeData,
    Connection,
    LayoutType,
    Point,
    UpdateParams,
    ExportImageParams,
    DownloadImageParams,
    FitParams,
    ZoomToBoundsParams,
    TextMeasurementParams,
    CalcProperties,
    NodeAccessor,
    DataAccessor,
    NodeContentCallback,
    ButtonContentCallback,
    PagingButtonCallback,
    NodeClickCallback,
    NodeExpandCollapseCallback,
    ZoomCallback,
    NodeUpdateCallback,
    NodeEnterCallback,
    NodeExitCallback,
    LinkUpdateCallback,
    DefsCallback,
    ConnectionsUpdateCallback
} from './types';

const d3 = {
    selection,
    select,
    max,
    min,
    sum,
    cumsum,
    tree,
    stratify,
    zoom,
    zoomIdentity,
    zoomTransform,
    linkHorizontal,
    flextree
}

// Interface untuk method overloading (untuk IDE autocomplete)
export interface IOrgChart<Datum = any> {
    // Configuration Methods
    container(): string | HTMLElement;
    container(value: string | HTMLElement): this;
    data(): Datum[] | null;
    data(value: Datum[]): this;
    svgWidth(): number;
    svgWidth(value: number): this;
    svgHeight(): number;
    svgHeight(value: number): this;
    compact(): boolean;
    compact(value: boolean): this;
    layout(): LayoutType;
    layout(value: LayoutType): this;
    duration(): number;
    duration(value: number): this;
    connections(): Connection<Datum>[];
    connections(value: Connection<Datum>[]): this;
    rootMargin(): number;
    rootMargin(value: number): this;
    setActiveNodeCentered(): boolean;
    setActiveNodeCentered(value: boolean): this;
    scaleExtent(): [number, number];
    scaleExtent(value: [number, number]): this;
    defaultFont(): string;
    defaultFont(value: string): this;
    imageName(): string;
    imageName(value: string): this;
    linkYOffset(): number;
    linkYOffset(value: number): this;

    // Accessor Methods
    nodeId(): DataAccessor<string | number, Datum>;
    nodeId(value: DataAccessor<string | number, Datum>): this;
    parentNodeId(): DataAccessor<string | number, Datum>;
    parentNodeId(value: DataAccessor<string | number, Datum>): this;
    nodeWidth(): NodeAccessor<number, Datum>;
    nodeWidth(value: NodeAccessor<number, Datum>): this;
    nodeHeight(): NodeAccessor<number, Datum>;
    nodeHeight(value: NodeAccessor<number, Datum>): this;
    siblingsMargin(): NodeAccessor<number, Datum>;
    siblingsMargin(value: NodeAccessor<number, Datum>): this;
    childrenMargin(): NodeAccessor<number, Datum>;
    childrenMargin(value: NodeAccessor<number, Datum>): this;
    neighbourMargin(): (node1: OrgChartNode<Datum>, node2: OrgChartNode<Datum>) => number;
    neighbourMargin(value: (node1: OrgChartNode<Datum>, node2: OrgChartNode<Datum>) => number): this;
    compactMarginPair(): NodeAccessor<number, Datum>;
    compactMarginPair(value: NodeAccessor<number, Datum>): this;
    compactMarginBetween(): NodeAccessor<number, Datum>;
    compactMarginBetween(value: NodeAccessor<number, Datum>): this;
    nodeButtonWidth(): NodeAccessor<number, Datum>;
    nodeButtonWidth(value: NodeAccessor<number, Datum>): this;
    nodeButtonHeight(): NodeAccessor<number, Datum>;
    nodeButtonHeight(value: NodeAccessor<number, Datum>): this;
    nodeButtonX(): NodeAccessor<number, Datum>;
    nodeButtonX(value: NodeAccessor<number, Datum>): this;
    nodeButtonY(): NodeAccessor<number, Datum>;
    nodeButtonY(value: NodeAccessor<number, Datum>): this;
    pagingStep(): NodeAccessor<number, Datum>;
    pagingStep(value: NodeAccessor<number, Datum>): this;
    minPagingVisibleNodes(): NodeAccessor<number, Datum>;
    minPagingVisibleNodes(value: NodeAccessor<number, Datum>): this;

    // Callback Methods
    nodeContent(): NodeContentCallback<Datum>;
    nodeContent(value: NodeContentCallback<Datum>): this;
    buttonContent(): ButtonContentCallback<Datum>;
    buttonContent(value: ButtonContentCallback<Datum>): this;
    pagingButton(): PagingButtonCallback<Datum>;
    pagingButton(value: PagingButtonCallback<Datum>): this;
    onNodeClick(): NodeClickCallback<Datum>;
    onNodeClick(value: NodeClickCallback<Datum>): this;
    onExpandOrCollapse(): NodeExpandCollapseCallback<Datum>;
    onExpandOrCollapse(value: NodeExpandCollapseCallback<Datum>): this;
    onZoomStart(): ZoomCallback<Datum>;
    onZoomStart(value: ZoomCallback<Datum>): this;
    onZoom(): ZoomCallback<Datum>;
    onZoom(value: ZoomCallback<Datum>): this;
    onZoomEnd(): ZoomCallback<Datum>;
    onZoomEnd(value: ZoomCallback<Datum>): this;
    nodeUpdate(): NodeUpdateCallback<Datum>;
    nodeUpdate(value: NodeUpdateCallback<Datum>): this;
    nodeEnter(): NodeEnterCallback<Datum>;
    nodeEnter(value: NodeEnterCallback<Datum>): this;
    nodeExit(): NodeExitCallback<Datum>;
    nodeExit(value: NodeExitCallback<Datum>): this;
    linkUpdate(): LinkUpdateCallback<Datum>;
    linkUpdate(value: LinkUpdateCallback<Datum>): this;
    connectionsUpdate(): ConnectionsUpdateCallback<Datum>;
    connectionsUpdate(value: ConnectionsUpdateCallback<Datum>): this;
    defs(): DefsCallback<Datum>;
    defs(value: DefsCallback<Datum>): this;
    lastTransform(): { x: number; y: number; k: number };
    lastTransform(value: { x: number; y: number; k: number }): this;

    // Utility Methods
    groupBy<T, K extends string | number>(
        array: T[],
        accessor: (item: T) => K,
        aggregator: (group: T[]) => any
    ): [string, any][];
    calculateCompactFlexDimensions(root: OrgChartNode<Datum>): void;
    calculateCompactFlexPositions(root: OrgChartNode<Datum>): void;
}

export class OrgChart<Datum = any> implements IOrgChart<Datum> {
    private attrs: OrgChartAttrs<Datum>;

    // Public getter for accessing chart state
    getChartState: () => OrgChartAttrs<Datum>;

    // Dynamic properties (added via getter/setter pattern)
    [key: string]: any;

    constructor() {

        // Exposed variables  test test
        const attrs: OrgChartAttrs<Datum> = {

            /* NOT INTENDED FOR PUBLIC OVERRIDE */

            id: `ID${Math.floor(Math.random() * 1000000)}`, // Id for event handlings
            firstDraw: true,    // Whether chart is drawn for the first time
            ctx: document.createElement('canvas').getContext('2d'),
            initialExpandLevel: 1,
            nodeDefaultBackground: 'none',
            lastTransform: { x: 0, y: 0, k: 1 },  // Panning and zooming values
            allowedNodesCount: {},
            zoomBehavior: null,
            generateRoot: null,

            /*  INTENDED FOR PUBLIC OVERRIDE */

            svgWidth: 800,   // Configure svg width
            svgHeight: window.innerHeight - 100,  // Configure svg height
            container: "body",  // Set parent container, either CSS style selector or DOM element
            data: null, // Set data, it must be an array of objects, where hierarchy is clearly defined via id and parent ID (property names are configurable)
            connections: [], // Sets connection data, array of objects, SAMPLE:  [{from:"145",to:"201",label:"Conflicts of interest"}]
            defaultFont: "Helvetica", // Set default font
            nodeId: (d: Datum) => (d as any).nodeId || (d as any).id, // Configure accessor for node id, default is either odeId or id
            parentNodeId: (d: Datum) => (d as any).parentNodeId || (d as any).parentId, // Configure accessor for parent node id, default is either parentNodeId or parentId
            rootMargin: 40, // Configure how much root node is offset from top
            nodeWidth: _ => 250, // Configure each node width, use with caution, it is better to have the same value set for all nodes
            nodeHeight: _ => 150,  //  Configure each node height, use with caution, it is better to have the same value set for all nodes
            neighbourMargin: (_, __) => 80, // Configure margin between two nodes, use with caution, it is better to have the same value set for all nodes
            siblingsMargin: _ => 40, // Configure margin between two siblings, use with caution, it is better to have the same value set for all nodes
            childrenMargin: _ => 60, // Configure margin between parent and children, use with caution, it is better to have the same value set for all nodes
            compactMarginPair: _ => 100, // Configure margin between two nodes in compact mode, use with caution, it is better to have the same value set for all nodes
            compactMarginBetween: (_ => 40), // Configure margin between two nodes in compact mode, use with caution, it is better to have the same value set for all nodes
            nodeButtonWidth: _ => 40, // Configure expand & collapse button width
            nodeButtonHeight: _ => 40, // Configure expand & collapse button height
            nodeButtonX: _ => -20, // Configure expand & collapse button x position
            nodeButtonY: _ => -20,  // Configure expand & collapse button y position
            linkYOffset: 10, // When correcting links which is not working for safari
            pagingStep: _ => 5, // Configure how many nodes to show when making new nodes appear
            minPagingVisibleNodes: _ => 2000, // Configure minimum number of visible nodes , after which paging button appears
            scaleExtent: [0.001, 20],  // Configure zoom scale extent , if you don't want any kind of zooming, set it to [1,1]
            duration: 400, // Configure duration of transitions
            imageName: 'Chart', // Configure exported PNG and SVG image name
            setActiveNodeCentered: true, // Configure if active node should be centered when expanded and collapsed
            layout: "top",// Configure layout direction , possible values are "top", "left", "right", "bottom"
            compact: true, // Configure if compact mode is enabled , when enabled, nodes are shown in compact positions, instead of horizontal spread
            createZoom: _ => d3.zoom(),
            onZoomStart: _ => { }, // Callback for zoom & panning start
            onZoom: _ => { }, // Callback for zoom & panning 
            onZoomEnd: _ => { }, // Callback for zoom & panning end
            onNodeClick: (d) => d, // Callback for node click
            onExpandOrCollapse: (d) => d, // Callback for node expand or collapse

            /*
            * Node HTML content generation , remember that you can access some helper methods:

            * node=> node.data - to access node's original data
            * node=> node.leaves() - to access node's leaves
            * node=> node.descendants() - to access node's descendants
            * node=> node.children - to access node's children
            * node=> node.parent - to access node's parent
            * node=> node.depth - to access node's depth
            * node=> node.hierarchyHeight - to access node's hierarchy height ( Height, which d3 assigns to hierarchy nodes)
            * node=> node.height - to access node's height
            * node=> node.width - to access node's width
            * 
            * You can also access additional properties to style your node:
            * 
            * d=>d.data._centeredWithDescendants - when node is centered with descendants
            * d=>d.data._directSubordinatesPaging - subordinates count in paging mode
            * d=>d.data._directSubordinates - subordinates count
            * d=>d.data._totalSubordinates - total subordinates count
            * d=>d._highlighted - when node is highlighted
            * d=>d._upToTheRootHighlighted - when node is highlighted up to the root
            * d=>d._expanded - when node is expanded
            * d=>d.data._centered - when node is centered
            */
            nodeContent: (d: OrgChartNode<Datum>) => `<div style="padding:5px;font-size:10px;">Sample Node(id=${(d.data as any).id}), override using <br/> 
            <code>chart.nodeContent({data}=>{ <br/>
             &nbsp;&nbsp;&nbsp;&nbsp;return '' // Custom HTML <br/>
             })</code>
             <br/> 
             Or check different <a href="https://github.com/bumbeishvili/org-chart#jump-to-examples" target="_blank">layout examples</a>
             </div>`,


            /* Node expand & collapse button content and styling. You can access same helper methods as above */
            buttonContent: ({ node, state }: { node: OrgChartNode<Datum>; state: OrgChartAttrs<Datum> }) => {
                const iconPath = getLayoutIcon(state.layout, !!node.children);
                const marginLeft = (state.layout === 'bottom' || state.layout === 'top') ? '1px' : '0';
                const iconHTML = createIconSVG(iconPath, node.data._directSubordinatesPaging || 0, marginLeft);
                return `<div style="border:1px solid #E4E2E9;border-radius:3px;padding:3px;font-size:9px;margin:auto auto;background-color:white"> ${iconHTML}  </div>`;
            },
            /* Node paging button content and styling. You can access same helper methods as above. */
            pagingButton: (d: OrgChartNode<Datum>, _i: number, _arr: OrgChartNode<Datum>[], state: OrgChartAttrs<Datum>) => {
                const step = state.pagingStep(d.parent!);
                const currentIndex = d.parent!.data._pagingStep;
                const diff = d.parent!.data._directSubordinatesPaging! - currentIndex!
                const min = Math.min(diff, step);
                return `
                   <div style="margin-top:90px;">
                      <div style="display:flex;width:170px;border-radius:20px;padding:5px 15px; padding-bottom:4px;;background-color:#E5E9F2">
                      <div><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.59 7.41L10.18 12L5.59 16.59L7 18L13 12L7 6L5.59 7.41ZM16 6H18V18H16V6Z" fill="#716E7B" stroke="#716E7B"/>
                      </svg>
                      </div><div style="line-height:2"> Show next ${min}  nodes </div></div>
                   </div>
                `
            },
            /* You can access and modify actual node DOM element in runtime using this method. */
            nodeUpdate: function (this: SVGGElement, d: OrgChartNode<Datum>, _i: number, _arr: SVGGElement[] | ArrayLike<SVGGElement>) {
                d3.select(this)
                    .select('.node-rect')
                    .attr("stroke", () => d.data._highlighted || d.data._upToTheRootHighlighted ? '#E27396' : 'none')
                    .attr("stroke-width", d.data._highlighted || d.data._upToTheRootHighlighted ? 10 : 2)
            },
            nodeEnter: (d: OrgChartNode<Datum>) => d, // Custom handling of node update
            nodeExit: (d: OrgChartNode<Datum>) => d, // Custom handling of exit node
            /* You can access and modify actual link DOM element in runtime using this method. */
            linkUpdate: function (this: SVGPathElement, d: OrgChartNode<Datum>, _i: number, _arr: SVGPathElement[] | ArrayLike<SVGPathElement>) {
                d3.select(this)
                    .attr("stroke", () => d.data._upToTheRootHighlighted ? '#E27396' : '#E4E2E9')
                    .attr("stroke-width", () => d.data._upToTheRootHighlighted ? 5 : 2)

                if (d.data._upToTheRootHighlighted) {
                    d3.select(this).raise()
                }
            },
            /* Horizontal diagonal generation algorithm - https://observablehq.com/@bumbeishvili/curved-edges-compact-horizontal */
            hdiagonal: function (s: Point, t: Point, m?: Point | null) {
                // Define source and target x,y coordinates
                const x = s.x;
                const y = s.y;
                const ex = t.x;
                const ey = t.y;

                const mx = m && m.x != null ? m.x : x;  // This is a changed line
                const my = m && m.y != null ? m.y : y; // This also is a changed line

                // Values in case of top reversed and left reversed diagonals
                const xrvs = ex - x < 0 ? -1 : 1;
                const yrvs = ey - y < 0 ? -1 : 1;

                // Define preferred curve radius
                const rdef = 35;

                // Reduce curve radius, if source-target x space is smaller
                let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

                // Further reduce curve radius, is y space is more small
                r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

                // Defin width and height of link, excluding radius
                // let h = Math.abs(ey - y) / 2 - r;
                const w = Math.abs(ex - x) / 2 - r;

                // Build and return custom arc command
                return `
                          M ${mx} ${my}
                          L ${mx} ${y}
                          L ${x} ${y}
                          L ${x + w * xrvs} ${y}
                          C ${x + w * xrvs + r * xrvs} ${y} 
                            ${x + w * xrvs + r * xrvs} ${y} 
                            ${x + w * xrvs + r * xrvs} ${y + r * yrvs}
                          L ${x + w * xrvs + r * xrvs} ${ey - r * yrvs} 
                          C ${x + w * xrvs + r * xrvs}  ${ey} 
                            ${x + w * xrvs + r * xrvs}  ${ey} 
                            ${ex - w * xrvs}  ${ey}
                          L ${ex} ${ey}
               `;
            },
            /* Vertical diagonal generation algorithm - https://observablehq.com/@bumbeishvili/curved-edges-compacty-vertical */
            diagonal: function (s: Point, t: Point, m?: Point | null, offsets: { sy?: number; ty?: number } = { sy: 0 }) {
                const x = s.x;
                let y = s.y;

                const ex = t.x;
                const ey = t.y;

                const mx = m && m.x != null ? m.x : x;  // This is a changed line
                const my = m && m.y != null ? m.y : y; // This also is a changed line

                const xrvs = ex - x < 0 ? -1 : 1;
                const yrvs = ey - y < 0 ? -1 : 1;

                y += (offsets.sy || 0);


                const rdef = 35;
                let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

                r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

                const h = Math.abs(ey - y) / 2 - r;
                const w = Math.abs(ex - x) - r * 2;
                //w=0;
                const path = `
                          M ${mx} ${my}
                          L ${x} ${my}
                          L ${x} ${y}
                          L ${x} ${y + h * yrvs}
                          C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${y + h * yrvs + r * yrvs
                    } ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
                          L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
                          C  ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${y + h * yrvs + r * yrvs
                    } ${ex} ${ey - h * yrvs}
                          L ${ex} ${ey}
               `;
                return path;
            },
            // Defining arrows with markers for connections
            defs: function (_state: OrgChartAttrs<Datum>, visibleConnections: Connection<Datum>[]) {
                return `<defs>
                    ${visibleConnections.map(conn => {
                    const labelWidth = 0; // Placeholder, will be calculated in actual rendering
                    return `
                       <marker id="${conn.from + "_" + conn.to}" refX="${conn._source!.x < conn._target!.x ? -7 : 7}" refY="5" markerWidth="500"  markerHeight="500"  orient="${conn._source!.x < conn._target!.x ? "auto" : "auto-start-reverse"}" >
                       <rect rx=0.5 width=${conn.label ? labelWidth + 3 : 0} height=3 y=1  fill="#E27396"></rect>
                       <text font-size="2px" x=1 fill="white" y=3>${conn.label || ''}</text>
                       </marker>

                       <marker id="arrow-${conn.from + "_" + conn.to}"  markerWidth="500"  markerHeight="500"  refY="2"  refX="1" orient="${conn._source!.x < conn._target!.x ? "auto" : "auto-start-reverse"}" >
                       <path transform="translate(0)" d='M0,0 V4 L2,2 Z' fill='#E27396' />
                       </marker>
                    `}).join("")}
                    </defs>
                    `},
            /* You can update connections with custom styling using this function */
            connectionsUpdate: function (this: SVGPathElement, d: Connection<Datum>, _i: number, _arr: SVGPathElement[] | ArrayLike<SVGPathElement>) {
                d3.select(this)
                    .attr("stroke", () => '#E27396')
                    .attr('stroke-linecap', 'round')
                    .attr("stroke-width", () => '5')
                    .attr('pointer-events', 'none')
                    .attr("marker-start", () => `url(#${d.from + "_" + d.to})`)
                    .attr("marker-end", () => `url(#arrow-${d.from + "_" + d.to})`)
            },
            // Link generator for connections
            linkGroupArc: d3.linkHorizontal().x(d => d[0]).y(d => d[1]),

            /*
            *   You can customize/offset positions for each node and link by overriding these functions
            *   For example, suppose you want to move link y position 30 px bellow in top layout. You can do it like this:
            *   ```javascript
            *   const layout = chart.layoutBindings();
            *   layout.top.linkY = node => node.y + 30;
            *   chart.layoutBindings(layout);
            *   ```
            */
            layoutBindings: {
                "left": {
                    "nodeLeftX": _ => 0,
                    "nodeRightX": node => node.width,
                    "nodeTopY": node => - node.height / 2,
                    "nodeBottomY": node => node.height / 2,
                    "nodeJoinX": node => node.x + node.width,
                    "nodeJoinY": node => node.y - node.height / 2,
                    "linkJoinX": node => node.x + node.width,
                    "linkJoinY": node => node.y,
                    "linkX": node => node.x,
                    "linkY": node => node.y,
                    "linkCompactXStart": node => node.x + node.width / 2,//node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
                    "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
                    "compactLinkMidX": (node, _) => node.firstCompactNode!.x,// node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
                    "compactLinkMidY": (node, state) => node.firstCompactNode!.y + (node.firstCompactNode!.flexCompactDim ? node.firstCompactNode!.flexCompactDim[0] / 4 : 0) + state.compactMarginPair(node) / 4,
                    "linkParentX": node => node.parent!.x + node.parent!.width,
                    "linkParentY": node => node.parent!.y,
                    "buttonX": node => node.width,
                    "buttonY": node => node.height / 2,
                    "centerTransform": ({ rootMargin, centerY, scale }: { root: OrgChartNode<Datum>; rootMargin: number; scale: number; centerX: number; centerY: number }) => `translate(${rootMargin},${centerY}) scale(${scale})`,
                    "compactDimension": {
                        sizeColumn: node => node.height,
                        sizeRow: node => node.width,
                        reverse: arr => arr.slice().reverse()
                    },
                    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
                        if (state.compact && node.flexCompactDim) {
                            const result: [number, number] = [node.flexCompactDim[0], node.flexCompactDim[1]]
                            return result;
                        };
                        const result: [number, number] = [height + siblingsMargin, width + childrenMargin]
                        return result;
                    },
                    "zoomTransform": ({ x, y, k }: { x: number; y: number; k: number }) => `translate(${x},${y}) scale(${k})`,
                    "diagonal": this.hdiagonal.bind(this),
                    "swap": d => {
                        const x = d.x;
                        d.x = d.y;
                        d.y = x;
                    },
                    "nodeUpdateTransform": ({ x, y, height }) => `translate(${x},${y - height / 2})`,
                },
                "top": {
                    "nodeLeftX": node => -node.width / 2,
                    "nodeRightX": node => node.width / 2,
                    "nodeTopY": _ => 0,
                    "nodeBottomY": node => node.height,
                    "nodeJoinX": node => node.x - node.width / 2,
                    "nodeJoinY": node => node.y + node.height,
                    "linkJoinX": node => node.x,
                    "linkJoinY": node => node.y + node.height,
                    "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
                    "linkCompactYStart": node => node.y + node.height / 2,
                    "compactLinkMidX": (node, state) => node.firstCompactNode!.x + (node.firstCompactNode!.flexCompactDim ? node.firstCompactNode!.flexCompactDim[0] / 4 : 0) + state.compactMarginPair(node) / 4,
                    "compactLinkMidY": node => node.firstCompactNode!.y,
                    "compactDimension": {
                        sizeColumn: node => node.width,
                        sizeRow: node => node.height,
                        reverse: arr => arr,
                    },
                    "linkX": node => node.x,
                    "linkY": node => node.y,
                    "linkParentX": node => node.parent!.x,
                    "linkParentY": node => node.parent!.y + node.parent!.height,
                    "buttonX": node => node.width / 2,
                    "buttonY": node => node.height,
                    "centerTransform": ({ rootMargin, scale, centerX }: { root: OrgChartNode<Datum>; rootMargin: number; scale: number; centerX: number; centerY: number }) => `translate(${centerX},${rootMargin}) scale(${scale})`,
                    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
                        if (state.compact && node.flexCompactDim) {
                            const result: [number, number] = [node.flexCompactDim[0], node.flexCompactDim[1]]
                            return result;
                        };
                        const result: [number, number] = [width + siblingsMargin, height + childrenMargin];
                        return result;
                    },
                    "zoomTransform": ({ x, y, k }: { x: number; y: number; k: number }) => `translate(${x},${y}) scale(${k})`,
                    "diagonal": this.diagonal.bind(this),
                    "swap": (_d: any) => { },
                    "nodeUpdateTransform": ({ x, y, width }: { x: number; y: number; width: number }) => `translate(${x - width / 2},${y})`,

                },
                "bottom": {
                    "nodeLeftX": node => -node.width / 2,
                    "nodeRightX": node => node.width / 2,
                    "nodeTopY": node => -node.height,
                    "nodeBottomY": _ => 0,
                    "nodeJoinX": node => node.x - node.width / 2,
                    "nodeJoinY": node => node.y - node.height - node.height,
                    "linkJoinX": node => node.x,
                    "linkJoinY": node => node.y - node.height,
                    "linkCompactXStart": node => node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
                    "linkCompactYStart": node => node.y - node.height / 2,
                    "compactLinkMidX": (node, state) => node.firstCompactNode!.x + (node.firstCompactNode!.flexCompactDim ? node.firstCompactNode!.flexCompactDim[0] / 4 : 0) + state.compactMarginPair(node) / 4,
                    "compactLinkMidY": node => node.firstCompactNode!.y,
                    "linkX": node => node.x,
                    "linkY": node => node.y,
                    "compactDimension": {
                        sizeColumn: node => node.width,
                        sizeRow: node => node.height,
                        reverse: arr => arr,
                    },
                    "linkParentX": node => node.parent!.x,
                    "linkParentY": node => node.parent!.y - node.parent!.height,
                    "buttonX": node => node.width / 2,
                    "buttonY": _ => 0,
                    "centerTransform": ({ rootMargin, scale, centerX }: { root: OrgChartNode<Datum>; rootMargin: number; scale: number; centerX: number; centerY: number; chartHeight?: number; chartWidth?: number }) => {
                        const attrs = this.getChartState();
                        return `translate(${centerX},${attrs.calc!.chartHeight - rootMargin}) scale(${scale})`;
                    },
                    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
                        if (state.compact && node.flexCompactDim) {
                            const result: [number, number] = [node.flexCompactDim[0], node.flexCompactDim[1]]
                            return result;
                        };
                        const result: [number, number] = [width + siblingsMargin, height + childrenMargin];
                        return result;
                    },
                    "zoomTransform": ({ x, y, k }: { x: number; y: number; k: number }) => `translate(${x},${y}) scale(${k})`,
                    "diagonal": this.diagonal.bind(this),
                    "swap": d => {
                        d.y = -d.y;
                    },
                    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x - width / 2},${y - height})`,
                },
                "right": {
                    "nodeLeftX": node => -node.width,
                    "nodeRightX": _ => 0,
                    "nodeTopY": node => - node.height / 2,
                    "nodeBottomY": node => node.height / 2,
                    "nodeJoinX": node => node.x - node.width - node.width,
                    "nodeJoinY": node => node.y - node.height / 2,
                    "linkJoinX": node => node.x - node.width,
                    "linkJoinY": node => node.y,
                    "linkX": node => node.x,
                    "linkY": node => node.y,
                    "linkParentX": node => node.parent!.x - node.parent!.width,
                    "linkParentY": node => node.parent!.y,
                    "buttonX": _ => 0,
                    "buttonY": node => node.height / 2,
                    "linkCompactXStart": node => node.x - node.width / 2,//node.x + (node.compactEven ? node.width / 2 : -node.width / 2),
                    "linkCompactYStart": node => node.y + (node.compactEven ? node.height / 2 : -node.height / 2),
                    "compactLinkMidX": (node, _) => node.firstCompactNode!.x,// node.firstCompactNode.x + node.firstCompactNode.flexCompactDim[0] / 4 + state.compactMarginPair(node) / 4,
                    "compactLinkMidY": (node, state) => node.firstCompactNode!.y + (node.firstCompactNode!.flexCompactDim ? node.firstCompactNode!.flexCompactDim[0] / 4 : 0) + state.compactMarginPair(node) / 4,
                    "centerTransform": ({ rootMargin, centerY, scale }: { root: OrgChartNode<Datum>; rootMargin: number; scale: number; centerX: number; centerY: number; chartWidth?: number; chartHeight?: number }) => {
                        const attrs = this.getChartState();
                        return `translate(${attrs.calc!.chartWidth - rootMargin},${centerY}) scale(${scale})`;
                    },
                    "nodeFlexSize": ({ height, width, siblingsMargin, childrenMargin, state, node }) => {
                        if (state.compact && node.flexCompactDim) {
                            const result: [number, number] = [node.flexCompactDim[0], node.flexCompactDim[1]]
                            return result;
                        };
                        const result: [number, number] = [height + siblingsMargin, width + childrenMargin];
                        return result;
                    },
                    "compactDimension": {
                        sizeColumn: node => node.height,
                        sizeRow: node => node.width,
                        reverse: arr => arr.slice().reverse()
                    },
                    "zoomTransform": ({ x, y, k }: { x: number; y: number; k: number }) => `translate(${x},${y}) scale(${k})`,
                    "diagonal": this.hdiagonal.bind(this),
                    "swap": d => {
                        const x = d.x;
                        d.x = -d.y;
                        d.y = x;
                    },
                    "nodeUpdateTransform": ({ x, y, width, height }) => `translate(${x - width},${y - height / 2})`,
                },
            }

        } as OrgChartAttrs<Datum>;

        // Assign attrs to instance property
        this.attrs = attrs;

        // Assign getChartState method
        this.getChartState = () => this.attrs;



        this.initializeEnterExitUpdatePattern();
    }

    initializeEnterExitUpdatePattern(): void {
        //Adding custom patternify method to d3.selection prototype
        d3.selection.prototype.patternify = function (params: { selector: string; tag: string; data?: any[] | ((d: any) => any[]) }) {
            const container = this;
            const selector = params.selector;
            const elementTag = params.tag;
            const data = params.data || [selector];

            // Pattern in action
            let selection = container.selectAll("." + selector).data(data, (d: any, i: number) => {
                if (typeof d === "object") {
                    if (d.id) { return d.id; }
                }
                return i;
            });
            selection.exit().remove();
            selection = selection.enter().append(elementTag).merge(selection);
            selection.attr("class", selector);
            return selection;
        };
    }

    // Configuration Methods
    container(value?: string | HTMLElement): any {
        if (arguments.length === 0) return this.attrs.container;
        this.attrs.container = value!;
        return this;
    }
    data(value?: Datum[]): any {
        if (arguments.length === 0) return this.attrs.data;
        this.attrs.data = value!;
        return this;
    }
    svgWidth(value?: number): any {
        if (arguments.length === 0) return this.attrs.svgWidth;
        this.attrs.svgWidth = value!;
        return this;
    }
    svgHeight(value?: number): any {
        if (arguments.length === 0) return this.attrs.svgHeight;
        this.attrs.svgHeight = value!;
        return this;
    }
    compact(value?: boolean): any {
        if (arguments.length === 0) return this.attrs.compact;
        this.attrs.compact = value!;
        return this;
    }
    layout(value?: LayoutType): any {
        if (arguments.length === 0) return this.attrs.layout;
        this.attrs.layout = value!;
        return this;
    }
    duration(value?: number): any {
        if (arguments.length === 0) return this.attrs.duration;
        this.attrs.duration = value!;
        return this;
    }
    connections(value?: Connection<Datum>[]): any {
        if (arguments.length === 0) return this.attrs.connections;
        this.attrs.connections = value!;
        return this;
    }
    rootMargin(value?: number): any {
        if (arguments.length === 0) return this.attrs.rootMargin;
        this.attrs.rootMargin = value!;
        return this;
    }
    setActiveNodeCentered(value?: boolean): any {
        if (arguments.length === 0) return this.attrs.setActiveNodeCentered;
        this.attrs.setActiveNodeCentered = value!;
        return this;
    }
    scaleExtent(value?: [number, number]): any {
        if (arguments.length === 0) return this.attrs.scaleExtent;
        this.attrs.scaleExtent = value!;
        return this;
    }
    defaultFont(value?: string): any {
        if (arguments.length === 0) return this.attrs.defaultFont;
        this.attrs.defaultFont = value!;
        return this;
    }
    imageName(value?: string): any {
        if (arguments.length === 0) return this.attrs.imageName;
        this.attrs.imageName = value!;
        return this;
    }
    linkYOffset(value?: number): any {
        if (arguments.length === 0) return this.attrs.linkYOffset;
        this.attrs.linkYOffset = value!;
        return this;
    }

    // Accessor Methods
    nodeId(value?: DataAccessor<string | number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeId;
        this.attrs.nodeId = value!;
        return this;
    }
    parentNodeId(value?: DataAccessor<string | number, Datum>): any {
        if (arguments.length === 0) return this.attrs.parentNodeId;
        this.attrs.parentNodeId = value!;
        return this;
    }
    nodeWidth(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeWidth;
        this.attrs.nodeWidth = value!;
        return this;
    }
    nodeHeight(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeHeight;
        this.attrs.nodeHeight = value!;
        return this;
    }
    siblingsMargin(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.siblingsMargin;
        this.attrs.siblingsMargin = value!;
        return this;
    }
    childrenMargin(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.childrenMargin;
        this.attrs.childrenMargin = value!;
        return this;
    }
    neighbourMargin(value?: (node1: OrgChartNode<Datum>, node2: OrgChartNode<Datum>) => number): any {
        if (arguments.length === 0) return this.attrs.neighbourMargin;
        this.attrs.neighbourMargin = value!;
        return this;
    }
    compactMarginPair(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.compactMarginPair;
        this.attrs.compactMarginPair = value!;
        return this;
    }
    compactMarginBetween(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.compactMarginBetween;
        this.attrs.compactMarginBetween = value!;
        return this;
    }
    nodeButtonWidth(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeButtonWidth;
        this.attrs.nodeButtonWidth = value!;
        return this;
    }
    nodeButtonHeight(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeButtonHeight;
        this.attrs.nodeButtonHeight = value!;
        return this;
    }
    nodeButtonX(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeButtonX;
        this.attrs.nodeButtonX = value!;
        return this;
    }
    nodeButtonY(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeButtonY;
        this.attrs.nodeButtonY = value!;
        return this;
    }
    pagingStep(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.pagingStep;
        this.attrs.pagingStep = value!;
        return this;
    }
    minPagingVisibleNodes(value?: NodeAccessor<number, Datum>): any {
        if (arguments.length === 0) return this.attrs.minPagingVisibleNodes;
        this.attrs.minPagingVisibleNodes = value!;
        return this;
    }

    // Callback Methods
    nodeContent(value?: NodeContentCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeContent;
        this.attrs.nodeContent = value!;
        return this;
    }
    buttonContent(value?: ButtonContentCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.buttonContent;
        this.attrs.buttonContent = value!;
        return this;
    }
    pagingButton(value?: PagingButtonCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.pagingButton;
        this.attrs.pagingButton = value!;
        return this;
    }
    onNodeClick(value?: NodeClickCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.onNodeClick;
        this.attrs.onNodeClick = value!;
        return this;
    }
    onExpandOrCollapse(value?: NodeExpandCollapseCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.onExpandOrCollapse;
        this.attrs.onExpandOrCollapse = value!;
        return this;
    }
    onZoomStart(value?: ZoomCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.onZoomStart;
        this.attrs.onZoomStart = value!;
        return this;
    }
    onZoom(value?: ZoomCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.onZoom;
        this.attrs.onZoom = value!;
        return this;
    }
    onZoomEnd(value?: ZoomCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.onZoomEnd;
        this.attrs.onZoomEnd = value!;
        return this;
    }
    nodeUpdate(value?: NodeUpdateCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeUpdate;
        this.attrs.nodeUpdate = value!;
        return this;
    }
    nodeEnter(value?: NodeEnterCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeEnter;
        this.attrs.nodeEnter = value!;
        return this;
    }
    nodeExit(value?: NodeExitCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.nodeExit;
        this.attrs.nodeExit = value!;
        return this;
    }
    linkUpdate(value?: LinkUpdateCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.linkUpdate;
        this.attrs.linkUpdate = value!;
        return this;
    }
    connectionsUpdate(value?: ConnectionsUpdateCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.connectionsUpdate;
        this.attrs.connectionsUpdate = value!;
        return this;
    }
    defs(value?: DefsCallback<Datum>): any {
        if (arguments.length === 0) return this.attrs.defs;
        this.attrs.defs = value!;
        return this;
    }
    lastTransform(value?: { x: number; y: number; k: number }): any {
        if (arguments.length === 0) return this.attrs.lastTransform;
        this.attrs.lastTransform = value!;
        return this;
    }

    // This method retrieves passed node's children IDs (including node)
    getNodeChildren(
        { data, children, _children }: { data: Datum; children?: OrgChartNode<Datum>[]; _children?: OrgChartNode<Datum>[] },
        nodeStore: Datum[] = []
    ): Datum[] {
        // Store current node ID
        nodeStore.push(data);

        // Loop over children and recursively store descendants id (expanded nodes)
        if (children) {
            children.forEach((d) => {
                this.getNodeChildren(d, nodeStore);
            });
        }

        // Loop over _children and recursively store descendants id (collapsed nodes)
        if (_children) {
            _children.forEach((d) => {
                this.getNodeChildren(d, nodeStore);
            });
        }

        // Return result
        return nodeStore;
    }

    // This method can be invoked via chart.setZoomFactor API, it zooms to particulat scale
    initialZoom(zoomLevel: number): this {
        const attrs = this.getChartState();
        attrs.lastTransform.k = zoomLevel;
        return this;
    }

    render(): this {
        //InnerFunctions which will update visuals
        const attrs = this.getChartState();
        if (!attrs.data || attrs.data.length == 0) {
            console.log('ORG CHART - Data is empty');
            if (attrs.container) {
                (select as any)(attrs.container).select('.nodes-wrapper').remove();
                (select as any)(attrs.container).select('.links-wrapper').remove();
                (select as any)(attrs.container).select('.connections-wrapper').remove();
            }
            return this;
        }

        //Drawing containers
        const container = (d3.select as any)(attrs.container);
        const containerNode = container.node();
        if (containerNode && 'getBoundingClientRect' in containerNode) {
            const containerRect = (containerNode as HTMLElement).getBoundingClientRect();
            if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
        }

        //Calculated properties
        const calc: CalcProperties = {
            id: `ID${Math.floor(Math.random() * 1000000)}`, // id for event handlings,
            chartWidth: attrs.svgWidth,
            chartHeight: attrs.svgHeight,
            centerX: attrs.svgWidth / 2,
            centerY: attrs.svgHeight / 2
        };
        attrs.calc = calc;

        // ******************* BEHAVIORS  **********************
        if (attrs.firstDraw) {
            const behaviors: any = {
                zoom: null
            };

            // Get zooming function
            behaviors.zoom = attrs.createZoom(attrs.root!)
                .clickDistance(10)
                .wheelDelta((event) => {
                    if (event.ctrlKey) {
                        event.preventDefault()

                        const isPinchGesture = event.ctrlKey && event.deltaMode === 0 && Math.abs(event.deltaY) < 50;
                        const isCtrlScrollReal = event.ctrlKey && Math.abs(event.deltaY) >= 50;
                        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (isPinchGesture ? 10 : isCtrlScrollReal ? 1 : 1)
                    }

                    return 0
                })
                .on('start', (event, _d) => attrs.onZoomStart(event))
                .on('end', (event, _d) => attrs.onZoomEnd(event))
                .on("zoom", (event, d: any) => {
                    attrs.onZoom(event);
                    this.zoomed(event, d);
                })
                .scaleExtent(attrs.scaleExtent)
            attrs.zoomBehavior = behaviors.zoom;
        }

        //****************** ROOT node work ************************

        attrs.flexTreeLayout = flextree<Datum>({
            nodeSize: (node: any) => {
                const width = attrs.nodeWidth(node);;
                const height = attrs.nodeHeight(node);
                const siblingsMargin = attrs.siblingsMargin(node)
                const childrenMargin = attrs.childrenMargin(node);
                return attrs.layoutBindings[attrs.layout].nodeFlexSize({
                    state: attrs,
                    node: node as OrgChartNode<Datum>,
                    width,
                    height,
                    siblingsMargin,
                    childrenMargin
                });
            }
        })
            .spacing((nodeA: any, nodeB: any) => nodeA.parent == nodeB.parent ? 0 : attrs.neighbourMargin(nodeA as OrgChartNode<Datum>, nodeB as OrgChartNode<Datum>));

        this.setLayouts({ expandNodesFirst: false });

        // *************************  DRAWING **************************
        //Add svg
        const svg = container
            .patternify({
                tag: "svg",
                selector: "svg-chart-container"
            })
            .attr("width", attrs.svgWidth)
            .attr("height", attrs.svgHeight)
            .attr("font-family", attrs.defaultFont)

        if (attrs.firstDraw) {
            svg.call(attrs.zoomBehavior)
                .on("dblclick.zoom", null)
                .on('wheel', (event: any) => {
                    const t = d3.zoomTransform(svg.node())
                    const k = t.k

                    if (event.ctrlKey) {
                        event.preventDefault()
                        return
                    }

                    event.preventDefault()
                    if (attrs.zoomBehavior) {
                        svg.call(
                            attrs.zoomBehavior.transform,
                            d3.zoomIdentity
                                .translate(t.x - event.deltaX, t.y - event.deltaY)
                                .scale(k),
                        )
                    }
                }, { passive: false })
                .attr("cursor", "move")
        }

        attrs.svg = svg;

        //Add container g element
        const chart = svg
            .patternify({
                tag: "g",
                selector: "chart"
            })

        // Add one more container g element, for better positioning controls
        attrs.centerG = chart
            .patternify({
                tag: "g",
                selector: "center-group"
            })

        attrs.linksWrapper = attrs.centerG!.patternify({
            tag: "g",
            selector: "links-wrapper"
        })

        attrs.nodesWrapper = attrs.centerG!.patternify({
            tag: "g",
            selector: "nodes-wrapper"
        })

        attrs.connectionsWrapper = attrs.centerG!.patternify({
            tag: "g",
            selector: "connections-wrapper"
        })

        attrs.defsWrapper = svg.patternify({
            tag: "g",
            selector: "defs-wrapper"
        })

        if (attrs.firstDraw) {
            attrs.centerG!.attr("transform", () => {
                return attrs.layoutBindings[attrs.layout].centerTransform({
                    centerX: calc.centerX,
                    centerY: calc.centerY,
                    scale: attrs.lastTransform.k,
                    rootMargin: attrs.rootMargin,
                    root: attrs.root!
                })
            });
        }

        attrs.chart = chart;

        // Display tree contenrs
        this.update(attrs.root! as any);


        //#########################################  UTIL FUNCS ##################################
        // This function restyles foreign object elements ()

        d3.select(window).on(`resize.${attrs.id}`, () => {
            const containerNode = (d3.select as any)(attrs.container).node();
            if (containerNode && 'getBoundingClientRect' in containerNode) {
                const containerRect = (containerNode as HTMLElement).getBoundingClientRect();
                attrs.svg!.attr('width', containerRect.width);
            }
        });

        if (attrs.firstDraw) {
            attrs.firstDraw = false;
        }

        return this;
    }

    // This function can be invoked via chart.addNode API, and it adds node in tree at runtime
    addNode(obj: Datum): this {
        const attrs = this.getChartState();
        if (obj && (attrs.parentNodeId(obj) == null || attrs.parentNodeId(obj) == attrs.nodeId(obj)) && (attrs.data?.length || 0) == 0) {
            attrs.data!.push(obj);
            this.render()
            return this;
        }
        const root = attrs.generateRoot!(attrs.data || [])
        const descendants = root.descendants();
        const nodeFound = descendants.filter(({ data }) => attrs.nodeId(data).toString() === attrs.nodeId(obj).toString())[0];
        if (nodeFound) {
            console.log(`ORG CHART - ADD - Node with id "${attrs.nodeId(obj)}" already exists in tree`)
            return this;
        }

        if ((obj as any)._centered && !(obj as any)._expanded) (obj as any)._expanded = true;
        attrs.data!.push(obj);

        // Update state of nodes and redraw graph
        this.updateNodesState();

        return this;
    }

    // This function can be invoked via chart.removeNode API, and it removes node from tree at runtime
    removeNode(nodeId: string | number): this {
        const attrs = this.getChartState();
        const root = attrs.generateRoot!(attrs.data || [])
        const descendants = root.descendants();
        const node = descendants.filter(({ data }) => attrs.nodeId(data) == nodeId)[0];

        if (!node) {
            console.log(`ORG CHART - REMOVE - Node with id "${nodeId}" not found in the tree`);
            return this;
        }

        // Get all node descendants
        const nodeDescendants = node.descendants()

        // Mark all node children and node itself for removal
        nodeDescendants
            .forEach(d => (d.data as any)._filteredOut = true)

        // Filter out retrieved nodes and reassign data
        attrs.data = attrs.data!.filter(d => !(d as any)._filteredOut);

        if ((attrs.data?.length || 0) == 0) {
            this.render();
        } else {
            const updateNodesState = this.updateNodesState.bind(this);
            // Update state of nodes and redraw graph
            updateNodesState();
        }
        return this;
    }

    groupBy<T, K extends string | number>(
        array: T[],
        accessor: (item: T) => K,
        aggregator: (group: T[]) => any
    ): [string, any][] {
        const grouped: Record<string, T[]> = {}
        array.forEach(item => {
            const key = String(accessor(item))
            if (!grouped[key]) {
                grouped[key] = []
            }
            grouped[key].push(item)
        })

        Object.keys(grouped).forEach(key => {
            grouped[key] = aggregator(grouped[key] as any)
        })
        return Object.entries(grouped);
    }

    calculateCompactFlexDimensions(root: OrgChartNode<Datum>): void {
        const attrs = this.getChartState();
        root.eachBefore(node => {
            node.firstCompact = undefined;
            node.compactEven = undefined;
            node.flexCompactDim = undefined;
            node.firstCompactNode = undefined;
        })
        root.eachBefore(node => {
            if (node.children && node.children.length > 1) {
                const compactChildren = node.children
                    .filter(d => !d.children)

                if (compactChildren.length < 2) return;
                compactChildren.forEach((child, i) => {
                    if (!i) child.firstCompact = true;
                    if (i % 2) child.compactEven = false;
                    else child.compactEven = true;
                    child.row = Math.floor(i / 2);
                })
                const evenMaxColumnDimension = d3.max(compactChildren.filter(d => d.compactEven), attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn) || 0;
                const oddMaxColumnDimension = d3.max(compactChildren.filter(d => !d.compactEven), attrs.layoutBindings[attrs.layout].compactDimension.sizeColumn) || 0;
                const columnSize = Math.max(evenMaxColumnDimension, oddMaxColumnDimension) * 2;
                const rowsMapNew = this.groupBy(compactChildren, d => d.row || 0, reducedGroup => d3.max(reducedGroup, d => attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d) + attrs.compactMarginBetween(d)));
                const rowSize = d3.sum(rowsMapNew.map(v => v[1]))
                compactChildren.forEach(node => {
                    node.firstCompactNode = compactChildren[0];
                    if (node.firstCompact) {
                        node.flexCompactDim = [
                            columnSize + attrs.compactMarginPair(node),
                            rowSize - attrs.compactMarginBetween(node)
                        ];
                    } else {
                        node.flexCompactDim = [0, 0];
                    }
                })
                node.flexCompactDim = undefined;
            }
        })
    }

    calculateCompactFlexPositions(root: OrgChartNode<Datum>): void {
        const attrs = this.getChartState();
        root.eachBefore(node => {
            if (node.children) {
                const compactChildren = node.children.filter(d => d.flexCompactDim);
                const fch = compactChildren[0];
                if (!fch || !fch.flexCompactDim) return;
                compactChildren.forEach((child, i, _arr) => {
                    if (i == 0 && fch.flexCompactDim) fch.x -= fch.flexCompactDim[0] / 2;
                    if (fch.flexCompactDim && (i & i % 2 - 1)) child.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(child) / 4;
                    else if (i && fch.flexCompactDim) child.x = fch.x + fch.flexCompactDim[0] * 0.75 + attrs.compactMarginPair(child) / 4;
                })
                if (!fch.flexCompactDim) return;
                const centerX = fch.x + fch.flexCompactDim[0] * 0.5;
                fch.x = fch.x + fch.flexCompactDim[0] * 0.25 - attrs.compactMarginPair(fch) / 4;
                const offsetX = node.x - centerX;
                if (Math.abs(offsetX) < 10) {
                    compactChildren.forEach(d => d.x += offsetX);
                }

                const rowsMapNew = this.groupBy(compactChildren, d => d.row || 0, reducedGroup => d3.max(reducedGroup, d => attrs.layoutBindings[attrs.layout].compactDimension.sizeRow(d)));
                const cumSum = d3.cumsum(rowsMapNew.map(d => d[1] + attrs.compactMarginBetween(fch)));
                compactChildren
                    .forEach((node, _i) => {
                        if (node.row) {
                            node.y = fch.y + cumSum[node.row - 1]
                        } else {
                            node.y = fch.y;
                        }
                    })

            }
        })
    }

    // This function basically redraws visible graph, based on nodes state
    update({ x0, y0, x = 0, y = 0, width, height }: UpdateParams): this {
        const attrs = this.getChartState();

        // Paging
        if (attrs.compact) {
            this.calculateCompactFlexDimensions(attrs.root!);
        }

        //  Assigns the x and y position for the nodes
        const treeData = attrs.flexTreeLayout!(attrs.root! as any);

        // Reassigns the x and y position for the based on the compact layout
        if (attrs.compact) {
            this.calculateCompactFlexPositions(attrs.root!);
        }

        const nodes = treeData.descendants();

        // console.table(nodes.map(d => ({ x: d.x, y: d.y, width: d.width, height: d.height, flexCompactDim: d.flexCompactDim + "" })))

        // Get all links
        const links = treeData.descendants().slice(1);
        nodes.forEach(attrs.layoutBindings[attrs.layout].swap as any)

        // Connections
        const connections = attrs.connections;
        const allNodesMap: any = {};
        attrs.allNodes!.forEach(d => allNodesMap[attrs.nodeId(d.data)] = d);

        const visibleNodesMap: any = {}
        nodes.forEach(d => visibleNodesMap[attrs.nodeId(d.data)] = d);

        connections.forEach(connection => {
            const source = allNodesMap[connection.from];
            const target = allNodesMap[connection.to];
            connection._source = source;
            connection._target = target;
        })
        const visibleConnections = connections.filter(d => visibleNodesMap[d.from] && visibleNodesMap[d.to]);
        const defsString = attrs.defs.bind(this)(attrs, visibleConnections);
        const existingString = attrs.defsWrapper!.html();
        if (defsString !== existingString) {
            attrs.defsWrapper!.html(defsString)
        }

        // --------------------------  LINKS ----------------------
        // Get links selection
        const linkSelection = attrs.linksWrapper!
            .selectAll("path.link")
            .data(links, (d: any) => attrs.nodeId(d.data));

        // Enter any new links at the parent's previous position.
        const linkEnter = linkSelection
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", (_d: any) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x: x0, y: y0, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x: x0, y: y0, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, o);
            });

        // Get links update selection
        const linkUpdate = (linkEnter as any).merge(linkSelection);

        // Styling links
        (linkUpdate as any)
            .attr("fill", "none")


        if (this.isEdge()) {
            linkUpdate
                .style('display', (d: any) => {
                    const display = d.data._pagingButton ? 'none' : 'auto'
                    return display;
                })
        } else {
            linkUpdate
                .attr('display', (d: any) => {
                    const display = d.data._pagingButton ? 'none' : 'auto'
                    return display;
                })
        }

        // Allow external modifications
        linkUpdate.each(attrs.linkUpdate as any);

        // Transition back to the parent element position
        linkUpdate
            .transition()
            .duration(attrs.duration)
            .attr("d", (d: any) => {
                const n = attrs.compact && d.flexCompactDim ?
                    {
                        x: attrs.layoutBindings[attrs.layout].compactLinkMidX(d, attrs),
                        y: attrs.layoutBindings[attrs.layout].compactLinkMidY(d, attrs)
                    } :
                    {
                        x: attrs.layoutBindings[attrs.layout].linkX(d),
                        y: attrs.layoutBindings[attrs.layout].linkY(d)
                    };

                const p = {
                    x: attrs.layoutBindings[attrs.layout].linkParentX(d),
                    y: attrs.layoutBindings[attrs.layout].linkParentY(d),
                };

                const m = attrs.compact && d.flexCompactDim ? {
                    x: attrs.layoutBindings[attrs.layout].linkCompactXStart(d),
                    y: attrs.layoutBindings[attrs.layout].linkCompactYStart(d),
                } : n;
                return attrs.layoutBindings[attrs.layout].diagonal(n, p, m, { sy: attrs.linkYOffset });
            });

        // Remove any  links which is exiting after animation
        linkSelection
            .exit()
            .transition()
            .duration(attrs.duration)
            .attr("d", (_d: any) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x, y, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x, y, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, null, { sy: attrs.linkYOffset });
            })
            .remove();


        // --------------------------  CONNECTIONS ----------------------

        const connectionsSel = attrs.connectionsWrapper!
            .selectAll("path.connection")
            .data(visibleConnections)

        // Enter any new connections at the parent's previous position.
        const connEnter = connectionsSel
            .enter()
            .insert("path", "g")
            .attr("class", "connection")
            .attr("d", (_d: any) => {
                const xo = attrs.layoutBindings[attrs.layout].linkJoinX({ x: x0, y: y0, width, height });
                const yo = attrs.layoutBindings[attrs.layout].linkJoinY({ x: x0, y: y0, width, height });
                const o = { x: xo, y: yo };
                return attrs.layoutBindings[attrs.layout].diagonal(o, o, null, { sy: attrs.linkYOffset });
            });


        // Get connections update selection
        const connUpdate = (connEnter as any).merge(connectionsSel);

        // Styling connections
        (connUpdate as any).attr("fill", "none")

        // Transition back to the parent element position
        connUpdate
            .transition()
            .duration(attrs.duration)
            .attr('d', (d: any) => {
                const xs = attrs.layoutBindings[attrs.layout].linkX({ x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height } as any);
                const ys = attrs.layoutBindings[attrs.layout].linkY({ x: d._source.x, y: d._source.y, width: d._source.width, height: d._source.height } as any);
                const xt = attrs.layoutBindings[attrs.layout].linkJoinX({ x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height } as any);
                const yt = attrs.layoutBindings[attrs.layout].linkJoinY({ x: d._target.x, y: d._target.y, width: d._target.width, height: d._target.height } as any);
                return attrs.linkGroupArc({ source: { x: xs, y: ys }, target: { x: xt, y: yt } })
            })

        // Allow external modifications
        connUpdate.each(attrs.connectionsUpdate);

        // Remove any  links which is exiting after animation
        connectionsSel
            .exit()
            .transition()
            .duration(attrs.duration)
            .attr('opacity', 0)
            .remove();

        // --------------------------  NODES ----------------------
        // Get nodes selection
        const nodesSelection = attrs.nodesWrapper!
            .selectAll("g.node")
            .data(nodes, (d: any) => attrs.nodeId(d.data));

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = nodesSelection
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: any) => {
                if (d == attrs.root) return `translate(${x0},${y0})`
                const xj = attrs.layoutBindings[attrs.layout].nodeJoinX({ x: x0, y: y0, width, height });
                const yj = attrs.layoutBindings[attrs.layout].nodeJoinY({ x: x0, y: y0, width, height });
                return `translate(${xj},${yj})`
            })
            .attr("cursor", "pointer")
            .on("click.node", (event, node) => {
                const { data } = node;
                if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
                    return;
                }
                if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
                    this.loadPagingNodes(node as any);
                    return;
                }
                if (!(data as any)._pagingButton) {
                    attrs.onNodeClick(node as any);
                    return;
                }
            })
            //  Event handler to the expand button
            .on("keydown.node", (event, node) => {
                const { data: _data } = node;
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    if ([...event.srcElement.classList].includes("node-button-foreign-object")) {
                        return;
                    }
                    if ([...event.srcElement.classList].includes("paging-button-wrapper")) {
                        this.loadPagingNodes(node as any);
                        return;
                    }
                    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                        this.onButtonClick(event, node as any)
                    }
                }
            });
        nodeEnter.each(attrs.nodeEnter as any)

        // Add background rectangle for the nodes
        nodeEnter
            .patternify({
                tag: "rect",
                selector: "node-rect",
                data: ((d: any) => [d]) as any
            })

        // Node update styles
        const nodeUpdate = (nodeEnter as any)
            .merge(nodesSelection)
            .style("font", "12px sans-serif");

        // Add foreignObject element inside rectangle
        const fo = nodeUpdate.patternify({
            tag: "foreignObject",
            selector: "node-foreign-object",
            data: (d: any) => [d]
        })
            .style('overflow', 'visible')

        // Add foreign object
        fo.patternify({
            tag: "xhtml:div",
            selector: "node-foreign-object-div",
            data: (d: any) => [d]
        })

        this.restyleForeignObjectElements();

        // Add Node button circle's group (expand-collapse button)
        const nodeButtonGroups = nodeEnter
            .patternify({
                tag: "g",
                selector: "node-button-g",
                data: ((d: any) => [d]) as any
            })
            .on("click", (event, d) => this.onButtonClick(event, d as any))
            .on("keydown", (event, d) => {
                if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
                    this.onButtonClick(event, d as any)
                }
            });

        nodeButtonGroups.patternify({
            tag: 'rect',
            selector: 'node-button-rect',
            data: ((d: any) => [d]) as any
        })
            .attr('opacity', 0)
            .attr('pointer-events', 'all')
            .attr('width', d => attrs.nodeButtonWidth(d as any))
            .attr('height', d => attrs.nodeButtonHeight(d as any))
            .attr('x', d => attrs.nodeButtonX(d as any))
            .attr('y', d => attrs.nodeButtonY(d as any))

        // Add expand collapse button content
        nodeButtonGroups
            .patternify({
                tag: "foreignObject",
                selector: "node-button-foreign-object",
                data: ((d: any) => [d]) as any
            })
            .attr('width', d => attrs.nodeButtonWidth(d as any))
            .attr('height', d => attrs.nodeButtonHeight(d as any))
            .attr('x', d => attrs.nodeButtonX(d as any))
            .attr('y', d => attrs.nodeButtonY(d as any))
            .style('overflow', 'visible')
            .patternify({
                tag: "xhtml:div",
                selector: "node-button-div",
                data: ((d: any) => [d]) as any
            })
            .style('pointer-events', 'none')
            .style('display', 'flex')
            .style('width', '100%')
            .style('height', '100%')



        // Transition to the proper position for the node
        nodeUpdate
            .transition()
            .attr("opacity", 0)
            .duration(attrs.duration)
            .attr("transform", ({ x, y, width, height }: { x: any; y: any; width: any; height: any }) => {
                return attrs.layoutBindings[attrs.layout].nodeUpdateTransform({ x, y, width, height } as any, attrs);

            })
            .attr("opacity", 1);

        // Style node rectangles
        nodeUpdate
            .select(".node-rect")
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height)
            .attr("x", (_d: any) => 0)
            .attr("y", (_d: any) => 0)
            .attr("cursor", "pointer")
            .attr('rx', 3)
            .attr("fill", attrs.nodeDefaultBackground)


        nodeUpdate.select(".node-button-g").attr("transform", (d: any) => {
            const x = attrs.layoutBindings[attrs.layout].buttonX(d);
            const y = attrs.layoutBindings[attrs.layout].buttonY(d);
            return `translate(${x},${y})`
        })
            .attr("display", ({ data }: { data: any }) => {
                return data._directSubordinates > 0 ? null : 'none';
            })
            .attr("opacity", (d: any) => {
                if (d.data._pagingButton) {
                    return 0;
                }
                if (d.children || d._children) {
                    return 1;
                }
                return 0;
            });

        // Restyle node button circle
        nodeUpdate
            .select(".node-button-foreign-object .node-button-div")
            .html((node: any) => {
                return attrs.buttonContent({ node, state: attrs })
            })

        // Restyle button texts
        nodeUpdate
            .select(".node-button-text")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", ({ children }: { children: any }) => {
                if (children) return 40;
                return 26;
            })
            .text(({ children }: { children: any }) => {
                if (children) return "-";
                return "+";
            })
            .attr("y", this.isEdge() ? 10 : 0);

        nodeUpdate.each(attrs.nodeUpdate as any)

        // Remove any exiting nodes after transition
        const nodeExitTransition = nodesSelection
            .exit()
        nodeExitTransition.each(attrs.nodeExit as any)

        const maxDepthNode: any = nodeExitTransition.data().reduce((a: any, b: any) => a.depth < b.depth ? a : b, { depth: Infinity });

        nodeExitTransition.attr("opacity", 1)
            .transition()
            .duration(attrs.duration)
            .attr("transform", (_d: any) => {

                const { x, y, width, height } = maxDepthNode.parent || {};
                const ex = attrs.layoutBindings[attrs.layout].nodeJoinX({ x, y, width, height } as any);
                const ey = attrs.layoutBindings[attrs.layout].nodeJoinY({ x, y, width, height } as any);
                return `translate(${ex},${ey})`
            })
            .on("end", function () {
                d3.select(this).remove();
            })
            .attr("opacity", 0);

        // Store the old positions for transition.
        nodes.forEach((d: any) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // CHECK FOR CENTERING
        const centeredNode = attrs.allNodes!.filter(d => d.data._centered)[0]
        if (centeredNode) {
            let centeredNodes = [centeredNode]
            if (centeredNode.data._centeredWithDescendants) {
                if (attrs.compact) {
                    centeredNodes = centeredNode.descendants().filter((_, i) => i < 7);
                } else {
                    centeredNodes = centeredNode.descendants().filter((_, i, arr) => {
                        const h = Math.round(arr.length / 2);
                        const spread = 2;
                        if (arr.length % 2) {
                            return i > h - spread && i < h + spread - 1;
                        }

                        return i > h - spread && i < h + spread;
                    });
                }

            }
            centeredNode.data._centeredWithDescendants = undefined;
            centeredNode.data._centered = undefined;
            this.fit({
                animate: true,
                scale: false,
                nodes: centeredNodes
            })
        }

        return this;
    }

    // This function detects whether current browser is edge
    isEdge(): boolean {
        return window.navigator.userAgent.includes("Edge");
    }

    // Generate horizontal diagonal - play with it here - https://observablehq.com/@bumbeishvili/curved-edges-horizontal-d3-v3-v4-v5-v6
    hdiagonal(s: Point, t: Point, m?: Point | null, offsets?: any): string {
        const state = this.getChartState();
        return state.hdiagonal!(s, t, m, offsets);
    }

    // Generate custom diagonal - play with it here - https://observablehiq.com/@bumbeishvili/curved-edges
    diagonal(s: Point, t: Point, m?: Point | null, offsets?: any): string {
        const state = this.getChartState();
        return state.diagonal!(s, t, m, offsets);
    }

    restyleForeignObjectElements(): void {
        const attrs = this.getChartState();

        attrs.svg!
            .selectAll(".node-foreign-object")
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height)
            .attr("x", (_d: any) => 0)
            .attr("y", (_d: any) => 0);
        attrs.svg!
            .selectAll(".node-foreign-object-div")
            .style("width", (d: any) => `${d.width}px`)
            .style("height", (d: any) => `${d.height}px`)
            .html(function (this: any, d: any, i: number, arr: any) {
                if (d.data._pagingButton) {
                    return `<div class="paging-button-wrapper"><div style="pointer-events:none">${attrs.pagingButton(d, i, arr, attrs)}</div></div>`;
                }
                return attrs.nodeContent.bind(this)(d)
            })
    }

    // Toggle children on click.
    onButtonClick(event: any, d: OrgChartNode<Datum>): void {
        const attrs = this.getChartState();
        if (d.data._pagingButton) {
            return;
        }
        if (attrs.setActiveNodeCentered) {
            (d.data as any)._centered = true;
            (d.data as any)._centeredWithDescendants = true;
        }

        // If childrens are expanded
        if (d.children) {
            //Collapse them
            d._children = d.children;
            d.children = undefined;

            // Set descendants expanded property to false
            this.setExpansionFlagToChildren(d, false);
        } else {
            // Expand children
            d.children = d._children;
            d._children = undefined;

            // Set each children as expanded
            if (d.children) {
                d.children.forEach(({ data }) => ((data as any)._expanded = true));
            }
        }

        // Redraw Graph
        this.update({ x0: d.x0 || 0, y0: d.y0 || 0, width: d.width, height: d.height });
        event.stopPropagation();

        // Trigger callback
        attrs.onExpandOrCollapse(d);

    }

    // This function changes `expanded` property to descendants
    setExpansionFlagToChildren({ data, children, _children }: OrgChartNode<Datum>, flag: boolean): void {
        // Set flag to the current property
        (data as any)._expanded = flag;

        // Loop over and recursively update expanded children's descendants
        if (children) {
            children.forEach((d) => {
                this.setExpansionFlagToChildren(d, flag);
            });
        }

        // Loop over and recursively update collapsed children's descendants
        if (_children) {
            _children.forEach((d) => {
                this.setExpansionFlagToChildren(d, flag);
            });
        }
    }


    // Method which only expands nodes, which have property set "expanded=true"
    expandSomeNodes(d: OrgChartNode<Datum>): void {
        // If node has expanded property set
        if ((d.data as any)._expanded) {
            // Retrieve node's parent
            let parent = d.parent;

            // While we can go up
            while (parent && parent._children) {
                // Expand all current parent's children
                parent.children = parent._children;
                parent._children = undefined;
                // Replace current parent holding object
                parent = parent.parent;
            }
        }

        // Recursively do the same for collapsed nodes
        if (d._children) {
            d._children.forEach((ch) => this.expandSomeNodes(ch));
        }

        // Recursively do the same for expanded nodes
        if (d.children) {
            d.children.forEach((ch) => this.expandSomeNodes(ch));
        }
    }

    // This function updates nodes state and redraws graph, usually after data change
    updateNodesState(): void {
        const attrs = this.getChartState();


        this.setLayouts({ expandNodesFirst: true });

        // Redraw Graphs
        const root = attrs.root!;
        this.update({ x0: root.x0 || 0, y0: root.y0 || 0, width: root.width, height: root.height });
    }

    setLayouts({ expandNodesFirst = true }: { expandNodesFirst?: boolean }): void {
        const attrs = this.getChartState();
        // Store new root by converting flat data to hierarchy

        const stratify = d3
            .stratify<Datum>()
            .id((d) => attrs.nodeId(d as any) as string)
            .parentId(d => attrs.parentNodeId(d as any) as string);

        attrs.generateRoot = ((data: Datum[]) => stratify(data as any) as any as OrgChartNode<Datum>);
        attrs.root = attrs.generateRoot(attrs.data || []);

        const descendantsBefore = attrs.root.descendants();
        if (attrs.initialExpandLevel > 1 && descendantsBefore.length > 0) {
            descendantsBefore.forEach((d) => {
                if (d.depth <= attrs.initialExpandLevel) {
                    (d.data as any)._expanded = true;
                }
            })
            attrs.initialExpandLevel = 1;
        }


        const hiddenNodesMap: Record<string, boolean> = {};
        attrs.root.descendants()
            .filter(node => node.children)
            .filter(node => !node.data._pagingStep)
            .forEach(node => {
                node.data._pagingStep = attrs.minPagingVisibleNodes(node);
            })



        attrs.root.eachBefore((node: OrgChartNode, _i: number) => {
            node.data._directSubordinatesPaging = node.children ? node.children.length : 0;
            if (node.children) {
                node.children.forEach((child: OrgChartNode, j: number) => {
                    child.data._pagingButton = false;
                    if (j > node.data._pagingStep!) {
                        hiddenNodesMap[child.id as string] = true;
                    }
                    if (j === node.data._pagingStep && (node.children!.length - 1) > node.data._pagingStep!) {
                        child.data._pagingButton = true;
                    }
                    if (child.parent && hiddenNodesMap[child.parent.id as string]) {
                        hiddenNodesMap[child.id as string] = true;
                    }
                    if (child.data._expanded || child.data._centered || child.data._highlighted || child.data._upToTheRootHighlighted) {
                        let localNode: OrgChartNode | null = child;
                        while (localNode && (hiddenNodesMap[localNode.id as string] || localNode.data._pagingButton)) {
                            hiddenNodesMap[localNode.id as string] = false;
                            if (localNode.data._pagingButton) {
                                localNode.data._pagingButton = false;
                                localNode.parent?.children?.forEach((ch: OrgChartNode) => {
                                    ch.data._expanded = true;
                                    hiddenNodesMap[ch.id as string] = false;
                                })
                            }
                            localNode = localNode.parent;
                        }
                    }
                })
            }
        })


        attrs.root = d3
            .stratify<Datum>()
            .id((d) => attrs.nodeId(d as any) as string)
            .parentId(d => attrs.parentNodeId(d as any) as string)(attrs.data!.filter(d => hiddenNodesMap[attrs.nodeId(d as any) as string] !== true) as any) as any as OrgChartNode<Datum>;

        attrs.root.each((node: OrgChartNode, _i: number, _thisNode: OrgChartNode) => {
            const _hierarchyHeight = (node as any)._hierarchyHeight || node.height
            const width = attrs.nodeWidth(node);
            const height = attrs.nodeHeight(node);
            Object.assign(node, { width, height, _hierarchyHeight })
        })

        // Store positions, where children appear during their enter animation
        attrs.root.x0 = 0;
        attrs.root.y0 = 0;
        attrs.allNodes = attrs.root.descendants();

        // Store direct and total descendants count
        attrs.allNodes.forEach((d) => {
            Object.assign(d.data, {
                _directSubordinates: d.children ? d.children.length : 0,
                _totalSubordinates: d.descendants().length - 1
            });
        });

        if (attrs.root.children) {
            if (expandNodesFirst) {
                // Expand all nodes first
                attrs.root.children.forEach(this.expand);
            }
            // Then collapse them all
            attrs.root.children.forEach((d) => this.collapse(d));

            // Collapse root if level is 0
            if (attrs.initialExpandLevel == 0) {
                attrs.root._children = attrs.root.children;
                attrs.root.children = undefined;
            }

            // Then only expand nodes, which have expanded property set to true
            if (attrs.root) {
                [attrs.root].forEach((ch) => this.expandSomeNodes(ch));
            }
        }
    }

    // Function which collapses passed node and it's descendants
    collapse(d: OrgChartNode): this {
        if (d.children) {
            d._children = d.children;
            d._children.forEach((ch) => this.collapse(ch));
            d.children = undefined;
        }
        return this;
    }

    // Function which expands passed node and it's descendants
    expand(d: OrgChartNode): this {
        if (d._children) {
            d.children = d._children;
            d.children.forEach((ch) => this.expand(ch));
            d._children = undefined;
        }
        return this;
    }

    // Zoom handler function
    zoomed(event: D3ZoomEvent<SVGSVGElement, OrgChartNodeData>, _d?: OrgChartNode): void {
        const attrs = this.getChartState();
        const chart = attrs.chart!;

        // Get d3 event's transform object
        const transform = event.transform;

        // Store it
        attrs.lastTransform = transform;

        // Reposition and rescale chart accordingly
        chart.attr("transform", transform.toString());

        // Apply new styles to the foreign object element
        if (this.isEdge()) {
            this.restyleForeignObjectElements();
        }
    }

    zoomTreeBounds({ x0, x1, y0, y1, params = { animate: true, scale: true, onCompleted: () => { } } }: ZoomToBoundsParams): void {
        const { centerG, svgWidth: w, svgHeight: h, svg, zoomBehavior, duration, lastTransform } = this.getChartState()
        const scaleVal = Math.min(8, 0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h));
        let identity = d3.zoomIdentity.translate(w / 2, h / 2)
        identity = identity.scale(params?.scale ? scaleVal : lastTransform.k)

        identity = identity.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
        // Transition zoom wrapper component into specified bounds
        (svg!.transition().duration(params?.animate ? duration : 0) as any).call(zoomBehavior!.transform, identity);
        centerG!.transition().duration(params?.animate ? duration : 0).attr('transform', 'translate(0,0)')
            .on('end', function () {
                if (params?.onCompleted) {
                    params.onCompleted()
                }
            })
    }

    fit({ animate = true, nodes, scale = true, onCompleted = () => { } }: FitParams = {}): this {
        const attrs = this.getChartState();
        const { root } = attrs;
        const descendants = nodes ? nodes : root!.descendants();
        const minX = d3.min(descendants, d => d.x + attrs.layoutBindings[attrs.layout].nodeLeftX(d)) || 0
        const maxX = d3.max(descendants, d => d.x + attrs.layoutBindings[attrs.layout].nodeRightX(d)) || 0
        const minY = d3.min(descendants, d => d.y + attrs.layoutBindings[attrs.layout].nodeTopY(d)) || 0
        const maxY = d3.max(descendants, d => d.y + attrs.layoutBindings[attrs.layout].nodeBottomY(d)) || 0

        this.zoomTreeBounds({
            params: { animate: animate, scale, onCompleted },
            x0: minX - 50,
            x1: maxX + 50,
            y0: minY - 50,
            y1: maxY + 50,

        });
        return this;
    }

    // Load Paging Nodes
    loadPagingNodes(node: OrgChartNode): void {
        const attrs = this.getChartState();
        node.data._pagingButton = false;
        const current = node.parent!.data._pagingStep!;
        const step = attrs.pagingStep(node.parent!)
        const newPagingIndex = current + step;
        node.parent!.data._pagingStep = newPagingIndex;
        this.updateNodesState();
    }

    // This function can be invoked via chart.setExpanded API, it expands or collapses particular node
    setExpanded(id: string | number, expandedFlag: boolean = true): this {

        const attrs = this.getChartState();
        // Retrieve node by node Id
        const node = attrs.allNodes!.filter(({ data }) => attrs.nodeId(data) == id)[0];

        if (!node) {
            console.log(`ORG CHART - ${expandedFlag ? "EXPAND" : "COLLAPSE"} - Node with id (${id})  not found in the tree`)
            return this;
        }
        node.data._expanded = expandedFlag;
        if (expandedFlag == false) {
            const parent = node.parent || { descendants: () => [] };
            const descendants = parent.descendants().filter(d => d != parent);
            descendants.forEach(d => d.data._expanded = false)
        }


        return this;
    }

    setCentered(nodeId: string | number): this {
        const attrs = this.getChartState();
        // this.setExpanded(nodeId)
        const root = attrs.generateRoot!(attrs.data || [])
        const descendants = root.descendants();
        const node = descendants.filter(({ data }) => attrs.nodeId(data).toString() == nodeId.toString())[0];
        if (!node) {
            console.log(`ORG CHART - CENTER - Node with id (${nodeId}) not found in the tree`)
            return this;
        }
        const ancestors = node.ancestors();
        ancestors.forEach(d => d.data._expanded = true)
        node.data._centered = true;
        node.data._expanded = true;
        return this;
    }

    setHighlighted(nodeId: string | number | null): this {
        const attrs = this.getChartState();
        const root = attrs.generateRoot!(attrs.data || [])
        const descendants = root.descendants();
        const node = nodeId ? descendants.filter(d => attrs.nodeId(d.data).toString() === nodeId.toString())[0] : null;
        if (!node) {
            console.log(`ORG CHART - HIGHLIGHT - Node with id (${nodeId})  not found in the tree`);
            return this
        }
        const ancestors = node.ancestors();
        ancestors.forEach(d => d.data._expanded = true)
        node.data._highlighted = true;
        node.data._expanded = true;
        node.data._centered = true;
        return this;
    }

    setUpToTheRootHighlighted(nodeId: string | number | null): this {
        const attrs = this.getChartState();
        const root = attrs.generateRoot!(attrs.data || [])
        const descendants = root.descendants();
        const node = nodeId ? descendants.filter(d => attrs.nodeId(d.data).toString() === nodeId.toString())[0] : null;
        if (!node) {
            console.log(`ORG CHART - HIGHLIGHTROOT - Node with id (${nodeId}) not found in the tree`)
            return this;
        }
        const ancestors = node.ancestors();
        ancestors.forEach(d => d.data._expanded = true)
        node.data._upToTheRootHighlighted = true;
        node.data._expanded = true;
        node.ancestors().forEach(d => d.data._upToTheRootHighlighted = true)
        return this;
    }

    clearHighlighting(): this {
        const attrs = this.getChartState();
        attrs.allNodes!.forEach(d => {
            d.data._highlighted = false;
            d.data._upToTheRootHighlighted = false;
        })
        const root = attrs.root!;
        this.update({ x0: root.x0 || 0, y0: root.y0 || 0, width: root.width, height: root.height });
        return this;
    }

    // It can take selector which would go fullscreen
    fullscreen(elem?: HTMLElement): void {
        const attrs = this.getChartState();
        const el = (elem ? d3.select(elem as any) : d3.select(attrs.container as any)).node() as any;

        d3.select(document).on('fullscreenchange.' + attrs.id, function (_d: any) {
            const fsElement = (document as any).fullscreenElement || (document as any).mozFullscreenElement || (document as any).webkitFullscreenElement;
            if (fsElement == el) {
                setTimeout((_d: any) => {
                    attrs.svg!.attr('height', window.innerHeight - 40);
                }, 500)
            } else {
                attrs.svg!.attr('height', attrs.svgHeight)
            }
        })

        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    // Zoom in exposed method
    zoomIn(): this {
        const { svg, zoomBehavior } = this.getChartState();
        (svg as any).transition().call(zoomBehavior!.scaleBy, 1.3);
        return this;
    }

    // Zoom out exposed method
    zoomOut(): this {
        const { svg, zoomBehavior } = this.getChartState();
        (svg as any).transition().call(zoomBehavior!.scaleBy, 0.78);
        return this;
    }

    toDataURL(url: string, callback: (result: string | ArrayBuffer | null) => void): void {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    callback(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            } else {
                callback(null)
            }
        };
        xhr.onerror = function () {
            callback(null)
        }
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    exportImg({ full = false, scale = 3, onLoad = (_d: any) => _d, save = true, backgroundColor = "#FAFAFA" }: ExportImageParams = {}): void {
        const that = this;
        const attrs = this.getChartState();
        const { svg: svgImg } = attrs
        let count = 0;
        const selection = svgImg!.selectAll('img')
        const total = selection.size()

        const exportImage = () => {
            const duration = that.duration();
            if (full) {
                that.fit();
            }
            const { svg } = that.getChartState()

            setTimeout((_d: any) => {
                that.downloadImage({
                    node: svg!.node()!,
                    scale,
                    isSvg: false,
                    backgroundColor,
                    onAlreadySerialized: (_d: any) => {
                        const root = that.getChartState().root!;
                        that.update({ x0: root.x0 || 0, y0: root.y0 || 0, width: root.width, height: root.height })
                    },
                    imageName: attrs.imageName,
                    onLoad: onLoad,
                    save
                })
            }, full ? duration + 10 : 0)
        }

        if (total > 0) {
            selection
                .each(function (this: any) {
                    const imgElement = this as HTMLImageElement;
                    that.toDataURL(imgElement.src, (dataUrl) => {
                        if (dataUrl) imgElement.src = dataUrl as string;
                        if (++count == total) {
                            exportImage();
                        }
                    })
                })
        } else {
            exportImage();
        }



    }



    exportSvg(): this {
        const { svg, imageName } = this.getChartState();
        this.downloadImage({ imageName: imageName, node: svg!.node()!, scale: 3, isSvg: true })
        return this;
    }

    expandAll(): this {
        const { data } = this.getChartState();
        data!.forEach(d => (d as any)._expanded = true)
        // allNodes.forEach(d => d.data._expanded = true);
        this.render()
        return this;
    }

    collapseAll(): this {
        const { allNodes } = this.getChartState();
        allNodes!.forEach(d => d.data._expanded = false);
        this.initialExpandLevel(1)
        this.render();
        return this;
    }

    downloadImage({ node, scale = 2, imageName = 'graph', isSvg = false, save = true, backgroundColor = "#FAFAFA", onAlreadySerialized = (_d: any) => { }, onLoad = (_d: any) => { } }: DownloadImageParams): void {
        // Retrieve svg node
        const svgNode = node as SVGSVGElement;

        function saveAs(uri: string, filename: string): void {
            // create link
            const link = document.createElement('a');
            if (typeof link.download === 'string') {
                document.body.appendChild(link); // Firefox requires the link to be in the body
                link.download = filename;
                link.href = uri;
                link.click();
                document.body.removeChild(link); // remove the link when done
            } else {
                location.replace(uri);
            }
        }
        // This function serializes SVG and sets all necessary attributes
        function serializeString(svg: any) {
            const xmlns = 'http://www.w3.org/2000/xmlns/';
            const xlinkns = 'http://www.w3.org/1999/xlink';
            const svgns = 'http://www.w3.org/2000/svg';

            // Clone the SVG
            const clonedSvg = svg.cloneNode(true);

            // Copy computed styles from original to cloned elements
            const originalWalker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
            const clonedWalker = document.createTreeWalker(clonedSvg, NodeFilter.SHOW_ELEMENT);

            // Process root SVG element
            copyComputedStyle(svg, clonedSvg);

            // Process all child elements
            while (originalWalker.nextNode() && clonedWalker.nextNode()) {
                const originalNode = originalWalker.currentNode as Element;
                const clonedNode = clonedWalker.currentNode as Element;

                // Copy computed styles
                copyComputedStyle(originalNode, clonedNode);

                // Fix fragment references
                for (const attr of Array.from(clonedNode.attributes)) {
                    if (attr.value.includes(window.location.href + '#')) {
                        attr.value = attr.value.replace(window.location.href + '#', '#');
                    }
                }
            }

            clonedSvg.setAttributeNS(xmlns, 'xmlns', svgns);
            clonedSvg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);
            const serializer = new XMLSerializer();
            const string = serializer.serializeToString(clonedSvg);
            return string;
        }

        // Helper function to copy computed styles
        function copyComputedStyle(source: Element, target: Element) {
            const computedStyle = window.getComputedStyle(source);

            // List of CSS properties to copy
            const propertiesToCopy = [
                'font-family', 'font-size', 'font-weight', 'font-style',
                'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
                'opacity', 'color',
                'text-anchor', 'dominant-baseline', 'alignment-baseline',
                'display', 'visibility',
                'transform', 'transform-origin',
                'background', 'background-color',
                'border', 'border-width', 'border-color', 'border-style', 'border-radius',
                'padding', 'margin',
                'width', 'height',
                'overflow'
            ];

            // Apply computed styles as inline styles
            propertiesToCopy.forEach(property => {
                const value = computedStyle.getPropertyValue(property);
                if (value && value !== '' && value !== 'none') {
                    (target as HTMLElement).style.setProperty(property, value);
                }
            });
        }

        if (isSvg) {
            let source = serializeString(svgNode);
            //add xml declaration
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            //convert svg source to URI data scheme.
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            saveAs(url, imageName + ".svg");
            onAlreadySerialized && onAlreadySerialized(source);
            return;
        }
        // Get image quality index (basically,  index you can zoom in)
        const quality = scale
        // Create image
        const image = document.createElement('img');
        image.onload = function () {
            // Create image canvas
            const canvas = document.createElement('canvas');
            // Set width and height based on SVG node
            const rect = svgNode.getBoundingClientRect();
            canvas.width = rect.width * quality;
            canvas.height = rect.height * quality;
            // Draw background
            const context = canvas.getContext('2d');
            context!.fillStyle = backgroundColor;;
            context!.fillRect(0, 0, rect.width * quality, rect.height * quality);
            context!.drawImage(image, 0, 0, rect.width * quality, rect.height * quality);
            // Set some image metadata
            const dt = canvas.toDataURL('image/png');
            if (onLoad) {
                const img = new Image();
                img.src = dt;
                onLoad(img);
            }
            if (save) {
                // Invoke saving function
                saveAs(dt, imageName + '.png');
            }

        };

        const url = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(serializeString(svgNode));

        onAlreadySerialized && onAlreadySerialized(serializeString(svgNode));

        image.src = url// URL.createObjectURL(blob);
        // This function invokes save window

    }

    // Calculate what size text will take
    getTextWidth(text: string, {
        fontSize = 14,
        fontWeight = "400",
        defaultFont = "Helvetice",
        ctx
    }: Partial<TextMeasurementParams>): number {
        ctx!.font = `${fontWeight || ''} ${fontSize}px ${defaultFont} `
        const measurement = ctx!.measureText(text);
        return measurement.width;
    }

    // Clear after moving off from the page
    clear(): void {
        const attrs = this.getChartState();
        d3.select(window).on(`resize.${attrs.id}`, null);
        attrs.svg && attrs.svg.selectAll("*").remove();
    }
}