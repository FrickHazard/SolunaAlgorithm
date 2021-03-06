# SolunaAlgorithm

em++ main.cpp -s EXPORTED_FUNCTIONS='["_calculateAllGameStates", "_getGameState","_getInitialStates", "_getInitialStatesCount","_getGameState","_getGameStateCount", "_getBoardBranchResult", "_getBoardNextPossibleMoves","_getBoardNextPossibleMovesCount","_getPartition","_getPartitionCount","_getBoardNextPossibleMovesGameState","_getBoardNextPossibleMovesGameStateCount"]' -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -O3 -s EXPORT_ES6=1 -s MODULARIZE=1 -s EXPORT_NAME="createModule" -s ENVIRONMENT="web"

https://3dtextures.me/2020/06/11/fabric-nylon-weave-001/
https://3dtextures.me/2019/07/15/concrete-column-001/

====================================
Cloudy skyboxes
---------------
Last updated August 10, 2012
====================================

4 color variations of a cloudy afternoon skybox with mixed types of clouds.

I originally just made the blue version, but I figured having some premade variations might be useful.

Blue: high key and somewhat cooled down.
Gray: more contrast and whitebalanced, more sombre.
Brown: somewhat of a sickly brown tinted version, a bit reminiscent of aged romantic paintings.
Yellow: funky bright orange/yellow tinted.

====================================
Technical Tidbits
====================================

Max quality baseline JPG compression.

For HDR enabled engines, overbrightening the high-end with a threshold of 0.7 and multiplier of 1.5 seems to look natural.
There are pure white highlights present inside some of the textures.

The sides are named and oriented in the Quake tradition, you might need to re-orient them for engines that use a different cubemap/skybox layout.

====================================
License Information:
====================================

CC-BY 3.0

You are free:

* to Share ó to copy, distribute and transmit the work
* to Remix ó to adapt the work
* to make commercial use of the work

Under the following conditions:

* Attribution ó You must attribute the work in the manner specified by the author or licensor (but not in any way that suggests that they endorse you or your use of the work).

With the understanding that:

* Waiver ó Any of the above conditions can be waived if you get permission from the copyright holder.
* Public Domain ó Where the work or any of its elements is in the public domain under applicable law, that status is in no way affected by the license.
* Other Rights ó In no way are any of the following rights affected by the license:
Your fair dealing or fair use rights, or other applicable copyright exceptions and limitations;
The author's moral rights;
Rights other persons may have either in the work itself or in how the work is used, such as publicity or privacy rights.

Notice ó For any reuse or distribution, you must make clear to others the license terms of this work. The best way to do this is with a link to this webpage*.

( * source: http://creativecommons.org/licenses/by/3.0/ )

====================================
Author
====================================

Pieter ëSpineyí Verhoeven

web: http://www.spiney.me/


magick convert Wood037_2K_Displacement.jpg Wood037_2K_Roughness.jpg -background black -set colorspace sRGB -channel RG -combine combined.jpg

magick convert Metal_Mesh_003_ambientOcclusion.jpg Metal_Mesh_003_roughness.jpg Metal_Mesh_003_metallic.jpg -set colorspace sRGB -channel RGB -combine combined.jpg