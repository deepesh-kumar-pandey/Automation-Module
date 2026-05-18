# Automation-Module

## Build Instructions

Use an out-of-source build so CMake and Make generate all build artifacts inside a `build` folder.

```bash
mkdir -p build
cd build
cmake ..
make
```

After building, run the executable from the `build` folder:

```bash
./automation-engine
```
