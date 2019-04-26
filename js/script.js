/*jslint browser: true, undef: true, eqeqeq: true, nomen: true, white: true */
/*global window: false, document: false */

/*
 * fix looped audio
 * add fruits + levels
 * fix what happens when a ghost is eaten (should go back to base)
 * do proper ghost mechanics (blinky/wimpy etc)
 */

var speedBaseMultiplier = 1;
var speedLevelMultiplier = 0.2; // speed: speedBaseMultiplier + (speedLevelMultiplier * (level - 1));
var startGameCountdown = 3;
var biscuitsToCompleteLevel = 365; // 357 + 8 = 365

var COLOR_ORANGE_MRHOUSTON = '#ED6E00';

var colors = {
  'walls': COLOR_ORANGE_MRHOUSTON,
  'background': 'black',
  'dialog': '#FFF',
  'lifes': '#FFFF00',
  'footerText': '#FFFFFF',
  'footerBackground': '#000000',
  'pacman': '#FFFF00',
  'pacmanDead': '#FFFF00',
  'pills': '#FFF',
  'biscuits': '#FFF',
  'ghosts': ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847", "#0022FF", "#00FF11", "#C300D1"],
  'ghostEdibleEatenText': "#FFFFFF",
  'ghostEdible': COLOR_ORANGE_MRHOUSTON,
  'ghostEdibleEaten': '#222',
  'ghostEdibleBlinking': ['#FFFFFF', '#0000BB'],
};
colors.footerBackground = colors.background;


var sprites = {
  player: {
    imgPath: 'img/pacmansprite.png',
    img: null,
    steps: 6,
    cicleDurationSeconds: 1,
    height: 22,
    width: 15,
  }
};
sprites.player.img = new Image();
sprites.player.img.src = sprites.player.imgPath;

// img/noun_virus_1867963_000000.svg
// Set as a variable to avoid having to load more files than neccesary
var ghostSvgSprite = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 34 34" enable-background="new 0 0 34 34" xml:space="preserve"><path d="M30,17h-4.525c-0.339-0.954-0.829-1.835-1.45-2.611l3.682-3.682C27.895,10.52,28,10.266,28,10V5c0-0.553-0.447-1-1-1  c-0.553,0-1,0.447-1,1v4.586l-3.389,3.389c-0.228-0.182-0.464-0.353-0.709-0.513c0.708-1,1.102-2.207,1.102-3.464  c0-1.294-0.416-2.491-1.116-3.472l2.819-2.819c0.391-0.391,0.391-1.023,0-1.414c-0.391-0.391-1.023-0.391-1.414,0l-2.819,2.819  c-0.981-0.699-2.177-1.114-3.47-1.114c-1.293,0-2.489,0.415-3.469,1.114l-2.819-2.819c-0.391-0.391-1.024-0.391-1.414,0  c-0.391,0.391-0.391,1.023,0,1.414l2.819,2.818c-0.7,0.981-1.116,2.178-1.116,3.473c0,1.248,0.394,2.454,1.103,3.459  c-0.248,0.161-0.488,0.334-0.718,0.518L8,9.586V5c0-0.553-0.447-1-1-1C6.447,4,6,4.447,6,5v5c0,0.266,0.105,0.52,0.293,0.707  l3.682,3.682C9.354,15.165,8.864,16.046,8.525,17H4c-0.553,0-1,0.447-1,1v5c0,0.553,0.447,1,1,1c0.553,0,1-0.447,1-1v-4h3.059  C8.022,19.329,8,19.662,8,20c0,1.102,0.209,2.154,0.573,3.13L6.19,26.413C6.066,26.583,6,26.789,6,27v5c0,0.553,0.447,1,1,1  c0.553,0,1-0.447,1-1v-4.676l1.603-2.209C11.23,27.459,13.937,29,17,29c3.063,0,5.77-1.541,7.396-3.885L26,27.324V32  c0,0.553,0.447,1,1,1c0.553,0,1-0.447,1-1v-5c0-0.211-0.066-0.417-0.19-0.587l-2.382-3.283C25.791,22.154,26,21.102,26,20  c0-0.338-0.022-0.671-0.059-1H29v4c0,0.553,0.447,1,1,1c0.553,0,1-0.447,1-1v-5C31,17.447,30.553,17,30,17z M13.004,8.998  c0-1.101,0.447-2.099,1.169-2.822c0.002-0.002,0.005-0.003,0.007-0.005c0.002-0.002,0.002-0.004,0.004-0.006  c0.724-0.72,1.72-1.167,2.82-1.167c1.101,0,2.099,0.447,2.823,1.169c0.001,0.001,0.001,0.003,0.003,0.004  c0.001,0.001,0.003,0.002,0.005,0.003c0.722,0.724,1.17,1.722,1.17,2.824c0,0.948-0.347,1.843-0.94,2.55  C19.106,11.2,18.077,11,17,11c-1.074,0-2.099,0.199-3.055,0.545C13.351,10.831,13.004,9.938,13.004,8.998z M10,20  c0-3.519,2.614-6.432,6-6.92v13.84C12.614,26.432,10,23.519,10,20z M18,26.92V13.08c3.386,0.488,6,3.401,6,6.92  C24,23.519,21.386,26.432,18,26.92z"></path></svg>';



var NONE        = 4,
    UP          = 3,
    LEFT        = 2,
    DOWN        = 1,
    RIGHT       = 11,
    WAITING     = 5,
    PAUSE       = 6,
    PLAYING     = 7,
    COUNTDOWN   = 8,
    EATEN_PAUSE = 9,
    DYING       = 10,
    Pacman      = {};



var portals = [

  {
    coords: {x:11, y:0},
    directions: [UP],
    destination: {x:11, y:18},
    //newDirection: RIGHT,
  }, {
    coords: {x:11, y:18},
    directions: [DOWN],
    destination: {x:11, y:0},
    //newDirection: RIGHT,
  }, {
    coords: {x:31, y:0},
    directions: [UP],
    destination: {x:31, y:18},
    //newDirection: RIGHT,
  }, {
    coords: {x:31, y:18},
    directions: [DOWN],
    destination: {x:31, y:0},
    //newDirection: RIGHT,
  }
];

Pacman.FPS = 30;

