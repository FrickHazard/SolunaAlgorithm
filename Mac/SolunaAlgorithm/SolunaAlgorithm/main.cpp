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

struct PartitionNumber {
    uint32_t number;
    uint32_t count;
} typedef PieceStack;

struct BranchResult {
    uint32_t leafCount;
    uint32_t leafVictory;
    bool guaranteedWin;
    uint32_t flipMoveCount;
} typedef BranchResult;
struct GameStateHash {
    size_t operator()(const std::vector<uint32_t>& gameState) const {
        size_t hsh = std::hash<uint32_t>{}((uint32_t)gameState.size());
        for (uint32_t i = 0; i < gameState.size(); ++i) {
            // order matters!
            hash_combine(hsh, gameState[i]);
        }
        return hsh;
    }
};

struct PartitionHash {
    size_t operator()(const std::vector<PartitionNumber>& partition) const {
        size_t hsh = std::hash<uint32_t>{}((uint32_t)partition.size());
        for (uint32_t i = 0;  i < partition.size(); ++i) {
            // order matters!
            hash_combine(hsh, partition[i].number);
            hash_combine(hsh, partition[i].count);
        }
        return hsh;
    }
};

bool operator == (const std::vector<PartitionNumber>& partition1, const std::vector<PartitionNumber>& partition2) {
    if (partition1.size() != partition2.size()) return false;
    for (uint32_t i = 0;  i < partition1.size(); ++i) {
        if (partition1[i].number != partition2[i].number || partition1[i].count != partition2[i].count) return false;    
    }
    return true;
}

struct ModuleState {
    uint32_t COLOR_COUNT;
    uint32_t PIECE_COUNT;
    std::vector<std::vector<uint32_t>> allGameStates;
    std::vector<std::vector<uint32_t>> allMoves;
    std::vector<BranchResult> allBranchResults;
    std::vector<uint32_t> initialStates;
    std::vector<std::vector<PartitionNumber>> allPartitions;
} state;

// recursive function, rewrite into iterative, this is the biggest choke point, exponential growth in color count
// essentialy constrained orderless combinations
void getAllGameStates
(
    std::vector<std::vector<uint32_t>> & wResult,
    const std::vector<uint32_t> & optionPieceCount,
    const uint32_t optionCount,
    uint32_t optionIndex,
    const uint32_t & maxItemCount,
    const uint32_t & maxPieceCount,
    std::vector<uint32_t> current,
    uint32_t currentPieceCount
)
{
    for (uint32_t i = optionIndex; i < optionCount; ++i) {

        uint32_t idPieceCount = optionPieceCount[i];

        if (idPieceCount + currentPieceCount > maxPieceCount) continue;
       
        std::vector<uint32_t> copy = current;
        copy.push_back(i);
      
        if (currentPieceCount + idPieceCount == maxPieceCount) {
            wResult.push_back(copy);
        }
        else if (copy.size() < maxItemCount) {
            getAllGameStates(wResult, optionPieceCount, optionCount, i, maxItemCount, maxPieceCount, copy, currentPieceCount + idPieceCount);
        }
    }
}

std::vector<std::vector<PartitionNumber>> nextPartition(std::vector<std::vector<PartitionNumber>> prevPartition, uint32_t n)
{
    std::vector<std::vector<PartitionNumber>> result;
    for (uint32_t i = 0; i < prevPartition.size(); i++)
    {
        std::vector<PartitionNumber> withOne;
        if (prevPartition[i][0].number != 1) {
            withOne.push_back({ 1, 1 });
        }

        for (uint32_t j = 0; j < prevPartition[i].size(); j++) {
            if (j == 1 && prevPartition[i][0].number < prevPartition[i][1].number && prevPartition[i][0].count == 1) {
                std::vector<PartitionNumber> permutation;
                if (prevPartition[i][0].number + 1 != prevPartition[i][1].number) {
                    permutation.push_back({ prevPartition[i][0].number + 1, prevPartition[i][0].count });
                }
                for (uint32_t k = 1; k < prevPartition[i].size(); k++) {
                    permutation.push_back(prevPartition[i][k]);
                    if (k == 1 && prevPartition[i][0].number + 1 == prevPartition[i][1].number) {
                        ++permutation[0].count;
                    }
                }
                result.push_back(permutation);
            }
            
            withOne.push_back(prevPartition[i][j]);
            
            if (j == 0 && prevPartition[i][j].number == 1)
                ++withOne[0].count;
        }
        result.push_back(withOne);
    }
    result.push_back({ { n, 1 } });
    return result;
}

