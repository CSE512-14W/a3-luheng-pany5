var width = 1000;
var height = 800;
var labelDistance = 0;

var vis = d3.select("body")
			.append("svg:svg")
			.attr("width", width)
			.attr("height", height);

var link, 
	node, 
	anchorLink,
	anchorNode,
	force,
	force2,
	drag;
	
var nodes, 
	labelAnchors,
	labelAnchorLinks,
	links;

var raw_labels = null,
	raw_edges = null,
	num_artists = 0;

var labels = null,
	edges = null,
	node_type = null; // 0: artist, 1:
	
var updateLink = function() {
	this.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
};

var updateNode = function() {
    this.attr("transform", function(d) {
    	return "translate(" + d.x + "," + d.y + ")";
    });
};

var updateGraph = function(redraw) {
	var num_nodes = labels.length;
	var num_edges = edges.length;
	nodes = [];
	links = [];
	labelAnchors = [];
	labelAnchorLinks = [];
	
	for(var i = 0; i < num_nodes; i++) {
		var input_node = { label : labels[i] }; 
		nodes.push(input_node);
		labelAnchors.push({ node : input_node });
		labelAnchors.push({ node : input_node });
	}

	for (var i = 0; i < num_nodes; i++) {
		labelAnchorLinks.push({
			source : i * 2,
			target : i * 2 + 1,
			weight : 1
		});
	}

	for (var i = 0; i < num_edges; i++) {
		links.push(edges[i]);
	}
	
	if (redraw) {
		force.stop();
		force2.stop();
		vis.selectAll("line.link").data([]).exit().remove();
		vis.selectAll("g.node").data([]).exit().remove();
		vis.selectAll("line.anchorLink").data([]).exit().remove();
		vis.selectAll("g.anchorNode").data([]).exit().remove();
	}
	
	// Figure out the parameters and try to make the graph less "wiggly"
	force = d3.layout.force()
	  .size([width, height])
	  .nodes(nodes)
	  .links(links)
	  .gravity(1)
	  .linkDistance(10)
	  .charge(-3000)
	  .linkStrength( function(d) {
	  	  return d.weight * 10;
	  });
	
	force.start();
	 
	force2 = d3.layout.force()
	  .nodes(labelAnchors)
	  .links(labelAnchorLinks)
	  .gravity(0)
	  .linkDistance(0)
	  .linkStrength(8)
	  .charge(-100)
	  .size([width, height]);
	  
	force2.start();
	
	drag = force.drag().on("dragstart", dragstart);
	
	link = /*redraw ? 
			vis.selectAll("line.link")
				.data(links)
				.exit()
				.remove() :*/
			vis.selectAll("line.link")
				.data(links)
				.enter()
				.append("svg:line")
				.attr("class", "link")
				.attr("stroke-width", function(d) {
					return d.weight * 30;
				});
	
	link.style("stroke", "grey")
		.style("opacity", 0.6);

	node = /*redraw ?
			vis.selectAll("g.node")
				.data(force.nodes())
				.exit()
				.remove() :*/
			vis.selectAll("g.node")
				.data(force.nodes())
				.enter()
				.append("svg:g")
				.attr("class", "node");
	
	node.append("svg:circle")
		.attr("r", function(d, i) {
				return node_type[i] == 0 ? 10 : 15; 
			})
		.style("fill", function(d, i) {
				return node_type[i] == 0 ? "steel" : "purple"; 
			})
		.style('opacity', 0.6)
		.style("stroke", "#FFF")
		.style("stroke-width", 1);
	
	node.call(drag).on("dblclick", dblclick);
	
	anchorLink = /*redraw ?
			vis.selectAll("line.anchorLink")
				.data(labelAnchorLinks)
				.exit()
				.remove() :*/
			vis.selectAll("line.anchorLink")
				.data(labelAnchorLinks)
				.enter()
				.append("svg:line")
				.attr("class", "anchorLink");
		
	anchorNode = /*redraw ?
			vis.selectAll("g.anchorNode")
				.data(force2.nodes())
				.exit()
				.remove() :*/
			vis.selectAll("g.anchorNode")
				.data(force2.nodes())
				.enter()
				.append("svg:g")
				.attr("class", "anchorNode");
	
	anchorNode.append("svg:circle")
		.attr("r", 0)
		.style("fill", "#FFF");
	
	anchorNode.append("svg:text")
		.text(function(d, i) {
			return i % 2 == 0 ? "" : d.node.label;
		})
		.style("fill", "black")
		.style("font-family", "Helvetica")
		.style("font-size", 12);
	
	force.on("tick", function() {
		force2.start();
		node.call(updateNode);
		anchorNode.each(function(d, i) {
			if(i % 2 == 0) {
				d.x = d.node.x;
				d.y = d.node.y;
			} else {
				var b = this.childNodes[1].getBBox();
				var diffX = d.x - d.node.x;
				var diffY = d.y - d.node.y;
				var dist = Math.sqrt(diffX * diffX + diffY * diffY);
				var shiftX = b.width * (diffX - dist) / (dist * 2);
				shiftX = Math.max(-b.width, Math.min(0, shiftX));
				var shiftY = 5;
				this.childNodes[1].setAttribute("transform",
						"translate(" + shiftX + "," + shiftY + ")");
			}
	    });	
	    anchorNode.call(updateNode);
	    link.call(updateLink);
	    anchorLink.call(updateLink);
	});
};

