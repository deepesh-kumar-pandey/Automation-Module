#ifndef SHELL_TASK_HPP
#define SHELL_TASK_HPP

#include "BaseTask.hpp"

namespace Core {

    /**
     * @class ShellTask
     * @brief Concrete task implementation designed to execute native Linux shell commands.
     * * Ingests the unified TaskContext payload, checks it for security hazards, 
     * and spawns a native sub-shell system process to run the command.
     */
    class ShellTask : public BaseTask {
    public:
        ShellTask() = default;
        ~ShellTask() override = default;

        /**
         * @brief Unpacks execution payloads, screens for credentials, and fires shell tasks.
         * @return true if the shell execution returned exit code 0, false otherwise.
         */
        bool execute(const TaskContext& ctx, 
                     std::shared_ptr<VariableManager> varManager, 
                     std::shared_ptr<Security::SecurityUtils> secUtils) override;
    };

} // namespace Core

#endif // SHELL_TASK_HPP