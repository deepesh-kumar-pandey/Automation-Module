#include <iostream>
#include <vector>
#include "../include/core/Parser.hpp" // Use explicit relative path so the header can be found without additional includePath setup

using namespace std; 

int main() {
    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: ONLINE   " << endl;
    cout << "-------------------------------" << endl;

    // Use a relative path that assumes you run from the project root
    Parser engineParser("sequences/test.json");

    auto sequence = engineParser.parse();

    if (sequence.empty()) {
        // This is likely what you are seeing because of the folder path issue
        cout << "[SYSTEM] No valid steps found. Check if 'sequences/test.json' exists." << endl;
    } else {
        cout << "[SYSTEM] Found " << sequence.size() << " steps. Executing..." << endl;
        
        for (const auto& step : sequence) {
            cout << " >> Action: [" << step.actionType << "] | Command: " << step.command << endl;
        }
    }

    cout << "-------------------------------" << endl;
    return 0;
}