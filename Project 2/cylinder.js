var radius = 0.5;
var n_points = 16;

var cylinder_points = [];
var cylinder_normals = [];
var cylinder_faces = [];
var cylinder_edges = [];

var cylinder_points_buffer = [];
var cylinder_normals_buffer = [];
var cylinder_faces_buffer = [];
var cylinder_edges_buffer = [];

function cylinderInit(gl) {
    cylinderBuild();
    cylinderUploadData(gl);
}

function cylinderBuild() {
    var delta_theta = 2 * Math.PI / n_points;
    var x, z, pt, normal;

    // Add top and bottom center vertices and normals
    cylinder_points.push(vec3(0, radius, 0));
    cylinder_normals.push(vec3(0, 1, 0));
    cylinder_points.push(vec3(0, -radius, 0));
    cylinder_normals.push(vec3(0, -1, 0));

    // Calculate all vertices and normals (lateral)
    for(theta = 0; theta < 2 * Math.PI; theta += delta_theta) {
        x = radius * Math.cos(theta);
        z = radius * Math.sin(theta);
        pt = vec3(x, 0, z);
        normal = normalize(vec3(pt));
        cylinder_points.push(vec3(x, radius, z));
        cylinder_normals.push(normal);
        cylinder_points.push(vec3(x, -radius, z));
        cylinder_normals.push(normal);
    }

    // Add all lateral faces and edges
    for(i = 2; i < cylinder_points.length - 2; i += 2)
        cylinderAddFace(i, i + 2);

    // Add last lateral face and edge
    cylinderAddFace(i, 2);

    // Calculate all vertices and normals (top and bottom)
    var index = cylinder_points.length;
    for(i = 2; i < index; i += 2) {
        cylinder_points.push(cylinder_points[i]);
        normal = vec3(0, 1, 0);
        cylinder_normals.push(normal);
        cylinder_points.push(cylinder_points[i+1]);
        normal = vec3(0, -1, 0);
        cylinder_normals.push(normal);
    }

    // Add all top faces and edges
    for(i = index; i < cylinder_points.length - 2; i += 2)
        cylinderAddTop(i, i + 2, 0);

    // Add last top face and edge
    cylinderAddTop(i, index, 0);

    // Add all bottom faces and edges
    for(i = index + 1; i < cylinder_points.length - 1; i += 2)
        cylinderAddBottom(i, i + 2, 1);

    // Add last bottom face and edge
    cylinderAddBottom(i, index + 1, 1);
}

function cylinderAddFace(i, n) {
    // Add 2 triangular faces (a, b, d) and (a, d, c)
    cylinder_faces.push(i);
    cylinder_faces.push(i+1);
    cylinder_faces.push(n+1);

    cylinder_faces.push(i);
    cylinder_faces.push(n+1);
    cylinder_faces.push(n);

    // Add first edge (a, b)
    cylinder_edges.push(i);
    cylinder_edges.push(i+1);

    // Add second edge (b, d)
    cylinder_edges.push(i+1);
    cylinder_edges.push(n+1);

    // Add third edge (a, d)
    cylinder_edges.push(i);
    cylinder_edges.push(n+1);

    // Add fourth edge (c, a)
    cylinder_edges.push(n);
    cylinder_edges.push(i);
}

function cylinderAddTop(a, b, c) {
    cylinder_faces.push(a);
    cylinder_faces.push(b);
    cylinder_faces.push(c);

    cylinder_edges.push(c);
    cylinder_edges.push(a);
}

function cylinderAddBottom(a, b, c) {
    cylinder_faces.push(b);
    cylinder_faces.push(a);
    cylinder_faces.push(c);

    cylinder_edges.push(a);
    cylinder_edges.push(c);
}

function cylinderUploadData(gl) {
    cylinder_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cylinder_points), gl.STATIC_DRAW);

    cylinder_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cylinder_normals), gl.STATIC_DRAW);

    cylinder_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder_faces), gl.STATIC_DRAW);

    cylinder_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder_edges), gl.STATIC_DRAW);
}

function cylinderDrawWireFrame(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_edges_buffer);
    gl.drawElements(gl.LINES, cylinder_edges.length, gl.UNSIGNED_SHORT, 0);
}

function cylinderDrawFilled(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_faces_buffer);
    gl.drawElements(gl.TRIANGLES, cylinder_faces.length, gl.UNSIGNED_SHORT, 0);
}