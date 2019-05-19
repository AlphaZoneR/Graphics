#include "GLWidget.h"

#if !defined(__APPLE__)
#include <GL/glu.h>
#endif

#include <iostream>
using namespace std;

#include <Core/Exceptions.h>

namespace cagd
{
    //--------------------------------
    // special and default constructor
    //--------------------------------
    GLWidget::GLWidget(QWidget *parent, const QGLFormat &format): QGLWidget(format, parent), show_d1(false), show_d2(false), rotate_y(0), div_points(200)
    {
        this->_timer = new QTimer();
        this->_timer->setTimerType(Qt::PreciseTimer);
        this->_timer->setInterval(1000/60);

        connect(this->_timer, SIGNAL(timeout()), this, SLOT(update()));

        this->_timer->start();
        this->light = nullptr;
    }

    GLWidget::~GLWidget() {
        if (this->parametric_curve) {
            delete this->parametric_curve;
            this->parametric_curve = nullptr;
        }

        if (this->generic_curve) {
            delete this->generic_curve;
            this->generic_curve = nullptr;
        }
    }

    //--------------------------------------------------------------------------------------
    // this virtual function is called once before the first call to paintGL() or resizeGL()
    //--------------------------------------------------------------------------------------
    void GLWidget::initializeGL()
    {
        // creating a perspective projection matrix
        glMatrixMode(GL_PROJECTION);

        glLoadIdentity();

        _aspect = static_cast<double>(this->width()) / static_cast<double>(this->height());
        _z_near = 1.0;
        _z_far  = 1000.0;
        _fovy   = 45.0;

        gluPerspective(_fovy, _aspect, _z_near, _z_far);

        // setting the model view matrix
        glMatrixMode(GL_MODELVIEW);
        glLoadIdentity();

        _eye[0] = _eye[1] = 0.0; _eye[2] = 6.0;
        _center[0] = _center[1] = _center[2] = 0.0;
        _up[0] = _up[2] = 0.0; _up[1] = 1.0;

        gluLookAt(_eye[0], _eye[1], _eye[2], _center[0], _center[1], _center[2], _up[0], _up[1], _up[2]);

        // enabling the depth test
        glEnable(GL_DEPTH_TEST);

        // enable anti-alias

        glEnable(GL_MULTISAMPLE);

        // enabling a bunch of stuff

        glEnable(GL_POINT_SMOOTH);
        glHint(GL_POINT_SMOOTH_HINT, GL_NICEST);

        glEnable(GL_LINE_SMOOTH);
        glHint(GL_LINE_SMOOTH_HINT, GL_NICEST);

        glEnable(GL_POLYGON_SMOOTH);
        glHint(GL_POLYGON_SMOOTH_HINT, GL_NICEST);

        glHint(GL_PERSPECTIVE_CORRECTION_HINT, GL_NICEST);

        glEnable(GL_LIGHTING);
        glEnable(GL_LIGHT0);
        glEnable(GL_NORMALIZE);

        // setting the background color
        glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

        // initial values of transformation parameters
        _angle_x = _angle_y = _angle_z = 0.0;
        _trans_x = _trans_y = _trans_z = 0.0;
        _zoom = 1.0;

        try
        {
            // initializing the OpenGL Extension Wrangler library
            GLenum error = glewInit();

            if (error != GLEW_OK)
            {
                throw Exception("Could not initialize the OpenGL Extension Wrangler Library!");
            }

            if (!glewIsSupported("GL_VERSION_2_0"))
            {
                throw Exception("Your graphics card is not compatible with OpenGL 2.0+! "
                                "Try to update your driver or buy a new graphics adapter!");
            }

            if (this->model.LoadFromOFF("Models/elephant.off", GL_TRUE)) {
                if(this->model.UpdateVertexBufferObjects()) {
                    this->_mouse_angle = 0;
                }
            }
        }
        catch (Exception &e)
        {
            cout << e << endl;
        }

        RowMatrix<ParametricCurve3::Derivative> derivative(3);
        derivative(0) = spiral_on_cone::d0;
        derivative(1) = spiral_on_cone::d1;
        derivative(2) = spiral_on_cone::d2;

        this->parametric_curve = new ParametricCurve3(derivative, spiral_on_cone::u_min, spiral_on_cone::u_max);

        if (!this->parametric_curve) {
            throw new Exception("Could not create parametricCurve from derivative!");
        }

        this->generic_curve = this->parametric_curve->GenerateImage(this->div_points, GL_STATIC_DRAW);

        if (!this->generic_curve) {
            throw new Exception("Could not create genericCurve from parametricCurve!");
        }

        if (!this->generic_curve->UpdateVertexBufferObjects(GL_STATIC_DRAW)) {
            throw new Exception("Could not create VBO for parametric curve!");
        }

//        this->light = new DirectionalLight(GL_LIGHT0, HCoordinate3(0, 0, 1, 0), Color4(0.4 , 0.4 , 0.4 , 1.0), Color4(0.8f, 0.8f, 0.8f, 1.0f), Color4(1.0f, 1.0f, 1.0f, 1.0f));
    }

