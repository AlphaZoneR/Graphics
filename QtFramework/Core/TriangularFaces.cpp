#include "TriangularFaces.h"

using namespace cagd;

// homework: copy constructor
TriangularFace::TriangularFace(const TriangularFace& face) {
    this->_node[0] = face._node[0];
    this->_node[1] = face._node[1];
    this->_node[2] = face._node[2];
}

// homework: assignment operator
TriangularFace& TriangularFace::operator=(const TriangularFace& rhs) {
    if (&rhs != this) {
        this->_node[0] = rhs._node[0];
        this->_node[1] = rhs._node[1];
        this->_node[2] = rhs._node[2];
    }

    return (*this);
}

// homework: get node identifiers by value
GLuint TriangularFace::operator[](GLuint i) const {
    if (i >= 3) {
        throw new Exception("TriangularFace::operator[] array out of bounds!");
    }

    return this->_node[i];
}

// homework: get node identifiers by reference
GLuint& TriangularFace::operator[](GLuint i) {
    if (i >= 3) {
        throw new Exception("TriangularFace::operator[] array out of bounds!");
    }

    return this->_node[i];
}
