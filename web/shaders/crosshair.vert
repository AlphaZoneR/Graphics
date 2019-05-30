#version 100

attribute vec2 in_vert;

uniform vec4 in_color;
varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4(in_vert, 0.0, 1.0);
  gl_PointSize = 3.0;

  // Pass the color to the fragment shader.
  v_color = in_color;
}