precision mediump float;

struct Material
{
    vec4    ambient;
    vec4    diffuse;
    vec4    specular;
    vec4    emission;
    float   shininess;
};

uniform Material front_material;
uniform Material back_material;

struct LightSource
{
    vec4    position;
    vec4    half_vector;
    vec4    ambient;
    vec4    diffuse;
    vec4    specular;
};

uniform LightSource light_source;

varying vec3  interpolated_normal;
varying mat4 N;
void main()
{
	vec3 light_direction = normalize(vec3(light_source.position));

    float intensity = dot(light_direction, interpolated_normal);

	vec4 color = front_material.ambient;
    vec3 N = normalize(interpolated_normal), L = normalize(light_direction);
    float N_dot_L = max(0.0, dot(N, L));
	
	if (intensity > 0.95)
                color += front_material.diffuse * N_dot_L *  0.95;
	else if (intensity > 0.85)
                color += front_material.diffuse * N_dot_L *  0.85;
	else if (intensity > 0.75)
                color += front_material.diffuse * N_dot_L *  0.75;
	else if (intensity > 0.65)
                color += front_material.diffuse * N_dot_L *  0.65;
	else if (intensity > 0.55)
                color += front_material.diffuse * N_dot_L *  0.55;
	else if (intensity > 0.45)
                color += front_material.diffuse * N_dot_L *  0.45;
	else 
	{
            color = vec4(1.0, 1.0, 1.0, 1.0);
	}

	gl_FragColor = color;
}
