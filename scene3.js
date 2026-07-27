function drawScene3() {
    showLoader();
    // Remove Scene 4 dropdown if it exists
    d3.select("#controls")
        .selectAll("*")
        .remove();
    d3.select("svg")
        .selectAll("*")
        .remove();
    d3.select("#title")
        .text("Every Borough Has Different Priorities");
    d3.select("#description")
        .text("Each borough has unique concerns, highlighting the complaint category that residents report most often in their community.")

    const url =
        "https://data.cityofnewyork.us/resource/erm2-nwe9.json" +
        "?$select=borough,complaint_type,count(*) as total" +
        "&$where=created_date between '2025-01-01T00:00:00' and '2025-12-31T23:59:59'" +
        "&$group=borough,complaint_type";
    d3.json(url)
        .then(function (data) {
            hideLoader();
            data.forEach(d => {
                d.total = +d.total;
            });
            // Remove records without borough
            data = data.filter(d =>
                d.borough &&
                d.complaint_type
            );
            // Find highest complaint for each borough
            const boroughOptions = boroughs.filter(b => b !== "All");
            const topComplaints =
                boroughOptions.map(borough => {
                    const boroughData =
                        data.filter(d =>
                            d.borough === borough
                        );
                    const highest =
                        boroughData.sort(
                            (a, b) => b.total - a.total
                        )[0];
                    return {
                        borough: borough,
                        complaint: highest.complaint_type,
                        total: highest.total
                    };
                });
            const complaintFrequency =
                d3.rollup(
                    topComplaints,
                    values => values.length,
                    d => d.complaint
                );
            const majorityComplaint =
                Array.from(complaintFrequency)
                    .sort((a, b) => b[1] - a[1])[0][0];
            const differentBoroughs =
                topComplaints.filter(d =>
                    d.complaint !== majorityComplaint
                );
            const svg = d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const margin = {
                top: 100,
                right: 100,
                bottom: 50,
                left: 250
            };
            const chartWidth =
                width - margin.left - margin.right;
            const chartHeight =
                height - margin.top - margin.bottom;
            const chart = svg.append("g")
                .attr(
                    "transform",
                    `translate(${margin.left},${margin.top})`
                );
            const x = d3.scaleLinear()
                .domain([
                    0,
                    d3.max(topComplaints, d => d.total)
                ])
                .range([
                    0,
                    chartWidth
                ]);
            const y = d3.scaleBand()
                .domain(
                    topComplaints.map(
                        d => d.borough
                    )
                )
                .range([
                    0,
                    chartHeight
                ])
                .padding(0.3);
            chart.selectAll("rect")
                .data(topComplaints)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr(
                    "y",
                    d => y(d.borough)
                )
                .attr(
                    "width",
                    d => x(d.total)
                )
                .attr(
                    "height",
                    y.bandwidth()
                )
                .attr(
                    "fill",
                    "#006BB6"
                );
            chart.append("g")
                .call(
                    d3.axisLeft(y)
                );
            chart.append("g")
                .attr(
                    "transform",
                    `translate(0,${chartHeight})`
                )
                .call(
                    d3.axisBottom(x)
                );
            // Complaint labels
            const formatLabel = value => {
                const trimmed = value.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            };
            chart.selectAll(".complaint")
                .data(topComplaints)
                .enter()
                .append("text")
                .attr(
                    "x",
                    d => x(d.total) + 5
                )
                .attr(
                    "y",
                    d => y(d.borough) + y.bandwidth() / 2
                )
                .attr(
                    "dy",
                    ".35em"
                )
                .text(
                    d => formatLabel(d.complaint)
                );

            // Annotation Box
            svg.append("rect")
                .attr("x", 120)
                .attr("y", 20)
                .attr("width", 660)
                .attr("height", 70)
                .attr("rx", 15)
                .attr("fill", "#F58426");

            // Annotation title
            svg.append("text")
                .attr("x", 450)
                .attr("y", 48)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .text("Key Finding");

            // Annotation message
            svg.append("text")
                .attr("x", 450)
                .attr("y", 68)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(
                    `${differentBoroughs.map(d =>
                        d.borough
                    ).join(" and ")} have different top complaints than most boroughs.`
                );
        })
        .catch(function (error) {
            hideLoader();
            d3.select("#title")
                .text("Unable to load NYC 311 data.");
            console.log(error);
        });
}