void generatePartitionIdMaps
(
    std::unordered_map<std::vector<PartitionNumber>, uint32_t, PartitionHash> &partitionToIdMap,
    std::vector<std::vector<PartitionNumber>> &allPartitions,
    std::vector<uint32_t> & idPieceCounts,
    const uint32_t PIECE_COUNT
)
{
    partitionToIdMap = std::unordered_map<std::vector<PartitionNumber>, uint32_t, PartitionHash>();
    allPartitions = std::vector<std::vector<PartitionNumber>>();
    idPieceCounts = std::vector<uint32_t>();

    std::vector<std::vector<PartitionNumber>> heightCountPartition;
    uint32_t partitionId = 0;
    for (uint32_t i = 1; i <= PIECE_COUNT; ++i) {
        heightCountPartition = nextPartition(heightCountPartition, i);
        for (uint32_t j = 0; j < heightCountPartition.size(); ++j) {
            idPieceCounts.push_back(i);
            partitionToIdMap.insert({ heightCountPartition[j], partitionId });
            allPartitions.push_back(heightCountPartition[j]);
            ++partitionId;
        }
    }
}

std::vector<PartitionNumber> copyAndApplyPartitionChanges
(
   const std::vector<PartitionNumber> & partition,
   std::vector<uint32_t> remove,
   uint32_t add
) {
    std::vector<PartitionNumber> result;
    
    if (remove.size() == 1) remove.push_back(0);
    bool notAdded = true;
    for (uint32_t i = 0; i < partition.size(); i++) {
        if (remove[0] == partition[i].number || remove[1] == partition[i].number) {
            if (remove[0] == partition[i].number && remove[1] == partition[i].number) {
                if (partition[i].count > 2){
                    result.push_back({ partition[i].number, partition[i].count - 2 });
                }
            }
            else if (partition[i].count > 1) {
                result.push_back({ partition[i].number, partition[i].count - 1 });
            }
        }
    
        else {
            if (add == partition[i].number) {
                result.push_back({ partition[i].number, partition[i].count + 1});
                notAdded = false;
            }
            else if (notAdded && add < partition[i].number && add != 0) {
                result.push_back({ add, 1 });
                result.push_back(partition[i]);
                notAdded = false;
            }
            else {
                result.push_back(partition[i]);
            }
        }
        
        if (i == partition.size() - 1 && notAdded && add > partition[i].number) {
            result.push_back({ add, 1 });
        }
    }
    return result;
}

std::vector<uint32_t> copyAndApplyPartitionIdChanges
(
    const std::vector<uint32_t> & gameState,
    // Both of these arrays will never be greater than 2, and always contains at least 1 entry each
    // comes from the fact a move only effects two pieces
    std::vector<uint32_t> remove,
    std::vector<uint32_t> add
) {
    std::vector<uint32_t> result;
    result.reserve(gameState.size() + add.size() - remove.size());
    
    if (add.size() > 1 && add[1] < add[0]) std::swap(add[0], add[1]);
    
    bool usedRemoves[2] = { false };
    bool usedAdds[2] = { false };

    for (uint32_t i = 0; i < gameState.size(); i++) {
        bool addThisNumb = true;
        if ((!usedRemoves[0] && gameState[i] == remove[0]) || (!usedRemoves[1] && remove.size() > 1 && gameState[i] == remove[1])) {
            if (!usedRemoves[0] && gameState[i] == remove[0]) {
                usedRemoves[0] = true;
            }
            else {
                usedRemoves[1] = true;
            }
            addThisNumb = false;
        }

        if (!usedAdds[0] && gameState[i] > add[0]) {
            usedAdds[0] = true;
            result.push_back(add[0]);
        }

        if (add.size() > 1 && !usedAdds[1] && gameState[i] > add[1]) {
            usedAdds[1] = true;
            result.push_back(add[1]);
        }

        if (addThisNumb) result.push_back(gameState[i]);
        
        if (i == gameState.size() - 1) {
            if (!usedAdds[0]) result.push_back(add[0]);
            if (!usedAdds[1] && add.size() > 1) result.push_back(add[1]);
        }
    }
    return result;
}

