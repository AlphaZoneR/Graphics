#ifndef TEST_H
#define TEST_H

#include "DCoordinates3.h"
#include "Matrices.h"

#include <fstream>
#include <exception>

using namespace cagd;

class Test
{
public:
    static void DCoordinate_Test() {
        DCoordinate3 a(0, 0, 0);
        DCoordinate3 b(1, 2, 3);
        DCoordinate3 identity(1, 1, 1);

        DCoordinate3 c = a + b;

        if (c.x() != 1.0 || c.y() != 2.0 || c.z() != 3.0) {
            throw std::exception("Invalid summation");
        }

        c = a - b;

        if (c.x() != -1.0 || c.y() != -2.0 || c.z() != -3.0) {
            throw std::exception("Invalid difference");
        }

        c = 4 * b;

        if (c.x() != 4.0 || c.y() != 8.0 || c.z() != 12.0) {
            throw std::exception("Invalid multiply");
        }

        c = c / 4;

        if (c.x() != 1.0 || c.y() != 2.0 || c.z() != 3.0) {
            throw std::exception("Invalid division");
        }

        c = identity ^ b;

        if (c.x() != 1.0 || c.y() != -2.0 || c.z() != 1.0) {
            throw std::exception("Invalid cross product");
        }

        GLdouble d = identity * b;

        if (d != 6.0) {
            throw std::exception("Invalid dot product");
        }

        a += b;

        if (a.x() != 1.0 || a.y() != 2.0 || a.z() != 3.0) {
            throw std::exception("Invalid =summation");
        }

        a -= b;

        if (a.x() != 0.0 || a.y() != 0.0 || a.z() != 0.0) {
            throw std::exception("Invalid =differentiation");
        }

        a = b;

        if (a.x() != 1.0 || a.y() != 2.0 || a.z() != 3.0) {
            throw std::exception("Invalid = equal operator");
        }

        a *= 2;

        if (a.x() != 2.0 || a.y() != 4.0 || a.z() != 6.0) {
            throw std::exception("Invalid =multiplication");
        }

        a /= 2;

        if (a.x() != 1.0 || a.y() != 2.0 || a.z() != 3.0) {
            throw std::exception("Invalid =division");
        }

    }

    static void Matrix_Test() {
        std::ifstream in("test.txt");

        if (in.fail()) {
            throw std::exception("cannot open file");
        }

        Matrix<GLfloat> m;

        in >> m;


        std::cout << m << std::endl;

        m.ResizeColumns(4);

        std::cout << m << std::endl;

        m.ResizeRows(2);

        std::cout << m << std::endl;

        RowMatrix<GLint> r(5);
        r.ResizeColumns(3);

        std::cout << r << std::endl;

        ColumnMatrix<GLint> c(5);
        c.ResizeRows(3);

        std::cout << c << std::endl;

        TriangularMatrix<GLint> t;

        in >> t;

        std::cout << t << std::endl;
    }

};

#endif // TEST_H
