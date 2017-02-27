var gl, opt;
var vertices = [
		vec2(-0.5,-0.5),
		vec2(0,0.5),
		vec2(0.5,-0.5)
	];
var aux = [];
var p1, p2, p3, x1, x2, y1, y2;
var program;
var theta = 0;
var newAngle = 0;

window.onload = function init() {
    opt = 1;
	var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

	// Configure WebGL
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Load the data into the GPU
	var bufferId = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate our shader variables with our data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

    // Interpreting the mouse movements
    var mouseIsDown = false;

    getSubdivisions();

    canvas.onmousedown = function(e) {
        // Read x1 and y1
        var position = getMousePos(canvas, e);
        x1 = position.x;
        y1 = position.y;

        mouseIsDown = true;
    }

    canvas.onmouseup = function(e) {
        mouseIsDown = false;
    }

    canvas.onmousemove = function(e) {
        if (!mouseIsDown) return;

        var positive = -1;

        // Read the second x2 and y2
        var position = getMousePos(canvas, e);
        x2 = position.x;
        y2 = position.y;

        newAngle = getInternalProduct(x1, y1, x2, y2);

        if (getExternalProduct(x1, y1, 0, x2, y2, 0)[2] >= 0) positive = 1;

        if (positive === 1)
            theta = theta + newAngle;
        else
            theta = theta - newAngle;

        render();

        x1 = x2;
        y1 = y2;
    }

	// Determines if lines or filled triangles
	document.getElementById("linesTriangle").onclick = function () {
		opt = 1;
        getSubdivisions();
    };

	document.getElementById("filledTriangle").onclick = function () {
		opt = 2;
        getSubdivisions();
    };
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // send the value of the angle
    var thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform1f(thetaLoc, theta);

    if (opt === 1) gl.drawArrays(gl.LINES, 0, aux.length);
    else gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    requestAnimFrame(render, 60);
}

// Get the internal product of 2 vectors
function getInternalProduct(x0, y0, x1, y1) {
    return (x0 * x1) + (y0 * y1);
}

// Get the external product of 2 vectors
function getExternalProduct(a1, a2, a3, b1, b2, b3) {
    return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
}

// Get the position of x and y of the event
function getMousePos(canvas, evt) {
    return {
      x: -1 + 2 * evt.offsetX / canvas.width,
      y: -1 + 2 * (canvas.height - evt.offsetY) / canvas.height
    };
}

// Gets the number of subdivions
function getSubdivisions() {
    var subdivisionNr = document.getElementById("subdivisionNr").value;

    vertices = [
        vec2(-0.5, -0.5),
        vec2(0, 0.5),
        vec2(0.5, -0.5)
    ];

    for (var i = 0; i < subdivisionNr; i++) {
        var l = vertices.length;
        for (var j = 0; j < l; j = j + 3) {
            p1 = vertices.shift();
            p2 = vertices.shift();
            p3 = vertices.shift();
            subdivideTriangle(p1, p2, p3, vertices);
        }
    }

    if (opt === 1) {
        printLines(vertices);
    } else {
        printTriangles(vertices);
    }
}

// Prints lines
function printLines(v) {
    aux = [];

    for (var i = 0; i < v.length; i = i + 3) {
        aux.push(v[i]);
        aux.push(v[i+1]);
        aux.push(v[i]);
        aux.push(v[i+2]);
        aux.push(v[i+1]);
        aux.push(v[i+2]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, flatten(aux), gl.STATIC_DRAW);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.LINES, 0, aux.length);
}

// Prints filled triangles
function printTriangles(v) {
	gl.bufferData(gl.ARRAY_BUFFER, flatten(v), gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, v.length);
}

/* Acrescenta a um vetor de entrada/saída 4 sequências de 3 vértices definindo assim os
triângulos gerados por subdivisão dum triângulo recebido como argumentos dessa mesma função,
sob a forma dos seus 3 vértices v1, v2 e v3: */
function subdivideTriangle(v1, v2, v3, out) {
    var v1v2 = mix(v1, v2, 0.5);  // função definida em MV.js
    var v1v3 = mix(v1, v3, 0.5);
    var v2v3 = mix(v2, v3, 0.5);

    // Add 1st triangle
    out.push(v1);
    out.push(v1v2);
    out.push(v1v3);

    // Add 2nd triangle
    out.push(v1v2);
    out.push(v2);
    out.push(v2v3);

    // Add 3rd triangle
    out.push(v1v3);
    out.push(v2v3);
    out.push(v3);

    // Add 4th (inner) triangle
    out.push(v1v2);
    out.push(v2v3);
    out.push(v1v3);
}