#### To Start

Run npm i && npm run dev

#### TODO:

--- Definitely need to scale down level files/modularise them

- Implement combinational player movement logic
    - Implement different types of movement
        - Ladder, water?
- Implement Block Palette to replace tiles within map
    - Implement start and finish tile logic
- Implement Timer
    - Implement Minute conversion
    - Add Time limit on certain levels
- Implement level completion screen/scene
    - Maybe more design?
- Implement level selector screen/scene
    - Maybe more design?

#### Extra Info
- Tiles are 16x16
- Font for logo is Bad Mofo
- Font for buttons is Courier size 16px

#### Level Info
- Create a standardised system of level size
    - Eg. a 10x15 tile world, a 20x40 tile world, etc.
- Level One
    - Sandbox level
- Level Two
    - Small level
- Level Three
    - Skill Level
- Level Four
    - Speedrun level
- Level Five
    - Minigame level

#### Current Bugs
- Player still moves to the right on its own without setVelocityX(-10)
    - Not sure how to fix this... maybe it has something to do with a player colliding all the time against a block?