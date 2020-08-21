// SolunaAlgorithm.cpp : This file contains the 'main' function. Program execution begins and ends there.
//
#include <iostream>
#include <algorithm>
#include <stdio.h>
#include <assert.h> 
#include <vector>
#include <unordered_set>
#include <unordered_map>
// copy of boosts hash_combine
template <class T>
inline void hash_combine(std::size_t& s, const T& v)
{
    std::hash<T> h;
    s ^= h(v) + 0x9e3779b9 + (s << 6) + (s >> 2);
}

enum PieceId { Sun = 0, Moon = 1, ShootingStar = 2, Stars = 3 };
#define COLOR_COUNT 4u
#define PIECE_COUNT 12u

struct PieceStack {
    uint32_t height;
    uint32_t count;
    // count of pieces
} typedef PieceStack;

struct GameState {
    uint32_t colorCount;
    std::vector<PieceStack> pieceLists[COLOR_COUNT];
}typedef GameState;

struct MoveResult {
    uint32_t topColorIndex;
    uint32_t topSubIndex;
    uint32_t bottomColorIndex;
    uint32_t bottomSubIndex;
} typedef MoveResult;

struct BranchResult {
    uint32_t leafCount;
    uint32_t leafVictory;
    bool guaranteedWin;
    // move set
} typedef BranchResult;


struct GameStateHash
{
    size_t operator()(const GameState& gameState) const {
        size_t hsh = std::hash<uint32_t>{}(gameState.colorCount);
        for (uint32_t i = 0; i < COLOR_COUNT; ++i) {            
            for (uint32_t j = 0; j < gameState.pieceLists[i].size(); ++j) {
                hash_combine<uint32_t>(hsh, gameState.pieceLists[i][j].height);
                hash_combine<uint32_t>(hsh, gameState.pieceLists[i][j].count);
            }
        }

        return hsh;
    }
};

struct ColorPieceVector {
    size_t operator()(const std::vector<PieceStack> &pieceList) const {
        size_t hsh = std::hash<uint32_t>{}(pieceList.size());
        for (uint32_t i = 0; i < pieceList.size(); ++i) {
            hash_combine<uint32_t>(hsh, pieceList[i].count);
            hash_combine<uint32_t>(hsh, pieceList[i].height);
        }

        return 0;
    }
};

bool operator==(const GameState& gameState1, const GameState& gameState2) {
    if (gameState1.colorCount != gameState2.colorCount) return false;
    for (uint32_t i = 0; i < COLOR_COUNT; ++i) {
        if (gameState1.pieceLists[i].size() != gameState2.pieceLists[i].size()) return false;
        for (uint32_t j = 0; j < gameState1.pieceLists[i].size(); ++j) {
            if (gameState1.pieceLists[i][j].height != gameState2.pieceLists[i][j].height || gameState1.pieceLists[i][j].count != gameState2.pieceLists[i][j].count) {
                return false;
            }
        }
    }

    return true;
}

MoveResult returnMove;
std::string enumNames[] = {"Sun", "Moon", "Shooting Star", "Stars" };

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

std::unordered_map<std::vector<PieceStack>, uint32_t, ColorPieceVector> generatePartitionId()
{
    std::unordered_map<std::vector<PieceStack>, uint32_t, ColorPieceVector> colorListToPartition = std::unordered_map < std::vector<PieceStack>, uint32_t, ColorPieceVector>();

    std::vector<std::vector<uint32_t>> heightCountPartition = std::vector<std::vector<uint32_t>>();
    uint32_t partitionId = 0;
    for (uint32_t i = 1; i <= PIECE_COUNT; ++i) {
        heightCountPartition = nextPartition(heightCountPartition, i);
        for (uint32_t j = 0; j < heightCountPartition.size(); ++j) {
            std::vector<PieceStack> pieces = std::vector<PieceStack>();
            uint32_t nmbIdx = 0;
            for (uint32_t k = 0; k < heightCountPartition[j].size(); ++k) {                
                if (heightCountPartition[j][k] != heightCountPartition[j][nmbIdx]) {
                    pieces.push_back({ heightCountPartition[j][k], (k - nmbIdx) });
                    nmbIdx = k;
                }                
            }
            colorListToPartition.insert({ pieces, partitionId });
            ++partitionId;
        }        
    }

    return colorListToPartition;
}