std::vector<uint32_t> getPossibleNextStates
(
    const std::vector<uint32_t> & gameState,
    const std::vector<std::vector<PartitionNumber>> & allPartitions,
    const std::unordered_map<std::vector<PartitionNumber>, uint32_t, PartitionHash>& partitionToIdMap,
    const std::vector<uint32_t> & pieceCountVec,
    const std::unordered_map<std::vector<uint32_t>, uint32_t, GameStateHash> & gameStateToIndexMap
) {
    std::vector<uint32_t> result;

    std::vector<uint32_t> heightPartitionIds;
    std::vector<std::vector<PartitionNumber>> heightPartitions;
    std::vector<uint32_t> heightPartitionCount;
    // get unique gameStates
    uint32_t currIdx = 0;
    for (uint32_t i = 0; i < gameState.size(); ++i) {
        if (gameState[currIdx] != gameState[i]) {
            heightPartitionIds.push_back(gameState[currIdx]);
            heightPartitionCount.push_back(i - currIdx);
            heightPartitions.push_back(allPartitions[gameState[currIdx]] );
            currIdx = i;
        }
        if (i == gameState.size() - 1) {
            heightPartitionIds.push_back(gameState[currIdx]);
            heightPartitionCount.push_back(i - currIdx + 1);
            heightPartitions.push_back(allPartitions[gameState[currIdx]]);
        }
    }

    // get new game states for when colors are same
    for (uint32_t i = 0; i < heightPartitions.size(); ++i) {
        for (uint32_t it = 0; it < heightPartitions[i].size(); ++it) {
            PartitionNumber partitionNumb = heightPartitions[i][it];
            // If the count of pieces is more than one, we can merge with piece of same height and color
            if (partitionNumb.count > 1) {
                std::vector<PartitionNumber> updatedPartition = copyAndApplyPartitionChanges(heightPartitions[i], { partitionNumb.number, partitionNumb.number }, partitionNumb.number + partitionNumb.number);
                
                 result.push_back(gameStateToIndexMap.at(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i] }, { partitionToIdMap.at(updatedPartition) })));
            }
            
            // for every other piece of same color, but different height, we consider a symmetric merge of the two pieces
            for (uint32_t subIt = it; subIt < heightPartitions[i].size(); ++subIt) {
                if (subIt == it) continue;
                PartitionNumber partitionNumbOther = heightPartitions[i][subIt];
                
                std::vector<PartitionNumber> updatedPartition = copyAndApplyPartitionChanges(heightPartitions[i], { partitionNumb.number, partitionNumbOther.number },partitionNumb.number + partitionNumbOther.number);
                result.push_back(gameStateToIndexMap.at(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i] }, { partitionToIdMap.at(updatedPartition) })));
            }
        }
    }

    // get new game states when height states are the same
    for (uint32_t i = 0; i < heightPartitions.size(); ++i) {
        // if there are equivalent height/piece count partitions, we consider a symmetric merge for every, pair of equal height pieces
        // we only do this once, even if there are 3 equivelent partitions, as doing it again would be symmetric
        if (heightPartitionCount[i] > 1) {
            for (uint32_t it = 0; it < heightPartitions[i].size(); ++it) {
                PartitionNumber partitionNumb = heightPartitions[i][it];
                
                std::vector<PartitionNumber> updatedPartition1 = copyAndApplyPartitionChanges(heightPartitions[i], { partitionNumb.number }, 0);
                
                std::vector<PartitionNumber> updatedPartition2 = copyAndApplyPartitionChanges(heightPartitions[i], { partitionNumb.number }, partitionNumb.number + partitionNumb.number);
             
                std::vector<uint32_t> partitionIdsToAdd;
                if (updatedPartition1.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition1));
                if (updatedPartition2.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition2));
                result.push_back(gameStateToIndexMap.at(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[i], heightPartitionIds[i] }, partitionIdsToAdd)));
            }
        }
    }
    
    std::vector<uint32_t> indices =  std::vector<uint32_t>(heightPartitions.size(), 0);
    
    while (true) {
        uint32_t minNumb = UINT32_MAX;
        
        std::vector<uint32_t> minIndices;
        minIndices.reserve(indices.size());
        
        for (uint32_t i = 0; i < indices.size(); ++i) {
            if (indices[i] == heightPartitions[i].size()) continue;
            if (heightPartitions[i][indices[i]].number < minNumb) {
                minIndices.clear();
                minNumb = heightPartitions[i][indices[i]].number;
                minIndices.push_back(i);
            }
            else if (heightPartitions[i][indices[i]].number == minNumb) {
                 minIndices.push_back(i);
            }
        }
        
        for (uint32_t i = 0; i < minIndices.size(); ++i) {
            for (uint32_t j = i + 1; j < minIndices.size(); ++j) {
                {
                    PartitionNumber partitionNumb = heightPartitions[minIndices[i]][indices[minIndices[i]]];
                    
                    std::vector<PartitionNumber> updatedPartition1 = copyAndApplyPartitionChanges(heightPartitions[minIndices[i]], { partitionNumb.number }, 0);
                    
                    std::vector<PartitionNumber> updatedPartition2 = copyAndApplyPartitionChanges(heightPartitions[minIndices[j]], { partitionNumb.number }, partitionNumb.number + partitionNumb.number);
                    
                    std::vector<uint32_t> partitionIdsToAdd;
                    if (updatedPartition1.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition1));
                    if (updatedPartition2.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition2));
                    result.push_back(gameStateToIndexMap.at(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[minIndices[i]], heightPartitionIds[minIndices[j]] }, partitionIdsToAdd)));
                }
                {
                    PartitionNumber partitionNumb = heightPartitions[minIndices[i]][indices[minIndices[i]]];
                                       
                   std::vector<PartitionNumber> updatedPartition1 = copyAndApplyPartitionChanges(heightPartitions[minIndices[i]], { partitionNumb.number }, partitionNumb.number + partitionNumb.number);
                   
                   std::vector<PartitionNumber> updatedPartition2 = copyAndApplyPartitionChanges(heightPartitions[minIndices[j]], { partitionNumb.number }, 0);
                   
                   std::vector<uint32_t> partitionIdsToAdd;
                   if (updatedPartition1.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition1));
                   if (updatedPartition2.size() > 0) partitionIdsToAdd.push_back(partitionToIdMap.at(updatedPartition2));
                   result.push_back(gameStateToIndexMap.at(copyAndApplyPartitionIdChanges(gameState, { heightPartitionIds[minIndices[i]], heightPartitionIds[minIndices[j]] }, partitionIdsToAdd)));
                }
            }
            ++indices[minIndices[i]];
        }
        
        if (minIndices.size() == 0) break;
    }
    return result;
}

