cmake_minimum_required(VERSION 3.10)
project(AutomationEngine VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

find_package(nlohmann_json CONFIG REQUIRED)

add_executable(automation_engine
    src/main.cpp
    src/ShellTask.cpp
    src/core/BaseTask.cpp
    src/core/Parser.cpp
    src/core/SecurityUtils.cpp
    src/core/VariableManager.cpp
    src/core/Worker.cpp
)

target_include_directories(automation_engine PRIVATE include/core)

target_link_libraries(automation_engine PRIVATE nlohmann_json::nlohmann_json)

install(TARGETS automation_engine DESTINATION bin)