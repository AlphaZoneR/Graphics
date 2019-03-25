#include <cmath>
#include "TestFunctions.h"
#include "../Core/Constants.h"

using namespace cagd;
using namespace std;

GLdouble spiral_on_cone::u_min = -TWO_PI;
GLdouble spiral_on_cone::u_max = +TWO_PI;

DCoordinate3 spiral_on_cone::d0(GLdouble u)
{
    return DCoordinate3(u * cos(u), u * sin(u), u);
}

DCoordinate3 spiral_on_cone::d1(GLdouble u)
{
    GLdouble c = cos(u), s = sin(u);
    return DCoordinate3(c - u * s, s + u * c, 1.0);
}

DCoordinate3 spiral_on_cone::d2(GLdouble u)
{
    GLdouble c = cos(u), s = sin(u);
    return DCoordinate3(-2.0 * s - u * c, 2.0 * c - u * s, 0);
}

GLdouble simple1::u_min = -TWO_PI;
GLdouble simple1::u_max = +TWO_PI;


DCoordinate3 simple1::d0(GLdouble u)
{
    return DCoordinate3(u, cos(2 * u), sin(2 * u));
}

DCoordinate3 simple1::d1(GLdouble u)
{
    return DCoordinate3(1, -2 * sin(2 * u), 2 * cos(2 * u));
}

DCoordinate3 simple1::d2(GLdouble u)
{

    return DCoordinate3(1, -4 * cos(2 * u), -4 * sin(2 * u));
}

GLdouble simple2::u_min = -TWO_PI;
GLdouble simple2::u_max = +TWO_PI;


DCoordinate3 simple2::d0(GLdouble u)
{
    return DCoordinate3(u * cos(u), u * sin(u), u * u);
}

DCoordinate3 simple2::d1(GLdouble u)
{
    return DCoordinate3(cos(u) - u * sin(u), sin(u) + u * cos(u), 2 * u);
}

DCoordinate3 simple2::d2(GLdouble u)
{

    return DCoordinate3(-2 * sin(u) - u * cos(u), 2 * cos(u) - u * sin(u), 2);
}

GLdouble simple3::u_min = 0;
GLdouble simple3::u_max = +TWO_PI;


DCoordinate3 simple3::d0(GLdouble u)
{
    return DCoordinate3(3 * cos(u) + cos(3 * u), 3 * sin(u) - sin(3 * u), sin(u));
}

DCoordinate3 simple3::d1(GLdouble u)
{
    return DCoordinate3(-3 * (sin(u) + sin(3 * u)), 3 * (cos(u) - cos(3 * u)), -cos(u));
}

DCoordinate3 simple3::d2(GLdouble u)
{

    return DCoordinate3(-3 * (cos(u) + 3 * cos(3 * u)), 9 * sin(3 * u) - 3 * sin(u), -sin(u));
}

GLdouble simple4::u_min = -TWO_PI;
GLdouble simple4::u_max = +TWO_PI;


DCoordinate3 simple4::d0(GLdouble u)
{
    return DCoordinate3(pow(E, u) + u * u, pow(E, 2 * u) + 3 * u, u);
}

DCoordinate3 simple4::d1(GLdouble u)
{
    return DCoordinate3(pow(E, u) + 2 * u, 2 * pow(E, 2 * u) + 3, 1);
}

DCoordinate3 simple4::d2(GLdouble u)
{

    return DCoordinate3(pow(E, u) + 2, 4 * pow(E, 2 * u), 0);
}

GLdouble simple5::u_min = -TWO_PI;
GLdouble simple5::u_max = +TWO_PI;

DCoordinate3 simple5::d0(GLdouble u)
{
    return DCoordinate3( cos(u),  sin(u), 2*u);
}

DCoordinate3 simple5::d1(GLdouble u)
{
    GLdouble c = cos(u), s = sin(u);
    return DCoordinate3(s, c , 2.0);
}

DCoordinate3 simple5::d2(GLdouble u)
{
    GLdouble c = cos(u), s = sin(u);
    return DCoordinate3(c, - s, 0);
}
