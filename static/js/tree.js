var treeData = [];

d3.json("static/budget_graph2.json", function(error, data) {
	if(error){console.log(error)}
	treeData.push(data);//JSON.stringify(data, null, 4));
	console.log(treeData[0]);

	make_graph();
});

function make_graph() {
var margin = {top: 20, right: 120, bottom: 20, left:100},
    width = 950 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("svg")
    // .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData[0];
root.x0 = height / 2;
root.y0 = 0;

update(root);

// d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
  //console.log(nodes);
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodesâ€¦
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("id", function(d) { return d.name + "-node";})
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; }); //#ccff99

  nodeEnter.append("text")
      // .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
      .attr("dy", ".35em")
      // .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name.replace("_", " "); })
      .style("transform", "translate(-150px,0px)")
      .style("fill-opacity", 1e-6);
     // .attr("class", function(d) {
     //          if (d.url != null) { return 'hyper'; }
     //     })
     //      .on("click", function (d) {
     //          $('.hyper').attr('style', 'font-weight:normal');
     //          d3.select(this).attr('style', 'font-weight:bold');
     //          if (d.url != null) {
     //             //  window.location=d.url;
     //             $('#vid').remove();
     //
     //             $('#vid-container').append( $('<embed>')
     //                .attr('id', 'vid')
     //                .attr('src', d.url + "?version=3&amp;hl=en_US&amp;rel=0&amp;autohide=1&amp;autoplay=1")
     //                .attr('wmode',"transparent")
     //                .attr('type',"application/x-shockwave-flash")
     //                .attr('width',"100%")
     //                .attr('height',"100%")
     //                .attr('allowfullscreen',"true")
     //                .attr('title',d.name)
     //              )
     //            }
     //      })
    // ;

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the linksâ€¦
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
      .attr("stroke-dasharray", function(d) {
        if (d.target.relationship) {
          if (d.target.relationship == "dotted") {
            return "6";
          }
        }
        return "0";
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
  console.log(d);
  update_budg(d);
  //update_okrs(d);
  // update_datasets(d);
  //update_team_name(d);
}

function update_budg(d) {
    // https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
    var b_str = d.name + ', Budget: $' + d.budget.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    d3.select('#budget_p').text(b_str)
}

function update_okrs(d) {
  if (d.okrs) {
    var okr1 = d.okrs[0];
    var okr2 = d.okrs[1];
    var okr3 = d.okrs[2];

    // console.log(okr3.key_results[0].key_result)
    d3.select("#okrs #okr1 h4 a").text(okr1.okr);
      d3.select("#okrs #okr1 .list-group:nth-of-type(1)").text(okr1.key_results[0].key_result);
      d3.select("#okrs #okr1 .list-group:nth-of-type(2)").text(okr1.key_results[1].key_result);
      d3.select("#okrs #okr1 .list-group:nth-of-type(3)").text(okr1.key_results[2].key_result);

    d3.select("#okrs #okr2 h4 a").text(okr2.okr);
      d3.select("#okrs #okr2 .list-group:nth-of-type(1)").text(okr2.key_results[0].key_result);
      d3.select("#okrs #okr2 .list-group:nth-of-type(2)").text(okr2.key_results[1].key_result);
      d3.select("#okrs #okr2 .list-group:nth-of-type(3)").text(okr2.key_results[2].key_result);

    d3.select("#okrs #okr3 h4 a").text(okr3.okr);
      d3.select("#okrs #okr3 .list-group:nth-of-type(1)").text(okr3.key_results[0].key_result);
      d3.select("#okrs #okr3 .list-group:nth-of-type(2)").text(okr3.key_results[1].key_result);
      d3.select("#okrs #okr3 .list-group:nth-of-type(3)").text(okr3.key_results[2].key_result);
  }
}

function update_datasets(d) {
  if (d.data_sets) {
    var arr = d.data_sets;
    for (i = 0; i < arr.length; i++) {

      var d_set = d.data_sets[i];

      var plat = d_set[Object.keys(d_set)][0].platform;
      var tble = d_set[Object.keys(d_set)][1].table;
      var desc = d_set[Object.keys(d_set)][2].description;
      var i_s = (i+2).toString();
      console.log(i_s);
      d3.select("#data-sets tr:nth-of-type("+i_s+") td:nth-of-type(1)").text(plat);
      d3.select("#data-sets tr:nth-of-type("+i_s+") td:nth-of-type(2)").text(tble);
      d3.select("#data-sets tr:nth-of-type("+i_s+") td:nth-of-type(3)").text(desc);
    }
    // console.log(d_set);
  }
}

function update_team_name(d) {
  if (d.name) {
    d3.select("#team_name").text(d.name);
  }
}

}
