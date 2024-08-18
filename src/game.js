const canvas = document.getElementById('gameCanvas');
const menuimg = document.getElementById('menu');
const title = document.getElementById('title');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startButton');
const gameOverMessage = document.getElementById('gameOverMessage');
const timerDisplay = document.getElementById('timerDisplay');
const bottom = document.getElementById('bottom');

canvas.width = window.innerWidth-30;
canvas.height = window.innerHeight-30;


const backgroundImage = new Image();
backgroundImage.src = 'bgN.png';


let fruits = [];
let fxList = [];
let score = 0;
let isStarted = false;
let timerInterval;
let timeLeft = 30; 
let gameInterval;
let animationFrameId;
let updateInterval;
let vx;

const fruitSprites = ["public/fruits/apple.png","public/fruits/avocado.png","public/fruits/bananas.png","public/fruits/mango.png","public/fruits/orange.png","public/fruits/strawberry.png"];

const loadedSprites = fruitSprites.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
const started = false;

const scoreDisplay = document.getElementById('scoreDisplay');

class Fruit {
    constructor(x, y, initialVelocityX, initialVelocityY) {
        this.x = x;
        this.y = y;
        this.velocityX = initialVelocityX;
        this.velocityY = initialVelocityY;
        this.gravity = 0.2; 
        this.radius = 50;
        this.sprite = loadedSprites[Math.floor(Math.random() * loadedSprites.length)];
        this.isSliced = false;
    }

    draw() {
        if (!this.isSliced) {
            ctx.drawImage(this.sprite, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }

    update() {
        this.velocityY += this.gravity; 
        this.x += this.velocityX;
        this.y += this.velocityY; 

   
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.velocityX = -this.velocityX; 
        }

      
        if (this.y - this.radius > canvas.height) {
            this.isSliced = true; 
        }

        this.draw();
    }

    slice() {
        this.isSliced = true;
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
    }
}

function spawnFruit() {
    const side = Math.floor(Math.random() * 2);
    let x, y, initialVelocityX, initialVelocityY;
    if (side === 0) {

        x = Math.random() * canvas.width;
        y = canvas.height -30; 
        initialVelocityX = (Math.random() - 0.5) * vx+5;
        initialVelocityY = -(5 + Math.random() * 20); 
    } else if (side === 1) {

        x = 50; 
        y = Math.random() * canvas.height;
        initialVelocityX = (5 + Math.random() * vx);
        initialVelocityY = -(Math.random() * 5);
    } else {
        x =canvas.width-50; 
        y = Math.random() * canvas.height;
        initialVelocityX = (5 + Math.random() * vx); 
        initialVelocityY = -(Math.random() * 5);
    }

    fruits.push(new Fruit(x, y, initialVelocityX, initialVelocityY));
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

    // Update and draw all FX
    fxList.forEach((fx, index) => {
        fx.draw(ctx);
        if (fx.isFinished()) {
            fxList.splice(index, 1);  // Remove finished effects from the list
        }
    });
}

function handleSlice(x, y) {
    fruits.forEach(fruit => {
        const dist = Math.hypot(x - fruit.x, y - fruit.y);
        if (dist < fruit.radius && !fruit.isSliced) {
            fruit.slice();
            fxList.push(new SlashFX(fruit.x - 20, fruit.y - 20, fruit.x + 20, fruit.y + 20));
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
        setAttributes();
        startBtn.style.display = 'none';
        gameOverMessage.style.display = 'none';
        menuimg.style.display = 'none';
        title.style.display = 'none';
        bottom.style.display = 'flex';
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = `Score: ${score}`;
        fruits = [];

        clearInterval(gameInterval); 
        clearInterval(timerInterval);
        gameInterval = setInterval(spawnFruit, updateInterval);
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
    bottom.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
}

class SlashFX {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.opacity = 1.0; // Initial opacity
        this.fadeSpeed = 0.1; // Speed at which the slash fades out
        this.lineWidth = 10; // Initial width of the slash
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // White color for the slash
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round'; // Rounded ends for a smoother slash
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();

        // Update the effect (fade out and narrow the line)
        this.opacity -= this.fadeSpeed;
        this.lineWidth -= 0.5;
    }

    isFinished() {
        return this.opacity <= 0 || this.lineWidth <= 0;
    }
}
function setAttributes(){
    const k = 728000; 
    const vk = 5000;
    const a = canvas.width;   
    const b = k/a;
    updateInterval=b;
    vx=vk/b;
    console.log(b);
    console.log(vx);
}

