var width = 800;
var height = 600;
var labelDistance = 0;

var vis = d3.select("body")
			.append("svg:svg")
			.attr("width", width)
			.attr("height", height);

// Load the graph
d3.json("data/lastfm_100artist_graph");

var nodes = []; 
var labelAnchors = []; // label anchors have duplicated nodes, why?
var labelAnchorLinks = [];
var links = [];

var labels = graph["labels"];
var edges = graph["links"];
var num_nodes = labels.length;
var num_edges = edges.length;
var num_artists = graph["tag_id_start"];
 
// add nodes
// TODO: prune isolated nodes
for(var i = 0; i < num_nodes; i++) {
  var node = {
    label : labels[i]
  }; 
  nodes.push(node);
  labelAnchors.push({ // label anchors keep two copies of the nodes
    node : node
  });
  labelAnchors.push({
    node : node
  });
};

// add links between label anchors
for (var i = 0; i < num_nodes; i++) {
 labelAnchorLinks.push({
        source : i * 2,
        target : i * 2 + 1,
        weight : 1
      });
}

// add links between actual "nodes"
for (var i = 0; i < num_edges; i++) {
  var edge = edges[i];
  var source_id = edge["artist"];
  // TODO: add edge weight filter to a sliding bar
  if (edge["weight"] < 0.05) {
	  continue;
  }
  links.push({
      source : source_id,
      target : edge["tag"],
      weight : edge["weight"]
  });
}

// Figure out the parameters and try to make the graph less "wiggly"
var force = d3.layout.force()
  .size([width, height])
  .nodes(nodes)
  .links(links)
  .gravity(1)
  .linkDistance(10)
  .charge(-3000)
  .linkStrength(function(x) {
  	  return x.weight * 10;
});
force.start();

var force2 = d3.layout.force()
  .nodes(labelAnchors)
  .links(labelAnchorLinks)
  .gravity(0)
  .linkDistance(0)
  .linkStrength(8)
  .charge(-100)
  .size([width, height]);

force2.start();

// draw links 
var link = vis.selectAll("line.link")
			.data(links)
			.enter()
			.append("svg:line")
			.attr("class", "link")
			.style("stroke", "#CCC");

// draw nodes
var node = vis.selectAll("g.node")
			.data(force.nodes())
			.enter()
			.append("svg:g") // group ?
			.attr("class", "node");

// node styles
node.append("svg:circle")
		.attr("r", function(d, i) {
				return i < num_artists ? 10 : 20; 
			})
		.style("fill", function(d, i) {
				return i < num_artists ? "blue" : "red"; 
			})
		.style("stroke", "#FFF")
		.style("stroke-width", 1);

// add labels
var anchorLink = vis.selectAll("line.anchorLink")
		.data(labelAnchorLinks);
		//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

var anchorNode = vis.selectAll("g.anchorNode")
		.data(force2.nodes())
		.enter()
		.append("svg:g")
		.attr("class", "anchorNode");

anchorNode.append("svg:circle") // invisible anchor nodes
		.attr("r", 0)
		.style("fill", "#FFF");

anchorNode.append("svg:text")
		.text(function(d, i) {
			return i % 2 == 0 ? "" : d.node.label;
		})
		.style("fill", "#555")
		.style("font-family", "Arial")
		.style("font-size", 12);

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

// Control ...
var drag = force
.drag()
.on("dragstart", dragstart);

node.call(drag)
.on("dblclick", dblclick);

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

tagbox = $("#tags")
	.autocomplete({
		source: labels
		/*messages: {
			noResults: '',
			results: function() {}
		*/
	})
	.keyup(function(e) {
	    if(e.which == 13) {
	        query_tag = $(this).val();
	        pruneGraph(query_tag);
	    }
	});

function pruneGraph(query_tag) {
	var tag_idx = $.inArray(query_tag, labels);
	alert(tag_idx);
	// update nodes and links
	
}


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