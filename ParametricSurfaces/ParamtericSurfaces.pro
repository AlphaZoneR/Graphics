QT += core gui widgets opengl

win32 {
    message("Windows platform...")

    INCLUDEPATH += $$PWD/Dependencies/Include
    DEPENDPATH += $$PWD/Dependencies/Include

    LIBS += -lopengl32 -lglu32

    CONFIG(release, debug|release): {
        contains(QT_ARCH, i386) {
            message("x86 (i.e., 32-bit) release build")
            LIBS += -L"$$PWD/Dependencies/Lib/GL/x86/" -lglew32
        } else {
            message("x86_64 (i.e., 64-bit) release build")
            LIBS += -L"$$PWD/Dependencies/Lib/GL/x86_64/" -lglew32
        }
    } else: CONFIG(debug, debug|release): {
        contains(QT_ARCH, i386) {
            message("x86 (i.e., 32-bit) debug build")
            LIBS += -L"$$PWD/Dependencies/Lib/GL/x86/" -lglew32
        } else {
            message("x86_64 (i.e., 64-bit) debug build")
            LIBS += -L"$$PWD/Dependencies/Lib/GL/x86_64" -lglew32
        }
    }

    msvc {
      QMAKE_CXXFLAGS += -openmp -arch:AVX -D "_CRT_SECURE_NO_WARNINGS"
      QMAKE_CXXFLAGS_RELEASE *= -O2
    }
}

unix: !mac {
    QMAKE_CXXFLAGS -= -Wreorder
    QMAKE_CXXFLAGS += -O2
    # for GLEW installed into /usr/lib/libGLEW.so or /usr/lib/glew.lib
    LIBS += -lGLEW -lGLU
}

mac {
    message("Macintosh platform...")

    # IMPORTANT: change the letters x, y, z in the next two lines
    # to the corresponding version numbers of the GLEW library
    # which was installed by using the command 'brew install glew'
    INCLUDEPATH += "/usr/local/Cellar/glew/x.y.z/include/"
    LIBS += -L"/usr/local/Cellar/glew/x.y.z/lib/" -lGLEW

    # the OpenGL library has to added as a framework
    LIBS += -framework OpenGL
}


FORMS += \
    GUI/MainWindow.ui \
    GUI/SideWidget.ui

HEADERS += \
    Core/Constants.h \
    Core/GenericCurves3.h \
    Core/ParametricCurves3.h \
    Core/TestFunctions.h \
    Core/Exceptions.h \
    Core/DCoordinates3.h \
    Core/Matrices.h \
    Core/test.h \
    Core/Colors4.h \
    Core/HCoordinates3.h \
    Core/Lights.h \
    Core/Materials.h \
    Core/TCoordinates4.h \
    Core/TriangularFaces.h \
    Core/TriangulatedMeshes3.h \
    Core/RealSquareMatrices.h \
    GUI/GLWidget.h \
    GUI/MainWindow.h \
    GUI/SideWidget.h \
    Core/ParametricSurfaces3.h


SOURCES += \
    Core/RealSquareMatrices.cpp \
    Core/GenericCurves3.cpp \
    Core/ParametricCurves3.cpp \
    Core/TestFunctions.cpp \
    Core/test.cpp \
    Core/Lights.cpp \
    Core/Materials.cpp \
    Core/TriangulatedMeshes3.cpp \
    Core/Colors4.cpp \
    Core/TCoordinates4.cpp \
    Core/TriangularFaces.cpp \
    Core/HCoordinates3.cpp \
    GUI/GLWidget.cpp \
    GUI/MainWindow.cpp \
    GUI/SideWidget.cpp \
    main.cpp \
    Core/ParametricSurfaces3.cpp


