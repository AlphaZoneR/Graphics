#pragma once

#include <cmath>
#include <GL/glew.h>
#include <iostream>

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
        friend std::ostream& operator <<(std::ostream& lhs, const HCoordinate3& rhs);
        friend std::istream& operator >>(std::istream& lhs, HCoordinate3& rhs);

        // default constructor
        HCoordinate3();

        // special constructor
        HCoordinate3(GLfloat x, GLfloat y, GLfloat z = 0.0, GLfloat w = 1.0);

        // homework: get components by value
        GLfloat operator[](GLuint rhs) const;
        GLfloat x() const;
        GLfloat y() const;
        GLfloat z() const;
        GLfloat w() const;

        // homework: get components by reference
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

    // homework: scale from left with a scalar
    inline const HCoordinate3 operator *(GLfloat lhs, const HCoordinate3& rhs) {
        return HCoordinate3(
            lhs * rhs._data[0],
            lhs * rhs._data[1],
            lhs * rhs._data[2],
            rhs._data[3]
        );
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

    // homework: output to stream
    inline std::ostream& operator <<(std::ostream& lhs, const HCoordinate3& rhs) {
        lhs << rhs._data[0] << " " << rhs._data[1] << " " << rhs._data[2] << " " << rhs._data[3];
        return lhs;
    }

    // homework: input from stream
    inline std::istream& operator >>(std::istream& lhs, HCoordinate3& rhs) {
        lhs >> rhs._data[0] >> rhs._data[1] >> rhs._data[2] >> rhs._data[3];
        return lhs;
    }
}
