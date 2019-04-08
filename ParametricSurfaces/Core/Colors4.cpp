#include "Colors4.h"

using namespace cagd;

// homework: get components by value
GLfloat Color4::operator [](GLuint rhs) const {
    return this->_data[rhs];
}

GLfloat Color4::r() const {
    return this->_data[0];
}
GLfloat Color4::g() const {
    return this->_data[1];
}
GLfloat Color4::b() const {
    return this->_data[2];
}
GLfloat Color4::a() const {
    return this->_data[3];
}

// homework: get components by reference
GLfloat& Color4::operator [](GLuint rhs) {
    return this->_data[rhs];
}

GLfloat& Color4::r() {
    return this->_data[0];
}

GLfloat& Color4::g() {
    return this->_data[1];
}

GLfloat& Color4::b() {
    return this->_data[2];
}

GLfloat& Color4::a() {
    return this->_data[3];
}
