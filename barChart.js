   /*-------------------------
   ------ WEATHER DATA  ------ 
   -------------------------*/


// Function to display instructions when bar chart is not highlighted
function triggerWeatherReset() {
    document.getElementById("weatherDiv").innerHTML = "Select a day from the graph above " +
    "to see the weather for that day"
}

// Function for getting the weather data, called by renderMyChart() on mouseover, uses Totals_and_Weather.json
function triggerWeatherData(date) {
    for (i = 0; i < weather.length; i++) {
        var tempDate = weather[i]['Date'] 
        if (i < 9) { // Preparees the data to match the requested date
            tempDate = tempDate.slice(7) 
        }
        else {
            tempDate = tempDate.slice(6)
        }
        if (date == tempDate) {
            document.getElementById("weatherDiv").innerHTML =
            ("The weather for March " + tempDate + " was " + weather[i]['Temp'] + " degrees" +
            ", had " + weather[i]['Wind Speed'] + "mph winds, and had " + weather[i]['Weather_Effects']);
        }
    }
};

   /*-------------------------
   ------  BAR CHART   ------ 
   -------------------------*/

   
// Function, called by Main.js, to create the chart. Uses data.txt
function DrawChart(ID) {

    d3.tsv("data.txt", type, function(error, data) {
        x.domain(data.map(function(d) { return d.Date; }));
        y.domain([0, d3.max(data, function(d) { return d[ID]; })]);

        chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

        chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)

        chart.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Date); })
        .attr("y", function(d) { return y(d[ID]); })
        .attr("height", function(d) { return height - y(d[ID]); })
        .attr("width", x.rangeBand());
    });

    function type(d) {
        d[ID] = +d[ID]; // coerce to number
        return d;
    } 
};

function DrawChart2(ID) {

    d3.tsv("data.txt", type, function(error, data) {
        y.domain([0, d3.max(data, function(d) { return d[ID]; })]);

    // Remove previous y-axis:
        chart.select(".y.axis").remove(); // << this line added
        // Existing code to draw y-axis:
        chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Totals");

        var bar = chart.selectAll(".bar")
        .data(data, function(d) { return d.Date; });

        bar.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.Date); })
        .attr("y", function(d) { return y(d[ID]); })
        .attr("height", function(d) { return height - y(d[ID]); })
        .attr("width", x.rangeBand());
        // removed data:
        bar.exit().remove();

        bar.transition().duration(750)  // <<< added this
        .attr("y", function(d) { return y(d[ID]); })
        .attr("height", function(d) { return height - y(d[ID]); }); 
       
        bar
        .on("mouseover", function (d) {
            triggerWeatherData(d.Date);
        })
        .on("mouseout", function (d) {
            triggerWeatherReset(d.Date);
        });
    });

    function type(d) {
        d[ID] = +d[ID]; // coerce to number
     return d;
    } 
};
