import { Scene, GameObjects, Physics, Types, Tilemaps } from 'phaser';

export class Helper {

    player: Phaser.Physics.Arcade.Sprite
    tilemap: Phaser.Tilemaps.Tilemap
    layer: Phaser.Tilemaps.TilemapLayer
    coinTiles: Phaser.Tilemaps.Tile[] 
    blockLayer: Phaser.Tilemaps.TilemapLayer


    getTilePositionFromPlayer(currentLevel: Tilemaps.Tilemap, player: Physics.Arcade.Sprite, tilemap: Tilemaps.Tilemap, layer: Tilemaps.TilemapLayer, coinTiles: Tilemaps.Tile[]) {
        // Convert player world position to tilemap coordinates
        const tileX = tilemap.worldToTileX(player.x) as number
        const tileY = tilemap.worldToTileY(player.y) as number
        
        // Gets the initial tile at the tilemap coordinates, then converts to center for accuracy
        const tile1 = layer.getTileAt(tileX, tileY, true)
        const tileCenterX = tile1.getCenterX()
        const tileCenterY = tile1.getCenterY()
        const tile = layer.getTileAt(tilemap.worldToTileX(tileCenterX)!, tilemap.worldToTileY(tileCenterY)!, true)
        
        // set tile index to find
        let tileIndex = 0

        for(const findTile of coinTiles) {
            if(findTile === tile) {
                tileIndex = findTile.index
            }
        }
        
        // If a tile exists, and the index of the current tile matches one found in the block array
        if (tile && (tile.index === tileIndex)) {
            // Convert tilemap coordinates back to world position
            const tileWorldX = tilemap.tileToWorldX(tile.x) as number
            const tileWorldY = tilemap.tileToWorldY(tile.y) as number
            
            return currentLevel.getTileAtWorldXY(tileWorldX, tileWorldY)
        } else {
            console.log('No tile at player position');
            return null;
        }
    }

    getTilePositionFromMap(pointer: Phaser.Input.Pointer, tilemap: Tilemaps.Tilemap, layer: Tilemaps.TilemapLayer, tiles: Tilemaps.Tile[]) {
        // Convert pointer world position to tilemap coordinates
        const tileX = tilemap.worldToTileX(pointer.x) as number
        const tileY = tilemap.worldToTileY(pointer.y) as number
        
        // Gets the initial tile at the tilemap coordinates, then converts to center for accuracy
        const tile1 = layer.getTileAt(tileX, tileY, true)
        const tileCenterX = tile1.getCenterX()
        const tileCenterY = tile1.getCenterY()
        const tile = layer.getTileAt(tilemap.worldToTileX(tileCenterX)!, tilemap.worldToTileY(tileCenterY)!, true)

        for(const findTile of tiles) {
            if(findTile === tile) {
                return findTile
            }
        }
    }

    tileMapToArray(blockLayer: Phaser.Tilemaps.TilemapLayer): Phaser.Tilemaps.Tile[] {
        // Create an empty array of type Phaser.Tilemaps.Tile
        const array: Phaser.Tilemaps.Tile[] = [];
    
        // Assuming you want to fill the array with tiles from the blockLayer
        blockLayer.layer.data.forEach(row => {
            row.forEach(tile => {
                if (tile) {
                    array.push(tile);
                }
            });
        });
    
        return array;
    }
}