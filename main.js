  /*-------------------------
   ------  VARIABLES  ------ 
   -------------------------*/

var lastStation;
var myFunctionHolder = {};
var myFunctionHolder2 = {};
var myFunctionHolder3 = {};


   /*-------------------------
   ------CREATE POPUPS------ 
   -------------------------*/

// Function to create the popups for bike stations
myFunctionHolder.addPopups = function (feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup("<b>Address:</b> " + feature.properties.name);
         layer.on('mouseover', function (e) {
            this.openPopup();
            this.bringToFront()
        });
        layer.on('mouseout', function (e) {
            this.closePopup();
            this.bringToBack()
        });
    }
        // Displayes the station name in stationDiv and calls the function to draw the lines
        layer.on('click', function(e) {
        stationName = feature.properties.name;
        stationID = feature.properties.id;
        stationInteraction(stationID) // Calls function to draw lines     
    })
}

// Function to create the popups for the subway stations
myFunctionHolder2.addPopups = function (feature, layer) {
    layer.bindPopup("<b>Station name:</b> " + feature.properties.Name);
     layer.on('mouseover', function (e) {
        this.openPopup();
    });
    layer.on('mouseout', function (e) {
        this.closePopup();
    });
}

// Function to create the popups for the averages
myFunctionHolder3.addPopups = function (feature, layer) {
    layer.bindPopup("<b>Average In-flow:</b> " + Number(feature.properties["TO_AVG"]).toFixed(2) + 
	"<br><b>Average Out-flow:</b>" + Number(feature.properties["FROM_AVG"]).toFixed(2) +
	"<br><b>Combined Average:</b>" + Number(feature.properties["COMB_AVG"]).toFixed(2));
     layer.on('mouseover', function (e) {
        this.openPopup();
    });
    layer.on('mouseout', function (e) {
        this.closePopup();
		this.bringToBack();
    });
}

   /*-------------------------
   ------CREATE STATIONS------ 
   -------------------------*/

// Funcion to create the details for the station markers
myFunctionHolder.pointToCircle = function (feature, latlng) {
    var geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#3db7e4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
    return circleMarker;
}