BranchResult SolunaAlgorithm
(
    const uint32_t i,
    const std::vector<std::vector<uint32_t>> & allGameStates,
    const std::vector<std::vector<uint32_t>> & allMoves,
    std::vector<BranchResult> & allBranchResults
) {
    auto cached = allBranchResults[i];
    if (!(cached.guaranteedWin == 0 && cached.leafCount == 0 && cached.leafVictory == 0)) {
        return cached;
    }

    const std::vector<uint32_t> & moveStateIndices = allMoves[i];

    // leaf node, if no moves you lose
    if (moveStateIndices.size() == 0) {
        return { 1, 0, false };
    }
    
    BranchResult result = { 0, 0, false, false };

    uint32_t guaranteedWinChildrenCount = 0;
    
    for (uint32_t i =0; i < moveStateIndices.size(); i++) {
        const BranchResult branchResult = SolunaAlgorithm(moveStateIndices[i], allGameStates, allMoves, allBranchResults);

        if (!branchResult.guaranteedWin) {
            result.guaranteedWin = true;
            ++guaranteedWinChildrenCount;
        }
        
        result.leafCount += branchResult.leafCount;
        result.leafVictory += (branchResult.leafCount - branchResult.leafVictory);
    }
    
    
    result.flipMoveCount = result.guaranteedWin ? ((uint32_t)moveStateIndices.size() - guaranteedWinChildrenCount) : 0;

    // choose best path here

    allBranchResults[i] = result;
    
    return result;
}

