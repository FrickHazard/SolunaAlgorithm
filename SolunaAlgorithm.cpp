// SolunaAlgorithm.cpp : This file contains the 'main' function. Program execution begins and ends there.
//
#include <iostream>
#include <algorithm>
#include <stdio.h>
#include <assert.h> 
#include <vector>

enum PieceId { Sun = 0, Moon = 1, ShootingStar = 2, Stars = 3 };
#define COLOR_COUNT 4u
#define PIECE_COUNT 12u

struct PieceStack {
    uint16_t height;
    PieceId id;
    // count of pieces
} typedef PieceStack;

struct GameState {
    uint16_t colorCount;
    uint32_t  pieceCounts[COLOR_COUNT];
    std::vector<PieceStack> pieceLists[COLOR_COUNT];
}typedef GameState;

struct MoveResult {
    PieceStack top;
    PieceStack bottom;
    uint32_t topIndex;
    uint32_t bottomIndex;
} typedef MoveResult;

struct BranchResult {
    uint32_t leafCount;
    uint32_t leafVictory;
    bool guaranteedWin;
    // move set
} typedef BranchResult;

MoveResult returnMove;
std::string enumNames[] = {"Sun", "Moon", "Shooting Star", "Stars" };

// set of all unique whole numbers numbers that add together to form N.  This goes from N to N + 1
// assumed all numbers sorted! N = A_1 + A_2 + ... + A_n to N+1 = A_1 + A_2 + ... + A_N+1

std::vector<std::vector<uint32_t>> getCombinations(uint32_t n, uint32_t r) {

    assert(n >= r);
    std::vector<std::vector<uint32_t>> result = std::vector<std::vector<uint32_t>>();
    std::vector<bool> v(n);   
    std::fill(v.end() - r, v.end(), true);
   
    do {
        std::vector<uint32_t> combination = std::vector<uint32_t>(r);
        uint32_t idx = 0;
        for (int i = 0; i < n; ++i) {            
            if (v[i]) {
                combination[idx] = i;
                ++idx;
            }
        }
        result.push_back(combination);
    } while (std::next_permutation(v.begin(), v.end()));


    return result;
}


std::vector<std::vector<uint32_t>> nextPartition(std::vector<std::vector<uint32_t>> a, uint32_t n)
{
    std::vector<std::vector<uint32_t>> result = std::vector<std::vector<uint32_t>>();
    for (uint32_t i = 0; i < a.size(); i++)
    {
        std::vector<uint32_t> withOne = std::vector<uint32_t>();
        withOne.push_back(1);

        for (uint32_t j = 0; j < a[i].size(); j++) {
            if (j == 1 && a[i][0] < a[i][1]) {
                std::vector<uint32_t> permutation = std::vector<uint32_t>();
                permutation.push_back(a[i][0] + 1);
                for (uint32_t k = 1; k < a[i].size(); k++) {
                    permutation.push_back(a[i][k]);
                }
                result.push_back(permutation);
            }
            withOne.push_back(a[i][j]);
        }
        result.push_back(withOne);
    }
    result.push_back({ n });
    return result;
}


GameState colorPartitionVectorToGameState(std::vector<uint32_t>& colorPartition, uint16_t height) {
    GameState state = { 0 };
    for (uint32_t i = 0; i < colorPartition.size(); ++i) {
        if (colorPartition[i] == 0) break;
        state.pieceCounts[state.colorCount] += colorPartition[i];
        state.pieceLists[state.colorCount] = std::vector<PieceStack>();
        for (uint32_t j = 0; j < colorPartition[i]; ++j) {
            state.pieceLists[state.colorCount].push_back({ height, (PieceId)i });
        }
        ++state.colorCount;
    }
    return state;
}

