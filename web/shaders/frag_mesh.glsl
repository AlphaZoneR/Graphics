precision mediump float;

struct Material {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
  float shininess;
};

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Material u_material;
uniform Light u_light;

varying vec3 var_frag_pos;
varying vec3 var_normal;
varying vec3 var_view_pos;

void main(void) {
    // ambient
    vec3 ambient = u_light.ambient * u_material.ambient;
    // diffuse 
    vec3 norm = normalize(var_normal);
    vec3 light_dir = normalize(u_light.position - var_frag_pos);
    float diff = max(dot(norm, light_dir), 0.0);
    vec3 diffuse = u_light.diffuse * (diff * u_material.diffuse);
    
    //specular

    vec3 view_dir = normalize(var_view_pos - var_frag_pos);
    vec3 reflect_dir = reflect(light_dir, norm);
    float spec = pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
    vec3 specular = u_light.specular * (spec * u_material.specular); 

    vec3 result = ambient + diffuse + specular;
    gl_FragColor = vec4(result, 1.0);
}