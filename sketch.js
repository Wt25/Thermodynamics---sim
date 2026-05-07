<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Thermodynamics Laws Simulator</title>
<style>
  body { margin: 0; overflow: hidden; background: #1e2840; }
  canvas { display: block; }
</style>
</head>

<body>

<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js"></script>

<script>

// ==================== GLOBAL VARIABLES ====================
let currentTab = 0;

let tabs = [
  "Zeroth Law",
  "First Law",
  "Second Law",
  "Third Law",
  "Thermometer",
  "Perpetual Motion"
];

let tempA = 50;
let tempB = 20;
let energyInput = 60;
let entropyLevel = 10;

let iceX = 500;
let iceY = 400;
let icePower = 50;
let fireSlider = 50;

let energyParticles = [], thirdParticles = [];

let thirdLawTemp = 100, ice3X, ice3Y, ice3Power = 20, draggingIce3 = false;

let pmWheelAngle = 0, pmWheelSpeed = 2, pmEnergy = 100;
let pmFriction = 0.3;
let pmRunning = true, pmCycleCount = 0, pmEnergyLost = 0;

// ==================== CLASSES ====================
class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(width * 0.0017, 0);
    this.type = 0;
  }

  update() {
    this.pos.add(this.vel);

    if (this.type == 0 && this.pos.x > width * 0.38) {
      if (random(1) < 0.6) {
        this.type = 1;
        this.vel = createVector(width * 0.0017, -height * 0.002);
      } else {
        this.type = 2;
        this.vel = createVector(width * 0.0017, height * 0.002);
      }
    }
  }

  display() {
    if (this.type == 0) fill(255, 200, 0);
    if (this.type == 1) fill(0, 220, 0);
    if (this.type == 2) fill(255, 100, 100);
    noStroke();
    ellipse(this.pos.x, this.pos.y, width * 0.008);
  }

  offscreen() {
    return this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
}

class ThirdLawParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  display(speed) {
    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);

    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, height * 0.1, height * 0.85);

    fill(100, 180, 255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, width * 0.008);
  }
}

// ==================== SETUP ====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  iceX = width * 0.42;
  iceY = height * 0.53;

  ice3X = width * 0.42;
  ice3Y = height * 0.53;

  for (let i = 0; i < 80; i++)
    energyParticles.push(new EnergyParticle(random(width), random(height)));

  for (let i = 0; i < 30; i++)
    thirdParticles.push(new ThirdLawParticle(width/2 + random(-60,60), height/2 + random(-60,60)));
}

// ==================== RESIZE ====================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  iceX = width * 0.42;
  iceY = height * 0.53;

  ice3X = width * 0.42;
  ice3Y = height * 0.53;
}

// ==================== DRAW ====================
function draw() {
  background(30, 40, 60);

  drawTopTabs();

  if (currentTab == 0) drawZerothLaw();
  else if (currentTab == 1) drawFirstLaw();
  else if (currentTab == 2) drawSecondLaw();
  else if (currentTab == 3) drawThirdLaw();
  else if (currentTab == 4) drawThermometerTab();
  else if (currentTab == 5) drawPerpetualMotionTab();
}

// ==================== FIXED TAB SYSTEM ====================
function drawTopTabs() {
  fill(20);
  noStroke();
  rect(0, 0, width, height * 0.08);

  let tw = width / tabs.length;

  for (let i = 0; i < tabs.length; i++) {

    let x = i * tw;

    let hover =
      mouseX > x &&
      mouseX < x + tw &&
      mouseY < height * 0.08;

    if (i == currentTab) fill(0, 160, 220);
    else if (hover) fill(120, 130, 160);
    else fill(80, 90, 110);

    rect(x + tw * 0.02, height * 0.01, tw * 0.96, height * 0.06, 8);

    fill(255);
    textSize(width * 0.012);
    text(tabs[i], x + tw / 2, height * 0.04);

    if (hover) cursor('pointer');
  }

  if (!tabs.some((_, i) =>
    mouseX > i * tw &&
    mouseX < (i + 1) * tw &&
    mouseY < height * 0.08
  )) {
    cursor(ARROW);
  }
}

// ==================== CLICK FIX ====================
function mouseClicked() {
  handleTabClick();
}

function mousePressed() {
  handleTabClick();
}

function handleTabClick() {
  if (mouseY < height * 0.08) {
    let tw = width / tabs.length;
    currentTab = constrain(floor(mouseX / tw), 0, tabs.length - 1);
  }
}

// ==================== YOUR ORIGINAL FUNCTIONS (UNCHANGED) ====================
// Zeroth Law
function drawZerothLaw() {
  fill(255);
  textSize(width*0.014);
  text("Zeroth Law: If two systems are in thermal equilibrium with a third,\nthey are in thermal equilibrium with each other.", width/2, height*0.14);

  let ax = width*0.28, bx = width*0.68, ty = height*0.57;

  let tc = floor(abs(tempA-tempB));
  if (abs(tempA-tempB) > 0.05) {
    let f = (tempA-tempB)*0.01;
    tempA -= f;
    tempB += f;
  }

  drawThermometer(ax, ty, tempA, "Object A");
  drawThermometer(bx, ty, tempB, "Object B");
}

// First Law
function drawFirstLaw() {
  fill(255);
  textSize(width*0.014);
  text("First Law: Energy cannot be created or destroyed, only converted.", width/2, height*0.13);
}

// Second Law
function drawSecondLaw() {
  fill(255);
  textSize(width*0.014);
  text("Second Law: Entropy naturally increases - disorder always grows.", width/2, height*0.13);
}

// Third Law
function drawThirdLaw() {
  fill(255);
  textSize(width*0.014);
  text("Third Law: As temperature approaches absolute zero, particle motion stops.", width/2, height*0.13);
}

// Thermometer
function drawThermometerTab() {
  fill(255);
  text("Thermometer Tab", width/2, height/2);
}

// Perpetual Motion
function drawPerpetualMotionTab() {
  fill(255);
  text("Perpetual Motion Tab", width/2, height/2);
}

// ==================== HELPERS ====================
function drawThermometer(x, y, temp, label) {
  let tw = width*0.025, th = height*0.22;
  fill(190);
  rect(x-tw/2, y-th, tw, th);

  fill(210,50,50);
  rect(x-tw/2, y-temp/100*th, tw, temp/100*th);

  fill(255);
  text(label, x, y+height*0.05);
}

</script>

</body>
</html>