//std::vector<GameState> mergeGameStatesWithNewHeight(GameState state, std::vector<uint32_t> & colorPartition, uint32_t newHeight) {
//    // assume newHeight is not in state!
//
//    // if any group has the same size then there is 
//    uint32_t uniqueGroupCount = 1;
//    for (uint32_t i = 1; i < colorPartition.size(); ++i) {
//        if (colorPartition[i - 1] != colorPartition[i]) ++uniqueGroupCount;
//    }
//
//    uint32_t variationCount = 1;
//    for (uint32_t i = 0; i < uniqueGroupCount; ++i) {
//        variationCount *= (COLOR_COUNT - i);
//    }
//
//    for (uint32_t i = 0; i < variationCount; i++) {
//    
//    
//    }
//
//
//}


std::vector<GameState> getBoardHeightSpaceSubColorSpace(std::vector<uint32_t> boardHeightSorted) {
    uint32_t currentHeight = boardHeightSorted[0];
    uint32_t i = 1;
    while (i < boardHeightSorted.size() && boardHeightSorted[i] == currentHeight) {
        ++i;
    }

    std::vector<std::vector<uint32_t>> colorPartition = std::vector<std::vector<uint32_t>>();
    std::vector<std::vector<uint32_t>> partition = std::vector<std::vector<uint32_t>>();

    for (uint32_t j = 1; j <= i; ++j)
        partition = nextPartition(partition, j);
    // constrained partition, remove all partitions with more than 4 numbers
    for (uint32_t j = 0; j < partition.size(); ++j)
        if (partition[j].size() <= COLOR_COUNT)
            colorPartition.push_back(partition[j]);    

    std::vector<GameState> result = std::vector<GameState>();
    for (uint32_t j = 0; j < colorPartition.size(); ++j) {       
        result.push_back(colorPartitionVectorToGameState(colorPartition[j], (uint16_t)currentHeight));
    } 
  
    // merge other height groups
    while (i < boardHeightSorted.size()) {
        currentHeight = boardHeightSorted[i];
        uint32_t count = 0;
        while (i < boardHeightSorted.size() && boardHeightSorted[i] == currentHeight)
        {
            ++count;
            ++i;
        }

        partition = std::vector<std::vector<uint32_t>>();
        std::vector<std::vector<uint32_t>> mergingColorPartition = std::vector<std::vector<uint32_t>>();
        for (uint32_t j = 1; j <= count; ++j)
            partition = nextPartition(partition, j);
        // constrained partition, remove all partitions with more than 4 numbers
        for (uint32_t j = 0; j < partition.size(); ++j)
            if (partition[j].size() <= COLOR_COUNT)
                mergingColorPartition.push_back(partition[j]);

        std::vector<GameState> nextResult = std::vector<GameState>();

       
        for (uint32_t a = 0; a < mergingColorPartition.size(); ++a) {
            std::vector<std::vector<uint32_t>> combinations = getCombinations(COLOR_COUNT, mergingColorPartition[a].size());
            for (uint32_t j = 0; j < result.size(); ++j) {
                for (uint32_t k = 0; k < combinations.size(); ++k) {
                    GameState newGameState = result[j];
                    assert(&newGameState.pieceLists != &result[j].pieceLists);
                    for (uint32_t l = 0; l < combinations[k].size(); ++l) {
                        for (uint32_t m = 0; m < mergingColorPartition[a][l]; ++m) {
                            newGameState.pieceLists[l].push_back({ (uint16_t)currentHeight, (PieceId)combinations[k][l] });
                            ++newGameState.pieceCounts[l];
                        }
                    }
                    // recount colors
                    for (uint32_t l = 0; l < COLOR_COUNT; ++l) {
                        if (newGameState.pieceCounts[l] == 0) {
                            newGameState.colorCount = l;
                            break;
                        }
                        if (l == COLOR_COUNT - 1)newGameState.colorCount = COLOR_COUNT;
                    }
                    nextResult.push_back(newGameState);
                }
            }
        }

        result = nextResult;
    }    
    return result;
}

void getAllSymmertricBoardSpaces()
{
    std::vector<std::vector<uint32_t>> heightPartition = std::vector<std::vector<uint32_t>>();
    for (uint32_t i = 1; i <= PIECE_COUNT; ++i) {
        heightPartition = nextPartition(heightPartition, i);
    } 

    std::vector<GameState> allGameStates = std::vector<GameState>();
    for (uint32_t i = 0; i < heightPartition.size(); ++i) {
        std::vector<GameState> gameStates = getBoardHeightSpaceSubColorSpace(heightPartition[i]);
        for (uint32_t j = 0; j < gameStates.size(); ++j) {
            allGameStates.push_back(gameStates[j]);
        }
    }
}

