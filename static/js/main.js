$(document).ready(function(){

  $('#menu-slider').click(function(e){
	//$(this).toggleClass("no-padding");
    //$('#FAQaccordion').toggle("slide");

	if(e.target !== e.currentTarget) return;
	// $(this).toggleClass("no-padding");
     menu_open();
  });

  $("#menu-slider-icon").click(function(e){
		menu_open();
  });

  $("#container .row").resize(function() {
		$('#menu-slider').height($('#container').height());
  });

  function menu_open(){
		$('#menu-slider').toggleClass("open").children("#FAQaccordion").toggle("slide");
		$("#menu-slider-icon").toggleClass( "fa-chevron-right" ).toggleClass( "fa-chevron-left" );

  }


});
