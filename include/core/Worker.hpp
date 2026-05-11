#ifndef WORKER_HPP
#define WORKER_HPP

#include <vector>
#include <string>
#include "Parser.hpp" // Required for the AutomationStep struct definition

/**
 * @class Worker
 * @brief Responsible for taking a sequence of automation steps and executing them.
 * * The Worker acts as the execution engine. It processes a list of instructions 
 * (AutomationSteps) and translates them into system-level actions.
 */
class Worker {
public:
    /**
     * @brief Constructor: Takes a pre-parsed list of steps.
     * @param steps A vector of AutomationStep objects to be executed.
     */
    explicit Worker(const std::vector<AutomationStep>& steps) : steps(steps) {};

    /**
     * @brief High-level trigger to start the execution of the entire sequence.
     * Iterates through the stored 'steps' and calls performAction on each.
     */
    void execute();

private:
    // The internal list of tasks to run
    std::vector<AutomationStep> steps;

    /**
     * @brief Internal logic to execute a single task based on its actionType.
     * @param step The specific AutomationStep to process.
     */
    void performAction(const AutomationStep& step);
}; // Fixed: Changed ':' to ';'

#endif /* WORKER_HPP */