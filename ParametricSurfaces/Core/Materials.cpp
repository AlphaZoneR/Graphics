#include "Materials.h"

using namespace cagd;

Material::Material(
    const Color4& front_ambient,
    const Color4& front_diffuse,
    const Color4& front_specular,
    const Color4& front_emissive,
    GLfloat front_shininess,

    const Color4& back_ambient,
    const Color4& back_diffuse,
    const Color4& back_specular,
    const Color4& back_emissive,
    GLfloat back_shininess):

    _front_ambient	(front_ambient),
    _front_diffuse	(front_diffuse),
    _front_specular	(front_specular),
    _front_emissive	(front_emissive),
    _front_shininess	(front_shininess),

    _back_ambient	(back_ambient),
    _back_diffuse	(back_diffuse),
    _back_specular	(back_specular),
    _back_emissive	(back_emissive),
    _back_shininess	(back_shininess)
{
}

GLvoid Material::SetAmbientColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a)
{
    switch (face)
    {
    case GL_FRONT:
        _front_ambient.r() = r;
        _front_ambient.g() = g;
        _front_ambient.b() = b;
        _front_ambient.a() = a;
    break;

    case GL_BACK:
        _back_ambient.r() = r;
        _back_ambient.g() = g;
        _back_ambient.b() = b;
        _back_ambient.a() = a;
    break;

    case GL_FRONT_AND_BACK:
        _front_ambient.r() = r;
        _front_ambient.g() = g;
        _front_ambient.b() = b;
        _front_ambient.a() = a;

        _back_ambient.r()  = r;
        _back_ambient.g()  = g;
        _back_ambient.b()  = b;
        _back_ambient.a()  = a;
    break;
    }
}

GLvoid Material::Apply()
{
    glMaterialfv(GL_FRONT, GL_AMBIENT,   &_front_ambient.r());
    glMaterialfv(GL_FRONT, GL_DIFFUSE,   &_front_diffuse.r());
    glMaterialfv(GL_FRONT, GL_SPECULAR,  &_front_specular.r());
    glMaterialfv(GL_FRONT, GL_EMISSION,  &_front_emissive.r());
    glMaterialf (GL_FRONT, GL_SHININESS, _front_shininess);

    glMaterialfv(GL_BACK, GL_AMBIENT,    &_back_ambient.r());
    glMaterialfv(GL_BACK, GL_DIFFUSE,    &_back_diffuse.r());
    glMaterialfv(GL_BACK, GL_SPECULAR,   &_back_specular.r());
    glMaterialfv(GL_BACK, GL_EMISSION,   &_back_emissive.r());
    glMaterialf (GL_BACK, GL_SHININESS,  _back_shininess);
}

GLvoid Material::SetAmbientColor(GLenum face, const Color4& c) {
    if (face == GL_FRONT) {
        this->_front_ambient = c;
    } else if (face == GL_BACK) {
        this->_back_ambient = c;
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_ambient = c;
        this->_back_ambient = c;
    }
}

GLvoid Material::SetDiffuseColor(GLenum face, const Color4& c) {
    if (face == GL_FRONT) {
        this->_front_diffuse = c;
    } else if (face == GL_BACK) {
        this->_back_diffuse = c;
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_diffuse = c;
        this->_back_diffuse = c;
    }
}

GLvoid Material::SetDiffuseColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a) {
    if (face == GL_FRONT) {
        this->_front_diffuse = Color4(r, g, b, a);
    } else if (face == GL_BACK) {
        this->_back_diffuse = Color4(r, g, b, a);
    } else if (face == GL_FRONT_AND_BACK) {
        this->_back_diffuse = Color4(r, g, b, a);
        this->_front_diffuse = Color4(r, g, b, a);
    }
}

// homework
GLvoid Material::SetSpecularColor(GLenum face, const Color4& c) {
    if (face == GL_FRONT) {
        this->_front_specular = c;
    } else if (face == GL_BACK) {
        this->_back_specular = c;
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_specular = c;
        this->_back_specular = c;
    }
}
GLvoid Material::SetSpecularColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a) {
    if (face == GL_FRONT) {
        this->_front_specular = Color4(r, g, b, a);
    } else if (face == GL_BACK) {
        this->_back_specular = Color4(r, g, b, a);
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_specular = Color4(r, g, b, a);
        this->_back_specular = Color4(r, g, b, a);
    }
}

// homework
GLvoid Material::SetEmissiveColor(GLenum face, const Color4& c) {
    if (face == GL_FRONT) {
        this->_front_emissive = c;
    } else if (face == GL_BACK) {
        this->_back_emissive = c;
    } else if (face == GL_FRONT_AND_BACK) {
        this->_back_emissive = c;
        this->_front_emissive = c;
    }
}
GLvoid Material::SetEmissiveColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a) {
    if (face == GL_FRONT) {
        this->_front_emissive = Color4(r, g, b, a);
    } else if (face == GL_BACK) {
        this->_back_emissive = Color4(r, g, b, a);
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_emissive = Color4(r, g, b, a);
        this->_back_emissive = Color4(r, g, b, a);
    }
}

