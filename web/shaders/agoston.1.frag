#version 100
precision mediump float;

varying vec3 interpolated_position;
varying vec3 interpolated_normal;
varying vec4 texture_coordinates;

uniform float     transparency;

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

uniform bool u_use_texture;

struct LightSource
{
    vec4    position;
    vec4    half_vector;
    vec4    ambient;
    vec4    diffuse;
    vec4    specular;
};

uniform LightSource light_source;
uniform sampler2D u_sampler;

void directionalLight(in vec3 N, in float shininess,
                      inout vec4 ambient, inout vec4 diffuse, inout vec4 specular)
{
    vec3 L = normalize(light_source.position.xyz);
   
    float N_dot_L = dot(N, L);
   
    if (N_dot_L > 0.0)
    {   
        vec3 H = light_source.half_vector.xyz;
       
        float pf = pow(max(dot(N, H), 0.0), shininess);

        diffuse  += light_source.diffuse  * N_dot_L;
        specular += light_source.specular * pf;
        ambient  += light_source.ambient;
    }
   
}

float calculateAttenuation(in float distance)
{
    return(1.0 / (2.0 +
                  3.0 * distance +
                  4.0 * distance * distance));
}


void spotlight(in vec3 N, in vec3 V, in float shininess,
               inout vec4 ambient, inout vec4 diffuse, inout vec4 specular)
{
    vec3 D = light_source.position.xyz - V;
    vec3 L = normalize(D);

    float distance = length(D);
    float attenuation = calculateAttenuation(distance);

    float N_dot_L = dot(N,L);

    if (N_dot_L > 0.0)
    {   
        float spot_effect = dot(normalize(light_source.position.xyz), -L);
       
        if (spot_effect > 5.0)
        {
            attenuation *=  spot_effect * spot_effect;

            vec3 E = normalize(-V);
            vec3 R = reflect(-L, N);
       
            float pf = pow(max(dot(R, E), 0.0), shininess);

            diffuse  += light_source.diffuse  * attenuation * N_dot_L;
            specular += light_source.specular * attenuation * pf;
        }
        ambient  += light_source.ambient * attenuation;
    }
   
}

void main()
{
    // Normalize the interpolated normal. 
    // A varying variable CANNOT be modified by a fragment shader.
    // So a new variable needs to be created.
    vec3 n = normalize(interpolated_normal);

    vec4 ambient = vec4(0.0), diffuse = vec4(0.0), specular = vec4(0.0), color = vec4(0.0);

    // Initialize the contributions for the front-face-pass over the lights.
    
    directionalLight(n, front_material.shininess,
                      ambient, diffuse, specular);

    color += front_material.emission +
             (ambient  * (front_material.ambient)) +
             (diffuse  * (front_material.diffuse)) +
             (specular * (front_material.specular));

    ambient = vec4(0.0);
    diffuse = vec4(0.0);
    specular = vec4(0.0);

    // Now caculate the back contribution. All that needs to be done is to flip the normal.
    directionalLight(-n, front_material.shininess,
                      ambient, diffuse, specular);

    color += back_material.emission +
             (ambient  * (back_material.ambient)) +
             (diffuse  * (back_material.diffuse)) +
             (specular * (back_material.specular));

    color = clamp(color, 0.0, 1.0);

    if (u_use_texture == false) {
        gl_FragColor = vec4(color.rgb, clamp(1.0 - transparency, 0.0, 1.0));
    } else if (u_use_texture == true) {
        gl_FragColor = texture2D(u_sampler, texture_coordinates.xy);
    }

}
