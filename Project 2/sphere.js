var radius = 0.5;
var nLat = 16;
var nLon = 16;

var theta;
var phi;
var x, y, z;

var sphere_points = [];
var sphere_normals = [];
var sphere_faces = [];
var sphere_edges = [];

var sphere_points_buffer = [];
var sphere_normals_buffer = [];
var sphere_faces_buffer = [];
var sphere_edges_buffer = [];

function sphereInit(gl) {
    sphereBuild(gl);
    sphereUploadData();
}

function sphereBuild(gl) {
    for (var latNumber = 0; latNumber <= nLat; latNumber++) {
        var theta = (latNumber * Math.PI) / nLat;

        for (var lonNumber = 0; lonNumber <= nLon; lonNumber++) {
            var phi = (lonNumber * 2 * Math.PI) / nLon;

            var x = radius * Math.cos(phi) * Math.sin(theta);
            var y = radius * Math.cos(theta);
            var z = radius * Math.sin(theta) * Math.sin(phi);

            var pt = vec3(x, y, z);
            sphere_points.push(pt);

            var normal = normalize(vec3(pt));
            sphere_normals.push(normal);

            if(latNumber !== nLat && lonNumber !== nLon) {
                var first = (latNumber * (nLon + 1)) + lonNumber;
                var second = first + nLon + 1;

                sphereAddFace(first, second);
            }
        }
    }
}

function sphereAddFace(first, second) {
    // Add sphere faces (a, c, d) and (a, d, b)
    sphere_faces.push(first);
    sphere_faces.push(second);
    sphere_faces.push(second+1);

    sphere_faces.push(first);
    sphere_faces.push(second+1);
    sphere_faces.push(first+1);

    // Add first edge (a, c)
    sphere_edges.push(first);
    sphere_edges.push(second);

    // Add second edge (c, d)
    sphere_edges.push(second);
    sphere_edges.push(second+1);

    // Add third edge (a, d)
    sphere_edges.push(first);
    sphere_edges.push(second+1);
}

function sphereUploadData() {
    sphere_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphere_points), gl.STATIC_DRAW);

    sphere_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphere_normals), gl.STATIC_DRAW);

    sphere_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere_faces), gl.STATIC_DRAW);

    sphere_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere_edges), gl.STATIC_DRAW);
}

function sphereDrawWireFrame(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_edges_buffer);
    gl.drawElements(gl.LINES, sphere_edges.length, gl.UNSIGNED_SHORT, 0);
}

function sphereDrawFilled(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_faces_buffer);
    gl.drawElements(gl.TRIANGLES, sphere_faces.length, gl.UNSIGNED_SHORT, 0);
}