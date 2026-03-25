#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <cstdlib>
#include <limits>

// Cross-platform Clear Screen
#ifdef _WIN32
    #define CLEAR "cls"
#endif

// ANSI Color Definitions
#define RESET   "\033[0m"
#define RED     "\033[31m"      // Snakes
#define GREEN   "\033[32m"      // Ladders
#define BLUE    "\033[34m"      // Players
#define YELLOW  "\033[33m"      // Highlights/Dice
#define CYAN    "\033[36m"      // Board Numbers
#define BOLD    "\033[1m"

using namespace std;

struct BoardObject {
    int start, end;
};

// --- INPUT VALIDATION (Prevents special characters/letters) ---
int getValidInt(int min, int max) {
    int input;
    while (true) {
        if (cin >> input && input >= min && input <= max) {
            return input;
        } else {
            cout << RED << "Invalid! Enter a NUMBER between " << min << " and " << max << ": " << RESET;
            cin.clear(); 
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }
}

// Check if a tile is already used by a Snake or Ladder
bool isOccupied(int pos, const vector<BoardObject>& snakes, const vector<BoardObject>& ladders) {
    for (auto& s : snakes) if (s.start == pos || s.end == pos) return true;
    for (auto& l : ladders) if (l.start == pos || l.end == pos) return true;
    return false;
}

void drawBoard(const vector<int>& players, const vector<BoardObject>& snakes, const vector<BoardObject>& ladders) {
    system(CLEAR);
    cout << BOLD << YELLOW << "==========================================\n";
    cout << "          SNAKE & LADDER WORLD            \n";
    cout << "==========================================\n" << RESET << endl;

    for (int i = 9; i >= 0; i--) {
        for (int j = 1; j <= 10; j++) {
            int currentPos = (i * 10) + j;
            bool pMarked = false;

            // 1. Draw Players (Blue)
            for (int p = 0; p < players.size(); p++) {
                if (players[p] == currentPos) {
                    cout << BOLD << BLUE << "P" << p + 1 << RESET << "  ";
                    pMarked = true; break;
                }
            }
            if (pMarked) continue;

            // 2. Draw Snakes (Red) and Ladders (Green)
            bool objectFound = false;
            for (auto& s : snakes) {
                if (currentPos == s.start) { cout << RED << "!   " << RESET; objectFound = true; break; }
                if (currentPos == s.end)   { cout << RED << "/   " << RESET; objectFound = true; break; }
            }
            if (objectFound) continue;

            for (auto& l : ladders) {
                if (currentPos == l.start) { cout << GREEN << "* " << RESET; objectFound = true; break; }
                if (currentPos == l.end)   { cout << GREEN << "^   " << RESET; objectFound = true; break; }
            }
            if (objectFound) continue;

            // 3. Draw Normal Numbers (Cyan)
            printf("\033[36m%-4d\033[0m", currentPos);
        }
        cout << "\n\n";
    }
    cout << "------------------------------------------\n";
    cout << GREEN << "*: Ladder Start | ^: Ladder End" << RESET << endl;
    cout << RED << "!: Snake Mouth  | /: Snake Tail" << RESET << endl;
    cout << "------------------------------------------\n";
}

int main() {
    srand(time(0));
    
    // --- SETUP PHASE ---
    cout << "Number of Players (2-5): ";
    int numP = getValidInt(2, 5);

    cout << "Number of Snakes (1-5): ";
    int numS = getValidInt(1, 5);
    vector<BoardObject> snakes;
    for (int i = 0; i < numS; i++) {
        while (true) {
            cout << "Snake " << i+1 << " Mouth (!) [11-99]: ";
            int m = getValidInt(11, 99);
            cout << "Snake " << i+1 << " Tail (/) [1-" << m-1 << "]: ";
            int t = getValidInt(1, m-1);
            if (!isOccupied(m, snakes, {}) && !isOccupied(t, snakes, {})) {
                snakes.push_back({m, t}); break;
            }
            cout << RED << "Overlap! Choose empty tiles.\n" << RESET;
        }
    }

    cout << "Number of Ladders (1-5): ";
    int numL = getValidInt(1, 5);
    vector<BoardObject> ladders;
    for (int i = 0; i < numL; i++) {
        while (true) {
            cout << "Ladder " << i+1 << " Start (*) [2-98]: ";
            int s = getValidInt(2, 98);
            cout << "Ladder " << i+1 << " End (^) [" << s+1 << "-99]: ";
            int e = getValidInt(s+1, 99);
            
            bool cycle = false;
            for(auto& snk : snakes) if(e == snk.start) cycle = true;

            if (!isOccupied(s, snakes, ladders) && !cycle) {
                ladders.push_back({s, e}); break;
            }
            cout << RED << "Invalid (Overlap/Cycle)! Try again.\n" << RESET;
        }
    }

    // --- GAME LOOP ---
    vector<int> pPos(numP, 1);
    int turn = 0;
    string lastMove = "Game Started!";

    while (true) {
        drawBoard(pPos, snakes, ladders);
        cout << "STATUS: " << YELLOW << lastMove << RESET << endl;
        cout << "Player " << turn + 1 << "'s turn. Press Enter to roll...";
        
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cin.get();

        int dice = (rand() % 6) + 1;
        lastMove = "Player " + to_string(turn + 1) + " rolled a " + to_string(dice);

        if (pPos[turn] + dice <= 100) {
            pPos[turn] += dice;
            // Check Snakes
            for (auto& s : snakes) {
                if (pPos[turn] == s.start) {
                    pPos[turn] = s.end;
                    lastMove += RED " -> BIT BY SNAKE! (Down to " + to_string(s.end) + ")" RESET;
                }
            }
            // Check Ladders
            for (auto& l : ladders) {
                if (pPos[turn] == l.start) {
                    pPos[turn] = l.end;
                    lastMove += GREEN " -> CLIMBED LADDER! (Up to " + to_string(l.end) + ")" RESET;
                }
            }
        } else {
            lastMove += " (Roll too high! Cannot move)";
        }

        if (pPos[turn] == 100) {
            drawBoard(pPos, snakes, ladders);
            cout << BOLD << YELLOW << "\n*** PLAYER " << turn + 1 << " IS THE CHAMPION! ***\n" << RESET << endl;
            break;
        }
        turn = (turn + 1) % numP;
    }

    return 0;
}