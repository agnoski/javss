const time = 100;
const timeStatistics = 1000;
const timesample = 33;
const maxtime = 600;
const conversionFactor = 25920/(1000/time); // 3 months = 5 minutes

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

const directions = {
    n: {x: 0, y: 1, nxt: ["n", "ne", "nw", "w", "e"]},
    e: {x: 1, y: 0, nxt: ["e", "ne", "se", "n", "s"]},
    s: {x: 0, y: -1, nxt: ["s", "se", "sw", "e", "w"]},
    w: {x: -1, y: 0, nxt: ["w", "sw", "nw", "s", "n"]},
    ne: {x: 1, y: 1, nxt: ["ne", "n", "e", "nw", "se"]},
    nw: {x: -1, y: 1, nxt: ["nw",  "n", "w", "ne", "sw"]},
    se: {x: 1, y: -1, nxt: ["se",  "e", "s", "ne", "sw"]},
    sw: {x: -1, y: -1, nxt: ["sw", "w", "s", "nw", "se"]}
};

const directionsProbabilities = [70, 10, 10, 5, 5];
const startingDirections = Object.keys(directions);

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
        this.stats = [];
        this.currentHealthy = 0;
        this.currentHealthyRatio = 0;
        this.currentHealthyAvgAge = 0;
        this.currentInfected = 0;
        this.currentInfectedRatio = 0;
        this.currentInfectedAvgAge = 0;
        this.currentSick = 0;
        this.currentSickRatio = 0;
        this.currentSickAvgAge = 0;
        this.currentDead = 0;
        this.currentDeadRatio = 0;
        this.currenDeadAvgAge = 0;
        this.currentRecovered = 0;
        this.currentRecoveredatio = 0;
        this.currentRecoveredAvgAge = 0;

        this.intervals = [];

        this.injectBalls(this.maxBallsHealthy, "healthy");
        this.injectBalls(this.maxBallsInfected, "infected");

        this.plotStats("Stats", "graph");
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
        this.balls.forEach(b => b.updateStatus());
    }

    moveAndRedraw() {
        this.balls.forEach(b => {
            b.move();
            b.draw();
        });
    }

    getTimeSpentInDays() {
        const days = getDays(this.time);
        const intDays = Math.floor(days);
        const intHours = Math.floor((days - intDays) * 24);
        return `${intDays} Days ${intHours} Hours`;
    }

    updateStatistics() {
        this.currentHealthy = this.balls.filter(b => b.status === "healthy").length;
        this.currentInfected = this.balls.filter(b => b.status === "infected").length;
        this.currentSick = this.balls.filter(b => b.status === "sick").length;
        this.currentDead = this.balls.filter(b => b.status === "dead").length;
        this.currentRecovered = this.balls.filter(b => b.status === "recovered").length;
        this.currentHealthyRatio = 100.0 * (this.currentHealthy / this.totalBalls);
        this.currentInfectedRatio = 100.0 * (this.currentInfected / this.totalBalls);
        this.currentSickRatio = 100.0 * (this.currentSick / this.totalBalls);
        this.currentDeadRatio = 100.0 * (this.currentDead / this.totalBalls);
        this.currentRecoveredRatio = 100.0 * (this.currentRecovered / this.totalBalls);
        this.currentHealthyAvgAge = this.currentHealthy > 0 ? this.balls.filter(b => b.status === "healthy").map(b => b.age.years).reduce((a, b) => a + b) / this.currentHealthy : -1;
        this.currentInfectedAvgAge = this.currentInfected > 0 ? this.balls.filter(b => b.status === "infected").map(b => b.age.years).reduce((a, b) => a + b) / this.currentInfected : -1;
        this.currentSickAvgAge = this.currentSick > 0 ? this.balls.filter(b => b.status === "sick").map(b => b.age.years).reduce((a, b) => a + b) / this.currentSick : -1;
        this.currentDeadAvgAge = this.currentDead > 0 ? this.balls.filter(b => b.status === "dead").map(b => b.age.years).reduce((a, b) => a + b) / this.currentDead : -1;
        this.currentRecoveredAvgAge = this.currentRecovered > 0 ? this.balls.filter(b => b.status === "recovered").map(b => b.age.years).reduce((a, b) => a + b) / this.currentRecovered : -1;
    }

    saveSample() {
        if(this.time % timesample === 0) {
            const sample = {
                date: Date.now(),
                currentHealthy: this.currentHealthy,
                currentHealthyRatio: this.currentHealthyRatio,
                currentInfected: this.currentInfected,
                currentInfectedRatio: this.currentInfectedRatio,
                currentSick: this.currentSick,
                currentSickRatio: this.currentSickRatio,
                currentDead: this.currentDead,
                currentDeadRatio: this.currentDeadRatio,
                currentRecovered: this.currentRecovered,
                currentRecoveredRatio: this.currentRecoveredRatio,
            };

            this.stats.push(sample);
        }
    }

    addInterval(interval) {
        this.intervals.push(interval);
    }

    clearIntervals() {
        this.intervals.forEach( i => {
            clearInterval(i);
        });
    }

    getPlotData(name, label) {
        return {
            x: this.stats.map(sample => sample["date"]),
            y: this.stats.map(sample => sample[name]),
            mode: "lines",
            type: "scatter",
            name: label
        };
    }

    plotStats(plotTitle, divName) {
        const layout = {
            title: plotTitle,
          };
      
          const config = {responsive: true}

          const dataH = this.getPlotData("currentlyHealthy", "Healthy");
          const dataI = this.getPlotData("currentInfected", "Infected");
          const dataS = this.getPlotData("currentSick", "Sick");
          const dataD = this.getPlotData("currentDead", "Dead");
          const dataR = this.getPlotData("currentRecovered", "Recovered");

          Plotly.newPlot(divName, [dataH, dataI, dataS, dataD, dataR], layout, config);
    }

    extendTraces() {
        Plotly.extendTraces("graph", {
            x: [[Date.now()], [Date.now()], [Date.now()], [Date.now()], [Date.now()]],
            y: [[this.currentHealthy], [this.currentInfected], [this.currentSick], [this.currentDead], [this.currentRecovered]]
          }, [0, 1, 2, 3, 4])
    }

    play() {
        this.time++;
        this.clearPlayground();
        this.updateBallsInfectedStatus();
        this.updateBallsStatus();
        this.moveAndRedraw();
        this.updateStatistics();
        this.saveSample();

        if(this.time  > maxtime) {
            //this.clearIntervals();
        }
    }

    stop() {
        this.clearIntervals();
    }
}

