const canvas = document.getElementById('gameCanvas');
const menuimg = document.getElementById('menu');
const title = document.getElementById('title');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startButton');
const gameOverMessage = document.getElementById('gameOverMessage');
const timerDisplay = document.getElementById('timerDisplay');

canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;


const backgroundImage = new Image();
backgroundImage.src = 'bg.png';


let fruits = [];
let score = 0;
let isStarted = false;
let timerInterval;
let timeLeft = 30; 
let gameInterval;
let animationFrameId;

const fruitSprites = ["public/fruits/apple.png","public/fruits/avocado.png","public/fruits/bananas.png","public/fruits/mango.png","public/fruits/orange.png","public/fruits/strawberry.png"];

const loadedSprites = fruitSprites.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
const started = false;

const scoreDisplay = document.getElementById('scoreDisplay');

class Fruit {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = 30;
        this.sprite = loadedSprites[Math.floor(Math.random() * loadedSprites.length)];
        this.isSliced = false;
    }

    draw() {
        if (!this.isSliced) {
            ctx.drawImage(this.sprite, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }

    update() {
        this.y += this.speed;
        this.draw();
    }

    slice() {
        this.isSliced = true;
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
    }
}

function spawnFruit() {
    const x = Math.random() * canvas.width;
    const speed = 2 + Math.random() * 3;
    fruits.push(new Fruit(x, 0, speed));
}

function updateGame() {
    
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    fruits.forEach((fruit, index) => {
        fruit.update();
        if (fruit.y > canvas.height) {
            fruits.splice(index, 1);
        }
    });
}

function gameLoop() {
    updateGame();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleSlice(x, y) {
    fruits.forEach(fruit => {
        const dist = Math.hypot(x - fruit.x, y - fruit.y);
        if (dist < fruit.radius && !fruit.isSliced) {
            fruit.slice();
        }
    });
}


canvas.addEventListener('mousedown', (event) => {
    handleSlice(event.clientX, event.clientY);
});

canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    handleSlice(touch.clientX, touch.clientY);
});

function startTimer() {
    timerDisplay.textContent = `Time: ${timeLeft}`;
    timerInterval = setInterval(() => {
        timeLeft--; 
        timerDisplay.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 1000);
}
startBtn.addEventListener('click', function(){
    startGame();
    startTimer();
});

function startGame() {
    if (!isStarted) {
        isStarted = true;
        startBtn.style.display = 'none';
        gameOverMessage.style.display = 'none';
        menuimg.style.display = 'none';
        title.style.display = 'none';
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = `Score: ${score}`;
        fruits = [];
        clearInterval(gameInterval); 
        clearInterval(timerInterval);
        gameInterval = setInterval(spawnFruit, 1000);
        gameLoop();
    }
}
function gameOver(){
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    cancelAnimationFrame(animationFrameId);
    isStarted = false;
    startButton.style.display = 'block';
    gameOverMessage.style.display = 'block';
    menuimg.style.display = 'flex';
    title.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
}








