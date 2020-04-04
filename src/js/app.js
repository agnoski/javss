const time = 100;
const timeStatistics = 1000;
const colors = {
    healthy: "lime",
    infected: "orange",
    sick: "red",
    dead: "gray",
    recovered: "cyan"
};
const sexColors = {
    male: "blue",
    female: "magenta"
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

        this.time = 0;
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

    updateBallsInfectedStatus() {
        this.balls.forEach((b1, i1) => {
            this.balls.forEach((b2, i2) => {
                if(i1 !== i2) { //TODO optimize check
                    b1.isInfectedByOther(b2, this.safeDist);
                }
            });
        });
    }

    updateBallsStatus() {

    }

    moveAndRedraw() {
        this.balls.forEach(b => {
            b.move();
            b.draw();
        });
    }

    getTimeSpentInDays() {
        const conversionFactor = 25920/(1000/time); // 3 months = 5 minutes
        const days = (this.time/(24*60*60)) * conversionFactor;
        const intDays = Math.floor(days);
        const intHours = Math.floor((days - intDays) * 24);
        return `${intDays} Days ${intHours} Hours`;
    }

    updateStatistics() {
        this.currentHealthy = this.balls.filter(b => b.status === "healthy").length;
        this.currentInfected = this.balls.filter(b => b.status === "infected").length;
        this.currentHealthyRatio = 100.0 * (this.currentHealthy / this.totalBalls);
        this.currentInfectedRatio = 100.0 * (this.currentInfected / this.totalBalls);
    }

    play() {
        this.time++;
        this.clearPlayground();
        this.updateBallsInfectedStatus();
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
        this.age = getAge(ageAndSexProbability);
        this.sex = getSexGivenAgeIdx(ageAndSexProbability, this.age.ageIdx);
        this.dateBorn = new Date();
        this.dateInfected = null;
        this.dateSickness = null;
        this.dateDeath = null;
        this.dateRecoverd = null;
    }

    getColor() {
        return colors[this.status];
    }

    getSexColor() {
        return sexColors[this.sex];
    }

    move() {
        this.x += this.getRndMovement(); //getRndInteger(-range, range);
        this.y += this.getRndMovement(); //getRndInteger(-range, range);
        this.x = Math.min(Math.max(0 + this.radius, this.x), this.maxWidth - this.radius);
        this.y = Math.min(Math.max(0 + this.radius, this.y), this.maxHeight - this.radius);
    }

    updateStatus() {

    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.getColor();
        this.ctx.strokeStyle = this.getSexColor();
        this.ctx.lineWidth = 1;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
    }

    getDistance(ball) {
        return Math.sqrt(Math.pow(this.x - ball.x, 2) + Math.pow(this.y - ball.y, 2));
    }

    getRndMovement() {
        return this.range * (getRndInteger(0, 1) === 0 ? -1 : 1);
    }

    getRadiusOfInfection(refDistance) {
        const maleDistanceMultiplier = 1.15;
        const femaleDistanceMultiplier = 0.95;
        const sickDistanceMultiplier = 1.5;
    
        let radius = refDistance;
        if(this.status === "infected") {
            radius *= (this.sex === "female" ? femaleDistanceMultiplier : maleDistanceMultiplier);
        } else if (this.status === "sick"){
            radius *= sickDistanceMultiplier; 
        } else {
            radius = -1;
        }

        return radius;
    }

    getProbabilityOfInfectionByDistance(distance, radiusOfInfection) {
        // y = -x^2/r^2 + 1
        let probability = 0;
        if(radiusOfInfection > 0) {
            probability = (-Math.pow(distance, 2)/Math.pow(radiusOfInfection, 2)) + 1;
        }
    
        return Math.max(probability, 0);
    }

    isInfectedByOther(other, refDistance) {
        const distance = this.getDistance(other);
        const radiusOfInfection = other.getRadiusOfInfection(refDistance);
        const probabilityOfInfection = this.getProbabilityOfInfectionByDistance(distance, radiusOfInfection);
        const infected = isHappeningProbability(probabilityOfInfection);
        if(this.status === "healthy" && infected) {
            this.status = "infected";
            this.dateInfected = Date.now();
            console.log(distance);
        }
        return infected;
    }

    getProbabilityOfSickness() {
        let probability = 0;
        if(this.status === "positive") {
            probability = 0.005*Math.exp(0.04*age);
        }
    
        return probability;
    }

    isSick() {
        const probabilityOfSickness = this.getProbabilityOfSickness();
        const sick = isHappeningProbability(probabilityOfSickness);

        if(sick) {
            this.staus = "sick";
            this.dateSickness = Date.now();
        }
        return sick;
    }
    
    getPrbabilityOfDeath() {
        let probability = 0;
        if(this.status === "sick") {
            probability = 0.005*Math.exp(0.04*this.age) + this.timeOfSickness*0.00025*this.age;
        }
        return probability;
    }

    isDead() {
        const probabilityOfDeath = this.getProbabilityOfDeath();
        const dead = isHappeningProbability(probabilityOfDeath);

        if(dead) {
            this.staus = "dead";
            this.dateDeath = Date.now();
        }
        return dead;
    }
    
    getProbabilityOfRecovery() {
        let probability = 0;
        if(status === "sick") {
            prbability = this.timeOfSickness * 0.01 - this.age * (0.001);
        }
        return probability;
    }

    isRecovery() {
        const probabilityOfRecovery = this.getProbabilityOfRecovery();
        const recovered = isHappeningProbability(probabilityOfRecovery);

        if(recovered) {
            this.staus = "recovered";
            this.dateRecoverd = Date.now();
        }
        return recovered;
    }
}

// utils
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// html
function printStatistics() {
    $("#time").html(`${playground.getTimeSpentInDays()}`);
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
    test();
});
