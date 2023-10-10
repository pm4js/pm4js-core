class DagreBPMNLayouting {
	static apply(bpmnGraph, nodesep=null, edgesep=null, ranksep=null, targetSvg="svg", targetInner="g", d3Obj=null, dagreD3Obj=null) {
		// works only in browser
		// works only with Dagre/D3
		if (d3Obj == null) {
			d3Obj = d3;
		}
		if (dagreD3Obj == null) {
			dagreD3Obj = dagreD3;
		}
		let ordered = bpmnGraph.getOrderedNodesAndEdges();
		
		var g = new dagreD3Obj.graphlib.Graph().setGraph({});
		
		for (let nodeId of ordered["nodesId"]) {
			let node = bpmnGraph.nodes[nodeId];
			g.setNode(node.id, {"label": node.name});				
		}
		
		for (let edge of ordered["edgesId"]) {
			g.setEdge(edge[0], edge[1], {})
		}
		
		g.graph().rankDir = 'LR';
		if (nodesep != null) {
			g.graph().nodesep = nodesep;
		}
		if (edgesep != null) {
			g.graph().edgesep = edgesep;
		}
		if (ranksep != null) {
			g.graph().ranksep = ranksep;
		}

		let render = new dagreD3Obj.render();
		
		let svg = d3Obj.select(targetSvg);
		let inner = svg.append(targetInner);
		render(inner, g);
		
		for (let nodeId in g._nodes) {
			let node = g._nodes[nodeId];
			let elemStr = node.elem.innerHTML;
			let width = parseInt(elemStr.split('width=\"')[1].split('\"')[0]);
			let height = parseInt(elemStr.split('height=\"')[1].split('\"')[0]);
			bpmnGraph.nodes[nodeId].bounds = {"x": node.x - width/2, "y": node.y - height/2, "width": width, "height": height};
		}
		
		
		for (let edgeId in g._edgeLabels) {
			let graphEdgeObj = g._edgeObjs[edgeId];
			graphEdgeObj = [graphEdgeObj.v, graphEdgeObj.w];
			let graphEdge = g._edgeLabels[edgeId];
			let edge = g._edgeLabels[edgeId];
			bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints = null;
			bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints = [];
			for (let p of edge.points) {
				bpmnGraph.edges[ordered["invMap"][graphEdgeObj]].waypoints.push([p["x"], p["y"]]);
			}
		}
		
		return bpmnGraph;
	}
}

try {
	module.exports = {DagreBPMNLayouting: DagreBPMNLayouting};
	global.DagreBPMNLayouting = DagreBPMNLayouting;
}
catch (err) {
	// not in Node
	//console.log(err);
}
