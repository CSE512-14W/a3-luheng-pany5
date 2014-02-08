var w = 1000;
var h = 1000;
var labelDistance = 0;

var vis = d3.select("body")
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h);

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
  .size([w, h])
  .nodes(nodes)
  .links(links)
  .gravity(0)
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
  .size([w, h]);

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
				return i < num_artists ? 20 : 10; 
			})
		.style("fill", function(d, i) {
				return i < num_artists ? "blue" : "red"; 
			})
		.style("stroke", "#FFF")
		.style("stroke-width", 1);
  
node.call(force.drag);

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
			this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
		}
    });	
    anchorNode.call(updateNode);
    link.call(updateLink);
    anchorLink.call(updateLink);
});