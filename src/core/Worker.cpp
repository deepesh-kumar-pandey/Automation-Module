#include "Worker.hpp"
#include <iostream>
#include <cstdlib> // Necessary for the system() function

/**
 * @brief Constructor: Injects steps and the shared VariableManager instance.
 * @param steps The vector of AutomationStep structs from the Parser.
 * @param vm Shared pointer to the VariableManager.
 */
Worker::Worker(const std::vector<AutomationStep>& steps, std::shared_ptr<VariableManager> vm) 
    : steps(steps), varManager(vm) {}

/**
 * @brief The execution loop: Resolves placeholders and triggers actions.
 */
void Worker::execute() {
    std::cout << "\n[Worker] Starting Execution Sequence..." << std::endl;
    std::cout << "---------------------------------------" << std::endl;

    for (auto& step : steps) {
        // 1. Resolve variables using our Manager
        // Swaps {{key}} for real-time values like kernel version strings.
        std::string resolvedCommand = varManager->replace(step.command);

        // 2. Update the step's command with the resolved version
        step.command = resolvedCommand;

        // 3. Perform the action
        performAction(step);
    }

    std::cout << "---------------------------------------" << std::endl;
    std::cout << "[Worker] Sequence finished successfully." << std::endl;
}

/**
 * @brief Logic Dispatcher: Interprets the 'actionType' and runs the command.
 */
void Worker::performAction(const AutomationStep& step) {
    // Supports "shell" and "type" keys from the JSON
    if (step.actionType == "shell" || step.actionType == "type") {
        std::cout << "[Worker] Executing: " << step.command << std::endl;

        /**
         * system() sends the command to /bin/sh.
         * c_str() converts std::string to const char* for compatibility.
         */
        int result = std::system(step.command.c_str());

        // Error handling for Linux environments (Fedora/KDE)
        if (result != 0) {
            std::cerr << "[Worker Error] Command failed with code: " << result << std::endl;
        }
    } 
    else {
        std::cerr << "[Worker Warning] Unknown action type: " << step.actionType 
                  << ". Skipping: " << step.command << std::endl;
    }
}