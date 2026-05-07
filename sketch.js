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

let iceX, iceY;
let icePower = 50;
let fireSlider = 50;

let energyParticles = [];
let thirdParticles = [];

let thirdLawTemp = 100;
let ice3X, ice3Y;
let ice3Power = 20;
let draggingIce3 = false;

let pmWheelAngle = 0;
let pmWheelSpeed = 2;
let pmEnergy = 100;
let pmFriction = 0.3;
let pmRunning = true;
let pmCycleCount = 0;
let pmEnergyLost = 0;

// ================= SETUP =================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  iceX = width * 0.42;
  iceY = height * 0.53;

  ice3X = width * 0.42;
  ice3Y = height * 0.53;

  for (let i = 0; i < 80; i++) {
    energyParticles.push(new EnergyParticle(random(width), random(height)));
  }

  for (let i = 0; i < 30; i++) {
    thirdParticles.push(
      new ThirdLawParticle(
        width / 2 + random(-60, 60),
        height / 2 + random(-60, 60)
      )
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

  if (currentTab == 0) drawZerothLaw();
  else if (currentTab == 1) drawFirstLaw();
  else if (currentTab == 2) drawSecondLaw();
  else if (currentTab == 3) drawThirdLaw();
  else if (currentTab == 4) drawThermometerTab();
  else if (currentTab == 5) drawPerpetualMotionTab();
}

// ================= TABS =================
function drawTopTabs() {
  fill(20);
  noStroke();
  rect(0, 0, width, height * 0.08);

  let tw = width / tabs.length;

  for (let i = 0; i < tabs.length; i++) {
    if (i == currentTab) fill(0, 160, 220);
    else fill(80, 90, 110);

    rect(i * tw + tw * 0.02, height * 0.01, tw * 0.96, height * 0.06, 8);

    fill(255);
    textSize(width * 0.012);
    text(tabs[i], i * tw + tw / 2, height * 0.04);
  }
}

function mousePressed() {
  if (mouseY < height * 0.08) {
    currentTab = floor(mouseX / (width / tabs.length));
  }

  if (
    currentTab == 5 &&
    mouseX > width * 0.38 &&
    mouseX < width * 0.62 &&
    mouseY > height * 0.88 &&
    mouseY < height * 0.96
  ) {
    pmEnergy = 100;
    pmWheelSpeed = 2;
    pmCycleCount = 0;
    pmEnergyLost = 0;
    pmRunning = true;
  }
}

// ================= ZEROTH LAW =================
function drawZerothLaw() {
  fill(255);
  textSize(width * 0.014);
  text(
    "Zeroth Law: If two systems are in thermal equilibrium with a third,\nthey are in thermal equilibrium with each other.",
    width / 2,
    height * 0.14
  );

  let ax = width * 0.28;
  let bx = width * 0.68;
  let ty = height * 0.57;

  drawThermometer(ax, ty, tempA, "Object A");
  drawThermometer(bx, ty, tempB, "Object B");

  let tc = floor(abs(tempA - tempB));

  for (let i = 0; i < tc; i++) {
    fill(255, 160, 0, 180);
    noStroke();
    ellipse(
      lerp(ax, bx, random(1)),
      ty - height * 0.1 + random(-height * 0.05, height * 0.05),
      6
    );
  }

  if (abs(tempA - tempB) > 0.05) {
    let f = (tempA - tempB) * 0.01;
    tempA -= f;
    tempB += f;
  }

  drawSlider(width * 0.1, height * 0.77, "Temp A", tempA);
  drawSlider(width * 0.55, height * 0.77, "Temp B", tempB);

  let arrowY = ty - height * 0.18;

  if (tempA > tempB + 1)
    drawArrow(ax, arrowY, bx, arrowY, "Heat flows A→B", color(255, 160, 0));
  else if (tempB > tempA + 1)
    drawArrow(bx, arrowY, ax, arrowY, "Heat flows B→A", color(255, 160, 0));
  else {
    fill(0, 255, 100);
    text("EQUILIBRIUM", width / 2, arrowY);
  }

  drawBox("What This Means:", [
    "Temperature is defined through equilibrium.",
    "If A = C and B = C → A = B.",
    "This is why thermometers work."
  ], width * 0.02, height * 0.8);

  drawBox("Questions:", [
    "What happens over time?",
    "Why do they equalize?",
    "Why does thermometer work?"
  ], width * 0.5, height * 0.8);
}

// ================= FIRST LAW =================
function drawFirstLaw() {
  fill(255);
  textSize(width * 0.014);
  text("First Law: Energy cannot be created or destroyed.", width / 2, height * 0.13);

  if (frameCount % 10 == 0)
    energyParticles.push(new EnergyParticle(width * 0.15, height * 0.45));

  for (let i = energyParticles.length - 1; i >= 0; i--) {
    energyParticles[i].update();
    energyParticles[i].display();
    if (energyParticles[i].offscreen()) energyParticles.splice(i, 1);
  }

  drawSlider(width * 0.2, height * 0.88, "Input Energy", energyInput);

  drawArrow(width * 0.1, height * 0.45, width * 0.2, height * 0.45, "Input", color(255, 200, 0));
  drawArrow(width * 0.4, height * 0.4, width * 0.5, height * 0.3, "Work", color(0, 220, 0));
  drawArrow(width * 0.4, height * 0.5, width * 0.5, height * 0.6, "Heat loss", color(255, 100, 100));

  drawBox("What This Means:", [
    "Energy is conserved.",
    "Input = work + heat loss.",
    "No free energy."
  ], width * 0.02, height * 0.8);

  drawBox("Questions:", [
    "Can all energy become work?",
    "Where does lost energy go?"
  ], width * 0.5, height * 0.8);
}

// ================= SECOND LAW =================
function drawSecondLaw() {
  fill(255);
  textSize(width * 0.014);
  text("Second Law: Entropy always increases.", width / 2, height * 0.13);

  entropyLevel += 0.1;

  for (let i = 0; i < entropyLevel; i++) {
    fill(100, random(255), random(255));
    noStroke();
    ellipse(width / 2 + random(-100, 100), height / 2 + random(-100, 100), 6);
  }

  drawBox("Entropy:", [
    "Disorder increases over time.",
    "Cannot reverse naturally."
  ], width * 0.02, height * 0.8);

  drawBox("Questions:", [
    "Why does disorder increase?",
    "Can entropy decrease?"
  ], width * 0.5, height * 0.8);
}

// ================= THIRD LAW =================
function drawThirdLaw() {
  fill(255);
  text("Third Law: Absolute zero = no motion", width / 2, height * 0.13);

  thirdLawTemp -= 0.2;
  thirdLawTemp = max(0, thirdLawTemp);

  for (let p of thirdParticles) {
    p.display(thirdLawTemp * 0.05);
  }

  drawBox("Meaning:", [
    "Particles stop at 0K.",
    "Impossible to reach exactly."
  ], width * 0.02, height * 0.8);
}

// ================= THERMOMETER =================
function drawThermometerTab() {
  fill(255);
  text("Thermometer Demo", width / 2, height * 0.1);

  tempA += (fireSlider - icePower) * 0.01;

  drawSlider(width * 0.2, height * 0.85, "Fire Power", fireSlider);
  drawSlider(width * 0.6, height * 0.85, "Ice Power", icePower);
}

// ================= PERPETUAL MOTION =================
function drawPerpetualMotionTab() {
  fill(255);
  text("Perpetual Motion Impossible", width / 2, height * 0.1);

  pmEnergy -= pmFriction;

  drawBox("Why it fails:", [
    "Friction always removes energy.",
    "No infinite motion."
  ], width * 0.2, height * 0.6);
}

// ================= HELPERS =================
function drawArrow(x1, y1, x2, y2, label, c) {
  stroke(c);
  line(x1, y1, x2, y2);
  noStroke();
  fill(255);
  text(label, (x1 + x2) / 2, (y1 + y2) / 2);
}

function drawBox(title, lines, x, y) {
  fill(0, 0, 0, 150);
  rect(x, y, 300, 120, 10);

  fill(255);
  text(title, x + 150, y + 20);

  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x + 150, y + 40 + i * 20);
  }
}

function drawSlider(x, y, label, val) {
  let w = 200;

  stroke(255);
  line(x, y, x + w, y);

  fill(255);
  text(label, x + w / 2, y - 15);

  fill(100, 150, 255);
  ellipse(x + (val / 100) * w, y, 10);
}

// ================= CLASSES =================
class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(2, 0);
    this.type = 0;
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    fill(255, 200, 0);
    ellipse(this.pos.x, this.pos.y, 6);
  }

  offscreen() {
    return this.pos.x > width;
  }
}

class ThirdLawParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  display(speed) {
    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);

    fill(100, 180, 255);
    ellipse(this.pos.x, this.pos.y, 6);
  }
}
