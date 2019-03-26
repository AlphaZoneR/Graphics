#pragma once

#include <iostream>
#include <vector>
#include <GL/glew.h>

namespace cagd
{
    // forward declaration of template class Matrix
    template <typename T>
    class Matrix;

    // forward declaration of template class RowMatrix
    template <typename T>
    class RowMatrix;

    // forward declaration of template class ColumnMatrix
    template <typename T>
    class ColumnMatrix;

    // forward declaration of template class TriangularMatrix
    template <typename T>
    class TriangularMatrix;

    // forward declarations of overloaded and templated input/output from/to stream operators
    template <typename T>
    std::ostream &operator<<(std::ostream &lhs, const Matrix<T> &rhs);

    template <typename T>
    std::istream &operator>>(std::istream &lhs, Matrix<T> &rhs);

    template <typename T>
    std::istream &operator>>(std::istream &lhs, TriangularMatrix<T> &rhs);

    template <typename T>
    std::ostream &operator<<(std::ostream &lhs, const TriangularMatrix<T> &rhs);

    //----------------------
    // template class Matrix
    //----------------------
    template <typename T>
    class Matrix
    {
        friend std::ostream &cagd::operator<< <T>(std::ostream &, const Matrix<T> &rhs);
        friend std::istream &cagd::operator>><T>(std::istream &, Matrix<T> &rhs);

      protected:
        GLuint _column_count;
        GLuint _row_count;
        std::vector<std::vector<T>> _data;

      public:
        // special constructor (can also be used as a default constructor)
        Matrix(GLuint row_count = 1, GLuint column_count = 1);

        // copy constructor
        Matrix(const Matrix &m);

        // assignment operator
        Matrix &operator=(const Matrix &m);

        // get element by reference
        T &operator()(GLuint row, GLuint column);

        // get copy of an element
        T operator()(GLuint row, GLuint column) const;

        // get dimensions
        GLuint GetRowCount() const;
        GLuint GetColumnCount() const;

        // set dimensions
        virtual GLboolean ResizeRows(GLuint row_count);
        virtual GLboolean ResizeColumns(GLuint column_count);

        // update
        GLboolean SetRow(GLuint index, const RowMatrix<T> &row);
        GLboolean SetColumn(GLuint index, const ColumnMatrix<T> &column);

        // destructor
        virtual ~Matrix();
    };

    //-------------------------
    // template class RowMatrix
    //-------------------------
    template <typename T>
    class RowMatrix : public Matrix<T>
    {
      public:
        // special constructor (can also be used as a default constructor)
        RowMatrix(GLuint column_count = 1);

        // get element by reference
        T &operator()(GLuint column);
        T &operator[](GLuint column);

        // get copy of an element
        T operator()(GLuint column) const;
        T operator[](GLuint column) const;

        // a row matrix consists of a single row
        GLboolean ResizeRows(GLuint row_count);
    };

    //----------------------------
    // template class ColumnMatrix
    //----------------------------
    template <typename T>
    class ColumnMatrix : public Matrix<T>
    {
      public:
        // special constructor (can also be used as a default constructor)
        ColumnMatrix(GLuint row_count = 1);

        // get element by reference
        T &operator()(GLuint row);
        T &operator[](GLuint row);

        // get copy of an element
        T operator()(GLuint row) const;
        T operator[](GLuint row) const;

        // a column matrix consists of a single column
        GLboolean ResizeColumns(GLuint column_count);
    };

    //--------------------------------
    // template class TriangularMatrix
    //--------------------------------
    template <typename T>
    class TriangularMatrix
    {
        friend std::istream &cagd::operator>><T>(std::istream &, TriangularMatrix<T> &rhs);
        friend std::ostream &cagd::operator<<<T>(std::ostream &, const TriangularMatrix<T> &rhs);

      protected:
        GLuint _row_count;
        std::vector<std::vector<T>> _data;

      public:
        // special constructor (can also be used as a default constructor)
        TriangularMatrix(GLuint row_count = 1);

        // get element by reference
        T &operator()(GLuint row, GLuint column);

        // get copy of an element
        T operator()(GLuint row, GLuint column) const;