GameState colorPartitionVectorToGameState(std::vector<uint32_t>& colorPartition, uint16_t height) {
    GameState state = { 0 };
    for (; state.colorCount < colorPartition.size(); ++state.colorCount) {
        if (colorPartition[state.colorCount] == 0) break;
        state.pieceLists[state.colorCount] = std::vector<PieceStack>();
        state.pieceLists[state.colorCount].push_back({ height, colorPartition[state.colorCount] });
    }
    return state;
}

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
                    for (uint32_t l = 0; l < combinations[k].size(); ++l) {                     
                            newGameState.pieceLists[combinations[k][l]].push_back({ (uint16_t)currentHeight, mergingColorPartition[a][l] });
                    }
                    // recount colors
                    for (uint32_t l = 0; l < COLOR_COUNT; ++l) {
                        if (newGameState.pieceLists[l].size() != 0) ++newGameState.colorCount;
                    }
                    nextResult.push_back(newGameState);
                }
            }
        }

        result = nextResult;
    }    
    return result;
}

std::vector<uint32_t> getSymmetries(const GameState & gameState) {

    std::vector<uint32_t> result = std::vector<uint32_t>(COLOR_COUNT);

    for (uint32_t i = 0; i < COLOR_COUNT; ++i)
        result[i] = i;

    for (uint32_t i = 0; i < COLOR_COUNT; ++i) {
        if (result[i] != i) continue;
        for (uint32_t j = i + 1; j < COLOR_COUNT; ++j) {
            if (result[j] != j) continue;
            if (gameState.pieceLists[i].size() != gameState.pieceLists[j].size()) continue;
            if (gameState.pieceLists[i].size() == 0) {
                continue;
            }
            for (uint32_t k = 0; k < gameState.pieceLists[i].size(); ++k) {
                if (gameState.pieceLists[i][k].height != gameState.pieceLists[j][k].height || gameState.pieceLists[i][k].count != gameState.pieceLists[j][k].count) {
                    break;
                }
                if (k == gameState.pieceLists[i].size() - 1) result[j] = i;
            }
            
        }
    }
    return result;
}

std::vector<MoveResult> getPossibleMoves(const GameState & gameState) {

    std::vector<MoveResult> result = std::vector<MoveResult>();
    std::vector<uint32_t> symmetries = getSymmetries(gameState);

    for (uint32_t i = 0; i < COLOR_COUNT; ++i) {
        if (symmetries[i] < i) continue;
        // get intercolor moves
        for (uint32_t j = 0; j < gameState.pieceLists[i].size(); ++j) {
            if (gameState.pieceLists[i][j].count > 1) result.push_back({ i, j, i, j });
            for (uint32_t k = j + 1; k < gameState.pieceLists[i].size(); ++k) {
                result.push_back({ i, j, i, k });
            }
        }
    }

    // runs max(height) * color, could switch to binary search, not a huge bottle neck
    uint32_t height = 1;
    bool exit = false;
    std::vector<uint32_t> indices = std::vector<uint32_t>(COLOR_COUNT, 0);
    do 
    {
        bool indicesExhausted = true;

        std::vector<uint32_t> sameHeightsColorIndex = std::vector<uint32_t>();
        std::vector<uint32_t> sameHeightsSubIndex = std::vector<uint32_t>();

        for (uint32_t i = 0; i < COLOR_COUNT; ++i) {                   
            if (indices[i] < gameState.pieceLists[i].size()) {
                indicesExhausted = false;
                if (gameState.pieceLists[i][indices[i]].height == height) {
                    sameHeightsColorIndex.push_back(i);
                    sameHeightsSubIndex.push_back(indices[i]);
                    ++indices[i];
                }              
            }
        }       

        if (indicesExhausted) exit = true;
        else {
            for (uint32_t i = 0; i < sameHeightsColorIndex.size(); ++i) {
                if (symmetries[sameHeightsColorIndex[i]] != sameHeightsColorIndex[i]) continue;
                std::unordered_set<uint32_t> dupSet = std::unordered_set<uint32_t>();
                for (uint32_t j = i + 1; j < sameHeightsColorIndex.size(); ++j)
                {
                    if (dupSet.count(symmetries[sameHeightsColorIndex[j]]) == 1) continue;
                    dupSet.insert(symmetries[sameHeightsColorIndex[j]]);
                    result.push_back({ sameHeightsColorIndex[i], sameHeightsSubIndex[i], sameHeightsColorIndex[j], sameHeightsSubIndex[j] });
                    if (symmetries[sameHeightsColorIndex[j]] != sameHeightsColorIndex[i]) {
                        result.push_back({ sameHeightsColorIndex[j], sameHeightsSubIndex[j], sameHeightsColorIndex[i], sameHeightsSubIndex[i] });
                    }
                }
            }            
        }
        ++height;
    } while (!exit);
    return result;
}




