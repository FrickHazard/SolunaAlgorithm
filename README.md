# SolunaAlgorithm
 
em++ main.cpp -s EXPORTED_FUNCTIONS='["_calculateAllGameStates", "_getGameState"]' -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -O3 -s EXPORT_ES6=1 -s MODULARIZE=1 -s EXPORT_NAME="createModule" -s ENVIRONMENT="web"