void getAllSymmertricBoardSpaces(uint32_t COLOR_COUNT, uint32_t PIECE_COUNT) {
    
    state = {0};
    
    std::unordered_map<std::vector<PartitionNumber>, uint32_t, PartitionHash> partitionToIdMap;
    std::vector<std::vector<PartitionNumber>> allPartitions;
    // essentially just the sum of ids
    std::vector<uint32_t> idPieceCounts;
    generatePartitionIdMaps(partitionToIdMap, allPartitions, idPieceCounts, PIECE_COUNT);

    std::vector<uint32_t> initialStates;
    std::vector<std::vector<uint32_t>> allGameStates;
    getAllGameStates(allGameStates, idPieceCounts, (uint32_t)allPartitions.size(), 0, COLOR_COUNT, PIECE_COUNT, {}, 0);
    
    std::unordered_map<std::vector<uint32_t>, uint32_t, GameStateHash> gameStateToIndexMap;
    gameStateToIndexMap.reserve(allGameStates.size());
    {
        for (uint32_t i =0; i < allGameStates.size(); ++i) {
            gameStateToIndexMap.insert({ allGameStates[i], i });
        }
    }
    
    // get initial states,
    {
        uint32_t i = 0;
        LOOP:
        for (;i < allGameStates.size(); ++i) {
            uint32_t c =0;
            for (uint32_t j = 0; j < allGameStates[i].size(); ++j) {
                std::vector<PartitionNumber> & part = allPartitions[allGameStates[i][j]];
                if (part.size() != 1 || part[0].number != 1) {
                    ++i;
                    goto LOOP;
                }
                c += part[0].count;
            }
            if (c == PIECE_COUNT) {
                initialStates.push_back(i);
            }
        }
    }

    std::vector<std::vector<uint32_t>> allMoves;
    allMoves.reserve(allGameStates.size());

    for (uint32_t i = 0; i < allGameStates.size(); ++i) {
        allMoves.push_back(getPossibleNextStates(allGameStates[i], allPartitions, partitionToIdMap, idPieceCounts, gameStateToIndexMap));
    }

    std::vector<BranchResult> allBranchResults = std::vector<BranchResult>(allGameStates.size(), {0});
    for (uint32_t i = 0; i < allGameStates.size(); ++i) {
        SolunaAlgorithm(i, allGameStates, allMoves, allBranchResults);
    }

    // TODO fix this copying here!
    state.COLOR_COUNT = COLOR_COUNT;
    state.PIECE_COUNT = PIECE_COUNT;
    state.allGameStates = allGameStates;
    state.allBranchResults = allBranchResults;
    state.initialStates = initialStates;
    state.allPartitions = allPartitions;
    state.allMoves = allMoves;
}

// API of webassembly
#ifdef __cplusplus
extern "C" {
#endif
bool calculateAllGameStates(uint32_t COLOR_COUNT, uint32_t PIECE_COUNT) {
    auto start = std::chrono::system_clock::now();
    getAllSymmertricBoardSpaces(COLOR_COUNT, PIECE_COUNT);
    auto end = std::chrono::system_clock::now();
    auto duration = (end - start);
    auto millis = std::chrono::duration_cast<std::chrono::milliseconds>(duration).count();
    std::cout << millis << std::endl;
    return true;
}

PieceStack * getPartition(uint32_t id) {
    return state.allPartitions[id].data();
}
uint32_t getPartitionCount(uint32_t id){
    return (uint32_t)state.allPartitions[id].size();
}

uint32_t * getGameState(uint32_t index) {
    return state.allGameStates[index].data();
}
uint32_t getGameStateCount(uint32_t index) {
    return (uint32_t)state.allGameStates[index].size();
}

uint32_t getBoardNextPossibleMovesCount(uint32_t index){
    return (uint32_t)state.allMoves[index].size();
}
uint32_t * getBoardNextPossibleMoves(uint32_t index) {
     return state.allMoves[index].data();
}


BranchResult * getBoardBranchResult(uint32_t index) {
    return &state.allBranchResults[index];
}

uint32_t * getInitialStates() {
    return state.initialStates.data();
}
uint32_t getInitialStatesCount() {
    return (uint32_t)state.initialStates.size();
}

#ifdef __cplusplus
}
#endif

//int main() {
//    calculateAllGameStates(4, 12);
//   
//    uint32_t moveCount = 0;
//    uint32_t c = 0;
//    for (uint32_t i = 0; i < state.allBranchResults.size(); ++i) {
//        moveCount += (uint32_t)state.allMoves[i].size();
//        c += (uint32_t)state.allBranchResults[i].flipMoveCount;
//    }
//    
//    return 0;
//}