    //-----------------------
    // the rendering function
    //-----------------------
    void GLWidget::paintGL()
    {

        // UPDATE VARIABLES

        if (this->rotate_y != 0) {
            this->_angle_y += 1;
        }

        this->_mouse_angle += DEG_TO_RADIAN;
        if (this->_mouse_angle >= TWO_PI) {
            this->_mouse_angle = 0;
        }

        GLfloat * vertex = this->model.MapVertexBuffer(GL_READ_WRITE);
        GLfloat * normal = this->model.MapNormalBuffer(GL_READ_ONLY);

        GLfloat scale = static_cast<GLfloat>(sin(this->_mouse_angle) / 3000.0);

        for (size_t i = 0; i < this->model.VertexCount(); ++i) {
            for (size_t j = 0; j < 3; ++j, ++normal, ++vertex) {
                *vertex += scale * (*normal);
            }
        }

        this->model.UnmapVertexBuffer();
        this->model.UnmapNormalBuffer();

        // clears the color and depth buffers
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        glPushMatrix();

            // applying transformations
        glRotatef(_angle_x, 1.0, 0.0, 0.0);            glRotatef(_angle_y, 0.0, 1.0, 0.0);
        glRotatef(_angle_z, 0.0, 0.0, 1.0);
        glTranslated(_trans_x, _trans_y, _trans_z);
        glScaled(_zoom, _zoom, _zoom);

//            // render your geometry (this is oldest OpenGL rendering technique, later we will use some advanced methods)

//            glColor3f(1.0f, 1.0f, 1.0f);
//            glBegin(GL_LINES);
//                glVertex3f(0.0f, 0.0f, 0.0f);
//                glVertex3f(1.1f, 0.0f, 0.0f);

//                glVertex3f(0.0f, 0.0f, 0.0f);
//                glVertex3f(0.0f, 1.1f, 0.0f);

//                glVertex3f(0.0f, 0.0f, 0.0f);
//                glVertex3f(0.0f, 0.0f, 1.1f);
//            glEnd();

//            glBegin(GL_TRIANGLES);
//                // attributes
//                glColor3f(1.0f, 0.0f, 0.0f);
//                // associated with position
//                glVertex3f(1.0f, 0.0f, 0.0f);

//                // attributes
//                glColor3f(0.0, 1.0, 0.0);
//                // associated with position
//                glVertex3f(0.0, 1.0, 0.0);

//                // attributes
//                glColor3f(0.0f, 0.0f, 1.0f);
//                // associated with position
//                glVertex3f(0.0f, 0.0f, 1.0f);
//            glEnd();

        // pops the current matrix stack, replacing the current matrix with the one below it on the stack,
        // i.e., the original model view matrix is restored

        if (this->generic_curve) {


            glLineWidth(1.0f);
            glPointSize(2.0f);
            glColor3f(0.0f, 0.5f, 0.0f);

            if (this->show_d1) {
                this->generic_curve->RenderDerivatives(1, GL_LINES);
                glColor3f(0.0f, 0.8f, 0.0f);
                this->generic_curve->RenderDerivatives(1, GL_POINTS);
            }

            if (this->show_d2) {
                glColor3f(0.1f, 0.5f, 0.9f);
                this->generic_curve->RenderDerivatives(2, GL_LINES);
                glColor3f(1.0f, 1.0f, 1.0f);
                this->generic_curve->RenderDerivatives(2, GL_POINTS);
            }

            glLineWidth(2.0f);
            glColor3f(1.0f, 0.0f, 0.0f);
            this->generic_curve->RenderDerivatives(0, GL_LINE_STRIP);
        }
        glPopMatrix();

        // pops the current matrix stack, replacing the current matrix with the one below it on the stack,
        // i.e., the original model view matrix is restored
    }

    //----------------------------------------------------------------------------
    // when the main window is resized one needs to redefine the projection matrix
    //----------------------------------------------------------------------------
    void GLWidget::resizeGL(int w, int h)
    {
        // setting the new size of the rendering context
        glViewport(0, 0, w, h);

        // redefining the projection matrix
        glMatrixMode(GL_PROJECTION);

        glLoadIdentity();

        _aspect = static_cast<double>(w) / static_cast<double>(h);

        gluPerspective(_fovy, _aspect, _z_near, _z_far);

        // switching back to the model view matrix
        glMatrixMode(GL_MODELVIEW);

//        updateGL();
    }

