#pragma once

#include <GL/glew.h>
#include <QGLWidget>
#include <QGLFormat>
#include <QWheelEvent>
#include <QTimer>

#include "Core/ParametricSurfaces3.h"
#include "Core/TestFunctions.h"
#include "Core/Constants.h"
#include "Core/TriangulatedMeshes3.h"
#include "Core/Materials.h"
#include "Core/Lights.h"

namespace cagd
{
    class GLWidget: public QGLWidget
    {
        Q_OBJECT

    private:
        QTimer       *_timer;
        // variables defining the projection matrix
        double       _aspect;            // aspect ratio of the rendering window
        double       _fovy;              // field of view in direction y
        double       _z_near, _z_far;    // distance of near and far clipping planes

        // variables defining the model-view matrix
        double       _eye[3], _center[3], _up[3];

        // variables needed by transformations
        int         _angle_x, _angle_y, _angle_z;
        double      _mouse_angle;
        double      _zoom;
        double      _trans_x, _trans_y, _trans_z;

        // your other declarations

        ParametricSurface3        * parametric_surface;
        TriangulatedMesh3         * parametric_mesh;

        int                    show_d1;
        int                    show_d2;
        int                    rotate_y;
        size_t                 div_points;

        TriangulatedMesh3      model;
        cagd::DirectionalLight  * light;

    public:
        // special and default constructor
        // the format specifies the properties of the rendering window
        GLWidget(QWidget* parent = nullptr, const QGLFormat& format = QGL::Rgba | QGL::DepthBuffer | QGL::DoubleBuffer);
        ~GLWidget() override;

        // redeclared virtual functions
        void initializeGL() override;
        void paintGL() override;
        void resizeGL(int w, int h) override;
        void wheelEvent(QWheelEvent *) override;

    public slots:
        // public event handling methods/slots
        void set_angle_x(int value);
        void set_angle_y(int value);
        void set_angle_z(int value);

        void set_div_points(int value);

        void set_zoom_factor(double value);

        void set_show_d1(int value);
        void set_show_d2(int value);
        void set_rotate_y(int value);

        void set_trans_x(double value);
        void set_trans_y(double value);
        void set_trans_z(double value);

        void set_curve(std::string);


    signals :
        // some value changed
        void zoom_changed(double value);
    };
}
