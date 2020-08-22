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
template <class PieceStack>
bool operator==(const std::vector<PieceStack>& pieceList1, const std::vector<PieceStack>& pieceList2) {
    if (pieceList1.size() != pieceList2.size()) return false;
    for (uint32_t i = 0; i < pieceList1.size(); ++i) {
        if (pieceList1[i].height != pieceList2[i].height || pieceList1[i].count != pieceList2[i].count) {
            return false;
        }
    }

    return true;
}

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

std::unordered_map<std::vector<PieceStack>, uint32_t, ColorPieceVector> generatePartitionIdMap()
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
                    pieces.push_back({ heightCountPartition[j][nmbIdx], (k - nmbIdx) });
                    nmbIdx = k;
                }
                if (k == heightCountPartition[j].size() - 1) {
                    pieces.push_back({ heightCountPartition[j][nmbIdx], (k - nmbIdx) + 1 });
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

GameState applyMoveToGameState(const GameState& gameState, MoveResult move)
{
    GameState newGameState = gameState;
    uint32_t newHeight = newGameState.pieceLists[move.bottomColorIndex][move.bottomSubIndex].height + newGameState.pieceLists[move.topColorIndex][move.topSubIndex].height;
    --newGameState.pieceLists[move.bottomColorIndex][move.bottomSubIndex].count;
    if (newGameState.pieceLists[move.bottomColorIndex][move.bottomSubIndex].count == 0) {
        for (uint32_t i = move.bottomSubIndex; i < newGameState.pieceLists[move.bottomColorIndex].size() - 1; ++i) {
            newGameState.pieceLists[move.bottomColorIndex][i] = newGameState.pieceLists[move.bottomColorIndex][i + 1];
        }
        newGameState.pieceLists[move.bottomColorIndex].resize(newGameState.pieceLists[move.bottomColorIndex].size() - 1);
    }

    --newGameState.pieceLists[move.topColorIndex][move.topSubIndex].count;
    if (newGameState.pieceLists[move.topColorIndex][move.topSubIndex].count == 0) {
        for (uint32_t i = move.topSubIndex; i < newGameState.pieceLists[move.topColorIndex].size() - 1; ++i) {
            newGameState.pieceLists[move.topColorIndex][i] = newGameState.pieceLists[move.topColorIndex][i + 1];
        }
        newGameState.pieceLists[move.topColorIndex].resize(newGameState.pieceLists[move.topColorIndex].size() - 1);
    }

    for (uint32_t i = move.topSubIndex; i < newGameState.pieceLists[move.topColorIndex].size(); ++i) {
        if (newGameState.pieceLists[move.topColorIndex][i].height == newHeight) {
            ++newGameState.pieceLists[move.topColorIndex][i].count;
            break;
        }
        else if (newGameState.pieceLists[move.topColorIndex][i].height > newHeight || i == newGameState.pieceLists[move.topColorIndex].size() - 1) {
            newGameState.pieceLists[move.topColorIndex].insert(newGameState.pieceLists[move.topColorIndex].begin() + i, { {newHeight, 1 } });
            break;
        }
    }

    return newGameState;
}

BranchResult SolunaAlgorithm
(
    const GameState gameState,
    std::unordered_map<GameState, std::vector<MoveResult>, GameStateHash>& moveMap,
    std::unordered_map<GameState, BranchResult, GameStateHash>& branchResultMap,
    uint32_t parity = 0
    )
{
    auto cached = branchResultMap.find(gameState);
    if (cached != branchResultMap.end()) {
        return cached->second;
    }

    const bool opponentsTurn = (parity % 2);

    assert(moveMap.find(gameState) != moveMap.end());
    std::vector<MoveResult> moves = moveMap[gameState];

    // leaf node
    if (moves.size() == 0) {
        BranchResult result = { 1, (opponentsTurn ? 1u : 0u), opponentsTurn };
        branchResultMap.insert({ gameState, result });
        return result;
    }

    BranchResult result = { 0, 0, false };

    for (const auto move : moves)
    {
        const GameState newGameState = applyMoveToGameState(gameState, move);

        const BranchResult branchResult = SolunaAlgorithm(newGameState, moveMap, branchResultMap, parity + 1);

        // on your turn if there exists a branch where you win return true
        if (!opponentsTurn && branchResult.guaranteedWin) {
            if (parity == 0) {
                returnMove = move;
            }
            result.guaranteedWin = true;
        }

        result.leafCount += branchResult.leafCount;
        result.leafVictory += branchResult.leafVictory;
    }


    // choose best path here
    if (!opponentsTurn && !result.guaranteedWin) {
        //
    }

    branchResultMap.insert({ gameState, result });
    return result;
}

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

    std::unordered_map<GameState, std::vector<MoveResult>, GameStateHash> moveMap = std::unordered_map<GameState, std::vector<MoveResult>, GameStateHash>();

    // std::unordered_map<std::vector<PieceStack>, uint32_t, ColorPieceVector> A = generatePartitionIdMap();
    for (auto const& gameState : allGameStates) {      
        std::vector<MoveResult> moves = getPossibleMoves(gameState);

        moveMap.insert({ gameState, moves });
    }
    
    std::unordered_map<GameState, BranchResult, GameStateHash> branchMap = std::unordered_map<GameState, BranchResult, GameStateHash>();

    for (auto const& gameState : allGameStates) {
        branchMap.insert({ gameState, SolunaAlgorithm(gameState, moveMap, branchMap) });
    }
}

int main()
{
    getAllSymmertricBoardSpaces();
    return 0;
}
