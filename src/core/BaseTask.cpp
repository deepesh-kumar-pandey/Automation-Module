#include "BaseTask.hpp"

namespace Core {

    // The virtual destructor is defaulted in the header file.
    // This source file serves as an anchor translation unit for Core::BaseTask,
    // ensuring the C++ compiler's toolchain has a clean, explicit mapping 
    // for the interface's dynamic dispatch tables (vtable).
    
    // In the future, any shared structural helper utilities for managing 
    // TaskContext parameters can be cleanly placed here.

} // namespace Core