// TODO: set everything else to normal
function dragstart(d) {
	d3.select(this)
		.classed("fixed", d.fixed = true)
		.classed("x", d.x = width / 2)
		.classed("y", d.y = height / 2);
}

function dblclick(d) {
	d3.select(this).classed("fixed", d.fixed = false);
}

function pruneGraph(viewPoint, hops, weight_threshold) {
	var node_idx = $.inArray(viewPoint, raw_labels);
	labels = [];
	edges = [];
	node_type = [];
	raw_ids = [];
	queue = [];
	queue.push({ id:node_idx, depth:0 });
	while (queue.length > 0) {
		var curr = queue.shift();
		var idx = curr.id,
			dep = curr.depth
		if ($.inArray(idx, raw_ids) >= 0) {
			continue;
		}
		if (idx < num_artists) {
			node_type.push(0);
		} else {
			node_type.push(1);
		}
		labels.push(raw_labels[idx]);
		raw_ids.push(idx);
		// TODO: change the graph representation in Python...
		if (dep >= hops) {
			continue;
		}
		for (var i = 0; i < raw_edges.length; i++) {
			var edge = raw_edges[i];
			var u = edge.artist, 
				v = edge.tag,
				w = edge.weight;
			if (w < weight_threshold) {
				continue;
			}
			if (u == idx) {
				queue.push({ id:v, depth:dep+1 });
			} else if (v == idx) {
				queue.push({ id:u, depth:dep+1 });
			}
		}
	}
	// re-computed edges
	for (var i = 0; i < raw_edges.length; i++) {
		var edge = raw_edges[i];
		var u = edge.artist, 
			v = edge.tag,
			w = edge.weight;
		if (w < weight_threshold) {
			continue;
		}
		var u0 = $.inArray(u, raw_ids),
			v0 = $.inArray(v, raw_ids);
		if (u0 >= 0 && v0 >= 0) {
			edges.push({ source:u0, target:v0, weight:w });
		}
	}
}

//Initialize data
d3.json("data/lastfm_100artist_graph");
raw_labels = graph["labels"],
raw_edges = graph["links"],
num_artists = graph["tag_id_start"];
pruneGraph("rock", 5, 0.08);
updateGraph(false);

var tagbox = $("#tags").autocomplete({
		source: raw_labels
		//messages: { noResults: '', results: function() {} 
	}).keyup(function(e) {
		if(e.which == 13) {
			pruneGraph($(this).val(), 2, 0.03);
			updateGraph(true);
		}
	});


//brushing directly on the graph?
//TODO: make this work....
//ref: http://bl.ocks.org/mbostock/4560481
/*
var brush = vis.append("g")
		.attr("class", "brush")
		.call(d3.svg.brush()
				.x(d3.scale.identity().domain([0, width]))
				.y(d3.scale.identity().domain([0, height]))
				.on("brush", function() {
					var extent = d3.event.target.extent();
					node.classed("selected", function(d) {
						return extent[0][0] <= d.x && d.x < extent[1][0]
							&& extent[0][1] <= d.y && d.y < extent[1][1];
				});
			}));

*/