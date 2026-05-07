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

<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>

<script>
let currentTab = 0;

const tabs = ["Zeroth Law", "First Law", "Second Law", "Third Law", "Thermometer", "Perpetual Motion"];

let tempA = 50, tempB = 20, energyInput = 60, entropyLevel = 10;
let iceX, iceY, icePower = 50, fireSlider = 50;

let energyParticles = [], thirdParticles = [];
let thirdLawTemp = 100, ice3X, ice3Y, ice3Power = 20;

let pmWheelAngle = 0, pmEnergy = 100;
let pmFriction = 0.3;
let pmRunning = true, pmCycleCount = 0, pmEnergyLost = 0;

// ================= ENERGY PARTICLE =================
class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(width * 0.0015, 0);
    this.type = 0;
  }

  update() {
    this.pos.add(this.vel);

    if (this.type === 0 && this.pos.x > width * 0.38) {
      if (random(1) < 0.6) {
        this.type = 1;
        this.vel = createVector(width * 0.0015, -height * 0.002);
      } else {
        this.type = 2;
        this.vel = createVector(width * 0.0015, height * 0.002);
      }
    }
  }

  display() {
    noStroke();
    if (this.type === 0) fill(255, 200, 0);
    if (this.type === 1) fill(0, 220, 0);
    if (this.type === 2) fill(255, 100, 100);
    ellipse(this.pos.x, this.pos.y, width * 0.008);
  }

  offscreen() {
    return this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
}

// ================= THIRD LAW PARTICLE =================
class ThirdLawParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  display(speed) {
    speed = max(0, speed || 0);

    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);

    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, height * 0.1, height * 0.85);

    noStroke();
    fill(100, 180, 255);
    ellipse(this.pos.x, this.pos.y, width * 0.008);
  }
}

// ================= SETUP =================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  iceX = width * 0.42;
  iceY = height * 0.53;

  ice3X = width * 0.42;
  ice3Y = height * 0.53;

  energyParticles = [];
  thirdParticles = [];

  for (let i = 0; i < 80; i++) {
    energyParticles.push(new EnergyParticle(random(width), random(height)));
  }

  for (let i = 0; i < 30; i++) {
    thirdParticles.push(
      new ThirdLawParticle(width / 2 + random(-60, 60), height / 2 + random(-60, 60))
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  iceX = width * 0.42;
  iceY = height * 0.53;

  ice3X = width * 0.42;
  ice3Y = height * 0.53;
}

// ================= DRAW =================
function draw() {
  background(30, 40, 60);

  drawTopTabs();

  if (currentTab === 0) drawZerothLaw();
  else if (currentTab === 1) drawFirstLaw();
  else if (currentTab === 2) drawSecondLaw();
  else if (currentTab === 3) drawThirdLaw();
  else if (currentTab === 4) drawThermometerTab();
  else if (currentTab === 5) drawPerpetualMotionTab();
}

// ================= SAFE SLIDER =================
function drawSlider(x, y, label, val) {
  let sw = width * 0.18;

  val = constrain(val || 0, 0, 100);

  stroke(200);
  line(x, y, x + sw, y);

  noStroke();
  fill(255);
  text(label + ": " + round(val), x + sw / 2, y - 20);

  let px = x + (val / 100) * sw;

  fill(90, 150, 220);
  ellipse(px, y, width * 0.013);

  if (mouseIsPressed && dist(mouseX, mouseY, px, y) < 15) {
    let nv = constrain((mouseX - x) / sw * 100, 0, 100);

    if (label === "Temp A") tempA = nv;
    if (label === "Temp B") tempB = nv;
    if (label === "Input Energy") energyInput = nv;
    if (label === "Ice Power") icePower = nv;
    if (label === "Fire Power") fireSlider = nv;
  }
}

// ================= TOP TABS =================
function drawTopTabs() {
  fill(20);
  rect(0, 0, width, height * 0.08);

  let tw = width / tabs.length;

  for (let i = 0; i < tabs.length; i++) {
    fill(i === currentTab ? color(0, 160, 220) : color(80));
    rect(i * tw, 0, tw, height * 0.08);

    fill(255);
    text(tabs[i], i * tw + tw / 2, height * 0.04);
  }
}

// ================= FIRST LAW (FIXED CRASH) =================
function drawFirstLaw() {
  fill(255);
  text("First Law: Energy cannot be created or destroyed", width / 2, 80);

  let interval = max(1, floor(map(energyInput, 0, 100, 30, 5)));

  if (frameCount % interval === 0) {
    energyParticles.push(new EnergyParticle(width * 0.15, height * 0.5));
  }

  for (let i = energyParticles.length - 1; i >= 0; i--) {
    energyParticles[i].update();
    energyParticles[i].display();

    if (energyParticles[i].offscreen()) {
      energyParticles.splice(i, 1);
    }
  }

  drawSlider(width * 0.2, height * 0.9, "Input Energy", energyInput);
}

// ================= SECOND LAW (FIXED COLOR RANGE) =================
function drawSecondLaw() {
  fill(255);
  text("Second Law: Entropy increases", width / 2, 80);

  entropyLevel += 0.05;
  entropyLevel = constrain(entropyLevel, 5, 120);

  let t = constrain(entropyLevel / 120, 0, 1);

  fill(lerpColor(color(0, 220, 0), color(255, 0, 0), t));
  ellipse(width / 2, height / 2, entropyLevel);
}

// ================= PLACEHOLDERS (kept safe) =================
function drawZerothLaw() {
  fill(255);
  text("Zeroth Law", width / 2, height / 2);
}

function drawThirdLaw() {
  fill(255);
  text("Third Law", width / 2, height / 2);
}

function drawThermometerTab() {
  fill(255);
  text("Thermometer", width / 2, height / 2);
}

function drawPerpetualMotionTab() {
  fill(255);
  text("Perpetual Motion", width / 2, height / 2);
}

// ================= INPUT =================
function mousePressed() {
  if (mouseY < height * 0.08) {
    currentTab = floor(mouseX / (width / tabs.length));
  }
}
</script>

</body>
</html>
