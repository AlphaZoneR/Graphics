#ifndef TCOORDINATES_H
#define TCOORDINATES_H

#include <GL/glew.h>
#include <iostream>

namespace cagd
{
    //-------------------------------------
    // four dimensional texture coordinates
    //-------------------------------------
    class TCoordinate4
    {
    protected:
        GLfloat _data[4]; // (s, t, r, q)

    public:
        friend std::istream& operator >>(std::istream& lhs, TCoordinate4& rhs);

        // default constructor
        TCoordinate4();

        // homework: special constructor -- done
        TCoordinate4(GLfloat s, GLfloat t, GLfloat r = 0.0, GLfloat q = 1.0);

        // homework: get components by value -- done
        GLfloat operator[](GLuint rhs) const;
        GLfloat s() const;
        GLfloat t() const;
        GLfloat r() const;
        GLfloat q() const;

        // homework: get components by reference -- done
        GLfloat& operator[](GLuint rhs);
        GLfloat& s();
        GLfloat& t();
        GLfloat& r();
        GLfloat& q();
    };

    // default constructor
    inline TCoordinate4::TCoordinate4()
    {
        _data[0] = _data[1] = _data[2] = 0.0;
        _data[3] = 1.0;
    }

    // homework: output to stream -- done
    inline std::ostream& operator <<(std::ostream& lhs, const TCoordinate4& rhs)
    {
        return lhs << rhs.s() << " " << rhs.t() << rhs.r() << " " << rhs.q();
    }

    // homework: input from stream -- done
    inline std::istream& operator >>(std::istream& lhs, TCoordinate4& rhs) {
        return lhs >> rhs._data[0] >> rhs._data[1] >> rhs._data[2] >> rhs._data[3];
    }
}

#endif
