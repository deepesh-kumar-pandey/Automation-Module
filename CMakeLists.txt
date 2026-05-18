cmake_minimum_required(VERSION 3.14)
project(AutomationEngine)

# Use C++20 for high-performance features
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Output executable into the build folder
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})

# Try to find nlohmann_json locally first, then download it if missing.
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
  include(FetchContent)
  FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.2
  )
  FetchContent_MakeAvailable(nlohmann_json)
endif()

# Automatically find all .cpp and .hpp files
file(GLOB_RECURSE SOURCES "src/*.cpp")
file(GLOB_RECURSE HEADERS "include/*.hpp")

# 3. Filter out any accidental build artifacts
list(FILTER SOURCES EXCLUDE REGEX "${CMAKE_BINARY_DIR}/.*")

# 4. Create the executable
add_executable(automation-engine ${SOURCES} ${HEADERS})

# 5. Modern Include Path
target_include_directories(automation-engine PUBLIC include)

# 6. Link the JSON library to your executable
target_link_libraries(automation-engine PRIVATE nlohmann_json::nlohmann_json)

# Debug: Verifies the file list in your terminal
message(STATUS "--- Build Configuration ---")
message(STATUS "Source Files: ${SOURCES}")
message(STATUS "Header Files: ${HEADERS}")
message(STATUS "---------------------------")