PieceStack * getSymmetricGames(uint32_t* wLenGames)
{
    // All whole number solutions to 12 = A + B + C + D
    // parition of 12, with 4 number constraint
    uint16_t symmetric[23][4] = {
        // first 4 p1 wins
        { 12, 0, 0, 0 },
        { 11, 1, 0, 0 },

        { 10, 2, 0, 0 },
        { 10, 1, 1, 0 },

        { 9, 3, 0, 0 },
        { 9, 2, 1, 0 },
        { 9, 1, 1, 1 },

        { 8, 4, 0, 0 },
        { 8, 3, 1, 0 },
        { 8, 2, 2, 0 },
        { 8, 2, 1, 1 },

        { 7, 5, 0, 0 },
        { 7, 4, 1, 0 },
        { 7, 3, 2, 0 },
        { 7, 3, 1, 1 },
        { 7, 2, 2, 1 },
    
        { 6, 6, 0, 0 },
        { 6, 5, 1, 0 },
        { 6, 4, 2, 0 },
        { 6, 4, 1, 1 },
        { 6, 3, 3, 0 },
        { 6, 3, 2, 1 },
        { 6, 2, 2, 2 }
    };
    
    PieceStack* games = (PieceStack*)malloc(sizeof(PieceStack) * 23 * PIECE_COUNT);
    uint32_t idx = 0;
    for (uint32_t i = 0; i < 23; ++i) {        
        for (uint32_t j = 0; j < 4; ++j) {
            for (uint32_t k = 0; k < symmetric[i][j]; ++k) {
                games[idx] = { 1, (PieceId)j };
                ++idx;
            }
        }
    }
    (*wLenGames) = 23;
    return games;
}