        // get dimension
        GLuint GetRowCount() const;

        // set dimension
        GLboolean ResizeRows(GLuint row_count);
    };

    /* Beggining of Matrix implementation */

    template <typename T>
    Matrix<T>::Matrix(GLuint row_count, GLuint column_count) : _row_count(row_count), _column_count(column_count),
    _data(row_count, std::vector<T>(column_count)) {}

    // copy constructor
    template <typename T>
    Matrix<T>::Matrix(const Matrix &m): _row_count(m._row_count), _column_count(m._column_count), _data(m._data) {}

    // assignment operator
    template <typename T>
    Matrix<T> &Matrix<T>::operator=(const Matrix &m)
    {
        if (&m != this)
        {
            this->_row_count = m._row_count;
            this->_column_count = m._column_count;
            this->_data = m._data;
        }

        return (*this);
    }

    // get element by reference
    template <typename T>
    T &Matrix<T>::operator()(GLuint row, GLuint column)
    {
        return this->_data[row][column];
    }

    // get copy of an element
    template <typename T>
    T Matrix<T>::operator()(GLuint row, GLuint column) const
    {
        return this->_data[row][column];
    }

    // get dimensions
    template <typename T>
    GLuint Matrix<T>::GetRowCount() const
    {
        return this->_row_count;
    }

    template <typename T>
    GLuint Matrix<T>::GetColumnCount() const
    {
        return this->_column_count;
    }

    // set dimensions
    template <typename T>
    GLboolean Matrix<T>::ResizeRows(GLuint row_count)
    {
        _data.resize(row_count, std::vector<T>(this->_column_count));
        this->_row_count = row_count;
        return GL_TRUE;
    }

    template <typename T>
    GLboolean Matrix<T>::ResizeColumns(GLuint column_count)
    {
        for (auto &row : this->_data)
        {
            row.resize(column_count);
        }
        this->_column_count = column_count;
        return GL_TRUE;
    }

    // update

    template <typename T>
    GLboolean Matrix<T>::SetRow(GLuint index, const RowMatrix<T> &row)
    {
        if (index >= this->_row_count || row._column_count != this->_column_count) {
            return GL_FALSE;
        }

        // implemet if index not in range and column counts match -- done
        this->_data[index] = row._data[0];

        return GL_TRUE;
    }

    template <typename T>
    GLboolean Matrix<T>::SetColumn(GLuint index, const ColumnMatrix<T> &column)
    {

        if (column->_row_count != this->_row_count || index >= this->_column_count) {
            return GL_FALSE;
        }
        // implemet if index not in range and row counts match -- done
        for (size_t i = 0; i < this->_row_count; ++i)
        {
            this->_data[i][index] = column._data[i][0];
        }

        return GL_TRUE;
    }

    // destructor
    template <typename T>
    Matrix<T>::~Matrix()
    {
        this->_row_count = 0;
        this->_column_count = 0;
        this->_data.clear();
    }

    /* End of Matrix implementation */

    /* Beggining of RowMatrix implementation */

    template <typename T>
    RowMatrix<T>::RowMatrix(GLuint column_count): Matrix<T> (1, column_count) {}

    // get element by reference
    template <typename T>
    T &RowMatrix<T>::operator()(GLuint column)
    {
        return this->_data[0][column];
    }

    template <typename T>
    T &RowMatrix<T>::operator[](GLuint column)
    {
        return this->_data[0][column];
    }

    // get copy of an element
    template <typename T>
    T RowMatrix<T>::operator()(GLuint column) const
    {
        return this->_data[0][column];
    }

    template <typename T>
    T RowMatrix<T>::operator[](GLuint column) const
    {
        return this->_data[0][column];
    }

    // a row matrix consists of a single row
    template <typename T>
    GLboolean RowMatrix<T>::ResizeRows(GLuint row_count)
    {
        return row_count == 1;
    }

    /* End of RowMatrix implementation */

    /* Beggining of ColumnMatrix implementation */

    template <typename T>
    ColumnMatrix<T>::ColumnMatrix(GLuint row_count): Matrix<T>(row_count, 1) {}