// MoveResult * getPossibleMoves(PieceStack* arr, uint32_t len, uint32_t * wLen) {

    // hardcode for now
    //// also could reduce branches, by piece symmetry, since there is nothing special about any one PieceId
    //const uint32_t movesUpperBound = 32;
    //bool same[4] = { false };
    //{
    //    int idCount[4] = { 0 };
    //    for (uint32_t i = 0; i < len; ++i) idCount[arr[i].id]++;
    //    uint32_t indices[4] = { 0 };
    //    PieceStack* piece[4] = { 0 };
    //    piece[0] = (PieceStack*)malloc(idCount[0] * sizeof(PieceStack));
    //    piece[1] = (PieceStack*)malloc(idCount[1] * sizeof(PieceStack));
    //    piece[2] = (PieceStack*)malloc(idCount[2] * sizeof(PieceStack));
    //    piece[3] = (PieceStack*)malloc(idCount[3] * sizeof(PieceStack));
    //    for (uint32_t i = 0; i < len; ++i) {
    //        piece[arr[i].id][indices[arr[i].id]] = arr[i];
    //        ++indices[arr[i].id];
    //    }
    //    // bubble sort
    //    for (uint32_t i = 0; i < 4; ++i)
    //    for (int j = 0; j < idCount[i] - 1; ++j)
    //    for (int k = 0; k < (idCount[i] - j - 1); ++k) {
    //        if ((piece[i])[k].height > piece[i][k + 1].height)
    //             std::swap(piece[i][k], piece[i][k + 1]);
    //    }

    //    for (uint32_t i = 0; i < 3; ++i) {
    //        for (uint32_t j = i + 1; j < 4; ++j) {
    //            if (idCount[i] == idCount[j] && same[j] == false) {
    //                for (uint32_t k = 0; k < idCount[i]; ++k) {
    //                    if (piece[i][k].height != piece[j][k].height) {                           
    //                        break;
    //                    }
    //                    else if (k == idCount[i] - 1)  same[j] = true;
    //                }
    //            }
    //        }
    //    }

    //    free(piece[0]);
    //    free(piece[1]);
    //    free(piece[2]);
    //    free(piece[3]);     
    //}

    //uint32_t count = 0;
    //MoveResult * moves = (MoveResult *)malloc(sizeof(MoveResult) * movesUpperBound);
    //for (uint32_t i = 0; i < len; ++i) {
    //    if (same[arr[i].id]) continue;
    //    for (uint32_t j = 0; j < len; ++j) {
    //        if (i == j) continue;
    //        const bool heightsMatch = arr[i].height == arr[j].height;
    //        const bool idsMatch = arr[i].id == arr[j].id;
    //        bool moveAlreadyLoggedForward = false;
    //        bool moveAlreadyLoggedBack = false;
    //        for (uint32_t k = 0; k < count; ++k) {
    //            if (
    //                moves[k].top.height == arr[i].height
    //                && moves[k].top.id == arr[i].id
    //                && moves[k].bottom.height == arr[j].height
    //                && moves[k].bottom.id == arr[j].id) {
    //                moveAlreadyLoggedForward = true;
    //            }
    //            if (
    //                moves[k].bottom.height == arr[i].height
    //                && moves[k].bottom.id == arr[i].id
    //                && moves[k].top.height == arr[j].height
    //                && moves[k].top.id == arr[j].id) {
    //                moveAlreadyLoggedBack = true;
    //            }
    //        }

    //        if (heightsMatch && idsMatch && !moveAlreadyLoggedForward) {
    //            moves[count] = { arr[i], arr[j], i, j };
    //            ++count;
    //            if (same[arr[j].id] && !moveAlreadyLoggedBack) {
    //                moves[count] = { arr[j], arr[i], j, i };
    //                ++count;
    //            }
    //        }
    //        else if (idsMatch && !moveAlreadyLoggedForward) {
    //            moves[count] = { arr[i], arr[j], i, j };
    //            ++count;
    //            if (same[arr[j].id] && !moveAlreadyLoggedBack) {
    //                moves[count] = { arr[j], arr[i], j, i };
    //                ++count;
    //            }
    //        }
    //        else if (heightsMatch) {
    //            if (!moveAlreadyLoggedForward) {
    //                moves[count] = { arr[i], arr[j], i, j };
    //                ++count;
    //            }
    //            if (!moveAlreadyLoggedBack) {
    //                moves[count] = { arr[j], arr[i], j, i };
    //                ++count;
    //            }
    //        }
    //    }
    //}

    //(*wLen) = count;
    //return moves;
// }

