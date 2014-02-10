var width = window.innerWidth;// 1000;
var height = window.innerHeight * 0.75; // 800;
var labelDistance = 0;

var vis = d3.select("#content")
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.style("margin", "auto");
			//.style("margin-right", "auto");
			
var link, 
	node, 
	anchorLink,
	anchorNode,
	anchorText,
	force,
	force2,
	drag;
	
var nodes, 
	labelAnchors,
	labelAnchorLinks,
	links;

// Read from JSON
var raw_labels = null,
	raw_edges = null,
	raw_counts = null,
	num_artists = 0;

var labels = null,
	edges = null,
	counts = null,
	raw_ids = null,
	node_type = null, // 0: artist, 1:
	centrality = null; // number of hops from the graph center
	
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
	  .linkDistance( function(d) {
		  //return 10 + 2 * Math.min(centrality[d.source], centrality[d.target]);
		  //return d.weight * 10;
		  return 20;
	  })
	  .charge(-3000)
	  .linkStrength( function(d) {
	  	  return d.weight < 0.1 ? 0 : 0.5;
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
	
	link = vis.selectAll("line.link")
			.data(links)
			.enter()
			.append("line")
			.attr("class", "link");

	link.style("stroke-width", function(d) {
			return d.weight * 8;
		})
		.style("stroke", "grey")
		.style("opacity", 0.2);

	node = vis.selectAll("g.node")
			.data(force.nodes())
			.enter()
			.append("svg:g")
			.attr("class", "node");
	
	node.append("circle")
		.attr("r", function(d, i) {
				return 10;
			})
		.style("fill", function(d, i) {
				/*if (centrality[i] == 0) {
					return "orange";
				}*/
				return node_type[i] == 0 ? "teal" : "purple"; 
			})
		.style("opacity", 0.5)
		.style("stroke", function(d, i) {
				/*if (i == 0) {
					return "orange";
				}*/
				return node_type[i] == 0 ? "teal" : "purple";
			})
		.style("stroke-width", function(d, i) {
				if (i == 0) {
					return 28;
				}
				//return node_type[i] == 0 ? 1 : 3;
				return 1;
			});
	
	node.on("dblclick", dblclick)
		.on("mouseover", highlightVicinity)
		.on("mouseout", fadeVicinity)
		.call(drag);
	
	anchorLink = vis.selectAll("line.anchorLink")
				.data(labelAnchorLinks)
				.enter()
				.append("svg:line")
				.attr("class", "anchorLink");
		
	anchorNode = vis.selectAll("g.anchorNode")
				.data(force2.nodes())
				.enter()
				.append("svg:g")
				.attr("class", "anchorNode");
	
	anchorNode.append("circle")
		.attr("r", 0)
		.style("fill", "#FFF")
		.style("opacity", 0);
	
	anchorText = anchorNode.append("text")
		.text(function(d, i) {
			return i % 2 == 0 ? "" : d.node.label;
		})
		.attr("class", "anchorText");
	
	anchorText.style("fill", "black")
		.style("font-family", "Helvetica")
		.style("fill", function(d, i) {
			return node_type[(i-1)/2] == 0 ?
					d3.rgb("teal").darker(10) :
					d3.rgb("purple").darker(10);
		})
		.style("font-size", function(d, i) {
			return i == 1 ? 20 : 13;
		})
		.style("font-weight", function(d, i) {
			return i == 1 ? "bold" : "normal";
		});
		//.style("background-color", "grey");
	
	/*
	anchorNode
		.on("mouseover", anchorMouseover)
		.on("mouseout", anchorMouseout);
	*/
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
		.classed("fixed", d.fixed = true);
}

function dblclick(d, i) {
	d3.select(this)
		.classed("fixed", d.fixed = false);
	//console.log(labels[i]);
	if (node_type[i] == 0) {
		pruneGraph($.inArray(labels[i], raw_labels), 2, 5, 10, 0.05, 1);
	} else { 
		pruneGraph($.inArray(labels[i], raw_labels), 2, 20, 2, 0.05, 1);
	}
	updateGraph(true);
}

function isLinkedTo(link_data, node_data) {
	//console.log("%o, %o, %o", link_data.source, link_data.target, node_data);
	return link_data.source == node_data || link_data.target == node_data;
}

function oneHopAway(new_id, center_id) {
	for (var i = 0; i < links.length; i++) {
		//console.log(i + ", " + links[i].source, + ", " + links[i].target + ", " + new_node + ", " + center_node);
		if (links[i].source == center_id && links[i].target == new_id) {
			return true;
		}
	}
	return false;
}

function highlightVicinity(node_d, node_i) {
	// bloat node
	d3.select(this)
		.select("circle")
		.transition()
		.duration(300)
		.attr("r", 20);

	// highlight link
	link.transition()
		.duration(300)
		.style("stroke-width", function(d) {
			return isLinkedTo(d, node_d) ? d.weight * 24 : d.weight * 8;
		})
		.style("stroke", function(d) {
			return isLinkedTo(d, node_d) ? "gold" : "grey";
		})
		.style("opacity", function(d) {
			return isLinkedTo(d, node_d) ? 0.6 : 0.2;
		});
	
	// change font
	anchorText.transition()
		.duration(300)
		.style("fill", "black")
		.style("font-family", "Helvetica")
		.style("font-size", function(d, i) {
			if (i == 1) {
				return 20;
			}
			return i == 2 * node_i + 1 ? 20 : 13;
		})
		.style("font-weight", function(d, i) {
			if (i == 1) {
				return "bold";
			}
			return i == 2 * node_i + 1 ? "bold" : "normal";
		});
}

function fadeVicinity(d, i) {
	d3.select(this)
		.transition()
		.duration(300)
		.select("circle")
	    .attr("r", 10);
	
	link.transition()
		.duration(300)
		.style("stroke-width", function(d) {
			return d.weight * 8;
		})
		.style("stroke", "grey")
		.style("opacity", function(d) {
			return 0.2;
		});
	
	anchorText.transition()
		.duration(300)
		.style("fill", "black")
		.style("font-family", "Helvetica")
		.style("font-size", function(d, i) {
			return i == 1 ? 20 : 13;
		})
		.style("font-weight", function(d, i) {
			return i == 1 ? "bold" : "normal";
		});
}

function pruneGraph(node_idx, max_hops, max_artist_fanout, max_tag_fanout,
					min_weight, min_label_freq) {
	//var node_idx = $.inArray(viewPoint, raw_labels);
	labels = [];
	edges = [];
	counts = [];
	node_type = [];
	centrality = [];
	raw_ids = [];
	queue = [];
	queue.push({ id:node_idx, depth:0 });
	while (queue.length > 0) {
		var curr = queue.shift();
		var idx = curr.id,
			dep = curr.depth;
		// skip already visited nodes
		if ($.inArray(idx, raw_ids) >= 0) {
			continue;
		}
		if (idx < num_artists) {
			node_type.push(0);
		} else {
			node_type.push(1);
		}
		labels.push(raw_labels[idx]);
		counts.push(raw_counts[idx]);
		centrality.push(dep);
		raw_ids.push(idx);
		
		if (dep >= max_hops) {
			continue;
		}
		var fanout = 0;
		var _neighbors = raw_edges[idx].n;
		var _weights = raw_edges[idx].w;
		for (var i = 0; i < _neighbors.length; i++) {
			var neighbor = _neighbors[i],
				weight = _weights[i];
			if (weight >= min_weight && raw_counts[neighbor] >= min_label_freq) {
				queue.push({ id:neighbor, depth:dep+1 });
				fanout += 1;
				if ((neighbor < num_artists && fanout >= max_artist_fanout) || 
					(neighbor >= num_artists && fanout >= max_tag_fanout)) {
					break;
				}
			}
		}
	}
	// add every edge in the node set
	// recompute centrality here
	for (var u = 0; u < raw_ids.length; u++) {
		var u0 = raw_ids[u];
		if (u0 >= num_artists) {
			continue;
		}
		var _neighbors = raw_edges[u0].n,
			_weights = raw_edges[u0].w;
		for (var i = 0; i < _neighbors.length; i++) {
			var v0 = _neighbors[i], 
				v = $.inArray(v0, raw_ids),
				weight = _weights[i];
			if (v >= 0 && weight >= min_weight) {
				edges.push({ source:u, target:v, weight:weight });
			}
		}
	}
}

//Initialize data
d3.json("data/lastfm_10000artist_graph_new");
raw_labels = graph["labels"],
raw_edges = graph["links"],
num_artists = graph["tag_id_start"];
raw_counts = graph["frequency"];

pruneGraph($.inArray("rock", raw_labels), 5, 4, 2, 0.15, 200);
updateGraph(false);

var tagbox = $("#input_artist").autocomplete({
		source: raw_labels
		//messages: { noResults: '', results: function() {} 
	}).keyup(function(e) {
		if(e.which == 13) {
			var label_idx = $.inArray($(this).val(), raw_labels);
			if (label_idx < num_artists) { 
				pruneGraph(label_idx, 2, 5, 10, 0.05, 1);
			} else {
				pruneGraph(label_idx, 2, 20, 2, 0.05, 1);
			}
			updateGraph(true);
		}
	});

/*
var tooltip =  $(function() {
    $( document ).tooltip({
        items: "img, [data-geo], [title]",
        content: function() {
          var element = $( this );
          if ( element.is( "[data-geo]" ) ) {
            var text = element.text();
            return "<img class='map' alt='" + text +
              "' src='http://maps.google.com/maps/api/staticmap?" +
              "zoom=11&size=350x350&maptype=terrain&sensor=false&center=" +
              text + "'>";
          }
          if ( element.is( "[title]" ) ) {
            return element.attr( "title" );
          }
          if ( element.is( "img" ) ) {
            return element.attr( "alt" );
          }
        }
      });
    });
*/

$(document).tooltip({
	items: "#help_icon, #info_icon",
	content: function() {
		var element = $(this);
		if (element.is("#help_icon")) {
			return "<h3> To explore artists and their tags, " + 
	         "double-click on the nodes or type in search box (e.g. britpop or coldplay); </h3>" + 
	         "<h3> Mouse over to hightlight nodes and surrounding edges. </h3>" + 
	         "<h3> For best visual effect, reset browser zoom to default. </h3>";
		} else if (element.is("#info_icon")) {
			return "<h3> Last.fm dataset, " +
	        "the official song tags and song similarity collection for the Million Song Dataset, </h3>" +
	        "<h3> available at: http://labrosa.ee.columbia.edu/millionsong/lastfm </h3>";
		}
	}
});

var legends = d3.select("#legend").append("svg")
	.attr("width", 250)
	.attr("height", 30)
	.style("margin", "auto");

var leg1 = legends.append("circle").attr("r", 10).attr("cx", 15).attr("cy", 18);
var legtext1 = legends.append("text").text("artist").attr("x", 30).attr("y", 24);

var leg2 = legends.append("circle").attr("r", 10).attr("cx", 95).attr("cy", 18);
var legtext2 = legends.append("text").text("user-added tag").attr("x", 110).attr("y", 24);
leg1.style("fill", "teal").style("opacity", 0.5);
leg2.style("fill", "purple").style("opacity", 0.5);
legtext1.style("font-size", 16)
		.style("font-family", "Helvetica")
		.style("font-weight", "bold")
		.style("fill", d3.rgb("teal").darker());
legtext2.style("font-size", 16)
	.style("font-family", "Helvetica")
	.style("font-weight", "bold")
	.style("fill", d3.rgb("purple").darker());
		
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