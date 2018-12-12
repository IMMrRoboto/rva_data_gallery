

d3.json("static/munged_data/budget_sunbirst.json").then(function(result){make_graph(result);});

var activeItem;

function make_graph(data) {

//console.log(data);

var arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.05))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));


var color = d3.scaleOrdinal().range(d3.quantize(d3.interpolateSinebow, data.children.length + 1));

var format = d3.format(",d");

var width = 700;//932;

var radius = width / 6;
    
var last_node;

var partition = data => {
  const root = d3.hierarchy(data)
      .sum(d => d.budget)
      .sort((a, b) => b.value - a.value);
  return d3.partition()
      .size([2 * Math.PI, root.height + 1])
    (root);
};


  const root = partition(data);

  root.each(d => d.current = d);

  const svg = d3.select("svg")//DOM.svg(width, width))
      .style("width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");

  const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${width / 2})`);

  const path = g.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .enter().append("path")
    .attr("class", d =>"node_id_"+String(d.data.id))
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
    .attr("stroke-opacity",0.5)
    .attr("stroke-width", .5)
    .attr("stroke", "white")
    .attr("d", d => arc(d.current));

  path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click.sp", clicked)
      .on("click.bt", update_details);

  path.style("cursor", "pointer")
      ;
      
  path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .enter().append("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name);

  const parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .attr("class", "back-up")
      .on("click.a", clicked)
      .on("click.b", update_details_up);
      
d3.select("circle").append("text").attr("dy", "0.35em")
      .attr("fill-opacity", 1)
      //.attr("transform", d => labelTransform(d.current)).text("Up a level");

update_details(root);

function get_parents(p, parents, parents_ids, p_budgets) {
    try{
    var p = p.parent;
    parents.push(p.data.name);
    parents_ids.push(p.data.id);
    p_budgets.push(p.value);
    //console.log(p.data.name);
    get_parents(p, parents, parents_ids, p_budgets);
    }catch (err){};
    return [parents, parents_ids, p_budgets];
}    
    
function update_details_up(p) {
   var elem = last_node.parent;
   if(elem == null){
       elem = root;
   }
   update_details(elem,);
}

function update_details(p) {
	console.log(p);
    last_node = p;
	d3.select("#tree_details").html('');
	d3.select("#sibling-list").html('');
	var parents = [];
    var parents_ids = [];
	var p_budgets = [];

	parents.push(p.data.name.replace(/_/g," "));
    parents_ids.push(p.data.id);
	p_budgets.push(p.value);
	
    get_parents(p, parents, parents_ids, p_budgets);

	var i;
	for (i = parents.length-1; i >=0; i--) { 
	    d3.select("#details-container")
		.style("display","block");
	    d3.select("#tree_details")
		.append("li").append("ul").attr("class","ul-"+i)
		.append("li").attr("class","line-item node_id_" + parents_ids[i])
		.text(parents[i].replace(/_/g, " "));

	    var b_str = '$' + p_budgets[i].toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	    d3.select("#tree_details li ul.ul-"+i)
		.append("li").attr("class","budg-item")
		.text(b_str);
	}

	sibs = p.children;
    if(!sibs){sibs=[];}
	for (i=0; i< sibs.length; i++) {
	
		var sib_name = sibs[i].data.name;
        var sib_id = sibs[i].data.id;
		var sib_b = '$' + sibs[i].value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

		d3.select("#sibling-list")
		.append("li").attr("class", "node_id_" + sib_id)
        .html("<b>"+sib_name + "</b>: "+sib_b);
	}

    $('#sibling-list li').mouseover(function(){
        var node_id = $(this).attr('class');
        console.log(node_id);
        d3.select("path."+node_id)
                  .attr("stroke", "#011627")
                  .attr("stroke-width", "2px")
                  .attr("stroke-opacity", "1");
    });
   $('#sibling-list li').mouseout(function(){
        var node_id = $(this).attr('class');
        console.log("out");
        d3.select("path."+node_id)
              .attr("stroke", "white")
              .attr("stroke-width", ".5")
              .attr("stroke-opacity", ".5");
    })
     $('#sibling-list li').click(function(){
        var node_id = $(this).attr('class');
        console.log("click");
        d3.select("path."+node_id)
              .attr("stroke", "white")
              .attr("stroke-width", ".5")
              .attr("stroke-opacity", ".5");
        $("path."+node_id).d3Click();
    })
       
    $('#tree_details .line-item').click(function(){
        var clk_cnt = parseInt($(this).parent().attr('class').split("-")[1])+1;
        delayD3click(clk_cnt);
    })          
       
   }
    
  function delayD3click(counter){
      if(counter > 0){
        setTimeout(function(){
          $("circle.back-up").d3Click();
          counter--;
          delayD3click(counter);
        }, 2);
      }
    }
    
  function clicked(p) {
    //update_details(p);
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = g.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.6) : 0)
        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
  }
  
  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  change_slider_height();

}


$(document).ready(function(){
  $("#svg-container svg").click(function() {change_slider_height();});
});

function change_slider_height(){
    console.log("asdasda");
    $('#menu-slider').height($('#container').height());
}
// Complements of Stackoverflow user: handler
// https://stackoverflow.com/questions/9063383/how-to-invoke-click-event-programmatically-in-d3
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};
