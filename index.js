let currentScene = 1;

let selectedBorough = "All";

function showLoader() {
    d3.select("#loader")
        .style("display", "block");
}

function hideLoader() {
    d3.select("#loader")
        .style("display", "none");
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