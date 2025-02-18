#version 330 compatibility

out  vec3  vN;	  // normal vector

void main( ) {
	vN = gl_Normal;
	gl_Position = gl_Vertex;
}
