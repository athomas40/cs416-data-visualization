function drawScene5() {
    d3.select("svg")
        .selectAll("*")
        .remove();

    d3.select("#title")
        .text("Explore NYC Complaints by Borough");
    d3.select("#description")
        .text("Interact with the data by selecting a borough and discovering how complaint patterns change across NYC.")

    loadDashboardData()
        .then(function (data) {
            hideLoader();

            const boroughOptions = boroughs;
            const complaintCountsByBorough = d3.rollup(
                data,
                values => values.length,
                d => d.borough,
                d => d.complaint_type
            );

            // Create dropdown
            const controls =
                d3.select("#controls");

            controls.selectAll("*")
                .remove();

            controls.append("label")
                .text("Select Borough: ");

            const dropdown =
                controls.append("select")
                    .attr("id", "boroughSelect");

            dropdown.selectAll("option")
                .data(boroughOptions)
                .enter()
                .append("option")
                .attr("value", d => d)
                .text(d => d);

            function updateChart(selectedBorough) {

                d3.select("svg")
                    .selectAll("g")
                    .remove();

                let filtered;

                if (selectedBorough === "All") {
                    filtered = Array.from(
                        d3.rollup(
                            data,
                            values => values.length,
                            d => d.complaint_type
                        ),
                        ([complaint_type, total]) => ({ complaint_type, total })
                    );
                }
                else {
                    const boroughComplaintMap = complaintCountsByBorough.get(selectedBorough) || new Map();
                    filtered = Array.from(
                        boroughComplaintMap,
                        ([complaint_type, total]) => ({ complaint_type, total })
                    );
                }

                filtered =
                    filtered
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 10);

                const totalComplaints =
                    d3.sum(
                        filtered,
                        d => d.total
                    );

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

                const chart =
                    svg.append("g")
                        .attr(
                            "transform",
                            `translate(${margin.left},${margin.top})`
                        );

                const x =
                    d3.scaleLinear()
                        .domain([
                            0,
                            d3.max(filtered, d => d.total)
                        ])
                        .range([
                            0,
                            chartWidth
                        ]);

                const formatLabel = value => {
                    const trimmed = value.trim();
                    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                };

                const y =
                    d3.scaleBand()
                        .domain(
                            filtered.map(
                                d => d.complaint_type
                            )
                        )
                        .range([
                            0,
                            chartHeight
                        ])
                        .padding(.2);

                chart.selectAll("rect")
                    .data(filtered)
                    .enter()
                    .append("rect")
                    .attr("x", 0)
                    .attr(
                        "y",
                        d => y(d.complaint_type)
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
                    )
                    // Tooltip
                    .on("mouseover", function (event, d) {

                        const percent =
                            ((d.total /
                                totalComplaints) * 100)
                                .toFixed(1);

                        const formatLabel = value => {
                            const trimmed = value.trim();
                            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
                        };

                        tooltip
                            .style("visibility", "visible")
                            .html(
                                `
                    <b>${formatLabel(d.complaint_type)}</b><br>
                    Complaints: ${d.total.toLocaleString()}<br>
                    Percent: ${percent}%
                    `
                            );

                    })

                    .on("mousemove", function (event) {
                        tooltip
                            .style(
                                "top",
                                (event.pageY + 10) + "px"
                            )
                            .style(
                                "left",
                                (event.pageX + 10) + "px"
                            );
                    })

                    .on("mouseout", function () {
                        tooltip
                            .style(
                                "visibility",
                                "hidden"
                            );
                    });


                chart.append("g")
                    .call(
                        d3.axisLeft(y).tickFormat(d => formatLabel(d))
                    );

                chart.append("g")
                    .attr(
                        "transform",
                        `translate(0,${chartHeight})`
                    )
                    .call(
                        d3.axisBottom(x)
                    );

                // Annotation box
                svg.append("rect")
                    .attr("x", 250)
                    .attr("y", 45)
                    .attr("width", 400)
                    .attr("height", 35)
                    .attr("rx", 15)
                    .attr("fill", "#F58426");

                svg.append("text")
                    .attr("x", 450)
                    .attr("y", 68)
                    .attr("text-anchor", "middle")
                    .style("fill", "white")
                    .style("font-weight", "bold")
                    .text(
                        selectedBorough === "All"
                            ?
                            "Explore complaints across all NYC."
                            :
                            "Explore complaint priorities in "
                            + selectedBorough
                    );

            }

            // Tooltip
            const tooltip =
                d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("background", "white")
                    .style("border", "1px solid gray")
                    .style("padding", "8px")
                    .style("visibility", "hidden");

            dropdown.on("change", function () {
                updateChart(this.value);
            });

            updateChart("All");

        })
        .catch(function (error) {
            hideLoader();
            d3.select("#title")
                .text("Unable to load NYC 311 data.");
            console.log(error);
        });

}