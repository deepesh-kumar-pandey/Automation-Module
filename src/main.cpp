#include <iostream>
#include <vector>
#include "../include/core/Parser.hpp"

using namespace std; 

int main() {
    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: ONLINE   " << endl;
    cout << "-------------------------------" << endl;

    // 1. Initialize the Parser with a test file path
    Parser engineParser("sequences/test.json");

    // 2. Attempt to parse the steps into a vector
    vector<AutomationStep> sequence = engineParser.parse();

    // 3. Logic Check: See if we found any steps to run
    if (sequence.empty()) {
        cout << "[SYSTEM] No valid steps found. Check the file path." << endl;
    } else {
        cout << "[SYSTEM] Found " << sequence.size() << " steps. Executing..." << endl;
        
        // Loop through and print the actions for testing
        for (const auto& step : sequence) {
            // FIX: Using 'command' to match the struct definition in Parser.hpp
            cout << " >> Action: [" << step.actionType << "] | Command: " << step.command << endl;
        }
    }

    cout << "-------------------------------" << endl;
    return 0;
}