// Funcion to create the details for the subway station markers
myFunctionHolder2.pointToCircle = function (feature, latlng) {
    var geojsonMarkerOptions = {
        radius: 5,
        fillColor: "purple",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
    return circleMarker;
}

// Funcion to create the details for the average station markers
myFunctionHolder3.pointToCircle = function (feature, latlng) {
    function colorDaCircle() {
        // Changes the color of the station depending on the greater value
        var x = feature.properties["FROM_AVG"];
        var y = feature.properties["TO_AVG"];  
        if (x > y) { return "red" }
        else { return "green" }
    }

    function sizeDaCircle() {
        // Creates the sizes of the stations based on the combined average
        var z = feature.properties["COMB_AVG"]        
        if (z >= 90) { return 18 }
        else if (z >= 80 && z < 90) { return 16 }
        else if (z >= 70 && z < 80) { return 14 }
        else if (z >= 60 && z < 70) { return 12 }
        else if (z >= 50 && z < 60) { return 10 }
        else if (z >= 40 && z < 50) { return 8 }
        else if (z >= 30 && z < 40) { return 6 }
        else if (z >= 20 && z < 30) { return 4 }
        else { return 2 }
    }
          
    var geojsonMarkerOptions = {
        radius: sizeDaCircle(),
        fillColor: colorDaCircle(),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
    return circleMarker;
}
   /*-------------------------
   ------ MAP OPTIONS  ------- 
   -------------------------*/

// Check boxes (index) calls this function to remove elements from the map
function checkMark () {
    switch (document.getElementById("stationCheck").checked){
        case true:
            mapObject.addLayer(stationLayer);
            stationCheck = true;
            break;
        case false:
            mapObject.removeLayer(stationLayer);
            stationCheck = false;
            clearMap();
            break;
    }
    switch (document.getElementById("inFlowCheck").checked){
        case true:
            inFlowCheck = true;
            break;
        case false:
            inFlowCheck = false;
            break;
    }
    switch (document.getElementById("outFlowCheck").checked){
        case true:
            outFlowCheck = true;
            break;
        case false:
            outFlowCheck = false;
            break;
    }
    switch (document.getElementById("subwayCheck").checked){
        case true:
            mapObject.addLayer(subwayLayer);
            subwayCheck = true;
            break;
        case false:
            mapObject.removeLayer(subwayLayer);
            subwayCheck = false;
            break;
    }
    switch (document.getElementById("bikeCheck").checked){
        case true:
            mapObject.addLayer(pathLayer);
            bikeCheck = true;
            break;
        case false:
            mapObject.removeLayer(pathLayer);
            bikeCheck = false;
            break;
    }
  	switch (document.getElementById("averageCheck").checked){
        case true:
            mapObject.addLayer(avgLayer);
            averageCheck = true;
            break;
        case false:
            mapObject.removeLayer(avgLayer);
            averageCheck = false;
            break;
    }
};

   /*-------------------------
   ------   HEAT MAP   ------- 
   -------------------------*/
var heatmapCfg = ({
    "radius": .005,
    "maxOpacity": .5, 
    "scaleRadius": true, 
    "useLocalExtrema": false,
    latField: 'lat',
    lngField: 'lng',
    valueField: 'value'});

var heatmapLayer = new HeatmapOverlay(heatmapCfg);

function heatMap() {
    if (document.getElementById("heatmapCheck").checked) {
        if (document.getElementById("heatmapflow").checked) {
            heatmapLayer.setData(fromTotals);
            mapObject.addLayer(heatmapLayer); }
        else {
            heatmapLayer.setData(toTotals);
            mapObject.addLayer(heatmapLayer); }
    }
    else { mapObject.removeLayer(heatmapLayer); }
};



   /*-------------------------
   ------   CLEAR MAP  ------- 
   -------------------------*/

// This function removes all the layers from the map, then adds the stations back on (it removes them too) 
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
    
    if (stationCheck) {
        stationLayer = L.geoJSON(Stations, {
			   onEachFeature: myFunctionHolder.addPopups,
			    pointToLayer: myFunctionHolder.pointToCircle
          });
        mapObject.addLayer(stationLayer);  }                              

    if (subwayCheck == true) {
        subwayLayer = L.geoJSON(subway, {
            onEachFeature: myFunctionHolder2.addPopups,
            pointToLayer: myFunctionHolder2.pointToCircle
            });
        mapObject.addLayer(subwayLayer); } 
			
    if (bikeCheck == true) {
        pathLayer = L.geoJSON(geojsonFeature).addTo(mapObject); }
		
	  if (averageCheck == true) {
		  avgLayer = L.geoJSON(AVGCOMB, {
			  onEachFeature: myFunctionHolder3.addPopups,
			  pointToLayer: myFunctionHolder3.pointToCircle
		});
		mapObject.addLayer(avgLayer); }
}


   /*-------------------------
   ------  DRAW LINES  ------- 
   -------------------------*/

// Function which is called when a station is clicked (.addPopups) to draw the lines
function stationInteraction(ID) {
    
    clearMap(mapObject); // Clears any lines which are on the map
    document.getElementById("stationDiv").innerHTML = stationName + " selected";
    
    if  (lastStation != ID)  { // Checks to see if the user clicked on the same station or not
        updateData(stationID) // Calls function to draw chart
        for (i = 0; i < lines.length; i++) {
            if (lines[i]['From'] == ID && outFlowCheck) { // Checks to see if the checkbox is checked or not
                var x3 = lines[i]['json_geometry']['coordinates'][0][1];
                var y3 = lines[i]['json_geometry']['coordinates'][0][0];
                var x4 = lines[i]['json_geometry']['coordinates'][1][1];
                var y4 = lines[i]['json_geometry']['coordinates'][1][0];
                pointList= [[x3, y3], [x4, y4]];
                var thick = 1; // Resets thickness to 1
                if (lines[i]['Total'] > 17) {
                    thick = Math.round((Math.sqrt(lines[i]['Total']))*.5), LineSizeOpacity = .8
                }
                else { thick = .7, LineSizeOpacity = 1 }
                outPolyline = L.polyline(pointList,  {color: 'red', weight: thick, interactive: false, opacity: LineSizeOpacity}).addTo(mapObject);
            }
            if (lines[i]['To'] == ID && inFlowCheck) { // Checks to see if the checkbox is checked or not
                var x3 = lines[i]['json_geometry']['coordinates'][0][1];
                 var y3 = lines[i]['json_geometry']['coordinates'][0][0];
                var x4 = lines[i]['json_geometry']['coordinates'][1][1];
                var y4 = lines[i]['json_geometry']['coordinates'][1][0];
                pointList= [[x3, y3], [x4, y4]];
                thick = 1; // Resets thickness to 1
                if (lines[i]['Total'] > 17) {
                    thick = Math.round((Math.sqrt(lines[i]['Total']))*.5), LineSizeOpacity = .8
                }
                else { thick = .7, LineSizeOpacity = 1 }
                inPolyline = L.polyline(pointList, {color: 'green', weight: thick, interactive: false, opacity: LineSizeOpacity}).addTo(mapObject);
            }
        lastStation = ID // Used for 2nd line of this function
        }
    }
    else {
        lastStation = '';     
        document.getElementById("stationDiv").innerHTML = "No station selected";
        updateData(0); // Calls function to reset chart
        
    }
};


   /*-------------------------
   ------   ON LOAD   ------- 
   -------------------------*/

// Loads the map, chart, and stations when the page is loaded   
window.onload = function () {

    drawData(0) // Calls the function to draw the chart located in line.js
	
	// Loads the map	
    mapObject = L.map('mapDiv');

    var baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/oriongrey/cjaicrz589s1y2rlnxhynanxe/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib3Jpb25ncmV5IiwiYSI6ImNqODdqa3hsNDB6OTMycXVkZzd1ZGg1cHUifQ.2U0Sy2lC5_29p_3z-3l2aw', {
        maxZoom: 18,
        minZoom: 9,
        attribution: "&copy; | Data courtesy of <a href = 'https://www.divvybikes.com'>Divvy Bikes</a> | <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
    }).addTo(mapObject);

    // Creates the subway stations frmo subways.js
    subwayLayer = L.geoJSON(subway, {
        onEachFeature: myFunctionHolder2.addPopups,
        pointToLayer: myFunctionHolder2.pointToCircle
        });

    // Creates the stations from stations.js    
    stationLayer = L.geoJSON(Stations, {
        //onEachFeature: myFunctionHolder.clickMe,
        onEachFeature: myFunctionHolder.addPopups,
        pointToLayer: myFunctionHolder.pointToCircle
    });

    // Creates the bike pathes from Bike Routes.geojson
    pathLayer = L.geoJSON(geojsonFeature, {
        interactive: false
    });
  
    // Creates the stations by averages from averagetrip.json
  	avgLayer = L.geoJSON(AVGCOMB, {
        onEachFeature: myFunctionHolder3.addPopups,
        pointToLayer: myFunctionHolder3.pointToCircle
    });

    
    // Adds the stations to the map
    if (document.getElementById("stationCheck").checked == true) {
        mapObject.addLayer(stationLayer); 
        stationCheck = true;
       }; 
    
    // Adds the bike pathes to the map
    if (document.getElementById("bikeCheck").checked == true) {
        mapObject.addLayer(pathLayer); 
        bikeCheck = true;
       }; 
    
    // Adds the subway stations to the map
    if (document.getElementById("subwayCheck").checked == true) {
        mapObject.addLayer(subwayLayer); 
        subwayCheck = true;
       }; 
    
    // Adds the averages to the map
  	if (document.getElementById("averageCheck").checked == true) {
        mapObject.addLayer(avgLayer); 
        averageCheck = true;
       }; 

    // Sets the bounds of the map
    mapObject.fitBounds(stationLayer.getBounds());
};
