<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Thermodynamics Laws Simulator</title>
<style>
  body { margin: 0; background: #1e2840; display: flex; justify-content: center; align-items: flex-start; }
  canvas { display: block; }
</style>
</head>
<body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js"></script>
<script>
// ==================== GLOBAL VARIABLES ====================
let currentTab = 0;
const tabs = ["Zeroth Law", "First Law", "Second Law", "Third Law", "Thermometer", "Perpetual Motion"];

let tempA = 50, tempB = 20, energyInput = 60, entropyLevel = 10;
let iceX, iceY, icePower = 50, fireSlider = 50;
let energyParticles = [], thirdParticles = [];

let thirdLawTemp = 100, ice3X, ice3Y, ice3Power = 20, draggingIce3 = false;

let pmWheelAngle = 0, pmWheelSpeed = 2, pmEnergy = 100;
let pmFriction = 0.3, pmBoost = 0;
let pmRunning = true, pmCycleCount = 0, pmEnergyLost = 0;

// ==================== PARTICLE CLASSES ====================
class EnergyParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(2, 0);
    this.type = 0;
  }
  update() {
    this.pos.add(this.vel);
    if (this.type == 0 && this.pos.x > width * 0.38) {
      if (random(1) < 0.6) { this.type = 1; this.vel = createVector(2, -1.5); }
      else { this.type = 2; this.vel = createVector(2, 1.5); }
    }
  }
  display() {
    if (this.type == 0) fill(255, 200, 0);
    if (this.type == 1) fill(0, 220, 0);
    if (this.type == 2) fill(255, 100, 100);
    noStroke(); ellipse(this.pos.x, this.pos.y, 10, 10);
  }
  offscreen() { return this.pos.x > width || this.pos.y < 0 || this.pos.y > height; }
}

class ThirdLawParticle {
  constructor(x, y) { this.pos = createVector(x, y); }
  display(speed) {
    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 80, height - 100);
    fill(100, 180, 255); noStroke();
    ellipse(this.pos.x, this.pos.y, 10, 10);
  }
}

