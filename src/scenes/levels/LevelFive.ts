import { Scene, GameObjects, Physics, Types, Tilemaps } from 'phaser';
import { PageButton } from '../../../public/assets/class/button';
import { Helper } from '../../../public/assets/helpers/helpers';
import { setupTilemapLayers, filterTilesByIndex, createBlockPalette } from '../../../public/assets/helpers/maphelper';

export class LevelFive extends Scene
{
    // Initialize variables

    private blocks: Physics.Arcade.StaticGroup
    private player: Physics.Arcade.Sprite
    private cursors: Types.Input.Keyboard.CursorKeys
    private WASDcursors: Types.Input.Keyboard.CursorKeys

    private level: Tilemaps.Tilemap
    private coins: Tilemaps.Tile[]
    private startTile: Tilemaps.Tile[]
    private endTile: Tilemaps.Tile[]
    private backgroundLayer: Tilemaps.TilemapLayer
    private blockLayer: Tilemaps.TilemapLayer
    private objectLayer: Tilemaps.TilemapLayer

    private totalCoins: integer
    private collectedCoins: integer

    // Text variables
    private infoText: GameObjects.Text
    private timerText: GameObjects.Text

    // Button variables
    private backButton: PageButton

    // Resolution variables
    private screenWidth: number
    private screenHeight: number
    private levelWidth: number
    private levelHeight: number

    private blockPaletteMap: Tilemaps.Tilemap
    private blockPaletteLayer: Tilemaps.TilemapLayer

    private marker: GameObjects.Graphics
    private selectedTile: Tilemaps.Tile

    private helper: Helper

    private timer: Phaser.Time.TimerEvent
    private timerSecondCount: number = 0
    
    constructor ()
    {
        super('LevelFive');
        this.helper = new Helper()
    }