// homework
GLvoid Material::SetShininess(GLenum face, GLfloat shininess) {
    if (face == GL_FRONT) {
        this->_front_shininess = shininess;
    } else if (face == GL_BACK) {
        this->_back_shininess = shininess;
    } else if (face == GL_FRONT_AND_BACK) {
        this->_front_shininess = shininess;
        this->_back_shininess = shininess;
    }
}

GLvoid Material::SetTransparency(const GLfloat& alpha) {
    this->_front_ambient.a() = alpha;
    this->_front_specular.a() = alpha;
    this->_front_diffuse.a() = alpha;
    this->_front_emissive.a() = alpha;

    this->_back_ambient.a() = alpha;
    this->_back_specular.a() = alpha;
    this->_back_diffuse.a() = alpha;
    this->_back_emissive.a() = alpha;
}

GLboolean Material::IsTransparent() const {
    return _front_ambient.a() != 1.0f ||  _front_specular.a() != 1.0f ||  _front_diffuse.a() != 1.0f ||  _front_emissive.a() != 1.0f || _back_ambient.a() != 1.0f ||  _back_specular.a() != 1.0f ||  _back_diffuse.a() != 1.0f ||  _back_emissive.a() != 1.0f;
}
// brass
Material cagd::MatFBBrass = Material(
                        Color4(0.329412f, 0.223529f, 0.027451f, 0.4f),
                        Color4(0.780392f, 0.568627f, 0.113725f, 0.6f),
                        Color4(0.992157f, 0.941176f, 0.807843f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        27.8974f,
                        Color4(0.329412f, 0.223529f, 0.027451f, 0.4f),
                        Color4(0.780392f, 0.568627f, 0.113725f, 0.6f),
                        Color4(0.992157f, 0.941176f, 0.807843f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        27.8974f);

// emerald
Material cagd::MatFBEmerald = Material(
                        Color4(0.021500f, 0.174500f, 0.021500f, 0.4f),
                        Color4(0.075680f, 0.614240f, 0.075680f, 0.6f),
                        Color4(0.633000f, 0.727811f, 0.633000f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        76.8f,
                        Color4(0.021500f, 0.174500f, 0.021500f, 0.4f),
                        Color4(0.075680f, 0.614240f, 0.075680f, 0.6f),
                        Color4(0.633000f, 0.727811f, 0.633000f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        76.8f);

// gold
Material cagd::MatFBGold = Material(
                        Color4(0.247250f, 0.199500f, 0.074500f, 0.4f),
                        Color4(0.751640f, 0.606480f, 0.226480f, 0.6f),
                        Color4(0.628281f, 0.555802f, 0.366065f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        51.2f,
                        Color4(0.247250f, 0.199500f, 0.074500f, 0.4f),
                        Color4(0.751640f, 0.606480f, 0.226480f, 0.6f),
                        Color4(0.628281f, 0.555802f, 0.366065f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        51.2f);

// pearl
Material cagd::MatFBPearl = Material(
                        Color4(0.250000f, 0.207250f, 0.207250f, 0.4f),
                        Color4(1.000000f, 0.829000f, 0.829000f, 0.6f),
                        Color4(0.296648f, 0.296648f, 0.296648f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        11.264f,
                        Color4(0.250000f, 0.207250f, 0.207250f, 0.4f),
                        Color4(1.000000f, 0.829000f, 0.829000f, 0.6f),
                        Color4(0.296648f, 0.296648f, 0.296648f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        11.264f);

// ruby
Material cagd::MatFBRuby = Material(
                        Color4(0.174500f, 0.011750f, 0.011750f, 0.4f),
                        Color4(0.614240f, 0.041360f, 0.041360f, 0.6f),
                        Color4(0.727811f, 0.626959f, 0.626959f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        76.8f,
                        Color4(0.174500f, 0.011750f, 0.011750f, 0.4f),
                        Color4(0.614240f, 0.041360f, 0.041360f, 0.6f),
                        Color4(0.727811f, 0.626959f, 0.626959f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        76.8f);

// silver
Material cagd::MatFBSilver = Material(
                        Color4(0.192250f, 0.192250f, 0.192250f, 0.4f),
                        Color4(0.507540f, 0.507540f, 0.507540f, 0.6f),
                        Color4(0.508273f, 0.508273f, 0.508273f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        51.2f,
                        Color4(0.192250f, 0.192250f, 0.192250f, 0.4f),
                        Color4(0.507540f, 0.507540f, 0.507540f, 0.6f),
                        Color4(0.508273f, 0.508273f, 0.508273f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        51.2f);

// turquoise
Material cagd::MatFBTurquoise = Material(
                        Color4(0.100000f, 0.187250f, 0.174500f, 0.4f),
                        Color4(0.396000f, 0.741510f, 0.691020f, 0.6f),
                        Color4(0.297254f, 0.308290f, 0.306678f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        12.8f,
                        Color4(0.100000f, 0.187250f, 0.174500f, 0.4f),
                        Color4(0.396000f, 0.741510f, 0.691020f, 0.6f),
                        Color4(0.297254f, 0.308290f, 0.306678f, 0.8f),
                        Color4(0.000000f, 0.000000f, 0.000000f, 0.0f),
                        12.8f);


