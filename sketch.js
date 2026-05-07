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

let energyParticles = [];
let thirdParticles = [];

let workInput = 0;

// Third Law
let thirdLawTemp = 100;
let ice3X = 500;
let ice3Y = 400;
let ice3Power = 20;
let draggingIce3 = false;

// Perpetual Motion
let pmWheelAngle = 0;
let pmWheelSpeed = 2.0;
let pmEnergy = 100;
let pmFriction = 0.3;
let pmRunning = true;
let pmCycleCount = 0;
let pmEnergyLost = 0;

// ==================== SETUP ====================
function setup() {
  createCanvas(1200, 750);

  textAlign(CENTER, CENTER);
  textSize(16);

  for (let i = 0; i < 100; i++) {
    energyParticles.push(
      new EnergyParticle(random(width), random(height))
    );
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

// ==================== DRAW ====================
function draw() {
  background(30, 40, 60);

  drawTopTabs();

  switch (currentTab) {
    case 0:
      drawZerothLaw();
      break;

    case 1:
      drawFirstLaw();
      break;

    case 2:
      drawSecondLaw();
      break;

    case 3:
      drawThirdLaw();
      break;

    case 4:
      drawThermometerTab();
      break;

    case 5:
      drawPerpetualMotionTab();
      break;
  }
}

// ==================== MOUSE ====================
function mousePressed() {
  if (mouseY < 60) {
    currentTab = floor(mouseX / 190);

    if (currentTab >= tabs.length) {
      currentTab = tabs.length - 1;
    }
  }

  if (
    currentTab === 5 &&
    mouseX > 500 &&
    mouseX < 700 &&
    mouseY > 660 &&
    mouseY < 700
  ) {
    pmEnergy = 100;
    pmWheelSpeed = 2.0;
    pmCycleCount = 0;
    pmEnergyLost = 0;
    pmRunning = true;
  }
}

// ==================== TOP NAVIGATION ====================
function drawTopTabs() {
  fill(20);
  rect(0, 0, width, 60);

  for (let i = 0; i < tabs.length; i++) {
    if (i === currentTab) {
      fill(0, 180, 255);
    } else {
      fill(120);
    }

    rect(20 + i * 190, 10, 180, 40, 12);

    fill(255);
    textSize(14);

    text(
      tabs[i],
      110 + i * 190,
      30
    );
  }
}

// ==================== ARROW ====================
function drawArrow(x1, y1, x2, y2, label, c) {
  stroke(c);
  strokeWeight(2);

  line(x1, y1, x2, y2);

  let angle = atan2(y2 - y1, x2 - x1);

  let headLen = 12;

  fill(c);
  noStroke();

  triangle(
    x2,
    y2,
    x2 - headLen * cos(angle - 0.4),
    y2 - headLen * sin(angle - 0.4),
    x2 - headLen * cos(angle + 0.4),
    y2 - headLen * sin(angle + 0.4)
  );

  fill(255, 255, 150);

  let mx = (x1 + x2) / 2;
  let my = (y1 + y2) / 2;

  textSize(11);
  text(label, mx, my - 10);

  textSize(16);
}

// ==================== ZEROTH LAW ====================
function drawZerothLaw() {
  fill(255);

  textSize(20);

  text(
    "Zeroth Law: Thermal Equilibrium",
    width / 2,
    85
  );

  drawThermometer(300, 380, tempA, "Object A");
  drawThermometer(750, 380, tempB, "Object B");

  let transferCount = int(abs(tempA - tempB));

  for (let i = 0; i < transferCount; i++) {
    let x = lerp(300, 750, random());
    let y = 380 + random(-40, 40);

    fill(255, 160, 0);

    ellipse(x, y, 6, 6);
  }

  if (abs(tempA - tempB) > 0.05) {
    let flow = (tempA - tempB) * 0.01;

    tempA -= flow;
    tempB += flow;
  }

  drawSlider(150, 540, "Temp A", tempA);
  drawSlider(650, 540, "Temp B", tempB);
}

// ==================== FIRST LAW ====================
function drawFirstLaw() {
  fill(255);

  textSize(20);

  text(
    "First Law: Energy cannot be created or destroyed",
    width / 2,
    80
  );

  if (frameCount % int(map(energyInput, 0, 100, 30, 5)) === 0) {
    energyParticles.push(
      new EnergyParticle(180, 300)
    );
  }

  for (let i = energyParticles.length - 1; i >= 0; i--) {
    let p = energyParticles[i];

    p.updateFirstLaw();
    p.display();

    if (p.offscreen()) {
      energyParticles.splice(i, 1);
    }
  }

  drawSlider(300, 620, "Input Energy", energyInput);
}

// ==================== SECOND LAW ====================
function drawSecondLaw() {
  fill(255);

  textSize(20);

  text(
    "Second Law: Entropy increases",
    width / 2,
    80
  );

  entropyLevel += 0.1;

  entropyLevel = constrain(entropyLevel, 5, 120);

  for (let i = 0; i < entropyLevel; i++) {
    let spread = entropyLevel * 3;

    fill(150, random(255), random(255));

    ellipse(
      width / 2 + random(-spread, spread),
      height / 2 + random(-spread, spread),
      10,
      10
    );
  }

  drawSlider(300, 620, "Entropy", entropyLevel);
}

// ==================== THIRD LAW ====================
function drawThirdLaw() {
  fill(255);

  textSize(20);

  text(
    "Third Law: Motion stops near absolute zero",
    width / 2,
    80
  );

  let targetTemp = map(mouseX, 0, width, 0, 100);

  thirdLawTemp +=
    (targetTemp - thirdLawTemp) * 0.05;

  for (let p of thirdParticles) {
    let speed = thirdLawTemp * 0.05;

    p.display(speed);
  }

  fill(150, 220, 255);

  rect(ice3X, ice3Y, 40, 40, 5);

  fill(255);

  text(
    "System Temp: " +
    int(thirdLawTemp) +
    "°C",
    width / 2,
    height - 50
  );
}

// ==================== THERMOMETER TAB ====================
function drawThermometerTab() {
  fill(255);

  textSize(20);

  text(
    "Interactive Thermometer",
    width / 2,
    50
  );

  let bx = width / 2 - 60;
  let by = 300;

  let bw = 120;
  let bh = 250;

  fill(180, 180, 255, 100);

  rect(bx, by, bw, bh, 10);

  fill(0, 100, 200, 180);

  rect(
    bx + 5,
    by + 5,
    bw - 10,
    bh - 10
  );

  let thermX = bx + bw + 60;

  fill(200);

  rect(thermX - 10, by, 20, bh);

  fill(255, 0, 0);

  let mercuryHeight =
    map(tempA, 0, 100, 0, bh - 10);

  rect(
    thermX - 10,
    by + bh - mercuryHeight,
    20,
    mercuryHeight
  );

  fill(255);

  text(
    "Water Temp: " +
    int(tempA) +
    "°C",
    bx + bw / 2,
    by - 20
  );

  drawSlider(200, 700, "Fire Power", fireSlider);
  drawSlider(900, 680, "Ice Power", icePower);
}

// ==================== PERPETUAL MOTION ====================
function drawPerpetualMotionTab() {
  fill(255);

  textSize(20);

  text(
    "Perpetual Motion Machine",
    width / 2,
    50
  );

  if (pmRunning && pmEnergy > 0) {
    pmWheelSpeed =
      map(pmEnergy, 0, 100, 0, 4);

    pmWheelAngle += pmWheelSpeed;

    let loss =
      pmFriction *
      (0.5 + pmWheelSpeed * 0.1);

    pmEnergy -= loss;

    pmEnergyLost += loss;

    pmEnergy = max(pmEnergy, 0);

  } else {
    pmWheelSpeed = 0;
    pmRunning = false;
  }

  let wx = 400;
  let wy = 350;
  let wr = 120;

  stroke(180);
  strokeWeight(3);

  noFill();

  ellipse(wx, wy, wr * 2, wr * 2);

  let numSpokes = 8;

  for (let i = 0; i < numSpokes; i++) {
    let angle =
      radians(pmWheelAngle) +
      i * TWO_PI / numSpokes;

    let sx = wx + cos(angle) * wr;
    let sy = wy + sin(angle) * wr;

    stroke(150);

    line(wx, wy, sx, sy);
  }

  fill(255);

  noStroke();

  text(
    "Energy Remaining: " +
    int(pmEnergy) +
    "%",
    850,
    250
  );

  text(
    "Energy Lost: " +
    int(pmEnergyLost) +
    "%",
    850,
    290
  );

  drawSlider(900, 650, "Friction", pmFriction * 100);

  fill(pmRunning ? 80 : color(0, 180, 80));

  rect(500, 660, 200, 40, 8);

  fill(255);

  text(
    pmRunning
      ? "Machine Running..."
      : "RESTART MACHINE",
    600,
    680
  );
}

// ==================== SLIDER ====================
function drawSlider(x, y, label, val) {
  stroke(255);

  line(x, y, x + 200, y);

  noStroke();

  fill(255);

  text(
    label + ": " + int(val),
    x + 100,
    y - 25
  );

  fill(120);

  ellipse(x + val * 2, y, 18, 18);

  if (
    mouseIsPressed &&
    dist(mouseX, mouseY, x + val * 2, y) < 15
  ) {
    let newVal =
      constrain((mouseX - x) / 2, 0, 100);

    if (label === "Temp A") tempA = newVal;
    if (label === "Temp B") tempB = newVal;
    if (label === "Input Energy") energyInput = newVal;
    if (label === "Ice Power") icePower = newVal;
    if (label === "Fire Power") fireSlider = newVal;
    if (label === "Entropy") entropyLevel = newVal;

    if (label === "Friction") {
      pmFriction = newVal / 100;
    }
  }
}

// ==================== THERMOMETER ====================
function drawThermometer(x, y, temp, label) {
  fill(200);

  rect(x - 20, y - 150, 40, 150);

  fill(255, 0, 0);

  rect(
    x - 20,
    y - temp * 1.5,
    40,
    temp * 1.5
  );

  fill(255);

  text(label, x, y + 40);
}

// ==================== ENERGY PARTICLE ====================
class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(2, 0);
    this.type = 0;
  }

  updateFirstLaw() {
    this.pos.add(this.vel);

    if (
      this.type === 0 &&
      this.pos.x > 400
    ) {
      let r = random();

      if (r < 0.6) {
        this.type = 1;
        this.vel =
          createVector(2, -1.5);

      } else {
        this.type = 2;
        this.vel =
          createVector(2, 1.5);
      }
    }
  }

  display() {
    if (this.type === 0) {
      fill(255, 200, 0);
    }

    if (this.type === 1) {
      fill(0, 220, 0);
    }

    if (this.type === 2) {
      fill(255, 100, 100);
    }

    noStroke();

    ellipse(
      this.pos.x,
      this.pos.y,
      10,
      10
    );
  }

  offscreen() {
    return (
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height
    );
  }
}

// ==================== THIRD LAW PARTICLE ====================
class ThirdLawParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
  }

  display(speed) {
    let dx = random(-speed, speed);
    let dy = random(-speed, speed);

    this.pos.x += dx;
    this.pos.y += dy;

    this.pos.x =
      constrain(this.pos.x, 0, width);

    this.pos.y =
      constrain(this.pos.y, 0, height);

    ellipse(
      this.pos.x,
      this.pos.y,
      10,
      10
    );
  }
}
