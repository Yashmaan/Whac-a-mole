let currMoleTile;
let currPlantTile;
let score = 0;
let gameOver = false;
let moleInterval = 1000; // Interval for setting moles
let plantInterval = 2000; // Interval for setting plants
let timerInterval = 1000; // Interval for updating timer

let timer = 60; // Initial timer value in seconds
let gameStarted = false; // Flag to track if the game has started

/**
 * Function to start the game.
 * Sets up the game based on selected duration and difficulty.
 */
function startGame() {
    if (!gameStarted) {
        let duration = parseInt(document.getElementById("durationSelect").value);
        let difficulty = parseInt(document.getElementById("difficultySelect").value);
        setGame();
        timer = duration; // Set the initial timer value to the selected duration
        document.getElementById("timer").innerText = "Timer: " + timer.toString(); // Update the timer display
        timerInterval = setInterval(updateTimer, timerInterval); // Start the timer with the selected duration
        setDifficulty(difficulty); // Set the difficulty
        gameStarted = true;
    }
}

/**
 * Function to set the difficulty level.
 * Adjusts the speed of mole and plant appearances based on the selected difficulty.
 * @param {number} difficulty - The selected difficulty level (1, 2, or 3)
 */
function setDifficulty(difficulty) {
    switch (difficulty) {
        case 1: // Easy
            moleInterval = 1000;
            plantInterval = 2000;
            specialMoleInterval = 4000;
            break;
        case 2: // Medium
            moleInterval = 1000;
            plantInterval = 1500;
            specialMoleInterval = 4000;
            break;
        case 3: // Hard
            moleInterval = 1000;
            plantInterval = 500;
            specialMoleInterval = 4000;
            break;
        
    }
    clearInterval(timerInterval); // Clear the previous timer interval
    clearInterval(moleInterval); // Clear the previous mole interval
    clearInterval(plantInterval); // Clear the previous plant interval
    clearInterval(specialMoleInterval); // Clear the previous special mole interval

    // Set new intervals
    timerInterval = setInterval(updateTimer, 1000);
    moleInterval = setInterval(setMole, moleInterval);
    plantInterval = setInterval(setPlant, plantInterval);
    specialMoleInterval = setInterval(setSpecialMole, specialMoleInterval);
}

/**
 * Function to set up the game board.
 * Creates a grid of tiles based on the number of rows and columns.
 * @param {number} rows - The number of rows in the grid (default is 3)
 * @param {number} cols - The number of columns in the grid (default is 3)
 */
function setGame(rows = 3, cols = 3) {
    document.getElementById("board").innerHTML = "";
    
    for (let i = 0; i < rows * cols; i++) {
        let tile = document.createElement("div");
        tile.id = i.toString();
        tile.addEventListener("click", selectTile);
        document.getElementById("board").appendChild(tile);
    }
    
    setInterval(setMole, moleInterval);
    setInterval(setPlant, plantInterval);
    setInterval(setSpecialMole, specialMoleInterval); // Call setSpecialMole at intervals
}

/**
 * Function to handle tile selection.
 * Updates the score, checks for achievements, and ends the game if necessary.
 */
function selectTile() {
    if (gameOver) {
        return;
    }
    if (this == currMoleTile) {
        score += 10;
        document.getElementById("score").innerText = "Score: " + score.toString(); //update score html
        document.getElementById("hitSound").play(); // Play hit sound
        consecutiveHits++;
        if (consecutiveHits >= 4) {
            alert("Achievement Unlocked: Mole Whacker Master!(4 consecutive hits)");
        }
    }
    else if (this == currPlantTile) {
        document.getElementById("score").innerText = "GAME OVER: " + score.toString(); //update score html
        gameOver = true;
        document.getElementById("gameOverSound").play(); // Play game over sound
    }
    else if (this.getAttribute("data-type") === "zombie") {
        score += 20;
        document.getElementById("score").innerText = "Score: " + score.toString(); //update score html
        document.getElementById("hitSound").play(); // Play hit sound
       
    }
    else {
        consecutiveHits = 0; // Reset consecutive hits counter if player misses
    }
}

/**
 * Function to update the timer.
 * Decreases the timer by 1 second and updates the timer display.
 * Checks for achievements and ends the game if the timer reaches 0.
 */
function updateTimer() {
    if (!gameOver) {
        timer--;
        document.getElementById("timer").innerText = "Timer: " + timer.toString();
        checkAchievements(); // Check achievements on timer update
    }

    if (timer === 0) {
        endGame();
    }
}

