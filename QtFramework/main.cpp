#include <QApplication>
#include "GUI/MainWindow.h"
#include "Core/test.h"
#include <memory>


using namespace cagd;

int main(int argc, char **argv)
{
    QApplication::setAttribute(Qt::AA_EnableHighDpiScaling, true);

    std::unique_ptr<QApplication> app(new QApplication(argc, argv));
    app->setAttribute(Qt::AA_UseDesktopOpenGL, true);

    std::unique_ptr<MainWindow> mainWindow(new MainWindow());

    mainWindow->showMaximized();

    return app->exec();
}
