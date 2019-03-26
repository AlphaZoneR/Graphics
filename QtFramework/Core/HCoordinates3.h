#ifndef HCOORDINATES_H
#define HCOORDINATES_H

#include <cmath>
#include <GL/glew.h>
#include <iostream>

#include "Exceptions.h"

namespace cagd
{
    //--------------------------------------
    // 3-dimensional homogeneous coordinates
    //--------------------------------------
    class HCoordinate3
    {
    protected:
        GLfloat _data[4]; // x, y, z, w;

    public:
        friend const HCoordinate3 operator *(GLfloat lhs, const HCoordinate3& rhs);
        friend const HCoordinate3 operator *(GLfloat lhs, const HCoordinate3& rhs);
        friend std::ostream& operator <<(std::ostream& lhs, const HCoordinate3& rhs);
        friend std::istream& operator >>(std::istream& lhs, HCoordinate3& rhs);

        // default constructor
        HCoordinate3();

        // special constructor
        HCoordinate3(GLfloat x, GLfloat y, GLfloat z = 0.0, GLfloat w = 1.0);

        // homework: get components by value -- done
        GLfloat operator[](GLuint rhs) const;
        GLfloat x() const;
        GLfloat y() const;
        GLfloat z() const;
        GLfloat w() const;

        // homework: get components by reference -- done
        GLfloat& operator[](GLuint rhs);
        GLfloat& x();
        GLfloat& y();
        GLfloat& z();
        GLfloat& w();

        // add
        const HCoordinate3 operator +(const HCoordinate3& rhs) const;

        // homework: add to this -- done
        HCoordinate3& operator +=(const HCoordinate3& rhs);

        // homework: subtract -- done
        const HCoordinate3 operator -(const HCoordinate3& rhs) const;

        // homework: subtract from this -- done
        HCoordinate3& operator -=(const HCoordinate3& rhs);

        // homework: dot product -- done
        GLfloat operator *(const HCoordinate3& rhs) const;

        // homework: cross product -- done
        const HCoordinate3 operator ^(const HCoordinate3& rhs) const;

        // homework: cross product with this -- done
        HCoordinate3& operator ^=(const HCoordinate3& rhs);

        // homework: multiplicate with scalar from right -- done
        const HCoordinate3 operator *(const GLfloat &rhs) const;

        // homework: multiplicate this with a scalar -- done
        HCoordinate3& operator *=(const GLfloat &rhs);

        // homework: divide with scalar -- done
        const HCoordinate3 operator /(const GLfloat &rhs) const;

        // homework: divide this with a scalar -- done
        HCoordinate3& operator /=(const GLfloat &rhs);

        // homework: length of vector represented by this homogeneous coordinate -- done
        GLfloat length() const;

        // homework: normalize -- done
        HCoordinate3& normalize();
    };
}

#endif
