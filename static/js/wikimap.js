/*
* Author: Connor Riley
* The Wikipedia Map of Richmond, VA
* Version: 1.0
* www.connorriley.me
* Made with Google Maps APIs, Stamen map tiles, and
* GeoNames API.
*
* This work is licensed under Creative Commons GNU LGPL License.
*/

/// Get Wiki data
var citymap = {};
var map;
var infowindow;
var openWindow = false;
var markers = [];

function getWikiData() {
    var x = new XMLHttpRequest();
    x.open("GET", 'http://api.geonames.org/findNearbyWikipedia?lat=37.551441&lng=-77.436056&radius=15&maxRows=500&username=immrroboto', true);
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200)
        {
            var doc = x.responseXML;
            citymap = xml2json(doc, '    ' );
            citymap = JSON.parse(citymap);
            citymap = citymap.geonames.entry;
            initMap();
        }
    };
    x.send(null);
}


// Map it
function initMap() {
    var richmond = {lat: 37.551441, lng: -77.436056};

    infowindow = new google.maps.InfoWindow({maxWidth: 300});

    var customMapTypeId = 'rvawikimap';

    var layer = "toner-lite";
    map = new google.maps.Map(document.getElementById("map"), {
        center: richmond,
        zoom: 13,
        mapTypeId: layer,
        disableDefaultUI: true,
        zoomControl: true,
        scrollwheel: false
    });
    try {
        map.mapTypes.set(layer, new google.maps.StamenMapType(layer));
    } catch(e) {
        map.mapTypes.set(layer, new google.maps.StyledMapType());
    }

    drawMarkers();
}

function drawMarkers() {
    for (var i = 0; i < citymap.length; i++) {

        var origin = {lat: parseFloat(citymap[i].lat), lng: parseFloat(citymap[i].lng)};
        var content_list = '<div class="infowindow">';
        if(citymap[i].thumbnailImg != null ) {
            content_list += '<img src="'+citymap[i].thumbnailImg+'">';
        }
        content_list +=
            '<a target="_blank" href="'+citymap[i].wikipediaUrl+'">' +
            '<h3>' + citymap[i].title + ': </h3>' +
            '<p style="color: #000">'+citymap[i].summary+'</p>' +
            '</a>' +
            '<button onclick="removeMarker('+i+')">Remove Marker</button>' +
            '</div>';

        var marker = new google.maps.Marker({
            map: map,
            position: origin,
            opacity: 0.8,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#79bd9a',
                fillOpacity: .85,
                strokeColor: '#79bd9a',
                strokeWeight: .8,
                scale: 2 + ( Math.sqrt(citymap[i].rank) * 3 )
            },
            preview: '<div class="infowindow preview"><h3>'+citymap[i].title+'</h3><p style="margin-bottom: 0">Wikipedia relevance score: '+citymap[i].rank+'</p></div>'
        });

        markers.push(marker);

        bindPopUp(marker, content_list, origin);
    }
}

function removeMarker(id) {
    markers[id].setMap(null);
}

function bindPopUp (marker, html, position) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(html);
        infowindow.setPosition(position);
        infowindow.open(map, this);
        openWindow = true;
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
        openWindow = false;
        infowindow.setContent(marker.preview);
        infowindow.setPosition(position);
        infowindow.open(map, this);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        if (!openWindow) {
            infowindow.close();
        }
    });

    google.maps.event.addListener(infowindow, 'closeclick', function() {
        openWindow = false;
    });
}

jQuery(document).ready(function($) {
    getWikiData();
})

//Not my work ---
/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/
*/
function xml2json(xml, tab) {
    var X = {
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType==1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                    for (var i=0; i<xml.attributes.length; i++)
                        o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild=0, cdataChild=0, hasElementChild=false;
                    for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType==1) hasElementChild = true;
                        else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType==4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (var n=xml.firstChild; n; n=n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {  // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                }
                                else  // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                        else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    }
                    else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n=xml.firstChild; n; n=n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType==9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var json = name ? ("\""+name+"\"") : "";
            if (o instanceof Array) {
                for (var i=0,n=o.length; i<n; i++)
                    o[i] = X.toJson(o[i], "", ind+"\t");
                json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name&&":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name&&":") + "\"" + o.toString() + "\"";
            else
                json += (name&&":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i=0; i<n.attributes.length;i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c=n.firstChild; c; c=c.nextSibling)
                                s += asXml(c);
                            s += "</"+n.nodeName+">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c=node.firstChild; c; c=c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n; ) {
                if (n.nodeType == 3) {  // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else                      // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}
