// SolunaAlgorithm.cpp : This file contains the 'main' function. Program execution begins and ends there.
//
#include <iostream>
#include <algorithm>
#include <stdio.h>
#include <assert.h> 
#include <vector>
#include <set>
#include <map>
#include <unordered_set>
#include <unordered_map>
#include <chrono>


// copy of boosts hash_combine
template <class T>
inline void hash_combine(std::size_t& s, const T& v) {
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


struct GameStateHash {
    size_t operator()(const std::vector<uint32_t>& gameState) const {
        size_t hsh = std::hash<uint32_t>{}(gameState.size());
        for (uint32_t i = 0; i < gameState.size(); ++i) {
            // order matters!
            hash_combine(hsh, gameState[i]);
        }
        return hsh;
    }
};

struct PartitionHash {
    size_t operator()(const std::map<uint32_t, uint32_t>& partition) const {
        size_t hsh = std::hash<uint32_t>{}(partition.size());
        for (const auto id : partition) {
            // order matters!
            hash_combine(hsh, id.first);
            hash_combine(hsh, id.second);
        }
        return hsh;
    }
};

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

// recursive function, rewrite into iterative, this is the biggest choke point, exponential growth in color count
// essentialy constrained orderless combinations
void getAllGameStates
(
    std::vector<std::vector<uint32_t>> & wResult,
    const std::vector<uint32_t> & optionPieceCount,
    const std::vector<uint32_t> & options,
    uint32_t optionIndex,
    const uint32_t & maxItemCount,
    const uint32_t & maxPieceCount,
    std::vector<uint32_t> current,
    uint32_t currentPieceCount  
)
{  
    for (uint32_t i = optionIndex; i < options.size(); ++i) {

        uint32_t idPieceCount = optionPieceCount[i];

        if (idPieceCount + currentPieceCount > maxPieceCount) continue;
       
        std::vector<uint32_t> copy = current;
        copy.push_back(options[i]);
      
        if (currentPieceCount + idPieceCount == maxPieceCount) {
            wResult.push_back(copy);
        }
        else if (copy.size() < maxItemCount) {
            getAllGameStates(wResult, optionPieceCount, options, i, maxItemCount, maxPieceCount, copy, currentPieceCount + idPieceCount);
        }
    }
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

void generatePartitionIdMaps
(
    std::unordered_map<std::map<uint32_t, uint32_t>, uint32_t, PartitionHash> &partitionToIdMap,
    std::unordered_map<uint32_t, std::map<uint32_t, uint32_t>> &idToPartitionMap,
    std::vector<uint32_t> & idPieceCounts,
    std::vector<uint32_t> & ids
)
{
    partitionToIdMap = std::unordered_map<std::map<uint32_t, uint32_t>, uint32_t, PartitionHash>();
    idToPartitionMap = std::unordered_map<uint32_t, std::map<uint32_t, uint32_t>>();
    idPieceCounts = std::vector<uint32_t>();
    ids = std::vector<uint32_t>();

    std::vector<std::vector<uint32_t>> heightCountPartition = std::vector<std::vector<uint32_t>>();
    uint32_t partitionId = 0;
    for (uint32_t i = 1; i <= PIECE_COUNT; ++i) {
        heightCountPartition = nextPartition(heightCountPartition, i);
        for (uint32_t j = 0; j < heightCountPartition.size(); ++j) {
            std::map<uint32_t, uint32_t> partitionMap = std::map<uint32_t, uint32_t>();
            uint32_t nmbIdx = 0;
            for (uint32_t k = 0; k < heightCountPartition[j].size(); ++k) {                
                if (heightCountPartition[j][k] != heightCountPartition[j][nmbIdx]) {
                    partitionMap.insert({ heightCountPartition[j][nmbIdx], (k - nmbIdx) });
                    nmbIdx = k;
                }
                if (k == heightCountPartition[j].size() - 1) {
                    partitionMap.insert({ heightCountPartition[j][nmbIdx], (k - nmbIdx) + 1 });
                }
            }
            ids.push_back(partitionId);
            idPieceCounts.push_back(i);
            partitionToIdMap.insert({ partitionMap, partitionId });
            idToPartitionMap.insert({ partitionId, partitionMap });
            ++partitionId;
        }        
    }
}

std::vector<uint32_t> copyAndApplyPartitionIdChanges
(
    const std::vector<uint32_t> & gameState,
    // Both of these arrays will never be greater than 2, and always contains at least 1 entry each
    // comes from the fact a move only effects two pieces
    std::vector<uint32_t> remove,
    std::vector<uint32_t> add
) {
    std::vector<uint32_t> result = std::vector<uint32_t>();
    result.reserve(gameState.size() + add.size() - remove.size());
    bool usedRemoves[2] = { false };
    bool usedAdds[2] = { false };

    for (uint32_t i = 0; i < gameState.size(); i++) {
        if ((!usedRemoves[0] && gameState[i] == remove[0]) || (!usedRemoves[1] &&remove.size() > 1 && gameState[i] == remove[1])) {
            if (!usedRemoves[0] && gameState[i] == remove[0]) {
                usedRemoves[0] = true;
                continue;
            }
            if (!usedRemoves[0] && remove.size() > 1 && gameState[i] == remove[1]) {
                usedRemoves[1] = true;
                continue;
            }
        }

        if (!usedAdds[0] && gameState[i] > add[0]) {
            if (!usedAdds[1] && add.size() > 1 && add[1] < add[0]) {
                usedAdds[1] = true;
                result.push_back(add[1]);
            }
            usedAdds[0] = true;
            result.push_back(add[0]);
        }

        if (add.size() > 1 && !usedAdds[1] && gameState[i] > add[1]) {
            usedAdds[1] = true;
            result.push_back(add[1]); 
        }

        result.push_back(gameState[i]);
    }
    return result;
}

std::vector<std::vector<uint32_t>> getPossibleNextStates
(
    const std::vector<uint32_t> & gameState,
    const std::unordered_map<uint32_t, std::map<uint32_t, uint32_t>> & idToPartitionMap,
    const std::unordered_map<std::map<uint32_t, uint32_t>, uint32_t, PartitionHash>& partitionToIdMap,
    const std::vector<uint32_t> & pieceCountVec
) {

    std::vector<std::vector<uint32_t>> result = std::vector<std::vector<uint32_t>>();

    std::vector<uint32_t> heightPartitionIds = std::vector<uint32_t>();
    std::vector<std::map<uint32_t, uint32_t>> heightPartitions = std::vector<std::map<uint32_t, uint32_t>>();
    std::vector<uint32_t> heightPartitionCount = std::vector<uint32_t>();

    uint32_t currIdx = 0;
    for (uint32_t i = 0; i < gameState.size(); ++i) {
        if (gameState[currIdx] != gameState[i]) {
            heightPartitionIds.push_back(gameState[currIdx]);
            heightPartitionCount.push_back(i - currIdx);
            heightPartitions.push_back(idToPartitionMap.at(gameState[currIdx]));
            currIdx = i;
        }
        if (i == gameState.size() - 1) {
            heightPartitionIds.push_back(gameState[currIdx]);
            heightPartitionCount.push_back(i - currIdx + 1);
            heightPartitions.push_back(idToPartitionMap.at(gameState[currIdx]));
        }
    }

    // get new game states for when colors are same
    for (uint32_t i = 0; i < heightPartitions.size(); ++i) {
        for (auto it = heightPartitions[i].begin(); it != heightPartitions[i].end(); ++it) {
            std::pair<uint32_t, uint32_t> pair = (*it);
            // count of piece is more than one can merge with piece of same height and color
            if (pair.second > 1) {
                std::map<uint32_t, uint32_t> heightPartitionCopy = heightPartitions[i];
                if (heightPartitionCopy[(*it).first] == 2) heightPartitionCopy.erase((*it).first);                
                else heightPartitionCopy[(*it).first] -=2;
                ++heightPartitionCopy[pair.first + pair.first];
                result.push_back(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i] }, { partitionToIdMap.at(heightPartitionCopy) }));
            }

            
            for (auto subIt = it; subIt != heightPartitions[i].end(); ++subIt) {
                if (subIt == it) continue;               
                std::pair<uint32_t, uint32_t> subPair = (*subIt);
                uint32_t newHeight = pair.first + subPair.first;
                std::map<uint32_t, uint32_t> heightPartitionCopy = heightPartitions[i];              
                if (heightPartitionCopy[(*it).first] == 1)heightPartitionCopy.erase((*it).first);
                else --heightPartitionCopy[(*it).first];

                if (heightPartitionCopy[(*subIt).first] == 1)heightPartitionCopy.erase((*subIt).first);
                else --heightPartitionCopy[(*subIt).first];

                ++heightPartitionCopy[newHeight];   
                result.push_back(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i] }, { partitionToIdMap.at(heightPartitionCopy) }));
            }
        }      
    }

    // get new game states when height states are the same
    for (uint32_t i = 0; i < heightPartitions.size(); ++i) {

        if (heightPartitionCount[i] > 1) {
            for (auto it = heightPartitions[i].begin(); it != heightPartitions[i].end(); ++it) {
                std::pair<uint32_t, uint32_t> pair = (*it);
                uint32_t newHeight = 2 * pair.first;

                std::map<uint32_t, uint32_t> heightPartitionCopyI = heightPartitions[i];                
                if (heightPartitionCopyI[pair.first] == 1) heightPartitionCopyI.erase(pair.first);
                else --heightPartitionCopyI[pair.first];

                std::map<uint32_t, uint32_t> heightPartitionCopyJ = heightPartitions[i];                
                if (heightPartitionCopyJ[pair.first] == 1)heightPartitionCopyJ.erase(pair.first);
                else --heightPartitionCopyJ[pair.first];

                ++heightPartitionCopyI[newHeight];
             
                std::vector<uint32_t> partitionIdsToAdd;
                if (heightPartitionCopyI.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyI));
                if (heightPartitionCopyJ.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyJ));
                result.push_back(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i], heightPartitionIds[i] }, partitionIdsToAdd));
            }
        }

        for (auto it = heightPartitions[i].begin(); it != heightPartitions[i].end(); ++it) {
            std::pair<uint32_t, uint32_t> pair = (*it);
            
            for (uint32_t j = i + 1; j < heightPartitions.size(); ++j) {
                auto it = heightPartitions[j].find(pair.first);
                if (it != heightPartitions[j].end()) {
                    {
                        uint32_t newHeight = 2 * pair.first;

                        std::map<uint32_t, uint32_t> heightPartitionCopyI = heightPartitions[i];
                        if (heightPartitionCopyI[pair.first] == 1) heightPartitionCopyI.erase(pair.first);                       
                        else --heightPartitionCopyI[pair.first];

                        std::map<uint32_t, uint32_t> heightPartitionCopyJ = heightPartitions[j];                        
                        if (heightPartitionCopyJ[pair.first] == 1)heightPartitionCopyJ.erase(pair.first);                        
                        else --heightPartitionCopyJ[pair.first];

                        ++heightPartitionCopyI[newHeight];
                      
                        std::vector<uint32_t> partitionIdsToAdd;
                        if (heightPartitionCopyI.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyI));
                        if (heightPartitionCopyJ.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyJ));
                        result.push_back(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i], heightPartitionIds[j] }, partitionIdsToAdd));
                    }
                    {
                        uint32_t newHeight = 2 * pair.first;

                        std::map<uint32_t, uint32_t> heightPartitionCopyI = heightPartitions[i];
                        if (heightPartitionCopyI[pair.first] == 1) heightPartitionCopyI.erase(pair.first);
                        else --heightPartitionCopyI[pair.first];

                        std::map<uint32_t, uint32_t> heightPartitionCopyJ = heightPartitions[j];
                        if (heightPartitionCopyJ[pair.first] == 1)heightPartitionCopyJ.erase(pair.first);
                        else --heightPartitionCopyJ[pair.first];


                        // diff on this line from above, symmetry for which height is on top
                        ++heightPartitionCopyJ[newHeight];
                    
                        std::vector<uint32_t> partitionIdsToAdd;
                        if (heightPartitionCopyI.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyI));
                        if (heightPartitionCopyJ.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(heightPartitionCopyJ));
                        result.push_back(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i], heightPartitionIds[j] }, partitionIdsToAdd));
                    }
                }
            }
        }
    }
    
    return result;
}

