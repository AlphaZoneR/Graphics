#include <QApplication>
#include "GUI/MainWindow.h"
#include "Core/test.h"


using namespace cagd;

int main(int argc, char **argv)
{
//    std::cout << "hello wrold!" << std::endl;
    Test::DCoordinate_Test();
    Test::Matrix_Test();
}
