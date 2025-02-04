const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 800;

let fruits = [];
let bombs = [];
let missedFruits = 0;
let score = 0;
let gameState = "start"; 
let spawnInterval;
let juiceSplashes = [];
let countdown = 3;

// Handle Input (Mouse & Touch)
canvas.addEventListener("click", handleTap);
canvas.addEventListener("mousedown", handleSwipe);
canvas.addEventListener("touchstart", handleSwipe);

function handleTap() {
    if (gameState === "start") {
        startCountdown();
    } else if (gameState === "gameOver") {
        resetToStartScreen();
    }
}

function handleSwipe(event) {
    const rect = canvas.getBoundingClientRect();
    let x = event.clientX || event.touches[0].clientX;
    let y = event.clientY || event.touches[0].clientY;
    x -= rect.left;
    y -= rect.top;

    // Check if a bomb is hit
    for (let i = bombs.length - 1; i >= 0; i--) {
        if (bombs[i].isHit(x, y)) {
            endGame(); // Game over if bomb is hit
            return;
        }
    }

    // Check if a fruit is hit
    for (let i = fruits.length - 1; i >= 0; i--) {
        if (fruits[i].isHit(x, y)) {
            createJuiceSplash(x, y);
            fruits.splice(i, 1);
            score++;
        }
    }
}

function startCountdown() {
    gameState = "countdown";
    countdown = 3;
    let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            startGame();
        }
        gameLoop();
    }, 1000);
}

function startGame() {
    gameState = "playing";
    missedFruits = 0;
    score = 0;
    fruits = [];
    bombs = [];
    juiceSplashes = [];

    setTimeout(() => {
        spawnInterval = setInterval(() => {
            spawnFruit();
            if (Math.random() < 0.2) spawnBomb(); // 20% chance to spawn a bomb
        }, 1500);
        gameLoop();
    }, 500);
}

function resetToStartScreen() {
    clearInterval(spawnInterval);
    gameState = "start";
    fruits = [];
    bombs = [];
    missedFruits = 0;
    score = 0;
    gameLoop();
}

function spawnFruit() {
    const types = ["apple", "orange", "banana"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const spawnX = Math.random() * (canvas.width - 50);
    fruits.push(new Fruit(spawnX, 0, randomType));
}

function spawnBomb() {
    const spawnX = Math.random() * (canvas.width - 50);
    bombs.push(new Bomb(spawnX, 0));
}

function gameLoop() {
    ctx.fillStyle = "#D2B48C"; // Light brown background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === "start") {
        drawStartScreen();
        return;
    }

    if (gameState === "countdown") {
        drawCountdown();
        return;
    }

    fruits.forEach(fruit => {
        fruit.update();
        fruit.draw();
        if (fruit.y > canvas.height) {
            missedFruits++;
            fruits = fruits.filter(f => f !== fruit);
        }
    });

    bombs.forEach(bomb => {
        bomb.update();
        bomb.draw();
        if (bomb.y > canvas.height) {
            bombs = bombs.filter(b => b !== bomb);
        }
    });

    juiceSplashes.forEach(splash => {
        splash.draw();
        splash.life--;
    });

    juiceSplashes = juiceSplashes.filter(splash => splash.life > 0);

    drawScore();

    if (missedFruits >= 5) {
        endGame();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    clearInterval(spawnInterval);
    gameState = "gameOver";
    displayGameOver();
}

function drawStartScreen() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Click to Start", canvas.width / 2 - 80, canvas.height / 2);
}

function drawCountdown() {
    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.fillText(countdown > 0 ? countdown : "Go!", canvas.width / 2 - 20, canvas.height / 2);
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width - 100, 30);
}

function displayGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over! Tap to Restart", 100, canvas.height / 2);
}

class Fruit {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 30; 
        this.speed = Math.random() * 2.6 + 1.6; // 0.2s slower
        const fruitTypes = {
            apple: "🍎",
            orange: "🍊",
            banana: "🍌"
        };
        this.emoji = fruitTypes[type];
    }

    draw() {
        ctx.font = "40px Arial";
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }

    isHit(px, py) {
        return Math.hypot(px - this.x, py - this.y) < this.radius;
    }
}

class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.speed = Math.random() * 2.6 + 1.6; // Same speed as fruits
        this.emoji = "💣";
    }

    draw() {
        ctx.font = "40px Arial";
        ctx.fillText(this.emoji, this.x, this.y);
    }

    update() {
        this.y += this.speed;
    }

    isHit(px, py) {
        return Math.hypot(px - this.x, py - this.y) < this.radius;
    }
}

class JuiceSplash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 15; 
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createJuiceSplash(x, y) {
    juiceSplashes.push(new JuiceSplash(x, y));
}

// Start the game loop immediately
gameLoop();