    preload() {

        this.WASDcursors = this.input.keyboard?.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        }) as Types.Input.Keyboard.CursorKeys

        // Sets the screenheight and width variables
        this.screenHeight = this.sys.game.canvas.height
        this.screenWidth = this.sys.game.canvas.width

        // Set the coin variables
        this.totalCoins = 0
        this.collectedCoins = 0

        // Accepts cursor key input
        this.cursors = this.input.keyboard!.createCursorKeys()

        // Loads all tiles
        this.load.image('tiles', 'assets/images/tiles.png');

        // Loads tile level data
        this.load.tilemapTiledJSON('levelfive', 'assets/tilemapdata/level5.json');
    }

    create ()
    {
        // Create level tilemap and block tileset
        this.level = this.make.tilemap({ key: 'levelfive', tileWidth: 16, tileHeight: 16})
        this.levelWidth = this.level.widthInPixels
        this.levelHeight = this.level.heightInPixels

        // Set up variables for screen measurements
        const sceneCenterX = ((this.screenWidth - this.levelWidth) / 2)
        const sceneCenterY = ((this.screenHeight - this.levelHeight) / 2)

        // Sets the level width and height based on the current level in pixels

        const levelMap = setupTilemapLayers(this.level, 'tiles', sceneCenterX, sceneCenterY);

        // Create and render layers
        this.backgroundLayer = levelMap.backgroundLayer
        this.blockLayer = levelMap.blockLayer
        this.objectLayer = levelMap.objectLayer

        // Filter coin tiles
        this.coins = filterTilesByIndex(this.level, 19);
        this.totalCoins = this.coins.length;

        // Filter start and end tiles
        this.startTile = filterTilesByIndex(this.level, 20);
        this.endTile = filterTilesByIndex(this.level, 21);

        const blockPalette = createBlockPalette(this, 'blockpalette', 16, 16, 9, 3, sceneCenterX, sceneCenterY - 75);
        this.blockPaletteLayer = blockPalette.layer
        this.blockPaletteMap = blockPalette.blockPaletteMap
        
        // Creates a group of blocks for physics
        this.blocks = this.physics.add.staticGroup();

        // Convert the tilemaps into arrays
        const blockArray = this.helper.tileMapToArray(this.blockLayer)
        const backgroundArray = this.helper.tileMapToArray(this.backgroundLayer)
        const objectArray = this.helper.tileMapToArray(this.objectLayer)

        // Adds player in physics
        this.player = this.physics.add.sprite(this.level.tileToWorldX((this.startTile[0].x))! + 8, this.level.tileToWorldY(this.startTile[0].y)!, 'player')
        this.player.setCollideWorldBounds(true)
        this.player.setDisplaySize(16, 16)

        // Adds physics collider between block types and the player
        this.blockLayer.setCollisionByProperty({ collides: true})
        this.physics.add.collider(this.player, this.blockLayer)
        this.physics.add.collider(this.player, this.blocks)
        this.physics.add.collider(this.player, this.objectLayer)
        this.physics.add.collider(this.player, this.backgroundLayer)

        // Block placement logic
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if(this.selectedTile) {
                if((pointer.x >= this.blockLayer.getBottomLeft().x && pointer.x <= this.blockLayer.getBottomRight().x) && (pointer.y <= this.blockLayer.getBottomLeft().y && pointer.y >= this.blockLayer.getTopLeft().y)) {
                    // Cases to remove types of tile
                    const blockTileToRemove = this.helper.getTilePositionFromMap(pointer, this.level, this.blockLayer, blockArray) as Tilemaps.Tile
                    const backgroundTileToRemove = this.helper.getTilePositionFromMap(pointer, this.level, this.backgroundLayer, backgroundArray) as Tilemaps.Tile
                    const objectTileToRemove = this.helper.getTilePositionFromMap(pointer, this.level, this.objectLayer, objectArray) as Tilemaps.Tile

                    // Removes blocks based on tile index and replaces with the selected block type. So far the max rows is 4, and columns is 8. Background tiles are on row 1
                    // TODO: Handle start and finish tiles

                    if(!this.selectedTile && (blockTileToRemove === undefined && objectTileToRemove === undefined) || (backgroundTileToRemove === undefined && objectTileToRemove === undefined)) {
                        console.log("clicking same thing twice")
                    }

                    // Placing block normally
                    else if(blockTileToRemove && (objectTileToRemove && objectTileToRemove.index !== 19) && (!backgroundTileToRemove || backgroundTileToRemove) && (this.selectedTile.index > 8 && this.selectedTile.index < 18)) {
                        this.level.putTileAt(this.selectedTile.index + 1, blockTileToRemove.x, blockTileToRemove.y)!.setCollision(true, true, true, true)
                    }

                    // Replacing normal blocks or interactables with normal blocks
                    else if(blockTileToRemove && (((!backgroundTileToRemove || backgroundTileToRemove.index === -1) && objectTileToRemove.index === -1) && (this.selectedTile.index > 8 && this.selectedTile.index < 18))) {
                        this.level.removeTile(blockTileToRemove, this.selectedTile.index + 1, false)
                        this.level.getTileAt(blockTileToRemove.x, blockTileToRemove.y, true, this.blockLayer)!.setCollision(true, true, true, true)
                    // Replacing interactables with normal blocks
                    } else if(objectTileToRemove && (this.selectedTile.index > 8 && this.selectedTile.index < 18)) {
                        this.level.removeTile(objectTileToRemove, this.selectedTile.index + 1, false)
                        const newBlockTile = this.level.getTileAt(blockTileToRemove.x, blockTileToRemove.y, true, this.objectLayer) as Phaser.Tilemaps.Tile
                        newBlockTile.setCollision(true, true, true, true)
                        this.level.putTileAt(newBlockTile, newBlockTile.x, newBlockTile.y, true, this.blockLayer)

                        // Removes interactable tile from array
                            for(let tileIndex = 0; tileIndex < objectArray.length; tileIndex++) {
                                if(objectArray[tileIndex] === objectTileToRemove) {
                                    objectArray.splice(tileIndex, -1)
                                    this.totalCoins = this.totalCoins - 1
                                }
                            }
                    }
                    // Replacing background blocks with background blocks
                    else if(backgroundTileToRemove && blockTileToRemove && objectTileToRemove && ((blockTileToRemove.index === -1 && (objectTileToRemove === undefined || objectTileToRemove.index === -1)) && (this.selectedTile.index < 9))) {
                        this.level.removeTile(backgroundTileToRemove, this.selectedTile.index + 1, false)  
                    
                    // Replacing interactables with interactables
                    } else if((!blockTileToRemove || blockTileToRemove.index == -1) && (!objectTileToRemove || objectTileToRemove.index === 19) && (((!backgroundTileToRemove || backgroundTileToRemove.index === -1 || backgroundTileToRemove))) && (this.selectedTile.index === 18)) {
                        if(objectTileToRemove) {
                            this.level.removeTile(objectTileToRemove, this.selectedTile.index + 1, false)
                        }
                    
                    // Replacing blocks with interactables (blocked by replacing interactables with normal blocks?)
                    } else if(blockTileToRemove && (!objectTileToRemove || objectTileToRemove.index !== 19) && (this.selectedTile.index === 18)) {
                        this.level.removeTile(blockTileToRemove, this.selectedTile.index + 1, false)
                        this.objectLayer.removeTileAt(blockTileToRemove.x, blockTileToRemove.y)
                        this.level.putTileAt(this.selectedTile.index + 1, blockTileToRemove.x, blockTileToRemove.y, true, this.objectLayer)
                        this.coins = this.level.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index === 19) as Tilemaps.Tile[]
                        this.totalCoins = this.totalCoins + 1
                    
                    // When someone collects a coin, then replaces with a block after collecting coin
                    } else if(!blockTileToRemove && !objectTileToRemove) {
                        this.level.putTileAt(this.selectedTile.index + 1, this.level.getTileAtWorldXY(pointer.x, pointer.y)!.x, this.level.getTileAtWorldXY(pointer.x, pointer.y)!.y)!.setCollision(true, true, true, true)
                        this.coins = this.level.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index === 19) as Tilemaps.Tile[]
                        this.totalCoins = this.totalCoins - 1
                    
                    // Putting a background tile behind a coin
                    } else if((this.selectedTile.index < 9) && (!backgroundTileToRemove || backgroundTileToRemove.index === -1 || backgroundTileToRemove) && (objectTileToRemove.index === 19) && blockTileToRemove.index === -1) {
                        this.level.putTileAt(this.selectedTile.index + 1, objectTileToRemove.x || backgroundTileToRemove.x, objectTileToRemove.y || backgroundTileToRemove.y, false, this.backgroundLayer)
                    } else if(this.selectedTile.index >= 21){
                        if(this.objectLayer.getTileAtWorldXY(pointer.x, pointer.y)) {
                            const removedTile = this.level.removeTileAtWorldXY(pointer.x, pointer.y, false, false, undefined, this.objectLayer)
                            if(removedTile!.index == 19) {
                                this.coins = this.level.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index === 19) as Tilemaps.Tile[]
                                this.totalCoins = this.totalCoins -1
                            }
                        } else if (this.blockLayer.getTileAtWorldXY(pointer.x, pointer.y)) {
                            this.level.removeTileAtWorldXY(pointer.x, pointer.y, false, false, undefined, this.blockLayer)
                        } else if(this.backgroundLayer.getTileAtWorldXY(pointer.x, pointer.y)) {
                            this.level.removeTileAtWorldXY(pointer.x, pointer.y, false, false, undefined, this.backgroundLayer)
                        }
                    }
                }
            }
        }, this);
        
        // Coin cointer text filler
        this.infoText = this.add.text(this.blockLayer.getTopLeft().x, this.blockLayer.getTopLeft().y - 15, '')

        // Back button to MainMenu
        this.backButton = new PageButton(this, this.blockLayer.getTopLeft().x - 75, this.blockLayer.getTopLeft().y + 5, 'Back', null, () => {this.scene.start('MainMenu')
            this.timer.reset({delay: 1000, callback: () => {this.timerSecondCount++}, callbackScope: this, loop: true})
            this.timerSecondCount = 0
        })
        this.add.existing(this.backButton)

        // Block outline hover
        this.marker = this.add.graphics()
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, this.blockPaletteMap.tileWidth, this.blockPaletteMap.tileHeight);

        // Timer
        this.timerText = this.add.text(this.blockLayer.getBottomLeft().x, this.blockLayer.getBottomLeft().y + 15, '')
        this.timer = this.time.addEvent({delay: 1000, callback: () => {this.timerSecondCount++}, callbackScope: this, loop: true})

    }

    update() {
        // Stops player from sliding right constantly. Not sure why this is
        this.player.setVelocityX(-10)

        // Updated jump/falling logic
        // TODO: fix when a player is holding up above an empty block?

        // Falling Logic
        if((!this.cursors.up.isDown || !this.WASDcursors.up.isDown) && this.player.body?.blocked.down === true && this.player.body.velocity.y === 0 && this.player.body.blocked.left === false && this.player.body.blocked.right === false) {
            this.player.setVelocityY(200)
        // Jumping Logic
        } else if((this.cursors.up.isDown || this.WASDcursors.up.isDown) && this.player.body?.blocked.down === true) {
            this.player.setVelocityY(-240)
        }

        // Holding A + D
        if(((this.cursors.right.isDown && this.cursors.left.isDown) || (this.WASDcursors.right.isDown && this.WASDcursors.left.isDown)) || ((this.cursors.left.isDown && this.cursors.right.isDown) || (this.WASDcursors.left.isDown && this.WASDcursors.right.isDown))) {
            this.player.setVelocityX(-10)
        
        // Combinational movement
        } else if((this.cursors.right.isDown && this.cursors.up.isDown) || (this.WASDcursors.right.isDown && this.WASDcursors.up.isDown)) {
            this.player.setVelocityX(160)
            if(this.player.body?.blocked.down) {
                this.player.setVelocityY(-240)
            }
        } else if((this.cursors.left.isDown && this.cursors.up.isDown) || (this.WASDcursors.left.isDown && this.WASDcursors.up.isDown)) {
            this.player.setVelocityX(-160)
            if(this.player.body?.blocked.down) {
                this.player.setVelocityY(-240)
            }
        }

        // Basic movement logic left, right, and jumping
        if(this.cursors.left.isDown || this.WASDcursors.left.isDown) {
            this.player.setVelocityX(-160)
        } else if(this.cursors.right.isDown || this.WASDcursors.right.isDown) {
            this.player.setVelocityX(160)
        } else if((this.cursors.up.isDown || this.WASDcursors.up.isDown) && this.player.body?.blocked.down === true) {
            this.player.setVelocityY(-240)
        }

        // Coin collection
        this.physics.world.overlapTiles(this.player, this.coins, this.hitPickup.bind(this, (this.coins)), undefined, this);

        // When the player gets all coins and reaches the end tile
        if(this.collectedCoins === this.totalCoins && (this.physics.world.overlapTiles(this.player, this.endTile))) {
            this.timer.paused === true
            const timerTime = this.timerSecondCount.toString() + "." + this.timer.getElapsedSeconds().toString().substring(2,6)
            this.scene.start('GameOver', {timerTime: timerTime});
        }

        // Actually setting the coin text
        this.infoText.setText('Total Coins: ' + this.collectedCoins +  '/' + this.totalCoins.toString())
        this.timerText.setText(`Timer: ${this.timerSecondCount}.${this.timer.getElapsedSeconds().toString().substring(2,6)}`)
        
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2

        // Pointer event for block palette
        if((this.input.manager.activePointer.x >= this.blockPaletteLayer.getBottomLeft().x && this.input.manager.activePointer.x <= this.blockPaletteLayer.getBottomRight().x) && (this.input.manager.activePointer.y <= this.blockPaletteLayer.getBottomLeft().y && this.input.manager.activePointer.y >= this.blockPaletteLayer.getTopLeft().y)) {
            // Rounds down to nearest tile
            const pointerTileX = this.blockPaletteMap.worldToTileX(worldPoint.x) as number
            const pointerTileY = this.blockPaletteMap.worldToTileY(worldPoint.y) as number

            // Snap to tile coordinates, but in world space
            this.marker.x = this.blockPaletteMap.tileToWorldX(pointerTileX) as number
            this.marker.y = this.blockPaletteMap.tileToWorldY(pointerTileY) as number

            if (this.input.manager.activePointer.isDown)
            {
                this.selectedTile = this.blockPaletteMap.getTileAt(pointerTileX, pointerTileY) as Tilemaps.Tile;
            }
        }

        // Pointer highlight for block layer
        if((this.input.manager.activePointer.x >= this.blockLayer.getBottomLeft().x && this.input.manager.activePointer.x <= this.blockLayer.getBottomRight().x) && (this.input.manager.activePointer.y <= this.blockLayer.getBottomLeft().y && this.input.manager.activePointer.y >= this.blockLayer.getTopLeft().y)) {
            // Rounds down to nearest tile
            const pointerTileX = this.level.worldToTileX(worldPoint.x) as number
            const pointerTileY = this.level.worldToTileY(worldPoint.y) as number

            // Snap to tile coordinates, but in world space
            this.marker.x = this.level.tileToWorldX(pointerTileX) as number
            this.marker.y = this.level.tileToWorldY(pointerTileY) as number
        }

        // Pointer highlight for background layer
        if((this.input.manager.activePointer.x >= this.backgroundLayer.getBottomLeft().x && this.input.manager.activePointer.x <= this.backgroundLayer.getBottomRight().x) && (this.input.manager.activePointer.y <= this.backgroundLayer.getBottomLeft().y && this.input.manager.activePointer.y >= this.backgroundLayer.getTopLeft().y)) {
            // Rounds down to nearest tile
            const pointerTileX = this.level.worldToTileX(worldPoint.x) as number
            const pointerTileY = this.level.worldToTileY(worldPoint.y) as number

            // Snap to tile coordinates, but in world space
            this.marker.x = this.level.tileToWorldX(pointerTileX) as number
            this.marker.y = this.level.tileToWorldY(pointerTileY) as number
        }

        // Pointer highlight event for object layer
        if((this.input.manager.activePointer.x >= this.objectLayer.getBottomLeft().x && this.input.manager.activePointer.x <= this.objectLayer.getBottomRight().x) && (this.input.manager.activePointer.y <= this.objectLayer.getBottomLeft().y && this.input.manager.activePointer.y >= this.objectLayer.getTopLeft().y)) {
            // Rounds down to nearest tile
            const pointerTileX = this.level.worldToTileX(worldPoint.x) as number
            const pointerTileY = this.level.worldToTileY(worldPoint.y) as number

            // Snap to tile coordinates, but in world space
            this.marker.x = this.level.tileToWorldX(pointerTileX) as number
            this.marker.y = this.level.tileToWorldY(pointerTileY) as number
        }
    }

    hitPickup (coinTiles: Tilemaps.Tile[])
    {
        const coinTile = this.helper.getTilePositionFromPlayer(this.level, this.player, this.level, this.objectLayer, coinTiles) as Tilemaps.Tile
        if(coinTile !== null) {
            this.level.removeTile(coinTile, this.level.getTileAt(coinTile.x, coinTile.y, false, this.backgroundLayer)!.index, false);
            this.collectedCoins = this.collectedCoins + 1;

            this.coins = this.level.filterTiles((tile: Phaser.Tilemaps.Tile) => tile.index === 19) as Tilemaps.Tile[]
        }
    }
}
