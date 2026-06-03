#!/bin/bash
# Automation Engine: Clean-Build-Execute Script

set -e # Exit immediately if any command fails

echo "[1/4] Cleaning previous build environment..."
rm -rf build
mkdir build

echo "[2/4] Generating CMake configuration..."
cat << 'EOF' > CMakeLists.txt
cmake_minimum_required(VERSION 3.10)
project(AutomationEngine)

set(CMAKE_CXX_STANDARD 17)
include_directories(backend/include)

add_executable(automation_engine 
    src/main.cpp 
    src/core/Parser.cpp 
    src/core/VariableManager.cpp 
    src/core/Worker.cpp 
    src/integrations/SecurityUtils.cpp
)

find_package(nlohmann_json CONFIG REQUIRED)
target_link_libraries(automation_engine PRIVATE nlohmann_json::nlohmann_json)
EOF

echo "[3/4] Compiling..."
cd build
cmake ..
make -j$(nproc)

echo "[4/4] Build complete. Executable located at: $(pwd)/automation_engine"
echo "--------------------------------------------------------"
echo "Ready to execute. Run: ./automation_engine"