class Ball {
    constructor(ctx, xStart, yStart, status, radius, range, maxWidth, maxHeight) {
        this.ctx = ctx;
        this.x = xStart;
        this.y = yStart;
        console.log("Coords: " + this.x + "," + this.y);
        this.status = status;
        this.radius = radius;
        this.range = range;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.id = 0;
        this.age = getAge(ageAndSexProbability);
        this.sex = getSexGivenAgeIdx(ageAndSexProbability, this.age.ageIdx);
        this.dateBorn = Date.now();
        this.dateInfected = null;
        this.dateSickness = null;
        this.dateDeath = null;
        this.dateRecoverd = null;
        this.currentDir = this.getStartingDirection();
    }

    getColor() {
        return colors[this.status];
    }

    getSexColor() {
        return sexColors[this.sex];
    }

    move() {
        /*
        this.x += this.getRndMovement(); //getRndInteger(-range, range);
        this.y += this.getRndMovement(); //getRndInteger(-range, range);
        */
       if(this.status !== "dead") {
            const movement = this.getPseudoRandomMovement();
            this.x += movement.x;
            this.y += movement.y;
            this.currentDir = movement;
            this.x = Math.min(Math.max(0 + this.radius, this.x), this.maxWidth - this.radius);
            this.y = Math.min(Math.max(0 + this.radius, this.y), this.maxHeight - this.radius);
       }
    }

