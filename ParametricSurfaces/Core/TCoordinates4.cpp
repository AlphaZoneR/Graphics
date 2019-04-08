#include "TCoordinates4.h"

using namespace cagd;

// homework: special constructor
TCoordinate4::TCoordinate4(GLfloat s, GLfloat t, GLfloat r, GLfloat q) {
    this->_data[0] = s;
    this->_data[1] = t;
    this->_data[2] = r;
    this->_data[3] = q;
}

// homework: get components by value
GLfloat TCoordinate4::operator[](GLuint rhs) const {
    return this->_data[rhs];
}

GLfloat TCoordinate4::s() const {
    return this->_data[0];
}

GLfloat TCoordinate4::t() const {
    return this->_data[1];
}

GLfloat TCoordinate4::r() const {
    return this->_data[2];
}
GLfloat TCoordinate4::q() const {
    return this->_data[3];
}

// homework: get components by reference
GLfloat& TCoordinate4::operator[](GLuint rhs) {
    return this->_data[rhs];
}

GLfloat& TCoordinate4::s() {
    return this->_data[0];
}

GLfloat& TCoordinate4::t() {
    return this->_data[1];
}

GLfloat& TCoordinate4::r() {
    return this->_data[2];
}
GLfloat& TCoordinate4::q() {
    return this->_data[3];
}
