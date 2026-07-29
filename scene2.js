function drawScene2() {
    // Remove Scene 4 dropdown
    d3.select("#controls")
        .selectAll("*")
        .remove();
    // Clear previous chart
    d3.select("svg")
        .selectAll("*")
        .remove();

    d3.select("#title")
        .text("Complaint Patterns Differ Across NYC Boroughs (2025)");
    d3.select("#description")
        .text("Complaint trends vary across the five boroughs, showing how location influences the issues residents report.")

    loadDashboardData()
        .then(function (data) {
            hideLoader();
            const complaintTotals = d3.rollup(
                data,
                values => values.length,
                d => d.complaint_type
            );

            const complaints = Array.from(complaintTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([complaintType]) => complaintType);

            const formatComplaintLabel = complaintType => {
                const trimmed = complaintType.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            };

            const boroughOptions = boroughs.filter(b => b !== "All");

            const boroughComplaintTotals = d3.rollup(
                data,
                values => values.length,
                d => d.borough,
                d => d.complaint_type
            );

            const formattedData = boroughOptions.map(borough => {
                let obj = {
                    borough: borough
                };
                complaints.forEach(type => {
                    const boroughData = boroughComplaintTotals.get(borough);
                    obj[type] = boroughData && boroughData.get(type)
                        ? boroughData.get(type)
                        : 0;
                });
                return obj;
            });

            const svg = d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const margin = {
                top: 120,
                right: 180,
                bottom: 70,
                left: 100
            };

            const chartWidth =
                width - margin.left - margin.right;
            const chartHeight =
                height - margin.top - margin.bottom;

            const chart =
                svg.append("g")
                    .attr(
                        "transform",
                        `translate(${margin.left},${margin.top})`
                    );

            // Stack data

            const stack =
                d3.stack()
                    .keys(complaints);

            const stackedData =
                stack(formattedData);

            // Scales

            const x =
                d3.scaleBand()
                    .domain(boroughOptions)
                    .range([0, chartWidth])
                    .padding(0.25);

            const y =
                d3.scaleLinear()
                    .domain([
                        0,
                        d3.max(
                            formattedData,
                            d =>
                                d3.sum(
                                    complaints,
                                    c => d[c]
                                )
                        )
                    ])
                    .range([chartHeight, 0]);

            // Colors
            const color =
                d3.scaleOrdinal()
                    .domain(complaints)
                    .range([
                        "#006BB6",
                        "#ff8c00",
                        "#c0c0c0",
                        "#111"
                    ]);

            // Draw stacked bars

            chart.selectAll("g.layer")
                .data(stackedData)
                .enter()
                .append("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr(
                    "x",
                    d => x(d.data.borough)
                )
                .attr(
                    "y",
                    d => y(d[1])
                )
                .attr(
                    "height",
                    d => y(d[0]) - y(d[1])
                )
                .attr(
                    "width",
                    x.bandwidth()
                );

            // Axes

            chart.append("g")
                .attr(
                    "transform",
                    `translate(0,${chartHeight})`
                )
                .call(
                    d3.axisBottom(x)
                );

            chart.append("g")
                .call(
                    d3.axisLeft(y)
                );

            // Legend

            const legend =
                svg.append("g")
                    .attr(
                        "transform",
                        `translate(700,140)`
                    );

            complaints.forEach((type, i) => {
                const row =
                    legend.append("g")
                        .attr(
                            "transform",
                            `translate(0,${i * 30})`
                        );

                row.append("rect")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr(
                        "fill",
                        color(type)
                    );

                row.append("text")
                    .attr(
                        "x",
                        25
                    )
                    .attr(
                        "y",
                        12
                    )
                    .style(
                        "font-size",
                        "12px"
                    )
                    .text(formatComplaintLabel(type));
            });

            const boroughTotals =
                formattedData.map(d => ({
                    borough: d.borough,
                    total: d3.sum(
                        complaints,
                        c => d[c]
                    )
                }));

            const highestBorough =
                boroughTotals.sort(
                    (a, b) => b.total - a.total
                )[0];

            // Annotation Box
            svg.append("rect")
                .attr("x", 220)
                .attr("y", 35)
                .attr("width", 460)
                .attr("height", 55)
                .attr("rx", 15)
                .attr("fill", "#F58426");

            // Annotation title
            svg.append("text")
                .attr("x", 450)
                .attr("y", 58)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .text("Key Finding");

            // Annotation message
            svg.append("text")
                .attr("x", 450)
                .attr("y", 78)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(
                    `${highestBorough.borough} has the highest number of complaints among NYC boroughs.`
                );

        })
        .catch(function (error) {
            hideLoader();
            d3.select("#title")
                .text("Unable to load NYC 311 data.");
            console.log(error);
        });
}