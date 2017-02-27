var gl;

var canvas;

var vertex_shader_area, fragment_shader_area;

var rX = 23;
var rY = -30;
var l = 1;
var a = 45;
var d = 3;

// GLSL programs
var program;
var object = 0;
var projection = mat4();
var filled = 0;

function initialize() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-default", "fragment-default");
    document.getElementById("vertex-custom").innerHTML = document.getElementById("vertex-default").innerHTML;
    document.getElementById("fragment-custom").innerHTML = document.getElementById("fragment-default").innerHTML;

    // remaining initializations
    cubeInit(gl);
    cylinderInit(gl);
    sphereInit(gl);
    updateShaderAreas();
}

function setupObl(l, a) {
    return mat4(1, 0, -l * Math.cos(a), 0,
              0, 1, -l * Math.sin(a), 0,
              0, 0, 1, 0,
              0, 0, 0, 1);
}

function setupPer(d) {
    return mat4(1, 0, 0, 0,
              0, 1, 0, 0,
              0, 0, 1, 0,
              0, 0, 1/d, 1);
}

function updateShaderAreas() {
    vertex_shader_area.value = document.getElementById("vertex-custom").text;
    fragment_shader_area.value = document.getElementById("fragment-custom").text;
}

function setupGUI() {
    vertex_shader_area = document.getElementById("vertex-shader-area");
    vertex_shader_area.style.width = "512px";
    vertex_shader_area.resize = "none";

    fragment_shader_area = document.getElementById("fragment-shader-area");
    fragment_shader_area.style.width = "512px";
    fragment_shader_area.resize = "none";

    vertex_shader_area.onchange = function () {
        document.getElementById("vertex-custom").innerHTML = document.getElementById("vertex-shader-area").value;
        program = initShaders(gl, "vertex-custom", "fragment-custom");
    }

    fragment_shader_area.onchange = function () {
        document.getElementById("fragment-custom").innerHTML = document.getElementById("fragment-shader-area").value;
        program = initShaders(gl, "vertex-custom", "fragment-custom");
    }

    document.getElementById("rotateX").onchange = function() {
        rX = document.getElementById("rotateX").value;
        document.getElementById("projection").value = "Axonometrica";
        projection = mult(rotateX(rX), rotateY(rY));
    };

    document.getElementById("rotateY").onchange = function() {
        rY = document.getElementById("rotateY").value;
        document.getElementById("projection").value = "Axonometrica";
        projection = mult(rotateX(rX), rotateY(rY));
    };

    document.getElementById("l").onchange = function() {
        l = document.getElementById("l").value;
        document.getElementById("projection").value = "Obliqua";
        projection = setupObl(l, a);
    };

    document.getElementById("a").onchange = function() {
        a = document.getElementById("a").value;
        document.getElementById("projection").value = "Obliqua";
        projection = setupObl(l, a);
    };

    document.getElementById("shading").onchange = function() {
        switch(this.value) {
            case "Gouraud":
                break;
            case "Phong":
                break;
        }
        updateShaderAreas();
    }

    document.getElementById("object").onchange = function() {
        switch(this.value) {
            case "Cubo":
                object = 0;
                break;
            case "Cilindro":
                object = 1;
                break;
            case "Esfera":
                object = 2;
                break;
        }
    }

    document.getElementById("projection").onchange = function() {
        switch(this.value) {
            case "AP":
                projection = mat4(1);
                break;
            case "PLANTA":
                projection = mult(mat4(1), rotateX(90));
                break;
            case "Axonometrica":
                projection = mult(rotateX(rX), rotateY(rY));
                break;
            case "Obliqua":
                projection = setupObl(l, a);
                break;
            case "Perspetiva":
                projection = setupPer(d);
                break;
        }
    }

    document.getElementById("mode").onchange = function() {
        switch(this.value) {
            case "WireFrame":
                filled = 0;
                break;
            case "Filled":
                filled = 1;
                break;
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // Send the current projection matrix
    var mProj = gl.getUniformLocation(program, "mProj");
    gl.uniformMatrix4fv(mProj, false, flatten(projection));

    switch(object) {
        case 0:
            if(filled == 0) cubeDrawWireFrame(gl, program);
            else cubeDrawFilled(gl, program);
            break;
        case 1:
            if(filled == 0) cylinderDrawWireFrame(gl, program);
            else cylinderDrawFilled(gl, program);
            break;
        case 2:
            if(filled == 0) sphereDrawWireFrame(gl, program);
            else sphereDrawFilled(gl, program);
            break;
    }

    requestAnimFrame(render);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    setupGUI();
    initialize();

    render();
}