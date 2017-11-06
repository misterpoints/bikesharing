//"use strict";
var myFunctionHolder = {};
var stationName = '';
var mapObject = '';
var stationLayer = '';
var pointList = [];
var clearList = [];
var thick = 1;
var outPolyline;
var inPolyline;

//declaring function 1
myFunctionHolder.addPopups = function (feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup("<b>Address:</b> " + feature.properties.name);
         layer.on('mouseover', function (e) {
            this.openPopup();
        });
        layer.on('mouseout', function (e) {
            this.closePopup();
        });
    }
        layer.on('click', function(e) {
        stationName = feature.properties.name;
        stationID = feature.properties.id;
        stationInteraction(stationID);
        document.getElementById("stationDiv").innerHTML = stationName + " selected";
    })
}



//declaring function 2
myFunctionHolder.pointToCircle = function (feature, latlng) {
    var geojsonMarkerOptions = {
        radius: 3,
        fillColor: "#3db7e4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
    return circleMarker;
}

function checkMark () {
    if (document.getElementById("myCheck").checked == true) {
        mapObject.addLayer(stationLayer);
    } else {
        mapObject.removeLayer(stationLayer);

    }
}


function clearMap() {
    for(i in mapObject._layers) {
        if(mapObject._layers[i]._path != undefined) {
            try {
                mapObject.removeLayer(mapObject._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + mapObject._layers[i]);
            }
        }
    }
        stationLayer = L.geoJSON(Stations, {
        onEachFeature: myFunctionHolder.clickMe,
        onEachFeature: myFunctionHolder.addPopups,
        pointToLayer: myFunctionHolder.pointToCircle
    });

    mapObject.addLayer(stationLayer);
}

// function clearMap () {
//    mapObject.removeLayer(layerIn);
//    mapObject.removeLayer(layerOut); 
// }

function stationInteraction(ID) {
    clearMap();
    for (i = 0; i < lines.length; i++) {
        if (lines[i]['From'] == ID) {
            var x3 = lines[i]['json_geometry']['coordinates'][0][1];
            var y3 = lines[i]['json_geometry']['coordinates'][0][0];
            var x4 = lines[i]['json_geometry']['coordinates'][1][1];
            var y4 = lines[i]['json_geometry']['coordinates'][1][0];
            pointList= [[x3, y3], [x4, y4]];
            thick = 1;
            if (lines[i]['Total'] > 20) {
                var thick = 10; }
            outPolyline = L.polyline(pointList, {color: 'red'}).addTo(mapObject);
//             var layerIn = L.layerGroup(outPolyline).addTo(mapObject);
        }
        if (lines[i]['To'] == ID) {
            var x3 = lines[i]['json_geometry']['coordinates'][0][1];
            var y3 = lines[i]['json_geometry']['coordinates'][0][0];
            var x4 = lines[i]['json_geometry']['coordinates'][1][1];
            var y4 = lines[i]['json_geometry']['coordinates'][1][0];
            pointList= [[x3, y3], [x4, y4]];
            thick = 1;
            if (lines[i]['Total'] > 20) {
                var thick = 10; 
            }
           inPolyline = L.polyline(pointList, {color: 'green', weight: thick}).addTo(mapObject);
//             var layerOut = L.layerGroup(inPolyline).addTo(mapObject);

        }
    }
}

//execute
window.onload = function () {
    renderMyChart();
    mapObject = L.map('mapDiv');
        
    var baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/sinba/ciperkjzk001jb6mdcb41o922/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2luYmEiLCJhIjoiY2loMWF6czQxMHdwcnZvbTNvMjVhaWV0MyJ9.zu-djzdfyr3C_Uj2F7noqg', {
        maxZoom: 18,
        attribution: "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
    }).addTo(mapObject);


    stationLayer = L.geoJSON(Stations, {
        onEachFeature: myFunctionHolder.clickMe,
        onEachFeature: myFunctionHolder.addPopups,
        pointToLayer: myFunctionHolder.pointToCircle
    });
    
    if (document.getElementById("myCheck").checked == true) {
        mapObject.addLayer(stationLayer); 
       }; 
    
    mapObject.fitBounds(stationLayer.getBounds());
};


