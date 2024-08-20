const canvas = document.getElementById('gameCanvas');
const menuimg = document.getElementById('menu');
const body = document.getElementById('body');
const title = document.getElementById('title');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('singlePlayer');
const gameOverMessage = document.getElementById('gameOverMessage');
const x1 = document.getElementById('x1');
const x2 = document.getElementById('x2');
const x3 = document.getElementById('x3');

const bottom = document.getElementById('bottom');
const menu = document.getElementById('menu');

canvas.width = window.innerWidth-30;
canvas.height = window.innerHeight-30;


const backgroundImage = new Image();
backgroundImage.src = 'BG.png';

const splash = new Image();
splash.src = 'public/splash.png';
splash.opacity=0.7;


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
let lives = 3;

const fruitSprites = ["public/fruits/boom.png","public/fruits/apple.png","public/fruits/avocado.png","public/fruits/bananas.png","public/fruits/mango.png","public/fruits/orange.png","public/fruits/strawberry.png"];

const loadedSprites = fruitSprites.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
const started = false;

const scoreDisplay = document.getElementById('scoreDisplay');

class Fruit {
    constructor(x, y, initialVelocityX, initialVelocityY,spriteindex) {
        this.x = x;
        this.y = y;
        this.velocityX = initialVelocityX;
        this.velocityY = initialVelocityY;
        this.gravity = 0.2; 
        this.radius = 50;
        this.spriteindex =spriteindex;
        this.sprite =loadedSprites[this.spriteindex];
        
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
        if(this.spriteindex==0){
            this.isSliced=true
            gameOver();
        }else{
            this.isSliced = true;
            score += 10;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        
    }
}

function spawnFruit() {
    const side = Math.floor(Math.random() * 2);
    let x, y, initialVelocityX, initialVelocityY,sprite;
    spriteindex= Math.floor(Math.random() * loadedSprites.length);
    

    if (side === 0) {

        x = Math.random() * canvas.width;
        y = canvas.height -30; 
        initialVelocityX = (Math.random() - 0.5) * 15;
        initialVelocityY = -(5 + Math.random() * 12); 
    } else if (side === 1) {

        x = 50; 
        y = Math.random() * canvas.height;
        initialVelocityX = (5 + Math.random() * 10);
        initialVelocityY = -(Math.random() * 7);
    } else {
        x =canvas.width-50; 
        y = Math.random() * canvas.height;
        initialVelocityX = (5 + Math.random() * 10); 
        initialVelocityY = -(Math.random() * 7);
    }
    fruits.push(new Fruit(x, y, initialVelocityX, initialVelocityY,spriteindex));
}

function updateGame() {
    
   ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    fruits.forEach((fruit, index) => {
        fruit.update();
        if (fruit.y > canvas.height) {
            fruits.splice(index, 1);
            if(fruit.spriteindex !=0){
                lives -=0.25;
                Handlelives();
                console.log(lives);
            }
           
            Handlelives();
        }
    });
}

function gameLoop() {
    updateGame();
    animationFrameId = requestAnimationFrame(gameLoop);

    Handlelives();
    fxList.forEach((fx, index) => {
        fx.draw(ctx);
        if (fx.isFinished()) {
            fxList.splice(index, 1); 
        }
    });
}

function handleSlice(x, y) {
    fruits.forEach(fruit => {
        const dist = Math.hypot(x - fruit.x, y - fruit.y);
        if (dist < fruit.radius+20 && !fruit.isSliced) {
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

startBtn.addEventListener('click', function(){
    startGame();
});

function startGame() {
    if (!isStarted) {
        isStarted = true;
        menu.style.display = 'none';
        gameOverMessage.style.display = 'none';
        bottom.style.display = 'flex';
        scoreDisplay.style.display='flex';
        body.style.backgroundImage='none'
        body.style.backgroundColor='black';
        resetLives();
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
    cancelAnimationFrame(animationFrameId);
    scoreDisplay.textContent = `Last Score: ${score}`;
    isStarted = false;
    menu.style.display = 'flex';
    gameOverMessage.style.display = 'block';
    bottom.style.display = 'none';
    body.style.backgroundImage='url(BG.png)'
    body.style.backgroundColor='none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
}
function Handlelives(){
    if(lives == 2 ){
        x1.style.backgroundImage='url(public/xx1.png)';
    }else if(lives==1){
        x1.style.backgroundImage='url(public/xx1.png)';
        x2.style.backgroundImage='url(public/xx2.png)';
    }else if(lives == 0){
        x1.style.backgroundImage='url(public/xx1.png)';
        x2.style.backgroundImage='url(public/xx2.png)';
        x3.style.backgroundImage='url(public/xx3.png)';
        gameOver();
    }
    
}
function resetLives(){
    lives = 3;
    x1.style.backgroundImage='url(public/x1.png)';
    x2.style.backgroundImage='url(public/x2.png)';
    x3.style.backgroundImage='url(public/x3.png)';
}

class SlashFX {
    
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.opacity = 1.0; 
        this.fadeSpeed = 0.1;
        this.lineWidth = 10; 
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = 'rgba(263	41	0, 0.8)'; 
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();

        
        this.opacity -= this.fadeSpeed/1000;
        this.lineWidth -= 0.5;
        ctx.drawImage(splash, this.x1, this.y1,100,100);

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

