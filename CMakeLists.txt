cmake_minimum_required(VERSION 3.10)
project(AutomationEngine)

# Use C++20 for high-performance features
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 1. NEW: Find the JSON library on your Fedora system
find_package(nlohmann_json REQUIRED)

# 2. Automatically find all .cpp and .hpp files
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.hpp")

# 3. Filter out any accidental build artifacts
list(FILTER SOURCES EXCLUDE REGEX "${CMAKE_BINARY_DIR}/.*")

# 4. Create the executable
add_executable(automation-engine ${SOURCES} ${HEADERS})

# 5. Modern Include Path
target_include_directories(automation-engine PUBLIC include)

# 6. NEW: Link the JSON library to your executable
target_link_libraries(automation-engine PRIVATE nlohmann_json::nlohmann_json)

# Debug: Verifies the file list in your terminal
message(STATUS "--- Build Configuration ---")
message(STATUS "Source Files: ${SOURCES}")
message(STATUS "Header Files: ${HEADERS}")
message(STATUS "---------------------------")