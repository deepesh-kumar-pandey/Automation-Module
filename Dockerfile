# Stage 1: Build
FROM alpine:3.19 AS builder

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    cmake \
    git \
    curl \
    zip \
    unzip \
    tar \
    pkgconfig \
    ninja

# Set up vcpkg
WORKDIR /opt
RUN git clone https://github.com/microsoft/vcpkg.git && \
    ./vcpkg/bootstrap-vcpkg.sh

# Set working directory to the project root
WORKDIR /app

# Copy dependency files (Now at root level)
COPY vcpkg.json ./
COPY CMakeLists.txt ./

# Install dependencies
RUN /opt/vcpkg/vcpkg install

# Copy everything from your Automation-Module root
COPY . .

# Build
RUN cmake -B build -S . -G Ninja -DCMAKE_TOOLCHAIN_FILE=/opt/vcpkg/scripts/buildsystems/vcpkg.cmake
RUN cmake --build build

# Stage 2: Runtime
FROM alpine:3.19
RUN apk add --no-cache libstdc++

WORKDIR /app

# Copy the binary from the build folder seen in image_ade982.png
COPY --from=builder /app/build/automation-engine .

# Match the folders shown in your VS Code explorer
RUN mkdir -p output_folder data sequences

ENTRYPOINT ["./automation-engine"]