MoveResult * getPossibleMoves(PieceStack* arr, uint32_t len, uint32_t * wLen) {

    // hardcode for now
    // also could reduce branches, by piece symmetry, since there is nothing special about any one PieceId
    const uint32_t movesUpperBound = 32;
    bool same[4] = { false };
    {
        int idCount[4] = { 0 };
        for (uint32_t i = 0; i < len; ++i) idCount[arr[i].id]++;
        uint32_t indices[4] = { 0 };
        PieceStack* piece[4] = { 0 };
        piece[0] = (PieceStack*)malloc(idCount[0] * sizeof(PieceStack));
        piece[1] = (PieceStack*)malloc(idCount[1] * sizeof(PieceStack));
        piece[2] = (PieceStack*)malloc(idCount[2] * sizeof(PieceStack));
        piece[3] = (PieceStack*)malloc(idCount[3] * sizeof(PieceStack));
        for (uint32_t i = 0; i < len; ++i) {
            piece[arr[i].id][indices[arr[i].id]] = arr[i];
            ++indices[arr[i].id];
        }
        // bubble sort
        for (uint32_t i = 0; i < 4; ++i)
        for (int j = 0; j < idCount[i] - 1; ++j)
        for (int k = 0; k < (idCount[i] - j - 1); ++k) {
            if ((piece[i])[k].height > piece[i][k + 1].height)
                 std::swap(piece[i][k], piece[i][k + 1]);
        }

        for (uint32_t i = 0; i < 3; ++i) {
            for (uint32_t j = i + 1; j < 4; ++j) {
                if (idCount[i] == idCount[j] && same[j] == false) {
                    for (uint32_t k = 0; k < idCount[i]; ++k) {
                        if (piece[i][k].height != piece[j][k].height) {                           
                            break;
                        }
                        else if (k == idCount[i] - 1)  same[j] = true;
                    }
                }
            }
        }

        free(piece[0]);
        free(piece[1]);
        free(piece[2]);
        free(piece[3]);     
    }

    uint32_t count = 0;
    MoveResult * moves = (MoveResult *)malloc(sizeof(MoveResult) * movesUpperBound);
    for (uint32_t i = 0; i < len; ++i) {
        if (same[arr[i].id]) continue;
        for (uint32_t j = 0; j < len; ++j) {
            if (i == j) continue;
            const bool heightsMatch = arr[i].height == arr[j].height;
            const bool idsMatch = arr[i].id == arr[j].id;
            bool moveAlreadyLoggedForward = false;
            bool moveAlreadyLoggedBack = false;
            for (uint32_t k = 0; k < count; ++k) {
                if (
                    moves[k].top.height == arr[i].height
                    && moves[k].top.id == arr[i].id
                    && moves[k].bottom.height == arr[j].height
                    && moves[k].bottom.id == arr[j].id) {
                    moveAlreadyLoggedForward = true;
                }
                if (
                    moves[k].bottom.height == arr[i].height
                    && moves[k].bottom.id == arr[i].id
                    && moves[k].top.height == arr[j].height
                    && moves[k].top.id == arr[j].id) {
                    moveAlreadyLoggedBack = true;
                }
            }

            if (heightsMatch && idsMatch && !moveAlreadyLoggedForward) {
                moves[count] = { arr[i], arr[j], i, j };
                ++count;
                if (same[arr[j].id] && !moveAlreadyLoggedBack) {
                    moves[count] = { arr[j], arr[i], j, i };
                    ++count;
                }
            }
            else if (idsMatch && !moveAlreadyLoggedForward) {
                moves[count] = { arr[i], arr[j], i, j };
                ++count;
                if (same[arr[j].id] && !moveAlreadyLoggedBack) {
                    moves[count] = { arr[j], arr[i], j, i };
                    ++count;
                }
            }
            else if (heightsMatch) {
                if (!moveAlreadyLoggedForward) {
                    moves[count] = { arr[i], arr[j], i, j };
                    ++count;
                }
                if (!moveAlreadyLoggedBack) {
                    moves[count] = { arr[j], arr[i], j, i };
                    ++count;
                }
            }
        }
    }

    (*wLen) = count;
    return moves;
}

PieceStack * applyMoveToGameState(PieceStack* arr, uint32_t len, MoveResult moveToApply, uint32_t * wLen)
{
    uint32_t gameStateLength;
    PieceStack* newGameState;
    if (moveToApply.topIndex == 0 && moveToApply.bottomIndex == 0) {
        gameStateLength = len;
        newGameState = (PieceStack*)malloc(sizeof(PieceStack) * gameStateLength);
        for (uint32_t i = 0; i < gameStateLength; i++) newGameState[i] = arr[i];
    }
    else {
        gameStateLength = len - 1;
        // apply move result;
        newGameState = (PieceStack*)malloc(sizeof(PieceStack) * gameStateLength);

        int j = 0;
        for (uint32_t i = 0; i < len; i++) {
            if (moveToApply.bottomIndex == i || moveToApply.topIndex == i) continue;
            newGameState[j] = arr[i];
            ++j;
        }
        newGameState[j] = { (uint16_t)(moveToApply.top.height + moveToApply.bottom.height), moveToApply.top.id };
    }
    (*wLen) = gameStateLength;
    return newGameState;
}

bool SolunaAlgorithm(PieceStack* arr, uint32_t len, MoveResult moveToApply, uint16_t parity)
{
    const bool opponentsTurn = (parity % 2);
   
    uint32_t gameStateLength;
    PieceStack * newGameState = applyMoveToGameState(arr, len, moveToApply, &gameStateLength);

    uint32_t moveLength = 0;
    MoveResult* moves = getPossibleMoves(newGameState, gameStateLength, &moveLength);

    // leaf node
    if (moveLength == 0) {        
        free(newGameState);
        free(moves);
        return opponentsTurn;
    }

    BranchResult result = {0, 0, false};

    for (uint32_t i = 0; i < moveLength; i++)
    {
        const MoveResult move = moves[i];
        const bool guaranteedWin = SolunaAlgorithm(newGameState, gameStateLength, move, parity + 1);

        // on your turn if there exists a branch where you win return true
        if (!opponentsTurn && guaranteedWin) {
            if (parity == 0) {
                returnMove = move;
            }
            return guaranteedWin;            
        }

        else if (opponentsTurn && !guaranteedWin) {
            return false;
        }
       
    }

    free(newGameState);
    free(moves);
    return opponentsTurn;
}

