function drawScene4(){
   d3.select("#controls")
        .selectAll("*")
        .remove();
   d3.select("svg")
        .selectAll("*")
        .remove();
   d3.select("#title")
        .text("The Biggest Problems Are Not Always the Hardest to Fix");
   const url =
    "https://data.cityofnewyork.us/resource/erm2-nwe9.json" +
    "?$select=complaint_type,created_date,closed_date" +
    "&$where=created_date between '2025-01-01T00:00:00' and '2025-12-31T23:59:59'" +
    "&$limit=50000";
   d3.json(url)
    .then(function(data){
       // calculate resolution time
       data = data.filter(d =>
            d.closed_date &&
            d.created_date
        );
       data.forEach(d=>{
           d.created_date =
                new Date(d.created_date);
           d.closed_date =
                new Date(d.closed_date);
           d.resolution_days =
                (d.closed_date - d.created_date)
                /
                (1000*60*60*24);
       });

       // Aggregate complaints
       const summary =
        Array.from(
            d3.rollups(
                data,
               values => ({
                    count: values.length,
                   avgResolution:
                    d3.mean(
                        values,
                        d=>d.resolution_days
                    )
                }),
               d=>d.complaint_type
            ),
           ([complaint_type,values])=>({
               complaint_type,
               count:values.count,
               avgResolution:
                values.avgResolution
           })
       );
       // keep top complaints
       const filtered =
            summary
            .sort((a,b)=>b.count-a.count)
            .slice(0,20);

       const svg=d3.select("svg");
       const width=+svg.attr("width");
        const height=+svg.attr("height");

       const margin={
            top:100,
            right:80,
            bottom:80,
            left:90
        };
       const chartWidth =
            width-margin.left-margin.right;
       const chartHeight =
            height-margin.top-margin.bottom;

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
                d3.max(filtered,d=>d.avgResolution)
            ])
            .range([
                0,
                chartWidth
            ]);

       const y =
            d3.scaleLinear()
            .domain([
                0,
                d3.max(filtered,d=>d.count)
            ])
            .range([
                chartHeight,
                0
            ]);

       // circles
       chart.selectAll("circle")
        .data(filtered)
        .enter()
        .append("circle")
        .attr(
            "cx",
            d=>x(d.avgResolution)
        )
        .attr(
            "cy",
            d=>y(d.count)
        )
        .attr(
            "r",
            8
        )
        .attr(
            "fill",
            "#006BB6"
        );

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

       // axis labels
       svg.append("text")
        .attr(
            "x",
            width/2
        )
        .attr(
            "y",
            height-20
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Average Resolution Time (Days)"
        );
       svg.append("text")
        .attr(
            "transform",
            "rotate(-90)"
        )
        .attr(
            "x",
            -height/2
        )
        .attr(
            "y",
            25
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Number of Complaints"
        );
       // Annotation
       svg.append("rect")
        .attr("x",150)
        .attr("y",20)
        .attr("width",600)
        .attr("height",58)
        .attr("rx",15)
        .attr(
            "fill",
            "#F58426"
        );
       svg.append("text")
        .attr("x",450)
        .attr("y",52)
        .attr(
            "text-anchor",
            "middle"
        )
        .style("fill", "white")
        .style(
            "font-weight",
            "bold"
        )
        .style("font-size", "13px")
        .text(
        "Some complaints take much longer to resolve than others."
        );
   });
}