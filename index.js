let currentScene = 1;

let selectedBorough = "All";

const NYC311_DATA_URL =
    "https://data.cityofnewyork.us/resource/erm2-nwe9.json" +
    "?$select=borough,complaint_type,created_date,closed_date" +
    "&$where=created_date between '2025-01-01T00:00:00' and '2025-12-31T23:59:59'" +
    "&$limit=50000";

let dashboardData = null;
let dashboardDataPromise = null;

function showLoader() {
    d3.select("#loader")
        .style("display", "flex");
}

function hideLoader() {
    d3.select("#loader")
        .style("display", "none");
}

function loadDashboardData() {
    if (dashboardData) {
        return Promise.resolve(dashboardData);
    }

    if (dashboardDataPromise) {
        return dashboardDataPromise;
    }

    showLoader();

    dashboardDataPromise = d3.json(NYC311_DATA_URL)
        .then(function (data) {
            dashboardData = data
                .filter(d => d.complaint_type)
                .map(d => ({
                    ...d,
                    borough: d.borough || "Unknown",
                    complaint_type: d.complaint_type || "",
                    created_date: d.created_date ? new Date(d.created_date) : null,
                    closed_date: d.closed_date ? new Date(d.closed_date) : null
                }));
            return dashboardData;
        })
        .catch(function (error) {
            dashboardDataPromise = null;
            hideLoader();
            throw error;
        });

    return dashboardDataPromise;
}

function updateScene() {
    if (currentScene === 1) {
        drawScene1();
    }
    else if (currentScene === 2) {
        drawScene2();
    }
    else if (currentScene === 3) {
        drawScene3();
    }
    else if (currentScene === 4) {
        drawScene4();
    }
    else if (currentScene === 5) {
        drawScene5();
    }
}

function setActiveButton(button) {
    d3.selectAll("#buttonsContainer button")
        .classed("active", false);
    d3.select(button)
        .classed("active", true);
}

d3.select("#scene1Button")
    .on("click", function () {
        currentScene = 1;
        setActiveButton(this);
        updateScene();
    });

d3.select("#scene2Button")
    .on("click", function () {
        currentScene = 2;
        setActiveButton(this);
        updateScene();
    });

d3.select("#scene3Button")
    .on("click", function () {
        currentScene = 3;
        setActiveButton(this);
        updateScene();
    });

d3.select("#scene4Button")
    .on("click", function () {
        currentScene = 4;
        setActiveButton(this);
        updateScene();
    });

d3.select("#scene5Button")
    .on("click", function () {
        currentScene = 5;
        setActiveButton(this);
        updateScene();
    });

setActiveButton("#scene1Button");
updateScene();