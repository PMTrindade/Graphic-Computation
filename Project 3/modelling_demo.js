var gl;

var canvas;

// GLSL programs
var program;

// Render Mode
var WIREFRAME = 1;
var FILLED = 2;
var renderMode = WIREFRAME;

var projection;
var modelView;
var view;

var a = 0;
var b = 0;
var c = 0;
var d = 1;

matrixStack = [];

function pushMatrix() {
    matrixStack.push(mat4(modelView[0], modelView[1], modelView[2], modelView[3]));
}

function popMatrix() {
    modelView = matrixStack.pop();
}

function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}

function multRotX(angle) {
    modelView = mult(modelView, rotateX(angle));
}

function multRotY(angle) {
    modelView = mult(modelView, rotateY(angle));
}

function multRotZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function multMatrix(m) {
    modelView = mult(modelView, m);
}

function multScale(s) {
    modelView = mult(modelView, scalem(s));
}

function initialize() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader-2", "fragment-shader-2");

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);

    setupProjection();
    setupView();

    window.addEventListener("keydown", function(event) {
        switch (event.keyCode) {
            case 37: // Left key
                if(a > -2) a -= 0.1;
                break;
            case 39: // Right key
                if(a < 2) a += 0.1;
                break;
            case 81: // ’Q’ key
                b -= 1;
                break;
            case 87: // ’W’ key
                b += 1;
                break;
            case 40: // Down key
                if(c > -60) c -= 1;
                break;
            case 38: // Up key
                if(c < 240) c += 1;
                break;
            case 79: // ’O’ key
                if(d > 0.7) d -= 0.1;
                break;
            case 80: // ’P’ key
                if(d < 1.2) d += 0.1;
                break;
        }
    });
}

function setupProjection() {
    projection = perspective(60, 1, 0.1, 100);
    //projection = ortho(-1, 1, -1, 1, 0.1, 100);
}

function setupView() {
    view = lookAt([0, 0, 5], [0, 0, 0], [0, 1, 0]);
    modelView = mat4(view[0], view[1], view[2], view[3]);
}

function setMaterialColor(color) {
    var uColor = gl.getUniformLocation(program, "color");
    gl.uniform3fv(uColor, color);
}

function sendMatrices() {
    // send the current model view matrix
    var mView = gl.getUniformLocation(program, "mView");
    gl.uniformMatrix4fv(mView, false, flatten(view));

    // send the normals transformation matrix
    var mViewVectors = gl.getUniformLocation(program, "mViewVectors");
    gl.uniformMatrix4fv(mViewVectors, false, flatten(normalMatrix(view, false)));

    // send the current model view matrix
    var mModelView = gl.getUniformLocation(program, "mModelView");
    gl.uniformMatrix4fv(mModelView, false, flatten(modelView));

    // send the normals transformation matrix
    var mNormals = gl.getUniformLocation(program, "mNormals");
    gl.uniformMatrix4fv(mNormals, false, flatten(normalMatrix(modelView, false)));
}

function draw_cube(color) {
    setMaterialColor(color);
    sendMatrices();
    cubeDrawFilled(gl, program);
}

function draw_cylinder(color) {
    setMaterialColor(color);
    sendMatrices();
    cylinderDrawFilled(gl, program);
}

function draw_sphere(color) {
    setMaterialColor(color);
    sendMatrices();
    sphereDrawFilled(gl, program);
}

//builds the floor of the scene
function buildFloor() {
    multTranslation([0, -0.5, 0]);
    multScale([5, 1, 5]);
    draw_cube([1, 1, 1]);
}

//builds the car
function buildCar() {
    pushMatrix();
        multTranslation([-0.3, 0, 0]);
        multRotX(90);
        multScale([0.2, 0.52, 0.2]);
        draw_cylinder([1, 1, 0]);
    popMatrix();
    pushMatrix();
        multTranslation([0.3, 0, 0]);
        multRotX(90);
        multScale([0.2, 0.52, 0.2]);
        draw_cylinder([1, 1, 0]);
    popMatrix();
    multTranslation([0, 0.1, 0]);
    pushMatrix();
        multScale([1.2, 0.2, 0.5]);
        draw_cube([1, 0, 0]);
    popMatrix();
}

//builds the base of the crane
function buildCraneBase() {
    pushMatrix();
        multScale([0.5, 0.2, 0.5]);
        draw_cylinder([0, 1, 0]);
    popMatrix();
    multTranslation([0, 1.1, 0]);
    pushMatrix();
        multScale([0.2, 2, 0.2]);
        draw_cube([1, 0, 0]);
    popMatrix();
}

//builds the arm of the crane
function buildCraneArm() {
    pushMatrix();
        multRotX(90);
        multScale([0.22, 0.22, 0.22]);
        draw_cylinder([0, 1, 0]);
    popMatrix();
    pushMatrix();
        multTranslation([0.6, 0, 0]);
        multScale([1.2, 0.2, 0.2]);
        draw_cube([1, 0, 0]);
    popMatrix();
}

//builds the extendable arm
function buildExtArm() {
    multScale([1.2, 0.14, 0.14]);
    draw_cube([1, 0, 0]);
}

function draw_scene(a, b, c, d) {
    multTranslation([0, -2.5, 0]);

    pushMatrix();
        buildFloor();
    popMatrix();

    multTranslation([a, 0.1, -1]);
    buildCar();

    multTranslation([0, 0.2, 0]);
    multRotY(b);
    buildCraneBase();

    multTranslation([0, 1, 0]);
    multRotZ(c);
    buildCraneArm();

    multTranslation([d, 0, 0]);
    buildExtArm();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    setupView();

    // send the current projection matrix
    var mProjection = gl.getUniformLocation(program, "mProjection");
    gl.uniformMatrix4fv(mProjection, false, flatten(projection));

    draw_scene(a, b, c, d);

    requestAnimFrame(render);
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    initialize();

    render();
}