BranchResult SolunaAlgorithm
(
    const std::vector<uint32_t> & gameState,
    const std::unordered_map<std::vector<uint32_t>, std::vector<std::vector<uint32_t>>, GameStateHash>& moveMap,
    std::unordered_map<std::vector<uint32_t>, BranchResult, GameStateHash>& branchResultMap,
    uint32_t parity = 0
) {
    auto cached = branchResultMap.find(gameState);
    if (cached != branchResultMap.end()) {
        return cached->second;
    }

    const bool opponentsTurn = (parity % 2);

    assert(moveMap.find(gameState) != moveMap.end());

    auto moveStates = moveMap.at(gameState);

    // leaf node
    if (moveStates.size() == 0) {
        BranchResult result = { 1, (opponentsTurn ? 1u : 0u), opponentsTurn };
        branchResultMap.insert({ gameState, result });
        return result;
    }

    BranchResult result = { 0, 0, false };

    for (const auto newGameState : moveStates)
    {    
        const BranchResult branchResult = SolunaAlgorithm(newGameState, moveMap, branchResultMap, parity + 1);

        // on your turn if there exists a branch where you win return true
        if (!opponentsTurn && branchResult.guaranteedWin) {
            if (parity == 0) {
                // returnMove = move;
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
    auto start = std::chrono::system_clock::now();
    std::unordered_map<std::map<uint32_t, uint32_t>, uint32_t, PartitionHash> partitionToIdMap;
    std::unordered_map<uint32_t, std::map<uint32_t, uint32_t>> idToPartitionMap;
    // essentially just the sum of ids
    std::vector<uint32_t> idPieceCounts;
    std::vector<uint32_t> ids;
    generatePartitionIdMaps(partitionToIdMap, idToPartitionMap, idPieceCounts, ids);

    std::vector<std::vector<uint32_t>> allGameStates;
    getAllGameStates(allGameStates, idPieceCounts, ids, 0, COLOR_COUNT, PIECE_COUNT, {}, 0);

    std::unordered_map<std::vector<uint32_t>, std::vector<std::vector<uint32_t>>, GameStateHash> moveMap;

    for (uint32_t i = 0; i < allGameStates.size(); ++i) {
        moveMap.insert({ allGameStates[i], getPossibleNextStates(allGameStates[i], idToPartitionMap, partitionToIdMap, idPieceCounts) });
    }

    std::unordered_map<std::vector<uint32_t>, BranchResult, GameStateHash> branchResultMap;
    for (uint32_t i = 0; i < allGameStates.size(); ++i) {
        SolunaAlgorithm(allGameStates[i], moveMap, branchResultMap);
    }

    auto end = std::chrono::system_clock::now();
    auto duration = (end - start);
    auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
    std::cout << "\r" << millis << std::endl;
}

int main()
{
    getAllSymmertricBoardSpaces();
    return 0;
}
