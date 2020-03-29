const time = 50;
const timeStatistics = 1000;
const range = 5;
const maxBallsHealthy = 100;
const maxBallsInfected = 2;
const totalBalls = maxBallsHealthy + maxBallsInfected;
const radius = 4;
const balls = [];
const colors = {
    healthy: "green",
    infected: "red",
    dead: "gray"
};
const safeDist = 20;
var ctx;
var canvas;
var currentHealthy = 0;
var currentInfected = 0;
var currentHealthyRatio = 0;
var currentInfectedRatio = 0;

class Ball {
    constructor(ctx, xStart, yStart, status) {
        this.id = 0;
        this.ctx = ctx;
        this.x = xStart;
        this.y = yStart;
        this.status = status;
        this.age = 0;
        this.dateInfection = new Date();
    }

    move() {
        this.x += getRndMovement(); //getRndInteger(-range, range);
        this.y += getRndMovement(); //getRndInteger(-range, range);
        this.x = Math.min(Math.max(0 + radius, this.x), canvas.width - radius);
        this.y = Math.min(Math.max(0 + radius, this.y), canvas.height - radius);
    }

    getColor() {
        return colors[this.status];
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.getColor();
        this.ctx.fill();
        this.ctx.closePath();
    }

    getDistance(ball) {
        return Math.sqrt(Math.pow(this.x - ball.x, 2) + Math.pow(this.y - ball.y, 2));
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRndMovement() {
    return range * getRndInteger(0, 1) === 0 ? -1 : 1;
}

function updateStatistics() {
    $("#healthy").html(`${currentHealthy} (${currentHealthyRatio.toFixed(2)}%)`);
    $("#infected").html(`${currentInfected} (${currentInfectedRatio.toFixed(2)}%)`);
}

function dance() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update balls status
    balls.forEach((b1, i1) => {
        balls.forEach((b2, i2) => {
            if(i1!==i2) {
                if(b1.getDistance(b2) < safeDist && b1.status === "healthy" && b2.status === "infected") {
                    b1.status = "infected";
                }
            }
        });
    });

    // move and redraw balls in the new position
    balls.forEach(b => {
        b.move();
        b.draw();
    });

    // updateStatistics
    currentHealthy = balls.filter(b => b.status === "healthy").length;
    currentInfected = balls.filter(b => b.status === "infected").length;
    currentHealthyRatio = 100.0 * (currentHealthy / totalBalls);
    currentInfectedRatio = 100.0 * (currentInfected / totalBalls);
}

function startDancing() {

    // init contetext
    canvas = document.getElementById("playground");
    ctx = canvas.getContext("2d");

    // inject healthy balls
    for(let i = 0; i < maxBallsHealthy; i++) {
        const xStart = getRndInteger(0, canvas.width - 1);
        const yStart = getRndInteger(0, canvas.height - 1);
        const ball = new Ball(ctx, xStart, yStart, "healthy");
        balls.push(ball);
    }

    // inject infected balls
    for(let i = 0; i < maxBallsInfected; i++) {
        const xStart = getRndInteger(0, canvas.width - 1);
        const yStart = getRndInteger(0, canvas.height - 1);
        const ball = new Ball(ctx, xStart, yStart, "infected");
        balls.push(ball);
    }

    // start infinite loop
    setInterval(dance, time);
    setInterval(updateStatistics, timeStatistics);
}

$(document).ready(function() {
    startDancing();
});