    // get element by reference
    template <typename T>
    T &ColumnMatrix<T>::operator()(GLuint row)
    {
        return this->_data[row][0];
    }

    template <typename T>
    T &ColumnMatrix<T>::operator[](GLuint row)
    {
        return this->_data[row][0];
    }

    // get copy of an element
    template <typename T>
    T ColumnMatrix<T>::operator()(GLuint row) const
    {
        return this->_data[row][0];
    }

    template <typename T>
    T ColumnMatrix<T>::operator[](GLuint row) const
    {
        return this->_data[row][0];
    }

    // a column matrix consists of a single column
    template <typename T>
    GLboolean ColumnMatrix<T>::ResizeColumns(GLuint column_count)
    {
        return column_count == 1;
    }

    /* End of ColumnMatrix implementation */

    /* Beggining of TriangularMatrix implementation */
    template<typename T>
    TriangularMatrix<T>::TriangularMatrix(GLuint row_count) : _row_count(row_count), _data(row_count, std::vector<T>(0)) {
        size_t i = 1;
        for (auto &row: this->_data) {
            row.resize(i++);
        }
    }

    // get element by reference
    template<typename T>
    T& TriangularMatrix<T>::operator()(GLuint row, GLuint column) {
        return this->_data[row][column];
    }

    // get copy of an element
    template<typename T>
    T TriangularMatrix<T>::operator()(GLuint row, GLuint column) const {
        return this->_data[row][column];
    }

    // get dimension
    template<typename T>
    GLuint TriangularMatrix<T>::GetRowCount() const {
        return this->_row_count;
    }

    // set dimension
    template<typename T>
    GLboolean TriangularMatrix<T>::ResizeRows(GLuint row_count) {
        if (row_count == this->_row_count) {
            return GL_TRUE;
        }

        if (row_count > this->_row_count) {
            size_t diff = static_cast<size_t>(row_count - this->_row_count);
            for (size_t i = 0; i < diff; ++i) {
                this->_data.push_back(std::vector<T>(this->_row_count + 1));
                ++this->_row_count;
            }

            return GL_TRUE;
        }

        if (row_count < this->_row_count) {
            size_t diff = this->_row_count - row_count;
            for (size_t i = 0; i < diff; ++i) {
                this->_data.pop_back();
            }

            this->_row_count = row_count;
            return GL_TRUE;
        }


        // optimize only new -- done;
    }


    /* End of TriangularMatrix implementation */

    // output to stream
    template <typename T>
    std::ostream &operator<<(std::ostream &lhs, const Matrix<T> &rhs)
    {
        lhs << rhs._row_count << " " << rhs._column_count << std::endl;
        for (typename std::vector<std::vector<T>>::const_iterator row = rhs._data.begin();
             row != rhs._data.end(); ++row)
        {
            for (typename std::vector<T>::const_iterator column = row->begin();
                 column != row->end(); ++column)
                lhs << *column << " ";
            lhs << std::endl;
        }
        return lhs;
    }

    // input from stream
    template <typename T>
    std::istream &operator>>(std::istream &lhs, Matrix<T> &rhs)
    {
        lhs >> rhs._row_count >> rhs._column_count;
        rhs.ResizeRows(rhs._row_count);
        rhs.ResizeColumns(rhs._column_count);

        for (auto &row : rhs._data) {
            for (auto &column : row) {
                lhs >> column;
            }
        }

        return lhs;
    }

    template <typename T>
    std::ostream &operator<<(std::ostream &lhs, const TriangularMatrix<T> &rhs) {
        lhs << rhs._row_count << std::endl;

        for (const auto &row: rhs._data) {
            for (const auto &col: row) {
                lhs << col << " ";
            }
            lhs << std::endl;
        }

        return lhs;
    }

    template <typename T>
    std::istream &operator>>(std::istream &lhs, TriangularMatrix<T> &rhs) {
        lhs >> rhs._row_count;
        rhs.ResizeRows(rhs._row_count);

        for (auto &row : rhs._data) {
            for (T &col: row) {
                lhs >> col;
            }
        }

        return lhs;
    }
} // namespace cagd