// ==================== SETUP ====================
function setup() {
  createCanvas(1200, 750);
  textAlign(CENTER, CENTER);
  iceX = 500; iceY = 400;
  ice3X = 500; ice3Y = 400;
  for (let i = 0; i < 80; i++) energyParticles.push(new EnergyParticle(random(width), random(height)));
  for (let i = 0; i < 30; i++) thirdParticles.push(new ThirdLawParticle(width/2 + random(-60,60), height/2 + random(-60,60)));
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

// ==================== TOP NAVIGATION ====================
function drawTopTabs() {
  fill(20); noStroke(); rect(0, 0, width, 60);
  for (let i = 0; i < tabs.length; i++) {
    if (i == currentTab) fill(0, 160, 220); else fill(80, 90, 110);
    rect(15 + i * 196, 10, 184, 40, 10);
    fill(255); textSize(14);
    text(tabs[i], 107 + i * 196, 30);
  }
}

function mousePressed() {
  if (mouseY < 60) {
    currentTab = constrain(floor(mouseX / 196), 0, tabs.length - 1);
  }
  if (currentTab == 5 && mouseX > 450 && mouseX < 650 && mouseY > 660 && mouseY < 700) {
    pmEnergy = 100; pmWheelSpeed = 2; pmCycleCount = 0; pmEnergyLost = 0; pmRunning = true; pmBoost = 0;
  }
}

// ==================== HELPERS ====================
function drawExplanationBox(x, y, w, h, title, lines) {
  fill(0, 0, 0, 160); stroke(0, 180, 255); strokeWeight(1.5);
  rect(x, y, w, h, 8); noStroke();
  fill(0, 200, 255); textSize(13); textAlign(LEFT, TOP);
  text(title, x+10, y+8);
  fill(210, 225, 235); textSize(11);
  for (let i = 0; i < lines.length; i++) text(lines[i], x+10, y+26+i*14);
  textAlign(CENTER, CENTER); textSize(16);
}

function drawQuestionsBox(x, y, w, h, questions) {
  fill(0, 50, 0, 180); stroke(0, 220, 80); strokeWeight(1.5);
  rect(x, y, w, h, 8); noStroke();
  fill(0, 255, 120); textSize(13); textAlign(LEFT, TOP);
  text("Guiding Questions:", x+10, y+8);
  fill(190, 240, 190); textSize(11);
  for (let i = 0; i < questions.length; i++) text(questions[i], x+10, y+26+i*15);
  textAlign(CENTER, CENTER); textSize(16);
}

function drawArrow(x1, y1, x2, y2, label, c) {
  stroke(c); strokeWeight(2); line(x1, y1, x2, y2);
  let angle = atan2(y2-y1, x2-x1), hl = 12;
  fill(c); noStroke();
  triangle(x2, y2,
    x2 - hl*cos(angle-0.4), y2 - hl*sin(angle-0.4),
    x2 - hl*cos(angle+0.4), y2 - hl*sin(angle+0.4));
  fill(255, 255, 140); textSize(10); noStroke();
  text(label, (x1+x2)/2, (y1+y2)/2 - 10);
  textSize(16);
}

function drawThermometer(x, y, temp, label) {
  fill(190); noStroke(); rect(x-16, y-145, 32, 145);
  fill(210, 50, 50); rect(x-16, y - temp*1.4, 32, temp*1.4);
  fill(255); textSize(14); text(label, x, y+35);
  fill(255, 200, 200); textSize(11); text(round(temp)+"°C", x, y-158);
}

function drawSlider(x, y, label, val) {
  stroke(200); strokeWeight(1.5); line(x, y, x+200, y); noStroke();
  fill(220); textSize(12); text(label + ": " + round(val), x+100, y-20);
  fill(90, 150, 220); ellipse(x + val*2, y, 16, 16);
  if (mouseIsPressed && dist(mouseX, mouseY, x+val*2, y) < 14) {
    let nv = constrain((mouseX - x) / 2, 0, 100);
    if (label == "Temp A") tempA = nv;
    if (label == "Temp B") tempB = nv;
    if (label == "Input Energy") energyInput = nv;
    if (label == "Ice Power") icePower = nv;
    if (label == "Fire Power") fireSlider = nv;
  }
}

// ==================== ZEROTH LAW ====================
function drawZerothLaw() {
  fill(255); textSize(18);
  text("Zeroth Law: If two systems are in thermal equilibrium with a third system,\nthey are in thermal equilibrium with each other.", width/2, 85);

  drawThermometer(300, 400, tempA, "Object A");
  drawThermometer(750, 400, tempB, "Object B");

  let tc = floor(abs(tempA - tempB));
  for (let i = 0; i < tc; i++) {
    fill(255, 160, 0, 180); noStroke();
    ellipse(lerp(300, 750, random(1)), 400 + random(-40, 40), 6, 6);
  }
  if (abs(tempA - tempB) > 0.05) {
    let f = (tempA - tempB) * 0.01;
    tempA -= f; tempB += f;
  }

  drawSlider(150, 560, "Temp A", tempA);
  drawSlider(650, 560, "Temp B", tempB);

  if (tempA > tempB + 1) drawArrow(340, 355, 715, 355, "Heat flows A to B", color(255,160,0));
  else if (tempB > tempA + 1) drawArrow(715, 355, 340, 355, "Heat flows B to A", color(255,160,0));
  else {
    stroke(0,255,100); strokeWeight(2);
    line(340,355,525,355); line(715,355,525,355); noStroke();
    fill(0,255,100); textSize(12);
    text("EQUILIBRIUM - equal temperatures, no net flow", 525, 332);
    textSize(16);
  }

  drawExplanationBox(20, 590, 500, 110, "What This Means:", [
    "The Zeroth Law defines TEMPERATURE as a meaningful quantity.",
    "If A is in equilibrium with C, and B is in equilibrium with C,",
    "then A and B must be at the same temperature even without",
    "directly touching each other. This is why thermometers work:",
    "the thermometer (C) reaches equilibrium with your body (A),",
    "and its reading tells you your temperature."
  ]);
  drawQuestionsBox(540, 590, 640, 110, [
    "Q1: What happens to the temperatures of A and B over time? Why?",
    "Q2: Set A=80 and B=20. Where do they end up? Is this a coincidence?",
    "Q3: Why can a thermometer tell you your body temperature?",
    "Q4: If both objects reach 50 degrees, is energy still moving between them?"
  ]);
}

// ==================== FIRST LAW ====================
function drawFirstLaw() {
  fill(255); textSize(18);
  text("First Law: Energy cannot be created or destroyed, only converted.", width/2, 80);

  if (frameCount % floor(map(energyInput, 0, 100, 30, 5)) == 0)
    energyParticles.push(new EnergyParticle(180, 320));

  for (let i = energyParticles.length - 1; i >= 0; i--) {
    energyParticles[i].update();
    energyParticles[i].display();
    if (energyParticles[i].offscreen()) energyParticles.splice(i, 1);
  }

  stroke(255,255,255,70); strokeWeight(1); line(width*0.38, 140, width*0.38, 520); noStroke();
  fill(255,255,255,110); textSize(11); text("Conversion Point", width*0.38, 128); textSize(16);

  textAlign(LEFT);
  fill(255); textSize(13); text("FIRST LAW", 38, 95);
  fill(255,200,0); ellipse(50,118,11,11); fill(255); text("Input Energy", 65, 118);
  fill(0,220,0); ellipse(50,136,11,11); fill(255); text("Energy Converted to Work", 65, 136);
  fill(255,100,100); ellipse(50,154,11,11); fill(255); text("Energy Lost as Heat/Waste", 65, 154);
  fill(255); text("Energy In = Work + Energy Lost", 38, height - 70);
  textAlign(CENTER, CENTER);

  drawSlider(280, 630, "Input Energy", energyInput);
  drawArrow(90, 320, 170, 320, "Energy enters\nthe system", color(255,200,0));
  drawArrow(width*0.385, 295, width*0.49, 220, "Useful work\ndone", color(0,220,0));
  drawArrow(width*0.385, 345, width*0.49, 420, "Waste heat\nlost", color(255,100,100));
  fill(255,255,140); textSize(11);
  text("Total energy is always conserved across both paths", width/2, 510);

  drawExplanationBox(645, 585, 540, 115, "What This Means:", [
    "Energy can never appear from nothing or vanish into nothing.",
    "When you burn fuel in an engine, chemical energy becomes",
    "mechanical work (green) AND waste heat (red). The total is",
    "always equal to what went in. This is why no machine can be",
    "100% efficient: some energy always becomes waste heat.",
    "Real-world: your phone battery loses some energy as heat."
  ]);
  drawQuestionsBox(20, 585, 610, 115, [
    "Q1: Increase input energy. Do the red and green particles increase too?",
    "Q2: Can you make ALL particles turn green (100% efficient)? Why not?",
    "Q3: Where does the red (wasted) energy go in a real car engine?",
    "Q4: If energy is never destroyed, why do batteries run out?"
  ]);
}

// ==================== SECOND LAW ====================
function drawSecondLaw() {
  fill(255); textSize(18);
  text("Second Law: Entropy naturally increases - disorder always grows.", width/2, 80);

  entropyLevel = constrain(entropyLevel + 0.08, 5, 120);
  for (let i = 0; i < floor(entropyLevel); i++) {
    let spread = entropyLevel * 3;
    fill(120, random(255), random(255), 160); noStroke();
    ellipse(width/2 + random(-spread, spread), height/2 + random(-spread, spread), 10, 10);
  }
  fill(255,255,0,130); textSize(11); text("Ordered start", width/2, height/2); textSize(16);

  let mH = map(entropyLevel, 5, 120, 0, 220);
  fill(40,40,40); noStroke(); rect(1100, 260, 42, 220, 5);
  fill(lerpColor(color(0,220,0), color(255,0,0), entropyLevel/120));
  rect(1100, 480-mH, 42, mH, 5);
  fill(255); textSize(11); text("Entropy\nMeter", 1121, 498); text("Disorder", 1121, 258);

  drawArrow(1000, 380, 1095, 375, "Disorder\nincreasing", color(255,100,100));
  drawArrow(width/2, height/2, width/2+185, height/2-85, "Particles spread\noutward over time", color(255,80,80));
  drawArrow(width/2, height/2, width/2-165, height/2+105, "Cannot spontaneously\nreturn to center", color(100,200,255));

  drawExplanationBox(20, 575, 530, 118, "What This Means:", [
    "Entropy is a measure of disorder. Natural processes always move",
    "toward higher entropy, never lower on their own. You can tidy",
    "a messy room (lower its entropy) but only by using energy,",
    "which creates more entropy elsewhere (e.g., your body heat).",
    "This is why heat flows from hot to cold, never the reverse.",
    "A broken egg never reassembles; smoke never un-disperses."
  ]);
  drawQuestionsBox(570, 575, 610, 118, [
    "Q1: Can you make the particles go back to the center on their own?",
    "Q2: Why does heat always flow from hot to cold, never the other way?",
    "Q3: Is it possible to reverse entropy? What would it cost?",
    "Q4: How does this explain why a dropped glass breaks but never reforms?"
  ]);
}

// ==================== THIRD LAW ====================
function drawThirdLaw() {
  fill(255); textSize(18);
  text("Third Law: As temperature approaches absolute zero, particle motion stops.", width/2, 80);

  let targetTemp = map(mouseX, 0, width, 0, 100);
  thirdLawTemp += (targetTemp - thirdLawTemp) * 0.05;

  let spd = thirdLawTemp * 0.05;
  for (let p of thirdParticles) p.display(spd);

  if (mouseIsPressed && dist(mouseX, mouseY, ice3X+20, ice3Y+20) < 38) draggingIce3 = true;
  if (!mouseIsPressed) draggingIce3 = false;
  if (draggingIce3) { ice3X = mouseX-20; ice3Y = mouseY-20; }

  for (let p of thirdParticles) {
    if (dist(ice3X+20, ice3Y+20, p.pos.x, p.pos.y) < 50) {
      thirdLawTemp = max(0, thirdLawTemp - ice3Power * 0.02);
      break;
    }
  }

  fill(180, 230, 255, 200); noStroke(); rect(ice3X, ice3Y, 40, 40, 5);
  fill(255); textSize(10); text("Ice", ice3X+20, ice3Y-10);

  fill(255); textSize(13);
  text("Move mouse LEFT to cool the system (slower particles)", width/2, height-65);
  text("System Temp: " + round(thirdLawTemp) + " degrees C", width/2, height-40);

  fill(40,40,40); noStroke(); rect(50, 200, 30, 300, 5);
  for (let i = 0; i < 300; i++) {
    let t = 1 - i/300;
    stroke(lerpColor(color(0,100,255), color(255,50,0), t));
    line(50, 200+i, 80, 200+i);
  }
  noStroke();
  let mY = map(thirdLawTemp, 0, 100, 500, 200);
  fill(255,255,0); ellipse(65, mY, 16, 16);
  fill(255); textSize(11); textAlign(LEFT);
  text("100 degrees C", 86, 206);
  text("0 degrees C (Abs. Zero)", 86, 492);
  textAlign(CENTER, CENTER);

  drawArrow(160, mY, 86, mY, "Current temp", color(255,255,0));
  fill(100,200,255,200); textSize(11);
  text("Absolute Zero (0 K = -273 degrees C): the theoretical point where all molecular motion ceases.", width/2, 152);

  drawExplanationBox(200, 575, 470, 118, "What This Means:", [
    "Temperature IS the average kinetic energy of particles.",
    "The hotter something is, the faster its particles vibrate.",
    "Absolute zero (0 Kelvin, -273 degrees C) is the point where",
    "particles would have zero kinetic energy and stop moving.",
    "We can get extremely close but never actually reach it:",
    "removing the last bit of energy requires infinite work."
  ]);
  drawQuestionsBox(690, 575, 490, 118, [
    "Q1: Move the mouse left. What happens to the particles? Why?",
    "Q2: At what temperature do the particles almost stop moving?",
    "Q3: What does temperature actually measure at the particle level?",
    "Q4: Why can we never reach absolute zero exactly?"
  ]);
}

// ==================== THERMOMETER TAB ====================
function drawThermometerTab() {
  fill(255); textSize(18); text("Interactive Thermometer: Beaker, Fire and Ice", width/2, 50);

  let bx = width/2 - 60, by = 280, bw = 120, bh = 250;
  fill(0, 90, 190, 180); noStroke(); rect(bx, by, bw, bh, 10);
  fill(160, 190, 255, 60); rect(bx, by, bw, bh, 10);

  let tx = bx + bw + 60;
  fill(185); rect(tx-10, by, 20, bh);
  let mH = map(tempA, 0, 100, 0, bh - 8);
  fill(210, 50, 50); rect(tx-10, by+bh-mH, 20, mH);
  fill(255); textSize(14);
  text("Thermometer: " + round(tempA) + " degrees C", tx+10, by-14);
  text("Water: " + round(tempA) + " degrees C", bx+bw/2, by-24);

  let fx = bx+bw/2, fy = by+bh+52;
  fill(190, 80, 0); rect(fx-20, fy-20, 40, 20);
  fill(255, 60, 0, 160); rect(fx-20, fy-20, fireSlider*0.4, 20);
  fill(255, 180, 0); textSize(13); text("Fire: " + round(fireSlider) + " degrees C", fx, fy-34);

  fill(160, 220, 255, 210); noStroke(); rect(iceX, iceY, 40, 40, 5);
  fill(255); textSize(11); text("Drag Ice", iceX+20, iceY-10);

  if (mouseIsPressed && dist(mouseX, mouseY, iceX+20, iceY+20) < 38) {
    iceX = mouseX-20; iceY = mouseY-20;
  }

  drawSlider(880, 690, "Ice Power", icePower);
  drawSlider(180, 700, "Fire Power", fireSlider);

  let netHeat = fireSlider * 0.01;
  if (iceX > bx && iceX < bx+bw && iceY > by && iceY < by+bh) netHeat -= icePower * 0.01;
  tempA = constrain(tempA + netHeat, 0, 100);

  drawArrow(fx, fy-22, bx+bw/2, by+bh, "Heat energy\ntransferred upward", color(255,120,0));
  drawArrow(tx-12, by+bh-mH, tx-12, by+bh, "Mercury\nexpands with heat", color(255,0,0));
  if (iceX > bx-50 && iceX < bx+bw+50 && iceY > by-50 && iceY < by+bh+50)
    drawArrow(iceX+20, iceY+20, bx+bw/2, by+bh/2, "Cooling\nthe water", color(150,220,255));
  drawArrow(bx+bw+5, by+bh/2, tx-14, by+bh/2, "Water temp\nread here", color(200,200,255));

  drawExplanationBox(20, 590, 490, 105, "What This Means:", [
    "This demonstrates the Zeroth Law in action: the thermometer",
    "reaches thermal equilibrium with the water, so its reading",
    "equals the water temperature. The fire adds energy (First Law),",
    "while the ice removes it. The net change in temperature depends",
    "on the balance between heat added and heat removed."
  ]);
  drawQuestionsBox(530, 590, 650, 105, [
    "Q1: What happens to the thermometer when you increase fire power?",
    "Q2: Drag the ice into the beaker. What law governs what you see?",
    "Q3: Can the water exceed 100 degrees C here? What would happen in reality?",
    "Q4: Which law explains why the thermometer reads the water temperature?"
  ]);
}

// ==================== PERPETUAL MOTION TAB ====================
function drawPerpetualMotionTab() {
  fill(255); textSize(18); text("Perpetual Motion Machine: Why It Cannot Exist", width/2, 50);

  if (pmRunning && pmEnergy > 0) {
    pmWheelSpeed = map(pmEnergy, 0, 100, 0, 4);
    pmWheelAngle += pmWheelSpeed;
    let loss = pmFriction * (0.5 + pmWheelSpeed * 0.1);
    pmEnergy = max(0, pmEnergy - loss);
    pmEnergyLost += loss;
    if (floor(pmWheelAngle) % 360 < 4) pmCycleCount++;
  } else { pmWheelSpeed = 0; pmRunning = false; }

  let wx = 380, wy = 350, wr = 120;
  stroke(180); strokeWeight(3); noFill(); ellipse(wx, wy, wr*2, wr*2);
  for (let i = 0; i < 8; i++) {
    let ang = pmWheelAngle * PI/180 + i * TWO_PI/8;
    let sx = wx + cos(ang)*wr, sy = wy + sin(ang)*wr;
    stroke(150); strokeWeight(2); line(wx, wy, sx, sy);
    let wo = 18*sin(ang*2 + frameCount*0.05);
    fill(190, 110, 45); noStroke();
    ellipse(sx + cos(ang)*wo, sy + sin(ang)*wo, 15, 15);
  }
  fill(90); noStroke(); ellipse(wx, wy, 18, 18);
  drawArrow(wx+22, wy, wx+55, wy-38, "Friction acts\nat axle", color(255,100,100));

  let bx = 690, by = 200, bh = 300;
  fill(40,40,40); noStroke(); rect(bx, by, 38, bh, 5);
  let eH = map(pmEnergy, 0, 100, 0, bh);
  fill(lerpColor(color(255,0,0), color(0,210,80), pmEnergy/100));
  rect(bx, by+bh-eH, 38, eH, 5);
  fill(255); textSize(12); text("Stored\nEnergy", bx+19, by-18); text(round(pmEnergy)+"%", bx+19, by+bh+14);

  let lx = 780;
  fill(40,40,40); noStroke(); rect(lx, by, 38, bh, 5);
  let lH = map(min(pmEnergyLost, 100), 0, 100, 0, bh);
  fill(255,70,70); rect(lx, by+bh-lH, 38, lH, 5);
  fill(255); text("Heat\nLost", lx+19, by-18); text(round(min(pmEnergyLost,100))+"%", lx+19, by+bh+14);

  drawArrow(670, by+bh/2, bx+42, by+bh-eH+5, "Depleting", color(255,80,80));
  drawArrow(760, by+bh/2, lx+42, by+bh-lH+5, "Waste heat", color(255,80,80));

  fill(255); textSize(13); textAlign(LEFT);
  text("Cycles: " + pmCycleCount, 690, 530);
  text("Speed: " + nf(pmWheelSpeed, 1, 2) + " rpm", 690, 550);
  text("Energy: " + round(pmEnergy) + "%", 690, 570);
  text("Lost: " + round(pmEnergyLost) + "%", 690, 590);
  textAlign(CENTER, CENTER);

  fill(255); textSize(12); textAlign(LEFT); text("Friction:", 870, 630); textAlign(CENTER, CENTER);
  stroke(255); strokeWeight(1); line(870, 648, 1100, 648); noStroke();
  fill(100, 150, 210); ellipse(870 + pmFriction*230, 648, 16, 16);
  if (mouseIsPressed && mouseY > 640 && mouseY < 658 && mouseX > 870 && mouseX < 1100)
    pmFriction = map(mouseX, 870, 1100, 0.05, 1.0);

  fill(pmRunning ? color(70, 80, 100) : color(0, 155, 70));
  noStroke(); rect(450, 660, 200, 40, 8);
  fill(255); textSize(14);
  text(pmRunning ? "Machine Running..." : "RESTART MACHINE", 550, 680);

  if (!pmRunning) {
    fill(255, 70, 70, 220); textSize(17);
    text("The machine has stopped. All energy was lost to heat.", width/2, 630);
    fill(255, 255, 110); textSize(13);
    text("This proves a perpetual motion machine violates the First and Second Laws.", width/2, 652);
    textSize(16);
  }

  fill(255, 200, 100, 190); textSize(11); textAlign(LEFT);
  text("1st Law: Energy cannot be created. The machine cannot generate\nits own power to replace what friction steals.", 20, 580);
  text("2nd Law: Every mechanical process creates waste heat (entropy).\nThis energy is permanently unavailable for work.", 20, 618);
  textAlign(CENTER, CENTER); textSize(16);

  drawExplanationBox(20, 478, 530, 118, "Why It Cannot Work:", [
    "A perpetual motion machine would run forever without energy input.",
    "This is impossible because: (1st Law) energy cannot be created,",
    "so the machine cannot generate new energy to replace losses.",
    "(2nd Law) Every real process loses energy as heat due to friction.",
    "The wheel slows and stops because friction converts kinetic energy",
    "into heat, which cannot be recovered to spin the wheel again."
  ]);
  drawQuestionsBox(570, 478, 610, 118, [
    "Q1: What happens to the wheel over time? Which law explains this?",
    "Q2: Increase friction. Does the machine stop faster? Why?",
    "Q3: Where does the lost energy go? Can we get it back?",
    "Q4: What would need to be true for a perpetual machine to work?"
  ]);

  if (pmRunning) {
    let ang = pmWheelAngle * PI/180;
    let ax = wx + cos(ang)*(wr+22), ay = wy + sin(ang)*(wr+22);
    drawArrow(ax, ay, ax + cos(ang+PI/2)*28, ay + sin(ang+PI/2)*28, "Rotation", color(0,200,255));
  }
}
</script>
</body>
</html>
