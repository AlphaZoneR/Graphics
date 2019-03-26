#ifndef TRIANGULARFACES_H
#define TRIANGULARFACES_H

#include <GL/glew.h>
#include <iostream>
#include <vector>
#include "Exceptions.h"

namespace cagd
{
    class TriangularFace
    {
    protected:
        GLuint _node[3];

    public:
        friend std::istream& operator >>(std::istream& lhs, TriangularFace& rhs);
        // default constructor
        TriangularFace();

        // homework: copy constructor -- done
        TriangularFace(const TriangularFace& face);

        // homework: assignment operator -- done
        TriangularFace& operator =(const TriangularFace& rhs);

        // homework: get node identifiers by value -- done
        GLuint operator [](GLuint i) const;

        // homework: get node identifiers by reference -- done
        GLuint& operator [](GLuint i);
    };

    // default constructor
    inline TriangularFace::TriangularFace()
    {
        _node[0] = _node[1] = _node[2] = 0;
    }

    // output to stream
    inline std::ostream& operator <<(std::ostream& lhs, const TriangularFace& rhs)
    {
        lhs << 3;
        for (GLuint i = 0; i < 3; ++i)
            lhs  << " " << rhs[i];
        return lhs;
    }

    // homework -- done
    inline std::istream& operator >>(std::istream& lhs, TriangularFace& rhs) {
        GLuint faces;
        lhs >> faces;

        if (faces != 3) {
            throw new Exception("Not a triangular face!");
        }

        return lhs >> rhs._node[0] >> rhs._node[1] >> rhs._node[2];
    }
}

#endif
