#include <cmath>
#include "TestFunctions.h"
#include "../Core/Constants.h"

using namespace cagd;
using namespace std;

GLdouble first_surface::u_min = -TWO_PI;
GLdouble first_surface::u_max = +TWO_PI;

GLdouble first_surface::v_min = -TWO_PI;
GLdouble first_surface::v_max = +TWO_PI;

DCoordinate3 first_surface::d00(double u, double v) {
    return DCoordinate3(sin(u), sin(v), u + v);
}

DCoordinate3 first_surface::d10(double u, double v) {
    return DCoordinate3(cos(u), 0, 1);
}

DCoordinate3 first_surface::d11(double u, double v) {
    return DCoordinate3(0, cos(v), 1);
}

GLdouble second_surface::u_min = -TWO_PI;
GLdouble second_surface::u_max = +TWO_PI;

GLdouble second_surface::v_min = -TWO_PI;
GLdouble second_surface::v_max = +TWO_PI;

DCoordinate3 second_surface::d00(double u, double v) {
    return DCoordinate3(sin(u), sin(v), sin(u + v));
}

DCoordinate3 second_surface::d10(double u, double v) {
    return DCoordinate3(cos(u), 0, cos(u + v));
}

DCoordinate3 second_surface::d11(double u, double v) {
    return DCoordinate3(0, cos(v), cos(u + v));
}

GLdouble third_surface::u_min = -TWO_PI;
GLdouble third_surface::u_max = +TWO_PI;

GLdouble third_surface::v_min = -TWO_PI;
GLdouble third_surface::v_max = +TWO_PI;

DCoordinate3 third_surface::d00(double u, double v) {
    return DCoordinate3((2 + cos(u)) * cos(v), (2 + cos(u)) * sin(v), 2 + sin(u));
}

DCoordinate3 third_surface::d10(double u, double v) {
    return DCoordinate3(-2 * sin(u) * cos(v), -2 * sin(u) * sin(v), cos(u));
}

DCoordinate3 third_surface::d11(double u, double v) {
    return DCoordinate3(-2 * sin(v) * cos(u), 2 * cos(v) * cos(u), 0);
}

GLdouble fourth_surface::u_min = -TWO_PI;
GLdouble fourth_surface::u_max = +TWO_PI;
 
GLdouble fourth_surface::v_min = -TWO_PI / 8;
GLdouble fourth_surface::v_max = +TWO_PI / 8;

DCoordinate3 fourth_surface::d00(double u, double v) {
    return DCoordinate3(cos(u), sin(u), v * (cos(u) + sin(u) + 10));
}

DCoordinate3 fourth_surface::d10(double u, double v) {
    return DCoordinate3(-sin(u), cos(u), v * (-sin(u) + cos(u)));
}

DCoordinate3 fourth_surface::d11(double u, double v) {
    return DCoordinate3(0, 0, sin(u) + cos(u) + 10);
}

GLdouble fifth_surface::u_min = -1;
GLdouble fifth_surface::u_max = +1;
 
GLdouble fifth_surface::v_min = -1;
GLdouble fifth_surface::v_max = +1;

DCoordinate3 fifth_surface::d00(double u, double v) {
    return DCoordinate3(u, v, u * u - v * v);
}

DCoordinate3 fifth_surface::d10(double u, double v) {
    return DCoordinate3(1, 0, 2 * u);
}

DCoordinate3 fifth_surface::d11(double u, double v) {
    return DCoordinate3(0, 1, 2 * v);
}

GLdouble sixth_surface::u_min = -1;
GLdouble sixth_surface::u_max = +1;
 
GLdouble sixth_surface::v_min = -1;
GLdouble sixth_surface::v_max = +1;

DCoordinate3 sixth_surface::d00(double u, double v) {
    return DCoordinate3(u * (1 / cos(v)), u * tan(v), u * u);
}

DCoordinate3 sixth_surface::d10(double u, double v) {
    return DCoordinate3(1 / cos(v), tan(v), 2 * u);
}

DCoordinate3 sixth_surface::d11(double u, double v) {
    return DCoordinate3(u * tan(v) * (1 / cos(v)), u * (1 / cos(v) * (1 / cos(v)), 0));
}
