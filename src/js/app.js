const time = 100;
const timeStatistics = 1000;
const colors = {
    healthy: "green",
    infected: "red",
    dead: "gray"
};

var playground;

class Playground {
    constructor(config) {
        this.range = parseInt(config.range);
        this.maxBallsHealthy = parseInt(config.maxBallsHealthy);
        this.maxBallsInfected = parseInt(config.maxBallsInfected);
        this.totalBalls = this.maxBallsHealthy + this.maxBallsInfected;
        this.radius = parseInt(config.radius);
        this.safeDist = parseInt(config.safeDist);
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.balls = [];
        this.currentHealthy = 0;
        this.currentInfected = 0;
        this.currentHealthyRatio = 0;
        this.currentInfectedRatio = 0;

        this.injectBalls(this.maxBallsHealthy, "healthy");
        this.injectBalls(this.maxBallsInfected, "infected");
    }

    injectBalls(amount, status){
        for(let i = 0; i < amount; i++) {
            const xStart = getRndInteger(0, this.canvas.width - 1);
            const yStart = getRndInteger(0, this.canvas.height - 1);
            const ball = new Ball(this.ctx, xStart, yStart, status, this.radius, this.range, this.canvas.width, this.canvas.height);
            this.balls.push(ball);
        }
    }

    clearPlayground() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateBallsStatus() {
        this.balls.forEach((b1, i1) => {
            this.balls.forEach((b2, i2) => {
                if(i1!==i2) {
                    if(b1.getDistance(b2) < this.safeDist && b1.status === "healthy" && b2.status === "infected") {
                        b1.status = "infected";
                    }
                }
            });
        });
    }

    moveAndRedraw() {
        this.balls.forEach(b => {
            b.move();
            b.draw();
        });
    }

    updateStatistics() {
        this.currentHealthy = this.balls.filter(b => b.status === "healthy").length;
        this.currentInfected = this.balls.filter(b => b.status === "infected").length;
        this.currentHealthyRatio = 100.0 * (this.currentHealthy / this.totalBalls);
        this.currentInfectedRatio = 100.0 * (this.currentInfected / this.totalBalls);
    }

    play() {
        this.clearPlayground();
        this.updateBallsStatus();
        this.moveAndRedraw();
        this.updateStatistics();
    }
}

class Ball {
    constructor(ctx, xStart, yStart, status, radius, range, maxWidth, maxHeight) {
        this.ctx = ctx;
        this.x = xStart;
        this.y = yStart;
        this.status = status;
        this.radius = radius;
        this.range = range;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.id = 0;
        this.age = 0;
        this.dateInfection = new Date();
    }

    move() {
        this.x += this.getRndMovement(); //getRndInteger(-range, range);
        this.y += this.getRndMovement(); //getRndInteger(-range, range);
        this.x = Math.min(Math.max(0 + this.radius, this.x), this.maxWidth - this.radius);
        this.y = Math.min(Math.max(0 + this.radius, this.y), this.maxHeight - this.radius);
    }

    getColor() {
        return colors[this.status];
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.getColor();
        this.ctx.fill();
        this.ctx.closePath();
    }

    getDistance(ball) {
        return Math.sqrt(Math.pow(this.x - ball.x, 2) + Math.pow(this.y - ball.y, 2));
    }

    getRndMovement() {
        return this.range * (getRndInteger(0, 1) === 0 ? -1 : 1);
    }
}

// utils
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// html
function printStatistics() {
    $("#healthy").html(`${playground.currentHealthy} (${playground.currentHealthyRatio.toFixed(2)}%)`);
    $("#infected").html(`${playground.currentInfected} (${playground.currentInfectedRatio.toFixed(2)}%)`);
}

function dance() {
    playground.play();
}

function startDancing() {
    // init contetext
    const config = {
        range: $("#range").val(),
        maxBallsHealthy: $("#maxBallsHealthy").val(),
        maxBallsInfected: $("#maxBallsInfected").val(),
        radius: $("#radius").val(),
        safeDist: $("#safeDist").val(),
        canvas: document.getElementById("playground")
    };

    playground = new Playground(config);

    // start infinite loop
    setInterval(dance, time);
    setInterval(printStatistics, timeStatistics);
}

$(document).ready(function() {
    console.log("Ready!");
});