void getAllSymmertricBoardSpaces()
{
    std::vector<std::vector<uint32_t>> heightPartition = std::vector<std::vector<uint32_t>>();
    for (uint32_t i = 1; i <= PIECE_COUNT; ++i) {
        heightPartition = nextPartition(heightPartition, i);
    }

    std::unordered_set<GameState, GameStateHash> allGameStates = std::unordered_set<GameState, GameStateHash>();
    for (uint32_t i = 0; i < heightPartition.size(); ++i) {
        // returns dupes!!!
        std::vector<GameState> gameStates = getBoardHeightSpaceSubColorSpace(heightPartition[i]);
        for (uint32_t j = 0; j < gameStates.size(); ++j)
            if (allGameStates.insert(gameStates[j]).second == false) {
                std::cout << std::endl;
            }
    }

    std::unordered_map<GameState, std::vector<MoveResult>, GameStateHash> map = std::unordered_map<GameState, std::vector<MoveResult>, GameStateHash>();   
    for (auto const& gameState : allGameStates) {
        
        std::vector<MoveResult> moves = getPossibleMoves(gameState);

        map.insert({ gameState, moves });
    }
}


//PieceStack * applyMoveToGameState(PieceStack* arr, uint32_t len, MoveResult moveToApply, uint32_t * wLen)
//{
//    uint32_t gameStateLength;
//    PieceStack* newGameState;
//    if (moveToApply.topIndex == 0 && moveToApply.bottomIndex == 0) {
//        gameStateLength = len;
//        newGameState = (PieceStack*)malloc(sizeof(PieceStack) * gameStateLength);
//        for (uint32_t i = 0; i < gameStateLength; i++) newGameState[i] = arr[i];
//    }
//    else {
//        gameStateLength = len - 1;
//        // apply move result;
//        newGameState = (PieceStack*)malloc(sizeof(PieceStack) * gameStateLength);
//
//        int j = 0;
//        for (uint32_t i = 0; i < len; i++) {
//            if (moveToApply.bottomIndex == i || moveToApply.topIndex == i) continue;
//            newGameState[j] = arr[i];
//            ++j;
//        }
//        newGameState[j] = { (uint16_t)(moveToApply.top.height + moveToApply.bottom.height), moveToApply.top.id };
//    }
//    (*wLen) = gameStateLength;
//    return newGameState;
//}

//BranchResult SolunaAlgorithm(PieceStack* arr, uint32_t len, MoveResult moveToApply, uint16_t parity)
//{
//    const bool opponentsTurn = (parity % 2);
//   
//    uint32_t gameStateLength;
//    PieceStack * newGameState = applyMoveToGameState(arr, len, moveToApply, &gameStateLength);
//
//    uint32_t moveLength = 0;
//    MoveResult* moves = getPossibleMoves(newGameState, gameStateLength, &moveLength);
//
//    // leaf node
//    if (moveLength == 0) {        
//        free(newGameState);
//        free(moves);
//        return { 1, (opponentsTurn ? 1u : 0u), opponentsTurn };
//    }
//
//    BranchResult result = {0, 0, false};
//
//    for (uint32_t i = 0; i < moveLength; i++)
//    {
//        const MoveResult move = moves[i];
//        const BranchResult branchResult = SolunaAlgorithm(newGameState, gameStateLength, move, parity + 1);
//
//        // on your turn if there exists a branch where you win return true
//        if (!opponentsTurn && branchResult.guaranteedWin) {
//            if (parity == 0) {
//                returnMove = move;
//            }
//            result.guaranteedWin = true;            
//        }
//
//        result.leafCount += branchResult.leafCount;
//        result.leafVictory += branchResult.leafVictory;
//    }
//
//
//    // choose best path here
//    if (!opponentsTurn && !result.guaranteedWin) {
//    }
//
//    free(newGameState);
//    free(moves);
//    return result;
//}

//PieceStack* generateRandomStartingGame(uint32_t * wLen)
//{
//    PieceStack* gameState = (PieceStack*)malloc(sizeof(PieceStack) * PIECE_COUNT);
//    for (uint32_t i = 0; i < PIECE_COUNT; i++)
//    {
//        // since modulo by 4, fits neatly into rand range
//        PieceId idNumb = (PieceId)(rand() % 4);
//        gameState[i] = { 1, idNumb };
//    }
//
//    (*wLen) = PIECE_COUNT;
//
//    return gameState;
//}
//// returns true when there is more gameStates


int main()
{
    getAllSymmertricBoardSpaces();
    return 0;
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

   /* {
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
        BranchResult result = SolunaAlgorithm(board, 12, { 0 }, 0);
        std::cout << "Leaf nodes " <<result.leafCount << " Leaf Victory " << result.leafVictory << std::endl;
        std::cout << "Determined: " << (result.guaranteedWin ? "true, " : "false, ") << "Move " << enumNames[returnMove.top.id] << " " << returnMove.top.height << " Onto " << enumNames[returnMove.bottom.id] << " " << returnMove.bottom.height << std::endl;
    }*/
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