Pacman.Ghost = function (game, map, colour) {

    var position  = null,
        direction = null,
        eatable   = null,
        eaten     = null,
        due       = null;

    function getNewCoord(dir, current) {

        var speed  = isVunerable() ? 1 : isHidden() ? 4 : 2,
            xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
            ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);

        return {
            "x": addBounded(current.x, xSpeed),
            "y": addBounded(current.y, ySpeed)
        };
    };

    /* Collision detection(walls) is done when a ghost lands on an
     * exact block, make sure they dont skip over it
     */
    function addBounded(x1, x2) {
        var rem    = x1 % 10,
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if(rem > 0 && result < 0) {
            return x1 - rem;
        }
        return x1 + x2;
    };

    function isVunerable() {
        return eatable !== null;
    };

    function isDangerous() {
        return eaten === null;
    };

    function isHidden() {
        return eatable === null && eaten !== null;
    };

    function getRandomDirection() {
        var moves = (direction === LEFT || direction === RIGHT)
            ? [UP, DOWN] : [LEFT, RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    };

    function reset() {
        eaten = null;
        eatable = null;
        //position = {"x": 90, "y": 80};
        position = {x:210, y:70};
        direction = getRandomDirection();
        due = getRandomDirection();
    };

    function onWholeSquare(x) {
        return x % 10 === 0;
    };

    function oppositeDirection(dir) {
        return dir === LEFT && RIGHT ||
            dir === RIGHT && LEFT ||
            dir === UP && DOWN || UP;
    };

    function makeEatable() {
        direction = oppositeDirection(direction);
        eatable = game.getTick();
    };

    function eat() {
        eatable = null;
        eaten = game.getTick();
    };

    function pointToCoord(x) {
        return Math.round(x / 10);
    };

    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) {
            return x;
        } else if (dir === RIGHT || dir === DOWN) {
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function secondsAgo(tick) {
        return (game.getTick() - tick) / Pacman.FPS;
    };

    function getColour() {
        if (eatable) {
            if (secondsAgo(eatable) > 5) {
                return game.getTick() % 20 > 10 ? colors.ghostEdibleBlinking[0] : colors.ghostEdibleBlinking[1];
            } else {
                return colors.ghostEdible;
            }
        } else if(eaten) {
            return colors.ghostEdibleEaten;
        }
        return colour;
    };

    function draw(ctx) {

        var s    = map.blockSize,
            top  = (position.y/10) * s,
            left = (position.x/10) * s;

        if (eatable && secondsAgo(eatable) > 8) {
            eatable = null;
        }

        if (eaten && secondsAgo(eaten) > 3) {
            eaten = null;
        }

        var tl = left + s;
        var base = top + s - 3;
        var inc = s / 10;

        var high = game.getTick() % 10 > 5 ? 3  : -3;
        var low  = game.getTick() % 10 > 5 ? -3 : 3;

        var pxm = left;
        var pym = top;



        // Create a DOMParser, load XML, parse it, get SVG item, get elems with class "drawElement", change their colors
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(ghostSvgSprite, "text/xml");
        var svg = xmlDoc.getElementsByTagName('svg')[0];
        var paths = svg.getElementsByTagName("path");
        for (var i = 0; i < paths.length; i++) {
          paths[i].style.fill = getColour();
        }
        // Transform SVG into base64 data
        var xml = new XMLSerializer().serializeToString(svg);
        var svg64 = btoa(xml);
        var b64Start = 'data:image/svg+xml;base64,';
        var image64 = b64Start + svg64;

        // Create image object using the base64 data
        var ghost = new Image();
        ghost.src = image64;

        // Draw image object
        ctx.drawImage(ghost, pxm, pym, s, s);

        /*
        ctx.fillStyle = getColour();
        ctx.beginPath();

        ctx.moveTo(left, base);

        ctx.quadraticCurveTo(left, top, left + (s/2),  top);
        ctx.quadraticCurveTo(left + s, top, left+s,  base);

        // Wavy things at the bottom
        ctx.quadraticCurveTo(tl-(inc*1), base+high, tl - (inc * 2),  base);
        ctx.quadraticCurveTo(tl-(inc*3), base+low, tl - (inc * 4),  base);
        ctx.quadraticCurveTo(tl-(inc*5), base+high, tl - (inc * 6),  base);
        ctx.quadraticCurveTo(tl-(inc*7), base+low, tl - (inc * 8),  base);
        ctx.quadraticCurveTo(tl-(inc*9), base+high, tl - (inc * 10), base);

        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#FFF"; //custom: ghost eyes color
        ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
        ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
        ctx.closePath();
        ctx.fill();

        var f = s / 12;
        var off = {};
        off[RIGHT] = [f, 0];
        off[LEFT]  = [-f, 0];
        off[UP]    = [0, -f];
        off[DOWN]  = [0, f];

        ctx.beginPath();
        ctx.fillStyle = "#000"; //custom: eye pupil color
        ctx.arc(left+6+off[direction][0], top+6+off[direction][1],
                s / 15, 0, 300, false);
        ctx.arc((left+s)-6+off[direction][0], top+6+off[direction][1],
                s / 15, 0, 300, false);
        ctx.closePath();
        ctx.fill();
        */

    };

    function pane(pos) {
        /*
        if (pos.y === 100 && pos.x >= 190 && direction === RIGHT) {
            return {"y": 100, "x": -10};
        }

        if (pos.y === 100 && pos.x <= -10 && direction === LEFT) {
            return position = {"y": 100, "x": 190};
        }
        */
        blockSize = map.blockSize;

        for (i = 0; i < portals.length; i += 1) {
          portal = portals[i];
          px = (portal.coords.x * 10);
          py = (portal.coords.y * 10);
          if (
            pos.y >= py-5 &&
            pos.y <= py+5 &&
            pos.x >= px-5 &&
            pos.x <= px+5 &&
            (
              portal.directions.includes(NONE) ||
              portal.directions.includes(direction)
            )
          ) {
            pos = {
              x: portal.destination.x * 10,
              y: portal.destination.y * 10,
            };
            return pos;
          }
        }

        return false;
    };

    function move(ctx) {

        var oldPos = position,
            onGrid = onGridSquare(position),
            npos   = null;

        if (due !== direction) {

            npos = getNewCoord(due, position);

            if (onGrid &&
                map.isFloorSpace({
                    "y":pointToCoord(nextSquare(npos.y, due)),
                    "x":pointToCoord(nextSquare(npos.x, due))})) {
                direction = due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = getNewCoord(direction, position);
        }

        if (onGrid &&
            map.isWallSpace({
                "y" : pointToCoord(nextSquare(npos.y, direction)),
                "x" : pointToCoord(nextSquare(npos.x, direction))
            })) {

            due = getRandomDirection();
            return move(ctx);
        }

        position = npos;

        var tmp = pane(position);
        if (tmp) {
            position = tmp;
        }

        due = getRandomDirection();

        return {
            "new" : position,
            "old" : oldPos
        };
    };

    return {
        "eat"         : eat,
        "isVunerable" : isVunerable,
        "isDangerous" : isDangerous,
        "makeEatable" : makeEatable,
        "reset"       : reset,
        "move"        : move,
        "draw"        : draw
    };
};

Pacman.User = function (game, map) {

    var position  = null,
        direction = null,
        eaten     = null,
        due       = null,
        lives     = null,
        score     = 5,
        keyMap    = {};

    keyMap[KEY.ARROW_LEFT]  = LEFT;
    keyMap[KEY.ARROW_UP]    = UP;
    keyMap[KEY.ARROW_RIGHT] = RIGHT;
    keyMap[KEY.ARROW_DOWN]  = DOWN;

    function addScore(nScore) {
        score += nScore;
        if (score >= 10000 && score - nScore < 10000) {
            lives += 1;
        }
    };

    function theScore() {
        return score;
    };

    function loseLife() {
        lives -= 1;
    };

    function getLives() {
        return lives;
    };

    function initUser() {
        score = 0;
        lives = 3;
        newLevel();
    }

    function newLevel() {
        resetPosition();
        eaten = 0;
    };

    function resetPosition() {
        //position = {"x": 90, "y": 120};
        position = {x:210, y:110};
        direction = LEFT;
        due = LEFT;
    };

    function reset() {
        initUser();
        resetPosition();
    };

    function keyDown(e) {
        if (typeof keyMap[e.keyCode] !== "undefined") {
            due = keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
	};

    function getNewCoord(dir, current) {
        return {
            "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
            "y": current.y + (dir === DOWN && 2 || dir === UP    && -2 || 0)
        };
    };

    function onWholeSquare(x) {
        return x % 10 === 0;
    };

    function pointToCoord(x) {
        return Math.round(x/10);
    };

    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) {
            return x;
        } else if (dir === RIGHT || dir === DOWN) {
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function next(pos, dir) {
        return {
            "y" : pointToCoord(nextSquare(pos.y, dir)),
            "x" : pointToCoord(nextSquare(pos.x, dir)),
        };
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function isOnSamePlane(due, dir) {
        return ((due === LEFT || due === RIGHT) &&
                (dir === LEFT || dir === RIGHT)) ||
            ((due === UP || due === DOWN) &&
             (dir === UP || dir === DOWN));
    };

    function move(ctx) {

        var npos        = null,
            nextWhole   = null,
            oldPosition = position,
            block       = null;

        if (due !== direction) {
            npos = getNewCoord(due, position);

            if (isOnSamePlane(due, direction) ||
                (onGridSquare(position) &&
                 map.isFloorSpace(next(npos, due)))) {
                direction = due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = getNewCoord(direction, position);
        }

        if (onGridSquare(position) && map.isWallSpace(next(npos, direction))) {
            direction = NONE;
        }

        if (direction === NONE) {
            return {"new" : position, "old" : position};
        }
        /*
        if (npos.y === 100 && npos.x >= 190 && direction === RIGHT) {
            npos = {"y": 100, "x": -10};
        }

        if (npos.y === 100 && npos.x <= -12 && direction === LEFT) {
            npos = {"y": 100, "x": 190};
        }
        */

        blockSize = map.blockSize;

        for (i = 0; i < portals.length; i += 1) {
          portal = portals[i];
          px = (portal.coords.x * 10);
          py = (portal.coords.y * 10);
          if (
            npos.y >= py-5 &&
            npos.y <= py+5 &&
            npos.x >= px-5 &&
            npos.x <= px+5 &&
            (
              portal.directions.includes(NONE) ||
              portal.directions.includes(direction)
            )
          ) {
            npos = {
              x: portal.destination.x * 10,
              y: portal.destination.y * 10,
            };
          }
        }

        position = npos;
        nextWhole = next(position, direction);

        block = map.block(nextWhole);

        if ((isMidSquare(position.y) || isMidSquare(position.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {

            map.setBlock(nextWhole, Pacman.EMPTY);
            addScore((block === Pacman.BISCUIT) ? 10 : 50);
            eaten += 1;
            if (eaten === biscuitsToCompleteLevel) { // 182 | 357
                game.completedLevel();
            }

            if (block === Pacman.PILL) {
                game.eatenPill();
            }
        }

        return {
            "new" : position,
            "old" : oldPosition
        };
    };

    function isMidSquare(x) {
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    function calcAngle(dir, pos) {
        if (dir == RIGHT && (pos.x % 10 < 5)) {
            return {"start":0.25, "end":1.75, "direction": false};
        } else if (dir === DOWN && (pos.y % 10 < 5)) {
            return {"start":0.75, "end":2.25, "direction": false};
        } else if (dir === UP && (pos.y % 10 < 5)) {
            return {"start":1.25, "end":1.75, "direction": true};
        } else if (dir === LEFT && (pos.x % 10 < 5)) {
            return {"start":0.75, "end":1.25, "direction": true};
        }
        return {"start":0, "end":2, "direction": false};
    };

    function drawDead(ctx, amount) {
        var s     = map.blockSize;
        var angle = calcAngle(direction, position);

         // Pixel map coordinates in canvas to draw pacman
        var pxm = ((position.x/10) * s) + s / 2 - s/2;
        var pym = ((position.y/10) * s) + s / 2 - s/2;

        var spriteStep = 0;
        var spriteDirCoordsStepTicks = Pacman.FPS / 8;
        var spriteDirCoordsStep = Math.floor((game.getTick() % (4 * spriteDirCoordsStepTicks)) / spriteDirCoordsStepTicks)
        var spriteDirCoords = 0;
        if (spriteDirCoordsStep === 0) {
          spriteDirCoords = sprites.player.width * 0;
        } else if (spriteDirCoordsStep === 1) {
          spriteDirCoords = sprites.player.width * 3;
        } else if (spriteDirCoordsStep === 2) {
          spriteDirCoords = sprites.player.width * 2;
        } else if (spriteDirCoordsStep === 3) {
          spriteDirCoords = sprites.player.width * 1;
        }

        if (amount >= 1) {
          spriteDirCoords = 0;
        }

        ctx.drawImage(sprites.player.img, spriteDirCoords, sprites.player.height * spriteStep, sprites.player.width, sprites.player.height, pxm, pym, s, s);
        //console.log(spriteDirCoordsStep);

        /*
        var size = map.blockSize,
            half = size / 2;

        if (amount >= 1) {
            return;
        }

        ctx.fillStyle = colors.pacmanDead;
        ctx.beginPath();
        ctx.moveTo(((position.x/10) * size) + half,
                   ((position.y/10) * size) + half);

        ctx.arc(((position.x/10) * size) + half,
                ((position.y/10) * size) + half,
                half, 0, Math.PI * 2 * amount, true);

        ctx.fill();
        */
    };


    function draw(ctx) { // draw pacman
        var s     = map.blockSize;
        var angle = calcAngle(direction, position);

         // Pixel map coordinates in canvas to draw pacman
        var pxm = ((position.x/10) * s) + s / 2 - s/2;
        var pym = ((position.y/10) * s) + s / 2 - s/2;

        // Calc sprite step
        var spriteSteps = sprites.player.steps;
        var spriteCicleDurationSeconds = sprites.player.cicleDurationSeconds;
        var spriteCicleDurationTicks = Pacman.FPS * spriteCicleDurationSeconds;
        var spriteStepDurationTicks = spriteCicleDurationTicks / spriteSteps;
        var spriteCicleTick = (game.getTick() % (spriteCicleDurationTicks));
        var spriteStep = Math.floor(spriteCicleTick / spriteStepDurationTicks);

        // Sprite direction coordinated in image
        var spriteDirCoords = sprites.player.width * 0;
        if (direction === DOWN) {
          spriteDirCoords = sprites.player.width * 0;
        } else if (direction === UP) {
          spriteDirCoords = sprites.player.width * 1;
        } else if (direction === LEFT) {
          spriteDirCoords = sprites.player.width * 2;
        } else if (direction === RIGHT) {
          spriteDirCoords = sprites.player.width * 3;
        } else {
          spriteDirCoords = sprites.player.width * 0;
          spriteStep = 0;
        }

        // Draw
        ctx.drawImage(sprites.player.img, spriteDirCoords, sprites.player.height * spriteStep, sprites.player.width, sprites.player.height, pxm, pym, s, s);


        // Original draw pacman
        /*
        var s     = map.blockSize,
            angle = calcAngle(direction, position);

        ctx.fillStyle = colors.pacman;

        ctx.beginPath();

        ctx.moveTo(((position.x/10) * s) + s / 2,
                   ((position.y/10) * s) + s / 2);

        ctx.arc(((position.x/10) * s) + s / 2,
                ((position.y/10) * s) + s / 2,
                s / 2, Math.PI * angle.start,
                Math.PI * angle.end, angle.direction);

        ctx.fill();
        */
    };

    initUser();

    return {
        "draw"          : draw,
        "drawDead"      : drawDead,
        "loseLife"      : loseLife,
        "getLives"      : getLives,
        "score"         : score,
        "addScore"      : addScore,
        "theScore"      : theScore,
        "keyDown"       : keyDown,
        "move"          : move,
        "newLevel"      : newLevel,
        "reset"         : reset,
        "resetPosition" : resetPosition
    };
};

Pacman.Map = function (size) {

    var height    = null,
        width     = null,
        blockSize = size,
        pillSize  = 0,
        map       = null;

    function withinBounds(y, x) {
        return y >= 0 && y < height && x >= 0 && x < width;
    }

    function isWall(pos) {
        return withinBounds(pos.y, pos.x) && map[pos.y][pos.x] === Pacman.WALL;
    }

    function isFloorSpace(pos) {
        if (!withinBounds(pos.y, pos.x)) {
            return false;
        }
        var peice = map[pos.y][pos.x];
        return peice === Pacman.EMPTY ||
            peice === Pacman.BISCUIT ||
            peice === Pacman.PILL;
    }

    function drawWall(ctx) {

        var i, j, p, line;

        ctx.strokeStyle = colors.walls;
        ctx.lineWidth   = 5;
        ctx.lineCap     = "round";

        for (i = 0; i < Pacman.WALLS.length; i += 1) {
            line = Pacman.WALLS[i];
            ctx.beginPath();

            for (j = 0; j < line.length; j += 1) {

                p = line[j];

                if (p.move) {
                    ctx.moveTo(p.move[0] * blockSize, p.move[1] * blockSize);
                } else if (p.line) {
                    ctx.lineTo(p.line[0] * blockSize, p.line[1] * blockSize);
                } else if (p.curve) {
                    ctx.quadraticCurveTo(p.curve[0] * blockSize,
                                         p.curve[1] * blockSize,
                                         p.curve[2] * blockSize,
                                         p.curve[3] * blockSize);
                }
            }
            ctx.stroke();
        }

    }

    function reset() {
        map    = Pacman.MAP.clone();
        height = map.length;
        width  = map[0].length;
    };

    function block(pos) {
        return map[pos.y][pos.x];
    };

    function setBlock(pos, type) {
        map[pos.y][pos.x] = type;
    };

    function drawPills(ctx) {

        if (++pillSize > 30) {
            pillSize = 0;
        }

        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
                if (map[i][j] === Pacman.PILL) {
                    ctx.beginPath();

                    ctx.fillStyle = colors.background;
		                ctx.fillRect((j * blockSize), (i * blockSize),
                                 blockSize, blockSize);

                    ctx.fillStyle = colors.pills;
                    ctx.arc((j * blockSize) + blockSize / 2,
                            (i * blockSize) + blockSize / 2,
                            Math.abs(5 - (pillSize/3)),
                            0,
                            Math.PI * 2, false);
                    ctx.fill();
                    ctx.closePath();
                }
		    }
	    }

      // draw Portals
      var drawPortals = true;
      if (drawPortals) {
        circleRadius = 5;
        for (i = 0; i < portals.length; i += 1) {
            portal = portals[i];
            pdx = portal.destination.x;
            pdy = portal.destination.y;
            pcx = portal.coords.x;
            pcy = portal.coords.y;

            pdxm = pdx * blockSize + blockSize / 2;
            pdym = pdy * blockSize + blockSize / 2;
            pcxm = pcx * blockSize + blockSize / 2;
            pcym = pcy * blockSize + blockSize / 2;

            // Draw portal circle
            ctx.strokeStyle = 'magenta';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
              pcxm,
              pcym,
              circleRadius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.stroke();

            // Draw portal path
            /*
            var gradient = ctx.createLinearGradient(pcxm, pcym, pdxm, pdym);
            gradient.addColorStop("0", "magenta");
            gradient.addColorStop("0.8", "blue");
            gradient.addColorStop("1.0", "red");
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            lineOffsetX = circleRadius - 1;
            lineOffsetY = circleRadius - 1;
            ctx.moveTo(pcxm + lineOffsetX, pcym + lineOffsetX);
            ctx.lineTo(pdxm, pdym);
            ctx.closePath();
            ctx.stroke();
            */
        }
      }
    };

    function draw(ctx) {

        var i, j, size = blockSize;

        ctx.fillStyle = colors.background;
	    ctx.fillRect(0, 0, width * size, height * size);

        drawWall(ctx);

        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
			    drawBlock(i, j, ctx);
		    }
	    }
    };

    function drawBlock(y, x, ctx) {

        var layout = map[y][x];

        if (layout === Pacman.PILL) {
            return;
        }

        ctx.beginPath();

        if (layout === Pacman.EMPTY || layout === Pacman.BLOCK ||
            layout === Pacman.BISCUIT) {

            ctx.fillStyle = colors.background;
		    ctx.fillRect((x * blockSize), (y * blockSize),
                         blockSize, blockSize);

            if (layout === Pacman.BISCUIT) {
                ctx.fillStyle = colors.biscuits;
		        ctx.fillRect((x * blockSize) + (blockSize / 2.5),
                             (y * blockSize) + (blockSize / 2.5),
                             blockSize / 6, blockSize / 6);
	        }
        }
        ctx.closePath();
    };

    reset();

    return {
        "draw"         : draw,
        "drawBlock"    : drawBlock,
        "drawPills"    : drawPills,
        "block"        : block,
        "setBlock"     : setBlock,
        "reset"        : reset,
        "isWallSpace"  : isWall,
        "isFloorSpace" : isFloorSpace,
        "height"       : height,
        "width"        : width,
        "blockSize"    : blockSize
    };
};

Pacman.Audio = function(game) {

    var files          = [],
        endEvents      = [],
        progressEvents = [],
        playing        = [];

    function load(name, path, cb) {

        var f = files[name] = document.createElement("audio");

        progressEvents[name] = function(event) { progress(event, name, cb); };

        f.addEventListener("canplaythrough", progressEvents[name], true);
        f.setAttribute("preload", "true");
        f.setAttribute("autobuffer", "true");
        f.setAttribute("src", path);
        f.pause();
    };

    function progress(event, name, callback) {
        if (event.loaded === event.total && typeof callback === "function") {
            callback();
            files[name].removeEventListener("canplaythrough",
                                            progressEvents[name], true);
        }
    };

    function disableSound() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
            files[playing[i]].currentTime = 0;
        }
        playing = [];
    };

    function ended(name) {

        var i, tmp = [], found = false;

        files[name].removeEventListener("ended", endEvents[name], true);

        for (i = 0; i < playing.length; i++) {
            if (!found && playing[i]) {
                found = true;
            } else {
                tmp.push(playing[i]);
            }
        }
        playing = tmp;
    };

    function play(name) {
        if (!game.soundDisabled()) {
            endEvents[name] = function() { ended(name); };
            playing.push(name);
            files[name].addEventListener("ended", endEvents[name], true);
            files[name].play();
        }
    };

    function pause() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
        }
    };

    function resume() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].play();
        }
    };

    return {
        "disableSound" : disableSound,
        "load"         : load,
        "play"         : play,
        "pause"        : pause,
        "resume"       : resume
    };
};

