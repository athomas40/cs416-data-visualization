function drawScene1() {
    // remove Scene 4 dropdown if it exists
    d3.select("#controls")
        .selectAll("*")
        .remove();
    // clear previous chart
    d3.select("svg")
        .selectAll("*")
        .remove();
    d3.select("#title")
        .text("What Do New Yorkers Complain About the Most? (2025)");
    d3.select("#description")
        .text("An overview of the most common 311 complaints in NYC during 2025, revealing the issues that residents reported most frequently.")
    loadDashboardData()
        .then(function (data) {
            hideLoader();

            const complaintTotals = Array.from(
                d3.rollup(
                    data,
                    values => values.length,
                    d => d.complaint_type
                ),
                ([complaint_type, total]) => ({ complaint_type, total })
            )
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);

            const svg = d3.select("svg");
            const width = +svg.attr("width");
            const height = +svg.attr("height");

            const margin = {
                top: 100,
                right: 80,
                bottom: 50,
                left: 230
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
                    d3.max(complaintTotals, d => d.total)
                ])
                .range([0, chartWidth]);

            const formatLabel = value => {
                const trimmed = value.trim();
                return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
            };

            const y = d3.scaleBand()
                .domain(complaintTotals.map(d => d.complaint_type))
                .range([0, chartHeight])
                .padding(0.2);

            chart.selectAll("rect")
                .data(complaintTotals)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", d => y(d.complaint_type))
                .attr("width", d => x(d.total))
                .attr("height", y.bandwidth())
                .attr("fill", d =>
                    d === data[0]
                        ? "#F58426"
                        : "#006BB6"
                );
            chart.append("g")
                .call(d3.axisLeft(y).tickFormat(d => formatLabel(d)));

            chart.append("g")
                .attr(
                    "transform",
                    `translate(0,${chartHeight})`
                )
                .call(d3.axisBottom(x));

            // Labels
            chart.selectAll(".label")
                .data(complaintTotals)
                .enter()
                .append("text")
                .attr("x", d => x(d.total) + 5)
                .attr(
                    "y",
                    d => y(d.complaint_type) + y.bandwidth() / 2
                )
                .attr("dy", ".35em")
                .text(d => d.total.toLocaleString());

            // Annotation Box

            const topComplaint = complaintTotals[0];

            svg.append("rect")
                .attr("x", 220)
                .attr("y", 35)
                .attr("width", 460)
                .attr("height", 55)
                .attr("rx", 15)
                .attr("fill", "#F58426");

            svg.append("text")
                .attr("x", 450)
                .attr("y", 58)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .text("Key Finding");

            svg.append("text")
                .attr("x", 450)
                .attr("y", 78)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(
                    `${topComplaint.complaint_type} generated the most complaints`
                );
        })
            .catch(function (error) {
                hideLoader();
                d3.select("#title")
                    .text("Unable to load NYC 311 data.");

                console.log(error);
            });

}