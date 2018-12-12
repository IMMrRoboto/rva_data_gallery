"use strict";

/*
* Author: Connor Riley
* The Wikipedia Map of Richmond, VA
* Version: 2.0
* www.connorriley.me
* Made with Leaflet Maps APIs, Stamen map tiles, and
* GeoNames API.
*
* This work is licensed under Creative Commons GNU LGPL License.
*/

/// Get Wiki data
var citymap = {};
var mymap;
var infowindow;
var openWindow = false;
var markers = [];
var current_marker;


jQuery(document).ready(function($) {
    $.getJSON("/static/munged_data/wikimap_data.json", function(json) {
        citymap = $.parseJSON(json);
        console.log(typeof(citymap));
        initMap();
    });
});

// Map it
function initMap() {
    
    var richmond = [37.551441, -77.436056];
    
    mymap = L.map('mapid').setView(richmond, 12);//{lat: 37.551441, lng: -77.436056};
    
    var Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        ext: 'png'
    }).addTo(mymap);
    

    drawMarkers();
}

function drawMarkers() {
    for (var i = 0; i < citymap.length; i++) {
        var origin = [parseFloat(citymap[i].lat), parseFloat(citymap[i].lng)];
        
        var content_list = '<div class="infowindow">';
        if(citymap[i].thumbnailImg != null ) {
            content_list += '<img src="'+citymap[i].thumbnailImg+'">';
        }
        content_list +=
            '<a target="_blank" href="http://'+citymap[i].wikipediaUrl+'">' +
            '<h3>' + citymap[i].title + ' </h3>' +
            '<p>'+citymap[i].summary+'</p>' +
            '</a>' +
            '<button class="rmv-btn" onclick="removeMarker()">Remove Marker</button>' +
            '</div>';
 
        var circle = L.circle(origin, {
            color: '#2EC4B6',
            fillColor: '#2EC4B6',
            fillOpacity: 0.5,
            radius: (citymap[i].rank * 1.5 )
        }).addTo(mymap);

        
        circle.bindPopup(content_list);
        circle.bindTooltip(citymap[i].title);
        circle.on('mouseover', function (e) {
            this.openTooltip();
        });
        circle.on('mouseout', function (e) {
            this.closeTooltip();
        });
        
        mymap.on('popupopen', function(e) {
          current_marker = e.popup._source;
        });
        
    }
}

function removeMarker(id) {
    mymap.removeLayer(current_marker);
}