var PACMAN = (function () {

    var state        = WAITING,
        audio        = null,
        ghosts       = [],
        ghostSpecs   = colors.ghosts, // custom: ghost colors
        eatenCount   = 0,
        level        = 0,
        tick         = 0,
        ghostPos, userPos,
        stateChanged = true,
        timerStart   = null,
        lastTime     = 0,
        ctx          = null,
        timer        = null,
        map          = null,
        user         = null,
        stored       = null;

    function getTick() {
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = colors.ghostEatenText;
        ctx.font      = "12px BDCartoonShoutRegular";
        ctx.fillText(text,
                     (position["new"]["x"] / 10) * map.blockSize,
                     ((position["new"]["y"] + 5) / 10) * map.blockSize);
    }

    function dialog(text) {
        ctx.fillStyle = colors.dialog;
        ctx.font      = "18px Calibri";
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2;
        ctx.fillText(text, x, (map.height * 10) + 8);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };

    function startLevel() {
        user.resetPosition();
        for (var i = 0; i < ghosts.length; i += 1) {
            ghosts[i].reset();
        }
        audio.play("start");
        timerStart = tick;
        setState(COUNTDOWN);
    }

    function startNewGame() {
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
        if (e.keyCode === KEY.N) {
            startNewGame();
        } else if (e.keyCode === KEY.S) {
            audio.disableSound();
            localStorage["soundDisabled"] = !soundDisabled();
        } else if (e.keyCode === KEY.P && state === PAUSE) {
            audio.resume();
            map.draw(ctx);
            setState(stored);
        } else if (e.keyCode === KEY.P) {
            stored = state;
            setState(PAUSE);
            audio.pause();
            map.draw(ctx);
            dialog("Paused");
        } else if (state !== PAUSE) {
            return user.keyDown(e);
        }
        return true;
    }

    function loseLife() {
        setState(WAITING);
        user.loseLife();
        if (user.getLives() > 0) {
            startLevel();
        } else {
            submitScore();
        }
    }

    function submitScore() {
      function http_build_params( obj ) { // https://stackoverflow.com/a/18116302/4114225
        return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
      }

      var submitData = {
        "uid" : 1,
        "score" : user.theScore(),
      };
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "POST", "api/score.php", false ); // false for synchronous request
      xmlHttp.send( http_build_params(submitData) );
      console.log(xmlHttp.responseText);

      console.log("Score:", user.theScore());
    }

    function setState(nState) {
        state = nState;
        stateChanged = true;
    };

    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) +
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function drawFooter() {

        var topLeft  = (map.height * map.blockSize),
            textBase = topLeft + 17;

        ctx.fillStyle = colors.footerBackground;
        ctx.fillRect(0, topLeft, (map.width * map.blockSize), 30);

        ctx.fillStyle = "#FFFF00"; //custom: ?

        for (var i = 0, len = user.getLives(); i < len; i++) {
            s = map.blockSize;

            ctx.drawImage(sprites.player.img, 0, 21, 15, 21, 150 + (25 * i) + map.blockSize / 2 - s/2, (topLeft+1) + map.blockSize / 2 - s/2, s, s);

            // Original code
            /*
            ctx.fillStyle = colors.lifes;
            ctx.beginPath();
            ctx.moveTo(150 + (25 * i) + map.blockSize / 2,
                       (topLeft+1) + map.blockSize / 2);

            ctx.arc(150 + (25 * i) + map.blockSize / 2,
                    (topLeft+1) + map.blockSize / 2,
                    map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.fill();
            */
        }

        ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000"; //custom: enabled-disabled color
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("♪", 10, textBase);
        //ctx.fillText("s", 10, textBase);

        ctx.fillStyle = colors.footerText;
        ctx.font      = "14px Calibri";
        ctx.fillText("Score: " + user.theScore(), 30, textBase);
        ctx.fillText("Level: " + level, 260, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y/10), Math.floor(pos.x/10), ctx);
        map.drawBlock(Math.ceil(pos.y/10), Math.ceil(pos.x/10), ctx);
    }

    function mainDraw() {

        var diff, u, i, len, nScore;

        ghostPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(ghostPos[i].old);
        }
        redrawBlock(u.old);

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
        }
        user.draw(ctx);

        userPos = u["new"];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) {
                    audio.play("eatghost");
                    ghosts[i].eat();
                    eatenCount += 1;
                    nScore = eatenCount * 50;
                    drawScore(nScore, ghostPos[i]);
                    user.addScore(nScore);
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                } else if (ghosts[i].isDangerous()) {
                    audio.play("die");
                    setState(DYING);
                    timerStart = tick;
                }
            }
        }
    };

    function mainLoop() {

        var diff;

        if (state !== PAUSE) {
            ++tick;
        }

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {
            stateChanged = false;
            map.draw(ctx);
            dialog("Press N to start a New game");
        } else if (state === EATEN_PAUSE &&
                   (tick - timerStart) > (Pacman.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);
        } else if (state === DYING) {
            if (tick - timerStart > (Pacman.FPS * 2)) {
                loseLife();
            } else {
                redrawBlock(userPos);
                for (i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(ghostPos[i].old);
                    ghostPos.push(ghosts[i].draw(ctx));
                }
                user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
            }
        } else if (state === COUNTDOWN) {

            diff = startGameCountdown + Math.floor((timerStart - tick) / Pacman.FPS);

            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING);
            } else {
                if (diff !== lastTime) {
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        }

        drawFooter();
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        for (i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }
    };

    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();

        var speedMultiplier = speedBaseMultiplier + (speedLevelMultiplier * (level - 1));
        clearInterval(timer);
        timer = window.setInterval(mainLoop, (1000 / Pacman.FPS) / speedMultiplier);

        user.newLevel();
        startLevel();
    };

    function keyPress(e) {
        if (state !== WAITING && state !== PAUSE) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    function init(wrapper) {

        var i, len, ghost,
            blockSize = wrapper.offsetWidth / Pacman.MAP[0].length, // wrapper.offsetWidth / Pacman.MAP[0].length
            canvas    = document.createElement("canvas");

        canvas.setAttribute("width", (blockSize * Pacman.MAP[0].length) + "px");
        canvas.setAttribute("height", (blockSize * Pacman.MAP.length) + 30 + "px");

        wrapper.appendChild(canvas);

        ctx  = canvas.getContext('2d');

        audio = new Pacman.Audio({"soundDisabled":soundDisabled});
        map   = new Pacman.Map(blockSize);
        user  = new Pacman.User({
            "completedLevel" : completedLevel,
            "eatenPill"      : eatenPill,
            "getTick"        : getTick
        }, map);

        for (i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Pacman.Ghost({"getTick":getTick}, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }

        map.draw(ctx);
        dialog("Loading ...");

        var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        var audio_files = [
            ["start", "audio/opening_song." + extension],
            ["die", "audio/die." + extension],
            ["eatghost", "audio/eatghost." + extension],
            ["eatpill", "audio/eatpill." + extension],
            ["eating", "audio/eating.short." + extension],
            ["eating2", "audio/eating.short." + extension]
        ];

        load(audio_files, function() { loaded(); });
    };

    function load(arr, callback) {

        if (arr.length === 0) {
            callback();
        } else {
            var x = arr.pop();
            audio.load(x[0], x[1], function() { load(arr, callback); });
        }
    };

    function loaded() {

        dialog("Press N to Start");

        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true);

        mainLoop();
        //timer = window.setInterval(mainLoop, 1000 / Pacman.FPS / speedMultiplier);

        var speedMultiplier = speedBaseMultiplier + (speedLevelMultiplier * (level - 1));
        timer = window.setInterval(mainLoop, (1000 / Pacman.FPS) / speedMultiplier);
    };

    return {
        "init" : init
    };

}());

