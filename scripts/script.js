/* Enum for the arrow key codes */
const arrows = {
    LEFT: 'ArrowLeft',
    UP:  'ArrowUp',
    RIGHT:  'ArrowRight',
    DOWN: 'ArrowDown'
};

// Custom event that will be fired when the game is lost, and a corresponding event handler
const gameLostEvent = new Event('gamelost');

window.addEventListener('gamelost', event => {
    // Create a modal window to ask the user if they want to play another game
    $('#gameLostWindow').css('display', 'block');
});

var snakeParts = [];
var gameArea, headDirection, gameInterval, fruitObject;
var lastKeyPressed = null, gameLost = false, arrowsDisabled;
var score = 0;
var music = new Audio('resources/audio/music.mp3');

/* Configurable */
var gameAreaWidth = 700,
    gameAreaHeight = 450,
    offset = 10,
    refreshRate = 80,
    arrowDisabledRate = 10,
    initialSnakeheadX = 10,
    initialSnakeheadY = 10;


/* Classes */
// The constructor of the game area instance
function GameArea(width, height) {
    this.canvas = document.createElement('canvas');
    this.context = null;

    this.start = () => {
        this.canvas.width = width;
        this.canvas.height = height;

        this.canvas.setAttribute('id', 'gameArea');
        this.canvas.style.backgroundColor = 'black';
        this.canvas.style.border = '2px solid green';

        this.context = this.canvas.getContext('2d');

        document.body.appendChild(this.canvas);
    }

    this.clear = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function SnakePart(xAxis, yAxis) {
    this.x = xAxis;
    this.y = yAxis;
    this.oldX = null;
    this.oldY = null;
    this.width = 10;
    this.height = 10;
    this.direction = null;

    this.storeCoordinates = () => {
        this.oldX = this.x;
        this.oldY = this.y;
    }

    /* Movement functions */
    this.update = () => {
        var context = gameArea.context;
        context.fillStyle = 'green';
        context.strokeStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.strokeRect(this.x, this.y, this.width, this.height);
    }

    this.clear = () => {
        var context = gameArea.context;
        context.clearRect(this.x, this.y, this.width, this.height);
    }

    this.moveRight = () => {
        this.x += offset;
    }

    this.moveLeft = () => {
        this.x -= offset;
    }

    this.moveUp = () => {
        this.y -= offset;
    }

    this.moveDown = () => {
        this.y += offset;
    }
}

// The constructor of the fruit instance
function Fruit(xAxis, yAxis) {
    this.x = xAxis;
    this.y = yAxis;
    this.width = 10;
    this.height = 10;

    this.update = () => {
        var context = gameArea.context;
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    this.clear = () => {
        var context = gameArea.context;
        context.clearRect(this.x, this.y, this.width, this.height);
    }
}


/* Functions */

// Generates a random integer between [min, max]
function getRandomInt(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates the fruit on the game board
function generateFruit() {
    // Generating the coordinates of the first fruit
    var fruitXAxis, fruitYAxis;

    do {
        fruitXAxis = getRandomInt(10, gameAreaWidth - 10);
        fruitYAxis = getRandomInt(10, gameAreaHeight - 10);
    } while (checkInvalidFruitPosition(fruitXAxis, fruitYAxis));

    // Generating the first fruit
    fruitObject = new Fruit(fruitXAxis, fruitYAxis);
    fruitObject.update();
}

// Draws a snake part on the given coordinates
function drawSnakePart(snakePartXAxis, snakePartYAxis) {
    var snakePart = new SnakePart(snakePartXAxis, snakePartYAxis);
    snakePart.update();
    snakeParts.push(snakePart);
}

// Expands the snake by 2 blocks
function expandSnake() {
    // Find the last snake part
    var lastSnakePart;

    if (snakeParts.length > 0) {
        lastSnakePart = snakeParts[snakeParts.length - 1];

        drawSnakePart(lastSnakePart.oldX, lastSnakePart.oldY);
        drawSnakePart(lastSnakePart.oldX - 10, lastSnakePart.oldY);
    } else if (snakeParts.length === 0) {
        drawSnakePart(initialSnakeheadX, initialSnakeheadY);
    }
}

// Checks if the snake has crashed with the game border or with itself
function checkSnakeCrash() {
    var snakeHead = snakeParts[0], crash = false;

    for (var i = 1; i < snakeParts.length; i++) {
        if (snakeHead.x === snakeParts[i].x && snakeHead.y === snakeParts[i].y) {
            crash = true;
            break;
        }
    }

    return crash;
}


// Checks if the the position generated for the fruit is invalid
function checkInvalidFruitPosition(fruitXAxis, fruitYAxis) {
    if (fruitXAxis === initialSnakeheadX || fruitYAxis === initialSnakeheadY || fruitXAxis % 10 !== 0 || fruitYAxis % 10 !== 0) 
        return true;

    for (var i = 0; i < snakeParts.length; i++) {
        if (fruitXAxis === snakeParts[i].x && fruitYAxis === snakeParts[i].y)
            return true;
        
    }

    return false;
}


// Initiates the game
function startGame() {
    console.log('startGame() executed!')

    // Generate the initial snake part
    expandSnake();
    
    // Generate the fruit
    generateFruit();

    // Start the music
    music.play();

    // Start the game interval
    gameInterval = setInterval(() => {
        console.log('interval executing')

        gameArea.clear();

        var prevPart;

        for (var i = 0; i < snakeParts.length; i++) {
            currPart = snakeParts[i];
            currPart.storeCoordinates();

            if (i === 0) {
                if (headDirection === 'left') {
                    currPart.moveLeft();
                    currPart.direction = 'left';
                } else if (headDirection === 'right') {
                    currPart.moveRight();
                    currPart.direction = 'right';
                } else if (headDirection === 'up') {
                    currPart.moveUp();
                    currPart.direction = 'up';
                } else if (headDirection === 'down') {
                    currPart.moveDown();
                    currPart.direction = 'down';
                }

                if (currPart.x < 0 || currPart.x === gameArea.canvas.width || currPart.y < 0 || currPart.y === gameArea.canvas.height || checkSnakeCrash()) {
                    gameLost = true;
                    break;
                }
                    
            } else {
                prevPart = snakeParts[i - 1];

                // If previous part is on the right of the current part
                if (prevPart.oldX - currPart.x === offset) {
                    currPart.moveRight();
                    currPart.direction = 'right';
                // If previous part is on the left of current part
                } else if (prevPart.oldX - currPart.x === -1 * offset) {
                    currPart.moveLeft();
                    currPart.direction = 'left';
                // If previous part is under the current part
                } else if (prevPart.oldY - currPart.y === offset) {
                        currPart.moveDown();
                        currPart.direction = 'down';
                // If previous part is over the current part
                } else if (prevPart.oldY - currPart.y === -1 * offset) {
                    currPart.moveUp();
                    currPart.direction = 'up';
                }
            }
            currPart.update();
        }

        if (gameLost) {
            // Stop the music when game is lost
            music.pause();
            music.currentTime = 0;

            // Clear the snake
            snakeParts.forEach(snakePart => {
                snakePart.clear()
            });

            snakeParts = [];

            // Clear the fruit
            fruitObject.clear();
            fruitObject = null;


            window.dispatchEvent(gameLostEvent);

            // Clear the game interval
            clearInterval(gameInterval);
        } else {
            // Calculate if the snake has eaten the fruit
            if (snakeParts[0].x === fruitObject.x && snakeParts[0].y === fruitObject.y) {
                // Snake has eaten the fruit

                fruitObject.clear(); 
                expandSnake();

                generateFruit();

                // Update the score
                score += 10;

                $('#scoreNum').html(score);
            } else {
                // Snake did not eat the fruit
                fruitObject.update();
            }
        }
    }, refreshRate);
}


/* Event Listeners */
$('#startGame').click(event => {
    // Sending a GET request to the server in order to get the high scores and display them
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://192.168.1.5/snake_game/requests.php?type=getHiScores', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // If the high schores are retrieved successfully
                var hiScoreEntry, scores = JSON.parse(xhr.responseText);
                console.log(scores)
                for(var i = 4; i >= 0; i--) {
                    hiScoreEntry = '<li> <h2 class=\'hiScoreEntry\'>' + scores[i].name + '    ' + scores[i].score + '</h2> </li> <br/>';

                    $('#hiScoreList').append(hiScoreEntry);
                }
            } else if (xhr.status === 400) {
                alert('REQUEST ERROR 400 GETTING HIGH SCORES.');
            }
        }
    };

    xhr.send();

    // Display the scoreboard, hiscore list and game area
    $('#startGame').css('display', 'none');
    $('#scoreBoard').css('display', 'block');
    $('#hiScores').css('display', 'block');

    // Event listener for when the music end, in order to start it again
    music.addEventListener('ended', event => {
        music.play();
    }, false);

    // Event listener for when the user accepts to reset the game when hthey lose
    $('#restartGame').click(event => {
        // Reset the game lost boolean
        gameLost = false;

        // Reset the head direction
        headDirection = '';

        $('#gameLostWindow').css('display', 'none');
        $('#scoreSubmittedMessage').css('display', 'none');
        $('#gameLostQuestion').css('display', 'block');

        // Reset the score
        score = 0;
        $('#scoreNum').html(0);

        startGame();
    });

    // Event listener for when the user wants to submit their score when they lose
    $('#openScoreSubmit').click(event => {
        $('#gameLostQuestion').css('display', 'none');
        $('#submitScoreNum').html('Your score is ' + score);
        $('#submitScoreQuestion').css('display', 'block');
    });

    // Event handler for when the user submits their score
    $('#submitScore').click(event => {
        var data = 'name=' + $('#playerNameEntry').val() + '&score=' + score;

        var xhr = new XMLHttpRequest();

        xhr.open('POST', 'http://192.168.1.5/snake_game/requests.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // If the score is submitted successfully
                    $('#submitScoreQuestion').css('display', 'none');

                } else if(xhr.status === 400){
                    alert('REQUEST ERROR 400 SUBMITTING SCORE.');
                } else {
                    alert('ERROR');
                }
            }
        };
    
        xhr.send(data);
    });

    gameArea = new GameArea(gameAreaWidth, gameAreaHeight);

    gameArea.start();

    // Event listener for arrow keys
    $(document).keydown(event => {
        var keyCode;

        if (event.key !== undefined)
            keyCode = event.key;
        else if (event.keyIdentifier !== undefined) 
            keyCode = event.keyIdentifier;
        else if (event.keyCode !== undefined) 
            keyCode = event.keyCode;

        if (!arrowsDisabled) {
            switch (keyCode) {
                case arrows.RIGHT:
                    if (lastKeyPressed !== arrows.RIGHT && lastKeyPressed !== arrows.LEFT && !arrowsDisabled) {
                        lastKeyPressed = arrows.RIGHT;

                        headDirection = 'right';

                        arrowsDisabled = setTimeout(() => {
                            arrowsDisabled = null;
                        }, refreshRate - arrowDisabledRate);
                    }

                    break; 
                case arrows.LEFT:
                    if (lastKeyPressed !== arrows.LEFT && lastKeyPressed !== arrows.RIGHT) {
                        lastKeyPressed = arrows.LEFT;

                        headDirection = 'left';

                        arrowsDisabled = setTimeout(() => {
                            arrowsDisabled = null;
                        }, refreshRate - arrowDisabledRate);
                    }

                    break;
                case arrows.UP:
                    if (lastKeyPressed !== arrows.UP && lastKeyPressed !== arrows.DOWN) {
                        lastKeyPressed = arrows.UP;

                        headDirection = 'up';

                        arrowsDisabled = setTimeout(() => {
                            arrowsDisabled = null;
                        }, refreshRate - arrowDisabledRate);
                    }

                    break;
                case arrows.DOWN:
                    if (lastKeyPressed !== arrows.DOWN && lastKeyPressed !== arrows.UP) {
                        lastKeyPressed = arrows.DOWN;

                        headDirection = 'down';

                        arrowsDisabled = setTimeout(() => {
                            arrowsDisabled = null;
                        }, refreshRate - arrowDisabledRate);
                    }

                    break;
                default:
                    console.log('')
            }
        }
    });

    $(document).keyup(event => {
        if (arrowsDisabled) {
            clearTimeout(arrowsDisabled);
            arrowsDisabled = null;
        }
    }); 

    startGame();
});
























