#ifndef MATERIALS_H
#define MATERIALS_H

#include "Colors4.h"
#include <GL/glew.h>

namespace cagd
{
    class Material
    {
    protected:
        Color4	_front_ambient, _front_diffuse, _front_specular, _front_emissive;
        GLfloat	_front_shininess;

        Color4	_back_ambient, _back_diffuse, _back_specular, _back_emissive;
        GLfloat	_back_shininess;

    public:

        Material(
            const Color4& front_ambient   = Color4(),
            const Color4& front_diffuse   = Color4(),
            const Color4& front_specular  = Color4(),
            const Color4& front_emissive  = Color4(),
            GLfloat front_shininess       = 128.0,
            const Color4& backAmbient     = Color4(),
            const Color4& back_diffuse    = Color4(),
            const Color4& back_specular   = Color4(),
            const Color4& back_emissive   = Color4(),
            GLfloat back_shininess        = 128.0);

        GLvoid SetAmbientColor(GLenum face, const Color4& c);
        GLvoid SetAmbientColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a = 1.0f);

        // homework -- done
        GLvoid SetDiffuseColor(GLenum face, const Color4& c);
        GLvoid SetDiffuseColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a = 1.0f);

        // homework -- done
        GLvoid SetSpecularColor(GLenum face, const Color4& c);
        GLvoid SetSpecularColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a = 1.0f);

        // homework -- done
        GLvoid SetEmissiveColor(GLenum face, const Color4& c);
        GLvoid SetEmissiveColor(GLenum face, GLfloat r, GLfloat g, GLfloat b, GLfloat a = 1.0f);

        // homework -- done
        GLvoid SetShininess(GLenum face, GLfloat shininess);

        // homework -- done with question
        GLvoid SetTransparency(const GLfloat &alpha);

        GLvoid Apply();

        // homework -- done with question
        GLboolean IsTransparent() const;
    };

    extern
    Material    MatFBBrass,
                MatFBGold,
                MatFBSilver,
                MatFBEmerald,
                MatFBPearl,
                MatFBRuby,
                MatFBTurquoise;
}


#endif