    //-----------------------------------
    // implementation of the public slots
    //-----------------------------------

    void GLWidget::set_angle_x(int value)
    {
        if (_angle_x != value)
        {
            _angle_x = value;
//            updateGL();
        }
    }

    void GLWidget::set_angle_y(int value)
    {
        if (_angle_y != value)
        {
            _angle_y = value;
//            updateGL();
        }
    }

    void GLWidget::set_angle_z(int value)
    {
        if (_angle_z != value)
        {
            _angle_z = value;
//            updateGL();
        }
    }

    void GLWidget::set_zoom_factor(double value)
    {
        if (_zoom != value)
        {
            _zoom = value;
//            updateGL();
        }
    }

    void GLWidget::set_trans_x(double value)
    {
        if (_trans_x != value)
        {
            _trans_x = value;
//            updateGL();
        }
    }

    void GLWidget::set_trans_y(double value)
    {
        if (_trans_y != value)
        {
            _trans_y = value;
//            updateGL();
        }
    }

    void GLWidget::set_trans_z(double value)
    {
        if (_trans_z != value)
        {
            _trans_z = value;
//            updateGL();
        }
    }

    void GLWidget::wheelEvent(QWheelEvent * qWheelEvent) {
        if (this->_zoom < 0.005 && qWheelEvent->delta() < 0) {
            return;
        }

        if (this->_zoom + (qWheelEvent->delta() / 12000.0) > 0) {
            this->set_zoom_factor(this->_zoom + (qWheelEvent->delta() / 12000.0));
            emit zoom_changed(this->_zoom);
        } else {
            this->_zoom = 0;
        }
    }

    void GLWidget::set_show_d1(int value) {
        this->show_d1 = value;
//        this->updateGL();
    }

    void GLWidget::set_show_d2(int value) {
        this->show_d2 = value;
//        this->updateGL();
    }

    void GLWidget::set_curve(std::string value) {
        RowMatrix<ParametricCurve3::Derivative> derivative(3);
        bool changed = false;
        double u_min, u_max;

        if (value == "simple1") {
            derivative(0) = simple1::d0;
            derivative(1) = simple1::d1;
            derivative(2) = simple1::d2;

            u_min = simple1::u_min;
            u_max = simple1::u_max;

            changed = true;
        } else if (value == "simple2") {
            derivative(0) = simple2::d0;
            derivative(1) = simple2::d1;
            derivative(2) = simple2::d2;

            u_min = simple2::u_min;
            u_max = simple2::u_max;

            changed = true;
        } else if (value == "simple3") {
            derivative(0) = simple3::d0;
            derivative(1) = simple3::d1;
            derivative(2) = simple3::d2;

            u_min = simple3::u_min;
            u_max = simple3::u_max;

            changed = true;
        } else if (value == "simple4") {
            derivative(0) = simple4::d0;
            derivative(1) = simple4::d1;
            derivative(2) = simple4::d2;

            u_min = simple4::u_min;
            u_max = simple4::u_max;

            changed = true;
        } else if (value == "simple5") {
            derivative(0) = simple5::d0;
            derivative(1) = simple5::d1;
            derivative(2) = simple5::d2;

            u_min = simple5::u_min;
            u_max = simple5::u_max;

            changed = true;
        }



        if (changed) {
            if (this->parametric_curve) {
                delete this->parametric_curve;
            }

            if (this->generic_curve) {
                delete this->generic_curve;
            }

            this->parametric_curve= new ParametricCurve3(derivative, u_min, u_max);

            if (!this->parametric_curve) {
                throw new Exception("Could not create parametricCurve from derivative!");
            }

            this->generic_curve = this->parametric_curve->GenerateImage(static_cast<GLuint>(this->div_points), GL_STATIC_DRAW);

            if (!this->generic_curve) {
                throw new Exception("Could not create genericCurve from parametricCurve!");
            }

            if (!this->generic_curve->UpdateVertexBufferObjects(GL_STATIC_DRAW)) {
                throw new Exception("Could not create VBO for parametric curve!");
            }

//            this->updateGL();
        }

    }

    void GLWidget::set_div_points(int value) {
        this->div_points = static_cast<size_t>(value);
        if (this->generic_curve) {
            delete this->generic_curve;
            this->generic_curve = nullptr;;
        }

        this->generic_curve = this->parametric_curve->GenerateImage(static_cast<GLuint>(this->div_points), GL_STATIC_DRAW);


        if (!this->generic_curve) {
            throw new Exception("Could not create genericCurve from parametricCurve!");
        }

        this->generic_curve->UpdateVertexBufferObjects();

//        updateGL();
    }

    void GLWidget::set_rotate_y(int value) {
        this->rotate_y = value;
    }
}
