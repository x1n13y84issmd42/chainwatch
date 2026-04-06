import * as d3 from 'd3';
import { AddressType } from './TxGraph';

type Addr = {addr: string, balance?: number};
type Tx = {source: number, target: number};

type GraphNode = Addr & {x: number, y: number} & {label: string, type: AddressType};
type GraphEdge = Tx & Partial<{x1: number, y1: number, x2: number, y2: number}>;

export class D3Graph {
	protected svg!: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
	protected w!: number;
	protected h!: number;

	protected nodes: GraphNode[] = [];
	protected edges: GraphEdge[] = [];
	protected dragHandler: d3.DragBehavior<Element, GraphNode, any>;

	protected sim!: d3.Simulation<GraphNode, undefined>;

	protected maxBalance = 0;

	constructor(selector: string) {
		this.svg = d3.select(selector);
		this.svg.attr('width', window.innerWidth - (250 + 20));
		this.svg.attr('height', window.innerHeight - 60);
		this.w = +this.svg.attr('width');
		this.h = +this.svg.attr('height');

		this.svg.append('g').attr('id', 'edges');
		this.svg.append('g').attr('id', 'nodes');
		this.svg.append('g').attr('id', 'node-label-bgs');
		this.svg.append('g').attr('id', 'node-labels');
		this.svg.append('g').attr('id', 'edge-labels');

		this.svg.select('#edges')
			.append("marker")
			.attr("id", "arrowhead")
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)     // Position of marker along the line (tip of the arrow)
			.attr("refY", 0)
			.attr("markerWidth", 16)
			.attr("markerHeight", 16)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-5L10,0L0,5")
			.attr("stroke", "rgba(255, 255, 255, 0.5)")
			.attr("fill", "none")
		;

		const that = this;

		// 1. Define the drag behavior
		this.dragHandler = d3.drag<Element, GraphNode>()
			.on("start", function(event) {
				that.sim.alphaTarget(0.5).restart();
			})
			.on("drag", function(event) {
				// 2. Update position based on event coordinates
				// d3.select(this)
				// 	.attr("cx", event.x)
				// 	.attr("cy", event.y);

				(this as any).__data__.fx = event.x;
				(this as any).__data__.fy = event.y;
				that.tick();
			})
			.on("end", function(event) {
				that.sim.alphaTarget(0);
			});
	}
	
	tick() {
		this.svg.select('#edges').selectAll('line')
			.attr('x1', (d: any) => d.source.x)
			.attr('y1', (d: any) => d.source.y)
			.attr('x2', (d: any) => d.target.x)
			.attr('y2', (d: any) => d.target.y)
		;

		this.svg.select('#nodes').selectAll('circle')
			.attr('cx', (n: any) => n.x)
			.attr('cy', (n: any) => n.y)
			.attr('r', (n: any) => (n.balance / this.maxBalance + 0.2) * 20)
		;

		this.svg.select('#node-labels').selectAll('text')
			.attr('x', (d: any) => d.x)
			.attr('y', (d: any) => d.y - 15)
		;

		this.svg.select('#node-label-bgs').selectAll('rect')
			.attr('x', (n: any) => n.x - 5)
			.attr('y', (n: any) => n.y - 30)
		;
	}

	hasAddress(addr: string) {
		const addrIndex = this.nodes.findIndex(n => n.addr === addr);
		return addrIndex > -1;
	}

	addAddress(addr: string, balance: number, type: AddressType) {
		const addrIndex = this.nodes.findIndex(n => n.addr === addr);
		if (addrIndex != -1) {
			// console.log(addr, `already added @`, addrIndex);
			return addrIndex;
		}

		this.pauseSim();

		this.maxBalance = Math.max(this.maxBalance, balance);

		const n: GraphNode = {
			addr,
			balance,
			x: Math.floor(this.w / 2 + Math.random() * 100 - 50),
			y: Math.floor(this.h / 2 + Math.random() * 100 - 50),
			label: `${addr.substring(0, 6)}...${addr.substring(addr.length-4)} (${balance?.toFixed(2)})`,
			type,
		};

		this.nodes.push(n);

		this.updateSim();

		return this.nodes.length - 1;
	}

	addTx(from: number, to: number, amnt: number) {
		//TODO: multiple txs are possible, but will do for now.
		const txIndex = this.edges.findIndex(e => e.source === from && e.target === to);
		if (txIndex != -1) {
			console.log(`tx`, from, to, `already added @`, txIndex);
			return;
		}

		this.pauseSim();

		// Adding an edge from n to a random node.
		const e: GraphEdge = {
			source: from,
			target: to,
		};

		this.edges.push(e);

		this.updateSim();
	}

	clear() {
		this.nodes = [];
		this.edges = [];
		this.maxBalance = 0;
		this.updateSVGNodes();
	}

	updateSVGNodes() {
		const updNodes = this.svg.select('#nodes').selectAll('circle').data(this.nodes);
		const exitNodes = updNodes.exit().remove();
		const enterNodes = updNodes.enter()
			.append("circle")
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)
			.attr('r', 7)
			.attr('fill', d => d.type === 0 ? 'rgb(75, 100, 255)' : 'rgb(255, 100, 75)')
			.attr('stroke', 'rgba(255, 255, 255, 0.5)')
			.attr('stroke-width', 3)
			.call(this.dragHandler as any);

		;
		enterNodes.merge(updNodes as any).merge(exitNodes as any);
		
		const updNodeLabels = this.svg.select('#node-labels').selectAll('text').data(this.nodes);
		const exitNodeLabels = updNodeLabels.exit().remove();
		const enterNodeLabels = updNodeLabels.enter()
			.append('text')
			.attr('fill', 'white')
			.attr('font-family', 'monospace')
			.text(d => d.label)
		;
		enterNodeLabels.merge(updNodeLabels as any).merge(exitNodeLabels as any);

		const updNodeLabelBGs = this.svg.select('#node-label-bgs').selectAll('rect').data(this.nodes);
		const exitNodeLabelBGs = updNodeLabelBGs.exit().remove();
		const enterNodeLabelBGs = updNodeLabelBGs.enter()
			.append('rect')
			.attr('x', d => d.x - 10)
			.attr('y', d => d.y - 30)
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('width', d => d.label.length * 7.2 + 10)
			.attr('height', 20)
			.attr('fill', 'rgba(111, 111, 111, 0.5)')
		;
		enterNodeLabelBGs.merge(updNodeLabelBGs as any).merge(exitNodeLabelBGs as any);

		const updEdges = this.svg.select('#edges').selectAll('line').data(this.edges);
		const exitEdges = updEdges.exit().remove();
		
		const enterEdges = updEdges.enter()
			.append('line')
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '8 3')
			.style('stroke', 'rgba(255, 255, 255, 0.5)')
			.attr("marker-end", "url(#arrowhead)")
		;
		enterEdges.merge(updEdges as any).merge(exitEdges as any);
	}

	pauseSim() {
		this.sim && this.sim.stop();
	}

	updateSim() {
		// This approach works incorrectly for some reason.
		// this.sim.nodes(this.nodes).force('link', d3.forceLink().links(this.edges));
		// this.sim.restart();

		// Seems excessive but works at least.
		this.sim = d3.forceSimulation(this.nodes)
			.force('link', d3.forceLink().links(this.edges).distance(100))
			.force('charge', d3.forceManyBody().distanceMax(200).distanceMin(50))
			.force('center', d3.forceCenter(this.w / 2, this.h / 2).strength(0.01))
			.on('tick', () => this.tick())
		;
	}
}
