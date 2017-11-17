  /*-------------------------
   ------  VARIABLES  ------ 
   -------------------------*/

var lastStation;
var myFunctionHolder = {};
var myFunctionHolder2 = {};


   /*-------------------------
   ------CREATE POPUPS------ 
   -------------------------*/

// Function to create the popups
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
        stationInteraction(stationID)
        DrawChart2(stationID); // Calls the function to adjust the graph
        document.getElementById("stationDiv").innerHTML = stationName + " selected";
    })
}

myFunctionHolder2.addPopups = function (feature, layer) {
    layer.bindPopup("<b>Station name:</b> " + feature.properties.Name);
     layer.on('mouseover', function (e) {
        this.openPopup();
    });
    layer.on('mouseout', function (e) {
        this.closePopup();
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

myFunctionHolder2.pointToCircle = function (feature, latlng) {
    var geojsonMarkerOptions = {
        radius: 5,
        fillColor: "red",
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
};

   /*-------------------------
   ------   HEAT MAP   ------- 
   -------------------------*/
  // TO DO ---- add a case so if ONE box is unchecked it won't remove it 

var heatmapCfg = ({
    "radius": .005,
    "maxOpacity": .5, 
    "scaleRadius": true, 
    "useLocalExtrema": false,
    latField: 'lat',
    lngField: 'lng',
    valueField: 'value'});

var heatmapLayer = new HeatmapOverlay(heatmapCfg);

function heatMapSwap(stationID) {
    if (document.getElementById("heatmapCheck").checked) {
        if (document.getElementById("heatMapFromTog").checked) {
          heatmapLayer.setData(toTotals);
          mapObject.addLayer(heatmapLayer);
        } else if (document.getElementById("heatMapToTog").checked) {
            heatmapLayer.setData(fromTotals);
            mapObject.addLayer(heatmapLayer);}
    } else {
      mapObject.removeLayer(heatmapLayer);
      heatmapCheck = false;}
}


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
        onEachFeature: myFunctionHolder.clickMe,
        onEachFeature: myFunctionHolder.addPopups,
        pointToLayer: myFunctionHolder.pointToCircle
        });
        mapObject.addLayer(stationLayer);  }                              

    if (subwayCheck == true) {
        subwayLayer = L.geoJSON(subway, {
             onEachFeature: myFunctionHolder2.addPopups,
            pointToLayer: myFunctionHolder2.pointToCircle
            });
            mapObject.addLayer(subwayLayer);
    
        }  
}


   /*-------------------------
   ------  DRAW LINES  ------- 
   -------------------------*/
// TO DO ---- fix stationDiv reset call in ELSE    

// Function which is called when a station is clicked (.addPopups) to draw the lines
function stationInteraction(ID) {
    
    clearMap(mapObject); // Clears any lines which are on the map
    if  (lastStation != ID)  { // Checks to see if the user clicked on the same station or not
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
        document.getElementById("stationDiv").innerHTML = " selected";
    }
};



   /*-------------------------
   ------ INSTRUCTIONS ------- 
   -------------------------*/

// Creates a pop up to display the instructions
function instructions() {
    alert("This web app shows interaction between DIVVY's bike stations throughout Chicago.\n \n" +
         "To use this app: \nClick on a station in the map. Two colored lines will appear, green and red. These lines represent the inflow and outflow of bikes from that station during March 2017."
        + "The thicker the line, the more interaction there was between the two stations. Click on the same station again to remove the lines. \nAfter you click on a station the graph will show the actual numbers of in and out for that station." +
        " Highlighting a day in the graph will also display weather for that day. \n\nOther options for this map are below the graph, you can turn on or off the stations or in/out flow. " +
        "Additionally, you can turn on a heat map to show which stations had the highest interaction overall for either bikes coming in or going out. ");            
    }     


   /*-------------------------
   ------   ON LOAD   ------- 
   -------------------------*/

// Loads the map, chart, and stations when the page is loaded   
window.onload = function () {

    DrawChart("0") // Calls the function to draw the chart located in barChart.js
    DrawChart2("0") // Calls the second function to appply the lables to the graph
    mapObject = L.map('mapDiv');

    var baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/sinba/ciperkjzk001jb6mdcb41o922/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2luYmEiLCJhIjoiY2loMWF6czQxMHdwcnZvbTNvMjVhaWV0MyJ9.zu-djzdfyr3C_Uj2F7noqg', {
        maxZoom: 18,
        minZoom: 9,
        attribution: "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
    }).addTo(mapObject);


    // Creates the stations later from stations.js    
    stationLayer = L.geoJSON(Stations, {
        //onEachFeature: myFunctionHolder.clickMe,
        onEachFeature: myFunctionHolder.addPopups,
        pointToLayer: myFunctionHolder.pointToCircle
    });
  
      // Adds the stations to the map
    if (document.getElementById("stationCheck").checked == true) {
        mapObject.addLayer(stationLayer); 
        stationCheck = true;
       }; 
 
    subwayLayer = L.geoJSON(subway, {
        onEachFeature: myFunctionHolder2.addPopups,
        pointToLayer: myFunctionHolder2.pointToCircle
        });

    if (document.getElementById("subwayCheck").checked == true) {
        mapObject.addLayer(subwayLayer); 
        subwayCheck = true;
    };
    
    // Sets the bounds of the map
    mapObject.fitBounds(stationLayer.getBounds());

    // Calls the function to display the instructions   
    instructions();
};
