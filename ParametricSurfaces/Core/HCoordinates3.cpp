#include "HCoordinates3.h"

using namespace cagd;
// default constructor
inline HCoordinate3::HCoordinate3()
{
    _data[0] = _data[1] = _data[2] = 0.0;
    _data[3] = 1.0;
}

// special constructor
inline HCoordinate3::HCoordinate3(GLfloat x, GLfloat y, GLfloat z, GLfloat w)
{
    _data[0] = x;
    _data[1] = y;
    _data[2] = z;
    _data[3] = w;
}

// add
inline const HCoordinate3 HCoordinate3::operator +(const HCoordinate3& rhs) const
{
    return HCoordinate3(
            rhs.w() * x() + w() * rhs.x(),
            rhs.w() * y() + w() * rhs.y(),
            rhs.w() * z() + w() * rhs.z(),
            w() * rhs.w());
}

HCoordinate3& HCoordinate3::operator+=(const HCoordinate3& rhs) {
    (*this) = ((*this) + rhs);
    return (*this);
}

// subtract

inline const HCoordinate3 HCoordinate3::operator-(const HCoordinate3& rhs) const {
    return HCoordinate3(
            rhs.w() * x() - w() * rhs.x(),
            rhs.w() * y() - w() * rhs.y(),
            rhs.w() * z() - w() * rhs.z(),
            w() * rhs.w());
}

HCoordinate3& HCoordinate3::operator-=(const HCoordinate3& rhs) {
    (*this) = ((*this) - rhs);
    return (*this);
}

// dot

inline GLfloat HCoordinate3::operator*(const HCoordinate3 &rhs) const {
    return rhs._data[3] * rhs._data[0] * this->_data[3] * this->_data[0] + rhs._data[3] * rhs._data[1] * this->_data[3] * this->_data[1] + rhs._data[3] * rhs._data[2] * this->_data[3] * this->_data[2];
}

// cross

inline const HCoordinate3 HCoordinate3::operator^(const HCoordinate3& rhs) const {
    return HCoordinate3(
        this->_data[0] * rhs._data[2] - this->_data[2] * rhs._data[1],
        this->_data[2] * rhs._data[0] - this->_data[0] * rhs._data[2],
        this->_data[0] * rhs._data[1] - this->_data[1] * rhs._data[0],
        this->_data[3] * rhs._data[3]
    );
}

HCoordinate3& HCoordinate3::operator^=(const HCoordinate3& rhs) {
    (*this) = ((*this) ^ rhs);
    return (*this);
}

//multiplicate with scalar from right
const HCoordinate3 HCoordinate3::operator*(const GLfloat &rhs) const {
    return HCoordinate3(
        this->_data[0] * rhs,
        this->_data[1] * rhs,
        this->_data[2] * rhs,
        this->_data[3]
    );
}

HCoordinate3& HCoordinate3::operator*=(const GLfloat &rhs) {
    (*this) = ((*this) * rhs);
    return (*this);
}

// divide with scalar
const HCoordinate3 HCoordinate3::operator /(const GLfloat &rhs) const {
    return HCoordinate3(
        this->_data[0],
        this->_data[1],
        this->_data[2],
        this->_data[3] * rhs
    );
}

HCoordinate3& HCoordinate3::operator/=(const GLfloat &rhs) {
    (*this) = ((*this) / rhs);
    return (*this);
}

// length of vector represented by hcoordinate

GLfloat HCoordinate3::length() const {
     return std::sqrt((*this) * (*this));
}

// normalize

HCoordinate3& HCoordinate3::normalize() {
    GLfloat l = length();

    if (l && l != 1.0)
        *this /= l;

    return (*this);
}

// homework: get components by value
GLfloat HCoordinate3::operator[](GLuint rhs) const {
    if (rhs >= 4) {
        throw new Exception("HCoordinate3::operator[] array out of bounds!");
    }

    return this->_data[rhs];
}
GLfloat HCoordinate3::x() const {
    return this->_data[0];
}

GLfloat HCoordinate3::y() const {
    return this->_data[1];
}

GLfloat HCoordinate3::z() const {
    return this->_data[2];
}
GLfloat HCoordinate3::w() const {
    return this->_data[3];
}

// homework: get components by reference
GLfloat& HCoordinate3::operator[](GLuint rhs) {
    if (rhs >= 4) {
        throw new Exception("HCoordinate3::operator[] array out of bounds!");
    }

    return this->_data[rhs];
}
GLfloat& HCoordinate3::x() {
    return this->_data[0];
}

GLfloat& HCoordinate3::y() {
    return this->_data[1];
}

GLfloat& HCoordinate3::z() {
    return this->_data[2];
}

GLfloat& HCoordinate3::w() {
    return this->_data[3];
}

// homework: scale from left with a scalar
const HCoordinate3 operator *(GLfloat lhs, const HCoordinate3& rhs) {
    return HCoordinate3(
        lhs * rhs.x(),
        lhs * rhs.y(),
        lhs * rhs.z(),
        rhs.w()
    );
}

// homework: output to stream -- done
inline std::ostream& operator <<(std::ostream& lhs, const HCoordinate3& rhs) {
    lhs << rhs.x() << " " << rhs.y() << " " << rhs.z() << " " << rhs.w();
    return lhs;
}

// homework: input from stream -- done
inline std::istream& operator >>(std::istream& lhs, HCoordinate3& rhs) {
    lhs >> rhs.x() >> rhs.y() >> rhs.z() >> rhs.w();
    return lhs;
}