/* Human readable keyCode index */
var KEY = {'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36, 'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40, 'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93, 'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110, 'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189, 'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220, 'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222};

(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();

Pacman.WALL    = 0;
Pacman.BISCUIT = 1;
Pacman.EMPTY   = 2;
Pacman.BLOCK   = 3;
Pacman.PILL    = 4;

Pacman.MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 4, 1, 1, 0, 2, 0, 2, 0, 2, 0, 1, 1, 1, 1, 4, 1, 0, 1, 4, 1, 1, 1, 1, 0, 2, 0, 2, 0, 2, 0, 1, 1, 4, 0, 1, 1, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 2, 0, 1, 1, 1, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 1, 1, 1, 0, 2, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 3, 3, 3, 3, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 2, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 2, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 1, 1, 1, 0, 1, 0],
  [0, 1, 1, 1, 0, 4, 1, 1, 0, 2, 0, 2, 0, 2, 0, 1, 1, 1, 1, 4, 1, 0, 1, 4, 1, 1, 1, 1, 0, 2, 0, 2, 0, 2, 0, 1, 1, 4, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

Pacman.WALLS = [
  [
    {"move": [10.5, 0]}, {"line": [10.5, 3]},
    {"curve": [10.5, 3.5, 10, 3.5]}, {"line": [9, 3.5]},
    {"curve": [8.5, 3.5, 8.5, 3]}, {"line": [8.5, 1]},
    {"curve": [8.5, 0.5, 8, 0.5]}, {"line": [5, 0.5]},
    {"curve": [4.5, 0.5, 4.5, 1]}, {"line": [4.5, 2]}, {"line": [4.5, 1]},
    {"curve": [4.5, 0.5, 4, 0.5]}, {"line": [1, 0.5]},
    {"curve": [0.5, 0.5, 0.5, 1]}, {"line": [0.5, 18]},
    {"curve": [0.5, 18.5, 1, 18.5]}, {"line": [4, 18.5]},
    {"curve": [4.5, 18.5, 4.5, 18]}, {"line": [4.5, 17]}, {"line": [4.5, 18]},
    {"curve": [4.5, 18.5, 5, 18.5]}, {"line": [8, 18.5]},
    {"curve": [8.5, 18.5, 8.5, 18]}, {"line": [8.5, 16]},
    {"curve": [8.5, 15.5, 9, 15.5]}, {"line": [10, 15.5]},
    {"curve": [10.5, 15.5, 10.5, 16]}, {"line": [10.5, 19]},
  ], [
    {"move": [12.5, 19]}, {"line": [12.5, 16]},
    {"curve": [12.5, 15.5, 13, 15.5]}, {"line": [14, 15.5]},
    {"curve": [14.5, 15.5, 14.5, 16]}, {"line": [14.5, 18]},
    {"curve": [14.5, 18.5, 15, 18.5]}, {"line": [21, 18.5]},
    {"curve": [21.5, 18.5, 21.5, 18]}, {"line": [21.5, 15.5]}, {"line": [21.5, 18]},
    {"curve": [21.5, 18.5, 22, 18.5]}, {"line": [28, 18.5]},
    {"curve": [28.5, 18.5, 28.5, 18]}, {"line": [28.5, 16]},
    {"curve": [28.5, 15.5, 29, 15.5]}, {"line": [30, 15.5]},
    {"curve": [30.5, 15.5, 30.5, 16]}, {"line": [30.5, 19]},
  ], [
    {"move": [32.5, 19]}, {"line": [32.5, 16]},
    {"curve": [32.5, 15.5, 33, 15.5]}, {"line": [34, 15.5]},
    {"curve": [34.5, 15.5, 34.5, 16]}, {"line": [34.5, 18]},
    {"curve": [34.5, 18.5, 35, 18.5]}, {"line": [38, 18.5]},
    {"curve": [38.5, 18.5, 38.5, 18]}, {"line": [38.5, 17]}, {"line": [38.5, 18]},
    {"curve": [38.5, 18.5, 39, 18.5]}, {"line": [42, 18.5]},
    {"curve": [42.5, 18.5, 42.5, 18]}, {"line": [42.5, 1]},
    {"curve": [42.5, 0.5, 42, 0.5]}, {"line": [39, 0.5]},
    {"curve": [38.5, 0.5, 38.5, 1]}, {"line": [38.5, 2]}, {"line": [38.5, 1]},
    {"curve": [38.5, 0.5, 38, 0.5]}, {"line": [35, 0.5]},
    {"curve": [34.5, 0.5, 34.5, 1]}, {"line": [34.5, 3]},
    {"curve": [34.5, 3.5, 34, 3.5]}, {"line": [33, 3.5]},
    {"curve": [32.5, 3.5, 32.5, 3]}, {"line": [32.5, 0]},
  ], [
    {"move": [30.5, 0]}, {"line": [30.5, 3]},
    {"curve": [30.5, 3.5, 30, 3.5]}, {"line": [29, 3.5]},
    {"curve": [28.5, 3.5, 28.5, 3]}, {"line": [28.5, 1]},
    {"curve": [28.5, 0.5, 28, 0.5]}, {"line": [22, 0.5]},
    {"curve": [21.5, 0.5, 21.5, 1]}, {"line": [21.5, 3.5]}, {"line": [21.5, 1]},
    {"curve": [21.5, 0.5, 21, 0.5]}, {"line": [15, 0.5]},
    {"curve": [14.5, 0.5, 14.5, 1]}, {"line": [14.5, 3]},
    {"curve": [14.5, 3.5, 14, 3.5]}, {"line": [13, 3.5]},
    {"curve": [12.5, 3.5, 12.5, 3]}, {"line": [12.5, 0]},
  ], [
    {"move": [6.5, 2.5]}, {"line": [6.5, 3]},
    {"curve": [6.5, 3.5, 6, 3.5]}, {"line": [4.5, 3.5]},
  ], [
    {"move": [6.5, 16.5]}, {"line": [6.5, 16]},
    {"curve": [6.5, 15.5, 6, 15.5]}, {"line": [4.5, 15.5]},
  ], [
    {"move": [6.5, 5.5]}, {"line": [6.5, 7.5]},
  ], [
    {"move": [6.5, 11.5]}, {"line": [6.5, 13.5]},
  ], [
    {"move": [2.5, 2.5]}, {"line": [2.5, 5]},
    {"curve": [2.5, 5.5, 3, 5.5]}, {"line": [4.5, 5.5]}, {"line": [3, 5.5]},
    {"curve": [2.5, 5.5, 2.5, 6]}, {"line": [2.5, 7.5]},
  ], [
    {"move": [2.5, 11.5]}, {"line": [2.5, 13]},
    {"curve": [2.5, 13.5, 3, 13.5]}, {"line": [4.5, 13.5]}, {"line": [3, 13.5]},
    {"curve": [2.5, 13.5, 2.5, 14]}, {"line": [2.5, 16.5]},
  ], [
    {"move": [2.5, 9.5]}, {"line": [4.5, 9.5]}, {"line": [4.5, 7.5]}, {"line": [4.5, 11.5]},
  ], [
    {"move": [6.5, 9.5]}, {"line": [8.5, 9.5]}, {"line": [8.5, 7.5]}, {"line": [8.5, 11.5]},
  ], [
    {"move": [8.5, 5.5]}, {"line": [10.5, 5.5]},
  ], [
    {"move": [12.5, 5.5]}, {"line": [16.5, 5.5]}, {"move": [14.5, 5.5]}, {"line": [14.5, 7.5]},
  ], [
    {"move": [8.5, 13.5]}, {"line": [10.5, 13.5]},
  ], [
    {"move": [10.5, 7.5]}, {"line": [10.5, 11.5]}, {"line": [12.5, 11.5]}, {"line": [12.5, 7.5]}, {"line": [10.5, 7.5]},
  ], [
    {"move": [12.5, 13.5]}, {"line": [16.5, 13.5]}, {"move": [14.5, 13.5]}, {"line": [14.5, 11.5]},
  ], [
    {"move": [16.5, 7.5]}, {"line": [16.5, 11.5]}, {"move": [16.5, 9.5]}, {"line": [14.5, 9.5]},
  ], [
    {"move": [16.5, 15.5]}, {"line": [16.5, 16.5]},
  ], [
    {"move": [16.5, 2.5]}, {"line": [16.5, 3.5]},
  ], [
    {"move": [18.5, 2.5]}, {"line": [18.5, 3.5]}, {"line": [19.5, 3.5]}, {"line": [19.5, 2.5]}, {"line": [18.5, 2.5]},
  ], [
    {"move": [18.5, 5.5]}, {"line": [18.5, 6.5]}, {"line": [19.5, 6.5]}, {"line": [19.5, 5.5]}, {"line": [18.5, 5.5]},
  ], [
    {"move": [18.5, 12.5]}, {"line": [18.5, 13.5]}, {"line": [19.5, 13.5]}, {"line": [19.5, 12.5]}, {"line": [18.5, 12.5]},
  ], [
    {"move": [18.5, 15.5]}, {"line": [18.5, 16.5]}, {"line": [19.5, 16.5]}, {"line": [19.5, 15.5]}, {"line": [18.5, 15.5]},
  ], [
    {"move": [23.5, 2.5]}, {"line": [23.5, 3.5]}, {"line": [24.5, 3.5]}, {"line": [24.5, 2.5]}, {"line": [23.5, 2.5]},
  ], [
    {"move": [23.5, 5.5]}, {"line": [23.5, 6.5]}, {"line": [24.5, 6.5]}, {"line": [24.5, 5.5]}, {"line": [23.5, 5.5]},
  ], [
    {"move": [23.5, 12.5]}, {"line": [23.5, 13.5]}, {"line": [24.5, 13.5]}, {"line": [24.5, 12.5]}, {"line": [23.5, 12.5]},
  ], [
    {"move": [23.5, 15.5]}, {"line": [23.5, 16.5]}, {"line": [24.5, 16.5]}, {"line": [24.5, 15.5]}, {"line": [23.5, 15.5]},
  ], [
    {"move": [30.5, 7.5]}, {"line": [30.5, 11.5]}, {"line": [32.5, 11.5]}, {"line": [32.5, 7.5]}, {"line": [30.5, 7.5]},
  ], [
    {"move": [20.5, 8.5]}, {"line": [18.5, 8.5]}, {"line": [18.5, 10.5]}, {"line": [24.5, 10.5]}, {"line": [24.5, 8.5]}, {"line": [22.5, 8.5]},
  ], [
    {"move": [21.5, 5.5]}, {"line": [21.5, 6.5]},
  ], [
    {"move": [26.5, 2.5]}, {"line": [26.5, 3.5]},
  ], [
    {"move": [26.5, 15.5]}, {"line": [26.5, 16.5]},
  ], [
    {"move": [26.5, 5.5]}, {"line": [30.5, 5.5]}, {"move": [28.5, 5.5]}, {"line": [28.5, 7.5]},
  ], [
    {"move": [26.5, 7.5]}, {"line": [26.5, 11.5]}, {"move": [26.5, 9.5]}, {"line": [28.5, 9.5]},
  ], [
    {"move": [26.5, 13.5]}, {"line": [30.5, 13.5]}, {"move": [28.5, 13.5]}, {"line": [28.5, 11.5]},
  ], [
    {"move": [32.5, 5.5]}, {"line": [34.5, 5.5]},
  ], [
    {"move": [32.5, 13.5]}, {"line": [34.5, 13.5]},
  ], [
    {"move": [34.5, 7.5]}, {"line": [34.5, 11.5]}, {"move": [34.5, 9.5]}, {"line": [36.5, 9.5]},
  ], [
    {"move": [38.5, 7.5]}, {"line": [38.5, 11.5]}, {"move": [38.5, 9.5]}, {"line": [40.5, 9.5]},
  ], [
    {"move": [40.5, 2.5]}, {"line": [40.5, 7.5]}, {"move": [40.5, 5.5]}, {"line": [38.5, 5.5]},
  ], [
    {"move": [40.5, 11.5]}, {"line": [40.5, 16.5]}, {"move": [40.5, 13.5]}, {"line": [38.5, 13.5]},
  ],




  [
    {"move": [36.5, 2.5]}, {"line": [36.5, 3]},
    {"curve": [36.5, 3.5, 37, 3.5]}, {"line": [38.5, 3.5]},
  ], [
    {"move": [36.5, 16.5]}, {"line": [36.5, 16]},
    {"curve": [36.5, 15.5, 37, 15.5]}, {"line": [38.5, 15.5]},
  ], [
    {"move": [36.5, 5.5]}, {"line": [36.5, 7.5]},
  ], [
    {"move": [36.5, 11.5]}, {"line": [36.5, 13.5]},
  ],
/*
    [{"move": [0, 9.5]}, {"line": [3, 9.5]},
     {"curve": [3.5, 9.5, 3.5, 9]}, {"line": [3.5, 8]},
     {"curve": [3.5, 7.5, 3, 7.5]}, {"line": [1, 7.5]},
     {"curve": [0.5, 7.5, 0.5, 7]}, {"line": [0.5, 1]},
     {"curve": [0.5, 0.5, 1, 0.5]}, {"line": [9, 0.5]},
     {"curve": [9.5, 0.5, 9.5, 1]}, {"line": [9.5, 3.5]}],

    [{"move": [9.5, 1]},
     {"curve": [9.5, 0.5, 10, 0.5]}, {"line": [18, 0.5]},
     {"curve": [18.5, 0.5, 18.5, 1]}, {"line": [18.5, 7]},
     {"curve": [18.5, 7.5, 18, 7.5]}, {"line": [16, 7.5]},
     {"curve": [15.5, 7.5, 15.5, 8]}, {"line": [15.5, 9]},
     {"curve": [15.5, 9.5, 16, 9.5]}, {"line": [19, 9.5]}],

    [{"move": [2.5, 5.5]}, {"line": [3.5, 5.5]}],

    [{"move": [3, 2.5]},
     {"curve": [3.5, 2.5, 3.5, 3]},
     {"curve": [3.5, 3.5, 3, 3.5]},
     {"curve": [2.5, 3.5, 2.5, 3]},
     {"curve": [2.5, 2.5, 3, 2.5]}],

    [{"move": [15.5, 5.5]}, {"line": [16.5, 5.5]}],

    [{"move": [16, 2.5]}, {"curve": [16.5, 2.5, 16.5, 3]},
     {"curve": [16.5, 3.5, 16, 3.5]}, {"curve": [15.5, 3.5, 15.5, 3]},
     {"curve": [15.5, 2.5, 16, 2.5]}],

    [{"move": [6, 2.5]}, {"line": [7, 2.5]}, {"curve": [7.5, 2.5, 7.5, 3]},
     {"curve": [7.5, 3.5, 7, 3.5]}, {"line": [6, 3.5]},
     {"curve": [5.5, 3.5, 5.5, 3]}, {"curve": [5.5, 2.5, 6, 2.5]}],

    [{"move": [12, 2.5]}, {"line": [13, 2.5]}, {"curve": [13.5, 2.5, 13.5, 3]},
     {"curve": [13.5, 3.5, 13, 3.5]}, {"line": [12, 3.5]},
     {"curve": [11.5, 3.5, 11.5, 3]}, {"curve": [11.5, 2.5, 12, 2.5]}],

    [{"move": [7.5, 5.5]}, {"line": [9, 5.5]}, {"curve": [9.5, 5.5, 9.5, 6]},
     {"line": [9.5, 7.5]}],
    [{"move": [9.5, 6]}, {"curve": [9.5, 5.5, 10.5, 5.5]},
     {"line": [11.5, 5.5]}],


    [{"move": [5.5, 5.5]}, {"line": [5.5, 7]}, {"curve": [5.5, 7.5, 6, 7.5]},
     {"line": [7.5, 7.5]}],
    [{"move": [6, 7.5]}, {"curve": [5.5, 7.5, 5.5, 8]}, {"line": [5.5, 9.5]}],

    [{"move": [13.5, 5.5]}, {"line": [13.5, 7]},
     {"curve": [13.5, 7.5, 13, 7.5]}, {"line": [11.5, 7.5]}],
    [{"move": [13, 7.5]}, {"curve": [13.5, 7.5, 13.5, 8]},
     {"line": [13.5, 9.5]}],

    [{"move": [0, 11.5]}, {"line": [3, 11.5]}, {"curve": [3.5, 11.5, 3.5, 12]},
     {"line": [3.5, 13]}, {"curve": [3.5, 13.5, 3, 13.5]}, {"line": [1, 13.5]},
     {"curve": [0.5, 13.5, 0.5, 14]}, {"line": [0.5, 17]},
     {"curve": [0.5, 17.5, 1, 17.5]}, {"line": [1.5, 17.5]}],
    [{"move": [1, 17.5]}, {"curve": [0.5, 17.5, 0.5, 18]}, {"line": [0.5, 21]},
     {"curve": [0.5, 21.5, 1, 21.5]}, {"line": [18, 21.5]},
     {"curve": [18.5, 21.5, 18.5, 21]}, {"line": [18.5, 18]},
     {"curve": [18.5, 17.5, 18, 17.5]}, {"line": [17.5, 17.5]}],
    [{"move": [18, 17.5]}, {"curve": [18.5, 17.5, 18.5, 17]},
     {"line": [18.5, 14]}, {"curve": [18.5, 13.5, 18, 13.5]},
     {"line": [16, 13.5]}, {"curve": [15.5, 13.5, 15.5, 13]},
     {"line": [15.5, 12]}, {"curve": [15.5, 11.5, 16, 11.5]},
     {"line": [19, 11.5]}],

    [{"move": [5.5, 11.5]}, {"line": [5.5, 13.5]}],
    [{"move": [13.5, 11.5]}, {"line": [13.5, 13.5]}],

    [{"move": [2.5, 15.5]}, {"line": [3, 15.5]},
     {"curve": [3.5, 15.5, 3.5, 16]}, {"line": [3.5, 17.5]}],
    [{"move": [16.5, 15.5]}, {"line": [16, 15.5]},
     {"curve": [15.5, 15.5, 15.5, 16]}, {"line": [15.5, 17.5]}],

    [{"move": [5.5, 15.5]}, {"line": [7.5, 15.5]}],
    [{"move": [11.5, 15.5]}, {"line": [13.5, 15.5]}],

    [{"move": [2.5, 19.5]}, {"line": [5, 19.5]},
     {"curve": [5.5, 19.5, 5.5, 19]}, {"line": [5.5, 17.5]}],
    [{"move": [5.5, 19]}, {"curve": [5.5, 19.5, 6, 19.5]},
     {"line": [7.5, 19.5]}],

    [{"move": [11.5, 19.5]}, {"line": [13, 19.5]},
     {"curve": [13.5, 19.5, 13.5, 19]}, {"line": [13.5, 17.5]}],
    [{"move": [13.5, 19]}, {"curve": [13.5, 19.5, 14, 19.5]},
     {"line": [16.5, 19.5]}],

    [{"move": [7.5, 13.5]}, {"line": [9, 13.5]},
     {"curve": [9.5, 13.5, 9.5, 14]}, {"line": [9.5, 15.5]}],
    [{"move": [9.5, 14]}, {"curve": [9.5, 13.5, 10, 13.5]},
     {"line": [11.5, 13.5]}],

    [{"move": [7.5, 17.5]}, {"line": [9, 17.5]},
     {"curve": [9.5, 17.5, 9.5, 18]}, {"line": [9.5, 19.5]}],
    [{"move": [9.5, 18]}, {"curve": [9.5, 17.5, 10, 17.5]},
     {"line": [11.5, 17.5]}],

    [{"move": [8.5, 9.5]}, {"line": [8, 9.5]}, {"curve": [7.5, 9.5, 7.5, 10]},
     {"line": [7.5, 11]}, {"curve": [7.5, 11.5, 8, 11.5]},
     {"line": [11, 11.5]}, {"curve": [11.5, 11.5, 11.5, 11]},
     {"line": [11.5, 10]}, {"curve": [11.5, 9.5, 11, 9.5]},
     {"line": [10.5, 9.5]}]
*/
];

/*
Object.prototype.clone = function () {
    var i, newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i === 'clone') {
            continue;
        }
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        } else {
            newObj[i] = this[i];
        }
    }
    return newObj;
};
*/

function displayPacmanGame() {
  var el = document.getElementById("pacman");
  el.style.display = 'block';
  var decentBrowser = Modernizr.canvas && Modernizr.localstorage &&
      Modernizr.audio && (Modernizr.audio.ogg || Modernizr.audio.mp3);
  if (decentBrowser) {
    //window.setTimeout(function () { PACMAN.init(el); }, 0);
  } else {
    el.innerHTML = "<p>Sorry, needs a decent browser</p><br /><small>" +
      "(firefox 3.6+, Chrome 4+, Opera 10+ and Safari 4+)</small>";
  }
}


$(function(){
  $('#formularioform').on("submit", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
      url: "api/form.php",
      type: "post",
      data: {
        "a": 1,
        "b": 2,
      },
      dataType: "json",
      success: function(result, status, xhr) {
        console.log(result);
        if (result['status'] === "ok") {
          // hide form
          //displayPacmanGame();
        } else {
          alert(error);
        }
      },
      error: function(xhr, status, error) {

      }
    });
    return false;
  });

});
