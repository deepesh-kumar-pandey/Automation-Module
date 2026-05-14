#include <iostream>
#include <vector>
#include <memory>
#include "core/Parser.hpp"
#include "core/VariableManager.hpp"
#include "core/Worker.hpp"

using namespace std;

int main(int argc, char* argv[]) {
    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: ONLINE   " << endl;
    cout << "-------------------------------" << endl;

    // 1. Initialize the Shared State (VariableManager)
    // This allows the Engine to remember values between steps
    auto varManager = make_shared<VariableManager>();

    // 2. Pre-load test variables (Simulating what your translation layer would do)
    varManager->set("user", "Deepesh");
    varManager->set("engine_mode", "High-Performance");

    // 3. Parse the JSON sequence
    string sequencePath = (argc > 1 ? argv[1] : "sequences/test.json");
    Parser engineParser(sequencePath);
    auto sequence = engineParser.parse();

    if (sequence.empty()) {
        cout << "[SYSTEM] No valid steps found. Check '" << sequencePath << "'." << endl;
    } else {
        cout << "[SYSTEM] Found " << sequence.size() << " steps. Initializing Worker..." << endl;

        // 4. Initialize the Worker with the shared VariableManager
        // This ensures the worker can resolve {{user}} or {{kernel}} tags
        Worker worker(sequence, varManager);

        // 5. Trigger the Execution Loop
        // This will run the logic we wrote in Worker::execute()
        worker.execute();
    }

    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: OFFLINE  " << endl;
    cout << "-------------------------------" << endl;

    return 0;
}