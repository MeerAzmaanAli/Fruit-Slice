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
splash.opacity=0.5;


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
let lives = 6;
let isMouseDown = false;
let lastMousePosition = { x: 0, y: 0 };

const fruitSprites = [
    "public/fruits/boom.png",
    "public/fruits/apple.png",
    "public/fruits/avocado.png",
    "public/fruits/bananas.png",
    "public/fruits/mango.png",
    "public/fruits/orange.png",
    "public/fruits/strawberry.png"
];
const SlicedSprites = [
    "public/fruits/boom-1.png",
    "public/fruits/apple-1.png",
    "public/fruits/avocado-1.png",
    "public/fruits/bananas-1.png",
    "public/fruits/mango-1.png",
    "public/fruits/orange-1.png",
    "public/fruits/strawberry-1.png",
];
    
const loadedSprites = fruitSprites.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
const loadedSliced = SlicedSprites.map(src => {
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
        this.spriteLeft=loadedSliced[spriteindex];
        this.spriteRight;
        
        this.isSliced = false;
    }
   

    draw() {
        if (!this.isSliced) {
            ctx.drawImage(this.sprite, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }else if(this.isSliced){
            ctx.drawImage(this.spriteLeft, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            
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
        y = canvas.height-100; 
        initialVelocityX = (Math.random() - 0.5) * 15;
        initialVelocityY = -(5 + Math.random() * 12); 
    } else if (side === 1) {

        x = 50; 
        y = Math.random() * (canvas.height-100);
        initialVelocityX = (5 + Math.random() * 10);
        initialVelocityY = -(Math.random() * 7);
    } else {
        x =canvas.width-50; 
        y = Math.random() * (canvas.height-100);
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
                if(!fruit.isSliced){
                    lives -=0.25;
                    Handlelives();
                    console.log(lives);
                }
               
            }
           
            
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

function handleSlice(x1, y1, x2, y2) {
    fruits.forEach(fruit => {
        if (!fruit.isSliced) {
            // Check if the fruit intersects with the line between the two mouse positions
            const dist = pointToLineDistance(fruit.x, fruit.y, x1, y1, x2, y2);
            if (dist < fruit.radius) {
                fruit.slice();
                fxList.push(new SlashFX(x1, y1, x2+100, y2));
            }
        }
    });
}


canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMousePosition = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});
canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const currentMousePosition = { x: event.clientX, y: event.clientY };
        handleSlice(currentMousePosition.x, currentMousePosition.y, lastMousePosition.x, lastMousePosition.y);
        lastMousePosition = currentMousePosition;
    }
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
        bottom.style.opacity=0;
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
        ctx.strokeStyle = 'rgba(40,16,9,0.7)'; 
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();

        
        this.opacity -= this.fadeSpeed/10000;
        this.lineWidth -= 0.5;
        ctx.drawImage(splash, this.x1, this.y1,150,150 );

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
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
function enterFullscreen() {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
        canvas.msRequestFullscreen();
    }
}