    updateStatus() {
        switch(this.status) {
            case "infected":
                this.isSick();
                break;
            case "sick":
                this.isDead();
                this.isRecovery();
                break; 
            default:
                // do nothing;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.getColor();
        //this.ctx.strokeStyle = this.getSexColor();
        //this.ctx.lineWidth = 1;
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
    }

    getDistance(ball) {
        return Math.sqrt(Math.pow(this.x - ball.x, 2) + Math.pow(this.y - ball.y, 2));
    }

    getStartingDirection() {
        const idx = Math.floor(Math.random() * startingDirections.length);
        return directions[startingDirections[idx]];
    }

    getPseudoRandomMovement() {
        const directionsArray = [];
        directionsProbabilities.forEach((p, i) => {
            for(let k = 0; k < p; k++) {
                directionsArray.push(this.currentDir.nxt[i]);
            }
        });
        const idx = Math.floor(Math.random() * directionsArray.length);
        const nextMoveKey = directionsArray[idx];
        return directions[nextMoveKey];
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
        }
        return infected;
    }

    getProbabilityOfSickness() {
        let probability = 0;
        if(this.status === "infected") {
            probability = 0.005*Math.exp(0.04*this.age.years);
        }
    
        return probability;
    }

    isSick() {
        const probabilityOfSickness = this.getProbabilityOfSickness();
        const sick = isHappeningProbability(probabilityOfSickness);

        if(sick) {
            this.status = "sick";
            this.dateSickness = Date.now();
        }
        return sick;
    }
    
    getProbabilityOfDeath() {
        let probability = 0;
        if(this.status === "sick") {
            const daysSinceSick = this.getElapsedTime(this.dateSickness);
            probability = 0.005*Math.exp(0.04*this.age.years) + daysSinceSick*0.00025*this.age.years;
        }
        return probability;
    }

    isDead() {
        const probabilityOfDeath = this.getProbabilityOfDeath();
        const dead = isHappeningProbability(probabilityOfDeath);

        if(dead) {
            this.status = "dead";
            this.dateDeath = Date.now();
        }
        return dead;
    }
    
    getProbabilityOfRecovery() {
        let probability = 0;
        if(this.status === "sick") {
            probability = this.getElapsedTime(this.dateSickness) * 0.01 - this.age.years * (0.001);
        }
        return probability;
    }

    isRecovery() {
        const probabilityOfRecovery = this.getProbabilityOfRecovery();
        const recovered = isHappeningProbability(probabilityOfRecovery);

        if(recovered) {
            this.status = "recovered";
            this.dateRecoverd = Date.now();
        }
        return recovered;
    }

    getElapsedTime(time) {
        return getDaysFromMs(Date.now() - time);
    }
}

// utils
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getDays(timeUnits) {
    return (timeUnits/(24*60*60)) * conversionFactor;
}

function getDaysFromMs(timeMs) {
    return getDays(timeMs*(1000/time));
}

// html
function printStatistics() {
    playground.extendTraces();

    $("#time").html(`${playground.getTimeSpentInDays()}`);
    $("#healthy").html(`${playground.currentHealthy} (${playground.currentHealthyRatio.toFixed(2)}%) - Avg Age: ${playground.currentHealthyAvgAge.toFixed(1)}`);
    $("#infected").html(`${playground.currentInfected} (${playground.currentInfectedRatio.toFixed(2)}%) - Avg Age: ${playground.currentInfectedAvgAge.toFixed(1)}`);
    $("#sick").html(`${playground.currentSick} (${playground.currentSickRatio.toFixed(2)}%) - Avg Age: ${playground.currentSickAvgAge.toFixed(1)}`);
    $("#dead").html(`${playground.currentDead} (${playground.currentDeadRatio.toFixed(2)}%) - Avg Age: ${playground.currentDeadAvgAge.toFixed(1)}`);
    $("#recovered").html(`${playground.currentRecovered} (${playground.currentRecoveredRatio.toFixed(2)}%) - Avg Age: ${playground.currentRecoveredAvgAge.toFixed(1)}`);
}

function printPlaygroundLegend() {
    for(c in colors) {
        const legendElement = `<span>${c}: <span class="legend-element" style="--color: ${colors[c]};">&nbsp;&nbsp;&nbsp;</span> </span> | `;
        $("#playground-legend").append(legendElement);
    };
}

function dance() {
    playground.play();
}

function stopDancing() {
    playground.stop();
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
    let interval = setInterval(dance, time);
    playground.addInterval(interval);
    interval = setInterval(printStatistics, timeStatistics);
    playground.addInterval(interval);
}

$(document).ready(function() {
    console.log("Ready!");
    printPlaygroundLegend();

    test();
});