/**
 * Function to end the game.
 * Stops the timer, updates the high score, displays the final score, and alerts the player that the game is over.
 */
function endGame() {
    if (!gameOver) {
        gameOver = true;
        clearInterval(timerInterval);
        let highScore = localStorage.getItem("highScore") || 0;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
        }
        document.getElementById("highScore").innerText = "High Score: " + highScore;
        alert("Game Over! Your final score is: " + score);
    }
}

/**
 * Function to get a random tile id.
 * Returns a random number between 0 and 8 (inclusive) as a string.
 */
function getRandomTile() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

let specialMole = null;
let specialMoleInterval;

/**
 * Function to set a special mole.
 * Sets a special mole at a random tile if there is no existing special mole.
 * The special mole disappears after a random interval between 3 to 8 seconds.
 */
function setSpecialMole() {
    if (gameOver) {
        return;
    }
    if (!specialMole) {
        specialMoleInterval = Math.floor(Math.random() * 5000) + 3000; // Random interval between 3 to 8 seconds
        specialMole = getRandomTile();
        setTimeout(() => { specialMole = null; }, specialMoleInterval);
    }
}

/**
 * Function to set a regular mole.
 * Sets a regular mole at a random tile.
 * The mole can be a regular mole, a special zombie mole, or a plant mole based on the difficulty level.
 */
function setMole() {
    if (gameOver) {
        return;
    }
    if (currMoleTile) {
        currMoleTile.innerHTML = "";
    }
    let mole = document.createElement("img");
    mole.src = "./monty-mole.png";

    let num = getRandomTile();
    if (currPlantTile && currPlantTile.id == num) {
        return;
    }
    currMoleTile = document.getElementById(num);

    // Randomly decide whether to set a regular mole, a special zombie mole, or a plant mole
    let moleType = Math.random();
    if (moleType < 0.2) { // 20% chance of being a special zombie mole
        mole.src = "./zombie.png";
        currMoleTile.setAttribute("data-type", "zombie");
    } else if (moleType < 0.5) { // Adjust the probability for plant mole based on difficulty level
        if (level == 2) { // Medium difficulty
            if (Math.random() < 0.2) { // 20% chance of being a plant mole
                mole.src = "./piranha-plant.png";
                currMoleTile.setAttribute("data-type", "plant");
            }
        } else if (level == 3) { // Hard difficulty
            if (Math.random() < 0.4) { // 40% chance of being a plant mole
                mole.src = "./piranha-plant.png";
                currMoleTile.setAttribute("data-type", "plant");
            }
        }
    }

    currMoleTile.appendChild(mole);
}

/**
 * Function to set a plant mole.
 * Sets a plant mole at a random tile.
 */
function setPlant() {
    if (gameOver) {
        return;
    }
    if (currPlantTile) {
        currPlantTile.innerHTML = "";
    }
    let plant = document.createElement("img");
    plant.src = "./piranha-plant.png";

    let num = getRandomTile();
    if (currMoleTile && currMoleTile.id == num) {
        return;
    }
    currPlantTile = document.getElementById(num);
    currPlantTile.appendChild(plant);
}

/**
 * Function to update the high score display.
 * Retrieves the high score from localStorage and updates the high score display.
 */
function updateHighScore() {
    let highScore = localStorage.getItem("highScore");
    if (highScore) {
        document.getElementById("highScore").innerText = "High Score: " + highScore;
    }
}

let achievements = {
    "Novice Whacker": false,
    "Master Whacker": false
};

/**
 * Function to check achievements.
 * Checks if the player has achieved certain milestones (e.g., reaching a certain score) and unlocks the corresponding achievements.
 */
function checkAchievements() {
    if (score >= 100 && !achievements["Novice Whacker"]) {
        achievements["Novice Whacker"] = true;
        alert("Congratulations! You've achieved the 'Novice Whacker' achievement!");
    }

    if (score >= 200 && !achievements["Master Whacker"]) {
        achievements["Master Whacker"] = true;
        alert("Congratulations! You've achieved the 'Master Whacker' achievement!");
    }
    
    if (timer <= 30 && !achievements["Time Keeper"]) {
        achievements["Time Keeper"] = true;
        alert("Congratulations! You've achieved the 'Time Keeper' achievement!");
    }
}