PieceStack* generateRandomStartingGame(uint32_t * wLen)
{
    PieceStack* gameState = (PieceStack*)malloc(sizeof(PieceStack) * PIECE_COUNT);
    for (uint32_t i = 0; i < PIECE_COUNT; i++)
    {
        // since modulo by 4, fits neatly into rand range
        PieceId idNumb = (PieceId)(rand() % 4);
        gameState[i] = { 1, idNumb };
    }

    (*wLen) = PIECE_COUNT;

    return gameState;
}
// returns true when there is more gameStates
bool getNextInitialConditions(PieceStack * gameState, uint32_t gameStateLength)
{
    for (uint32_t i = 0; i < gameStateLength; i++) {
        if ((uint16_t)gameState[i].id < 3) {
            gameState[i].id = (PieceId)(gameState[i].id + 1);
            return true;
        }
        else { gameState[i].id = (PieceId)(0); }
    }
    return false;
}


int main()
{
   /* getCombinations(4, 3);
    getAllSymmertricBoardSpaces();
    return 0;*/
    //{
    //    uint32_t player1Wins = 0;
    //    uint32_t player2Wins = 0;
    //    uint32_t gameStateLength;
    //    PieceStack* symmetricGames = getSymmetricGames(&gameStateLength);

    //    for (uint32_t i = 0; i < gameStateLength; ++i) {
    //        const bool p1Win = SolunaGuaranteedWin(symmetricGames + (i * PIECE_COUNT), PIECE_COUNT, { 0 }, 0);



    //        if (p1Win) player1Wins += 1;
    //        else player2Wins += 1;
    //    }

    //    free(symmetricGames);

    //    std::cout << "Player 1 Wins: " << player1Wins << std::endl;
    //    std::cout << "Player 2 Wins: " << player2Wins << std::endl;
    //}

    {
        PieceStack board[12] = { 0 };
        board[0] = { 1, Sun };
        board[1] = { 1, Sun };
        board[2] = { 1, Sun };
        board[3] = { 1, Sun };
        board[4] = { 1, Sun };
        board[5] = { 1, Sun };
        board[6] = { 1, Sun };
        board[7] = { 1, Sun };
        board[8] = { 1, Sun };
        board[9] = { 1, Moon };
        board[10] = { 1, Moon };
        board[11] = { 1, Moon };
        bool guaranteedWin = SolunaAlgorithm(board, 12, { 0 }, 0);
        // std::cout << "Leaf nodes " << guarenteedWin.leafCount << " Leaf Victory " << result.leafVictory << std::endl;
        std::cout << "Determined: " << (guaranteedWin ? "true, " : "false, ") << "Move " << enumNames[returnMove.top.id] << " " << returnMove.top.height << " Onto " << enumNames[returnMove.bottom.id] << " " << returnMove.bottom.height << std::endl;
    }
    /*{
        uint32_t gameStateLength;
        PieceStack* symmetricGames = getSymmetricGames(&gameStateLength);
        for (uint32_t i = 0; i < gameStateLength; ++i) {
            const BranchResult result = SolunaAlgorithm(symmetricGames + (i * PIECE_COUNT), PIECE_COUNT, { 0 }, 0);

            std::cout << (i+1) <<": Leaf nodes " << result.leafCount << " Leaf Victory " << result.leafVictory << std::endl;
            std::cout << "Determined: " << (result.guaranteedWin ? "true, " : "false, ") << "Move " << enumNames[returnMove.top.id] << " " << returnMove.top.height << " Onto " << enumNames[returnMove.bottom.id] << " " << returnMove.bottom.height << std::endl;
        }

        free(symmetricGames);
    }*/
}
