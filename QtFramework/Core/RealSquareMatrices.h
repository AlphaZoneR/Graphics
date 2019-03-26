#pragma once

#include <GL/glew.h>
#include <limits>
#include <cmath>
#include "Matrices.h"

namespace cagd
{
    class RealSquareMatrix: public Matrix<GLdouble>
    {
    private:
        GLboolean           _lu_decomposition_is_done;
        std::vector<GLuint> _row_permutation;

    public:
        // special/default constructor
        RealSquareMatrix(GLuint size = 1);

        // copy constructor
        RealSquareMatrix(const RealSquareMatrix& m); // do -- done

        // assignment operator
        RealSquareMatrix& operator =(const RealSquareMatrix& rhs); // do -- done

        // square matrices have the same number of rows and columns!
        GLboolean ResizeRows(GLuint row_count); // do
        GLboolean ResizeColumns(GLuint row_count); // do

        // when writing the above use parent class
        // initialize class variables

        // tries to determine the LU decomposition of this square matrix
        GLboolean PerformLUDecomposition();

        // Solves linear systems of type A * x = b, where A is a regular square matrix,
        // while b and x are row or column matrices with elements of type T.
        // Here matrix A corresponds to *this.
        // Advantage: T can be either GLdouble or DCoordinate, 
        // or any other type which has similar mathematical operators.
        template <class T>
        GLboolean SolveLinearSystem(const Matrix<T>& b, Matrix<T>& x, GLboolean represent_solutions_as_columns = GL_TRUE);
    };

    template <class T>
    GLboolean RealSquareMatrix::SolveLinearSystem(const Matrix<T>& b, Matrix<T>& x, GLboolean represent_solutions_as_columns)
    {
        if (!_lu_decomposition_is_done)
            if (!PerformLUDecomposition())
                return GL_FALSE;

        if (represent_solutions_as_columns)
        {
            GLuint size = GetColumnCount();
            if (static_cast<GLuint>(b.GetRowCount()) != size)
                    return GL_FALSE;

            x = b;

            for (GLuint k = 0; k < b.GetColumnCount(); ++k)
            {
                GLuint ii = 0;
                for (GLuint i = 0; i < size; ++i)
                {
                    GLuint ip = _row_permutation[i];
                    T sum = x(ip, k);
                    x(ip, k) = x(i, k);
                    if (ii != 0)
                        for (GLuint j = ii - 1; j < i; ++j)
                            sum -= _data[i][j] * x(j, k);
                    else
                        if (sum != 0.0)
                            ii = i + 1;
                    x(i, k) = sum;
                }

                for (GLint i = static_cast<GLint>(size - 1); i >= 0; --i)
                {
                    T sum = x(i, k);
                    for (GLuint j = static_cast<GLuint>(i + 1); j < size; ++j)
                        sum -= _data[i][j] * x(j, k);
                    x(i, k) = sum /= _data[i][i];
                }
            }
        }
        else
        {
            GLuint size = GetRowCount();
            if (static_cast<GLuint>(b.GetColumnCount()) != size)
                return GL_FALSE;

            x = b;

            for (GLuint k = 0; k < b.GetRowCount(); ++k)
            {
                GLuint ii = 0;
                for (GLuint i = 0; i < size; ++i)
                {
                    GLuint ip = _row_permutation[i];
                    T sum = x(k, ip);
                    x(k, ip) = x(k, i);
                    if (ii != 0)
                        for (GLuint j = ii - 1; j < i; ++j)
                            sum -= _data[i][j] * x(k, j);
                    else
                        if (sum != 0.0)
                            ii = i + 1;
                    x(k, i) = sum;
                }

                for (GLint i = static_cast<GLint>(size) - 1; i >= 0; --i)
                {
                    T sum = x(k, i);
                    for (GLuint j = static_cast<GLuint>(i) + 1; j < size; ++j)
                        sum -= _data[i][j] * x(k, j);
                    x(k, i) = sum /= _data[i][i];
                }
            }
        }

        return GL_TRUE;
    }

}
