  /*-------------------------
   ------  VARIABLES  ------ 
   -------------------------*/

   var lastStation2; // Used to redraw the chart when you click off

// Function for getting the weather data, called by renderMyChart() on mouseover, uses Totals_and_Weather.json
function triggerWeatherData(date) {
	datestr = date.toString()
	for (i = 0; i < weather.length; i++) {
		var tempDate = weather[i]['Date']
		tempDate = tempDate.slice(6)

		if (datestr.slice(8, 10) == tempDate) {
			document.getElementById("weatherDiv").innerHTML =
				("The weather for March " + tempDate + " was " + weather[i]['Temp'] + " degrees" +
					", had " + weather[i]['Wind Speed'] + "mph winds, and had " + weather[i]['Weather_Effects']);
		}
	}
}

// Function for resetting the weather data
function triggerWeatherReset() {
	document.getElementById("weatherDiv").innerHTML = "Select a day from the graph above " +
		"to see the weather for that day"
}



// Draws the inital chart
function drawData(ID) {

	// Ifelse used for diplayin the total
	if (ID == 0) {
		FROM = 0; TO = 0;
	}
	else {
		FROM = "FROM" + ID;
		TO = "TO" + ID;
	}

	// Get the data
	d3.tsv("data/fromandto.txt", function (error, data) {
		data.forEach(function (d) {
			d.Date = parseDate(d.Date);
			d[FROM] = +d[FROM];
			d[TO] = +d[TO];
		});

		
		// Scale the range of the data
		x.domain(d3.extent(data, function (d) { return d.Date; }));
		y.domain([0, d3.max(data, function (d) { return Math.max(d[FROM], d[TO]); })]);
		
		svg.append("path")		// Add the valueline path.
			.attr("class", "line FROMline")
			.style("stroke", "green")
			.style("stroke-width", 2)
			.attr("d", valueline(data));

		svg.append("path")		// Add the valueline2 path.
			.attr("class", "line TOline")
			.style("stroke", "red")
			.style("stroke-width", 2)
			.attr("d", valueline2(data));

		svg.append("g")			// Add the X Axis
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function (d) {
				return "rotate(-65)"
			});

		svg.append("g")			// Add the Y Axis
			.attr("class", "y axis")
			.call(yAxis);

		/* These two sections can put a label on the end of the line 
		
		svg.append("text")
			.attr("transform", "translate(" + (width+3) + "," + y(data[0][TO]) + ")")
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.style("fill", "red")
			.text("In-flow");
	
		svg.append("text")
			.attr("transform", "translate(" + (width+3) + "," + y(data[0][FROM]) + ")")
			.attr("dy", ".35em")
			.attr("text-anchor", "start")
			.style("fill", "steelblue")
			.text("Out-flow");	*/

		// From this points is used for the displaying the info when you mouse over the line
		var mouseG = svg.append("g")
			.attr("class", "mouse-over-effects");

		mouseG.append("path") // this is the black vertical line to follow mouse
			.attr("class", "mouse-line")
			.style("stroke", "black")
			.style("stroke-width", "1px")
			.style("opacity", "0");

		var lines = document.getElementsByClassName('line');

		var mousePerLine = mouseG.selectAll('.mouse-per-line')
			.data(data)
			.enter()
			.append("g")
			.attr("class", "mouse-per-line");

		mousePerLine.append("circle")
			.attr("r", 3)
			.style("stroke", "black")
			.style("fill", "none")
			.style("stroke-width", "1px")
			.style("opacity", "0");

		mousePerLine.append("text")
			.attr("transform", "translate(10,3)");

		mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
			.attr('width', width) // can't catch mouse events on a g element
			.attr('height', height)
			.attr('fill', 'none')
			.attr('pointer-events', 'all')
			.on('mouseout', function () { // on mouse out hide line, circles and text
				d3.select(".mouse-line")
					.style("opacity", "0");
				d3.selectAll(".mouse-per-line circle")
					.style("opacity", "0");
				d3.selectAll(".mouse-per-line text")
					.style("opacity", "0");
				triggerWeatherReset();
			})
			.on('mouseover', function () { // on mouse in show line, circles and text
				d3.select(".mouse-line")
					.style("opacity", "1")
					.style("stroke-width", .5);
				d3.selectAll(".mouse-per-line circle")
					.style("opacity", "1");
				d3.selectAll(".mouse-per-line text")
					.style("opacity", "1");
			})
			.on('mousemove', function () { // mouse moving over canvas
				var mouse = d3.mouse(this);
				d3.select(".mouse-line")
					.attr("d", function () {
						var d = "M" + mouse[0] + "," + height;
						d += " " + mouse[0] + "," + 0;
						return d;
					});

				d3.selectAll(".mouse-per-line")
					.attr("transform", function (d, i) {

						var xDate = x.invert(mouse[0]),
							bisect = d3.bisector(function (d) { return d.Date; }).right;
						idx = bisect(d[TO], d[FROM], xDate);
						triggerWeatherData(xDate);

						var beginning = 0,
							end = lines[i].getTotalLength(),
							target = null;

						while (true) {
							target = Math.floor((beginning + end) / 2);
							pos = lines[i].getPointAtLength(target);
							if ((target === end || target === beginning) && pos.x !== mouse[0]) {
								break;
							}
							if (pos.x > mouse[0]) end = target;
							else if (pos.x < mouse[0]) beginning = target;
							else break; //position found
						}

						d3.select(this).select('text')
							.text(y.invert(pos.y).toFixed(2));

						return "translate(" + mouse[0] + "," + pos.y + ")";
					});
			});

	});
}


// ** Update line graph
function updateData(ID) {

	if (ID == 0) {
		FROM = 0; TO = 0;
	}
	else {
		FROM = "FROM" + ID;
		TO = "TO" + ID;
	}

	// Get the data again
	d3.tsv("fromandto.txt", function (error, data) {
		data.forEach(function (d) {
			d.Date = parseDate(d.Date);
			d[FROM] = +d[FROM];
			d[TO] = +d[TO];
		});

		// Scale the range of the data
		x.domain(d3.extent(data, function (d) { return d.Date; }));
		y.domain([0, d3.max(data, function (d) { return Math.max(d[FROM], d[TO]); })]);

		// Select the section we want to apply our changes to
		var svg = d3.select("body").transition();

		// Make the changes
		svg.select(".TOline")   // change the line
			.duration(750)
			.attr("d", valueline(data));
		svg.select(".FROMline")   // change the line
			.duration(750)
			.attr("d", valueline2(data));
		svg.select(".x.axis") // change the x axis
			.duration(750)
		//.call(xAxis)
		svg.select(".y.axis") // change the y axis
			.duration(750)
			.call(yAxis);
	});
}
