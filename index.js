let currentScene = 1;

let selectedBorough = selectedComplaint;

function updateScene(){

    d3.selectAll("button")
        .classed("active",false);
    if(currentScene===1){
        d3.select("#scene1Button")
        .classed("active",true);
        drawScene1();
    }

    else if(currentScene===2){
        d3.select("#scene2Button")
        .classed("active",true);
        drawScene2();
    }

    else if(currentScene===3){
        d3.select("#scene3Button")
        .classed("active",true);
        drawScene3();
    }

    else if(currentScene===4){
        d3.select("#scene4Button")
        .classed("active",true);
        drawScene4();
    }

    else if(currentScene===5){
        d3.select("#scene5Button")
        .classed("active",true);
        drawScene5();
    }
}

d3.select("#scene1Button")
.on("click",function(){
    currentScene=1;
    updateScene();
});

d3.select("#scene2Button")
.on("click",function(){
    currentScene=2;
    updateScene();
});

d3.select("#scene3Button")
.on("click",function(){
    currentScene=3;
    updateScene();
});

d3.select("#scene4Button")
.on("click",function(){
    currentScene=4;
    updateScene();
});

d3.select("#scene5Button")
.on("click",function(){
    currentScene=5;
    updateScene();
});

updateScene();