cmake_minimum_required(VERSION 3.10)
project(AutomationEngine)

# Use C++20 for high-performance features
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. Automatically find all .cpp and .hpp files
# Including .hpp files ensures VS Code and CMake track header changes
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.hpp")

# 2. Filter out any accidental build artifacts
list(FILTER SOURCES EXCLUDE REGEX "${CMAKE_BINARY_DIR}/.*")

# 3. Create the executable
add_executable(automation-engine ${SOURCES} ${HEADERS})

# 4. Modern Include Path
# 'PUBLIC' ensures that if you add tests later, they also know where the headers are
target_include_directories(automation-engine PUBLIC include)

# Debug: Verifies the file list in your terminal
message(STATUS "--- Build Configuration ---")
message(STATUS "Source Files: ${SOURCES}")
message(STATUS "Header Files: ${HEADERS}")
message(STATUS "---------------------------")