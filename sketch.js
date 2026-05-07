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

let currentTab = 0;
const tabs = ["Zeroth Law", "First Law", "Second Law", "Third Law", "Thermometer", "Perpetual Motion"];

let tempA = 50, tempB = 20, energyInput = 60, entropyLevel = 10;
let iceX, iceY, icePower = 50, fireSlider = 50;
let energyParticles = [], thirdParticles = [];
let thirdLawTemp = 100, ice3X, ice3Y, ice3Power = 20, draggingIce3 = false;
let pmWheelAngle = 0, pmWheelSpeed = 2, pmEnergy = 100;
let pmFriction = 0.3;
let pmRunning = true, pmCycleCount = 0, pmEnergyLost = 0;

class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(width * 0.0017, 0);
    this.type = 0;
  }
  update() {
    this.pos.add(this.vel);
    if (this.type == 0 && this.pos.x > width * 0.38) {
      if (random(1) < 0.6) { this.type = 1; this.vel = createVector(width*0.0017, -height*0.002); }
      else { this.type = 2; this.vel = createVector(width*0.0017, height*0.002); }
    }
  }
  display() {
    if (this.type == 0) fill(255, 200, 0);
    if (this.type == 1) fill(0, 220, 0);
    if (this.type == 2) fill(255, 100, 100);
    noStroke();
    ellipse(this.pos.x, this.pos.y, width*0.008);
  }
  offscreen() {
    return this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
}

class ThirdLawParticle {
  constructor(x, y) { this.pos = createVector(x, y); }
  display(speed) {
    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, height*0.1, height*0.85);
    fill(100, 180, 255); noStroke();
    ellipse(this.pos.x, this.pos.y, width*0.008);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  pixelDensity(1); // ✅ FIX CLICK + DISPLAY ALIGNMENT ISSUE

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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iceX = width * 0.42;
  iceY = height * 0.53;
  ice3X = width * 0.42;
  ice3Y = height * 0.53;
}

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

function drawTopTabs() {
  fill(20);
  noStroke();
  rect(0, 0, width, height*0.08);

  let tw = width / tabs.length;

  for (let i = 0; i < tabs.length; i++) {
    fill(i == currentTab ? color(0,160,220) : color(80,90,110));
    rect(i*tw + tw*0.02, height*0.01, tw*0.96, height*0.06, 8);

    fill(255);
    textSize(width*0.012);
    text(tabs[i], i*tw + tw/2, height*0.04);
  }
}

function mousePressed() {

  let tabH = height * 0.08;
  let tabW = width / tabs.length;

  // ✅ FIXED TAB CLICK LOGIC
  if (mouseY < tabH) {
    let idx = floor(mouseX / tabW);
    if (idx >= 0 && idx < tabs.length) {
      currentTab = idx;
    }
    return; // stop other clicks interfering
  }

  // Restart button (Perpetual Motion)
  if (
    currentTab == 5 &&
    mouseX > width*0.38 && mouseX < width*0.62 &&
    mouseY > height*0.88 && mouseY < height*0.96
  ) {
    pmEnergy = 100;
    pmWheelSpeed = 2;
    pmCycleCount = 0;
    pmEnergyLost = 0;
    pmRunning = true;
  }
}

/* ===========================
   ALL YOUR ORIGINAL FUNCTIONS
   (UNCHANGED BELOW)
   =========================== */

// NOTE: keep ALL your existing drawZerothLaw(), drawFirstLaw(), etc.
// (not repeated here to avoid unnecessary duplication in chat)

</script>

</body>
</html>
