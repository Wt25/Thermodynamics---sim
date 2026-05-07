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
    noStroke(); ellipse(this.pos.x, this.pos.y, width*0.008, width*0.008);
  }
  offscreen() { return this.pos.x > width || this.pos.y < 0 || this.pos.y > height; }
}

class ThirdLawParticle {
  constructor(x, y) { this.pos = createVector(x, y); }
  display(speed) {
    this.pos.x += random(-speed, speed);
    this.pos.y += random(-speed, speed);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, height*0.1, height*0.85);
    fill(100, 180, 255); noStroke();
    ellipse(this.pos.x, this.pos.y, width*0.008, width*0.008);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  iceX = width * 0.42; iceY = height * 0.53;
  ice3X = width * 0.42; ice3Y = height * 0.53;
  for (let i = 0; i < 80; i++) energyParticles.push(new EnergyParticle(random(width), random(height)));
  for (let i = 0; i < 30; i++) thirdParticles.push(new ThirdLawParticle(width/2 + random(-60,60), height/2 + random(-60,60)));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iceX = width * 0.42; iceY = height * 0.53;
  ice3X = width * 0.42; ice3Y = height * 0.53;
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
  fill(20); noStroke(); rect(0, 0, width, height*0.08);
  let tw = width / tabs.length;
  for (let i = 0; i < tabs.length; i++) {
    if (i == currentTab) fill(0, 160, 220); else fill(80, 90, 110);
    rect(i*tw + tw*0.02, height*0.01, tw*0.96, height*0.06, 8);
    fill(255); textSize(width*0.012);
    text(tabs[i], i*tw + tw/2, height*0.04);
  }
}

function mousePressed() {
  if (mouseY < height*0.08) {
    currentTab = constrain(floor(mouseX / (width/tabs.length)), 0, tabs.length-1);
  }
  // Restart button for PM tab
  if (currentTab == 5 && mouseX > width*0.38 && mouseX < width*0.62 &&
      mouseY > height*0.88 && mouseY < height*0.96) {
    pmEnergy = 100; pmWheelSpeed = 2; pmCycleCount = 0; pmEnergyLost = 0; pmRunning = true;
  }
}

function drawExpBox(x, y, w, h, title, lines) {
  fill(0,0,0,160); stroke(0,180,255); strokeWeight(1.5);
  rect(x, y, w, h, 8); noStroke();
  fill(0,200,255); textSize(width*0.011); textAlign(LEFT,TOP);
  text(title, x+w*0.02, y+h*0.06);
  fill(210,225,235); textSize(width*0.009);
  for (let i=0; i<lines.length; i++) text(lines[i], x+w*0.02, y+h*0.18+i*(h*0.13));
  textAlign(CENTER,CENTER);
}

function drawQBox(x, y, w, h, qs) {
  fill(0,50,0,180); stroke(0,220,80); strokeWeight(1.5);
  rect(x, y, w, h, 8); noStroke();
  fill(0,255,120); textSize(width*0.011); textAlign(LEFT,TOP);
  text("Guiding Questions:", x+w*0.02, y+h*0.06);
  fill(190,240,190); textSize(width*0.009);
  for (let i=0; i<qs.length; i++) text(qs[i], x+w*0.02, y+h*0.2+i*(h*0.19));
  textAlign(CENTER,CENTER);
}

function drawArrow(x1, y1, x2, y2, label, c) {
  stroke(c); strokeWeight(2); line(x1,y1,x2,y2);
  let angle = atan2(y2-y1, x2-x1), hl = width*0.01;
  fill(c); noStroke();
  triangle(x2,y2, x2-hl*cos(angle-0.4),y2-hl*sin(angle-0.4), x2-hl*cos(angle+0.4),y2-hl*sin(angle+0.4));
  fill(255,255,140); textSize(width*0.009); noStroke();
  text(label, (x1+x2)/2, (y1+y2)/2 - height*0.02);
  textSize(width*0.013);
}

function drawThermometer(x, y, temp, label) {
  let tw = width*0.025, th = height*0.22;
  fill(190); noStroke(); rect(x-tw/2, y-th, tw, th);
  fill(210,50,50); rect(x-tw/2, y-temp/100*th, tw, temp/100*th);
  fill(255); textSize(width*0.012); text(label, x, y+height*0.05);
  fill(255,200,200); textSize(width*0.009); text(round(temp)+"°C", x, y-th-height*0.02);
}

function drawSlider(x, y, label, val) {
  let sw = width*0.18;
  stroke(200); strokeWeight(1.5); line(x, y, x+sw, y); noStroke();
  fill(220); textSize(width*0.01); text(label+": "+round(val), x+sw/2, y-height*0.03);
  fill(90,150,220); ellipse(x+val/100*sw, y, width*0.013, width*0.013);
  if (mouseIsPressed && dist(mouseX,mouseY,x+val/100*sw,y) < width*0.013) {
    let nv = constrain((mouseX-x)/sw*100, 0, 100);
    if (label=="Temp A") tempA=nv;
    if (label=="Temp B") tempB=nv;
    if (label=="Input Energy") energyInput=nv;
    if (label=="Ice Power") icePower=nv;
    if (label=="Fire Power") fireSlider=nv;
  }
}

// ==================== ZEROTH LAW ====================
function drawZerothLaw() {
  fill(255); textSize(width*0.014);
  text("Zeroth Law: If two systems are in thermal equilibrium with a third,\nthey are in thermal equilibrium with each other.", width/2, height*0.14);

  let ax = width*0.28, bx = width*0.68, ty = height*0.57;
  drawThermometer(ax, ty, tempA, "Object A");
  drawThermometer(bx, ty, tempB, "Object B");

  let tc = floor(abs(tempA-tempB));
  for (let i=0; i<tc; i++) {
    fill(255,160,0,180); noStroke();
    ellipse(lerp(ax,bx,random(1)), ty-height*0.1+random(-height*0.05,height*0.05), 6, 6);
  }
  if (abs(tempA-tempB) > 0.05) { let f=(tempA-tempB)*0.01; tempA-=f; tempB+=f; }

  drawSlider(width*0.1, height*0.77, "Temp A", tempA);
  drawSlider(width*0.55, height*0.77, "Temp B", tempB);

  let arrowY = ty - height*0.18;
  if (tempA > tempB+1) drawArrow(ax+width*0.03, arrowY, bx-width*0.03, arrowY, "Heat flows A to B", color(255,160,0));
  else if (tempB > tempA+1) drawArrow(bx-width*0.03, arrowY, ax+width*0.03, arrowY, "Heat flows B to A", color(255,160,0));
  else {
    stroke(0,255,100); strokeWeight(2);
    line(ax+width*0.03,arrowY,width/2,arrowY); line(bx-width*0.03,arrowY,width/2,arrowY); noStroke();
    fill(0,255,100); textSize(width*0.011);
    text("EQUILIBRIUM - no net heat flow", width/2, arrowY-height*0.04);
  }

  let bw = width*0.44, bh = height*0.18;
  drawExpBox(width*0.02, height*0.8, bw, bh, "What This Means:", [
    "The Zeroth Law defines TEMPERATURE as a meaningful quantity.",
    "If A is in equilibrium with C, and B is in equilibrium with C,",
    "then A and B must be at the same temp without touching.",
    "This is why thermometers work: they reach equilibrium",
    "with your body and tell you your temperature."
  ]);
  drawQBox(width*0.48, height*0.8, bw, bh, [
    "Q1: What happens to A and B temperatures over time? Why?",
    "Q2: Set A=80 and B=20. Where do they end up?",
    "Q3: Why can a thermometer tell you your body temperature?",
    "Q4: At equilibrium, is energy still moving between them?"
  ]);
}

// ==================== FIRST LAW ====================
function drawFirstLaw() {
  fill(255); textSize(width*0.014);
  text("First Law: Energy cannot be created or destroyed, only converted.", width/2, height*0.13);

  if (frameCount % floor(map(energyInput,0,100,30,5)) == 0)
    energyParticles.push(new EnergyParticle(width*0.15, height*0.45));

  for (let i=energyParticles.length-1; i>=0; i--) {
    energyParticles[i].update(); energyParticles[i].display();
    if (energyParticles[i].offscreen()) energyParticles.splice(i,1);
  }

  stroke(255,255,255,70); strokeWeight(1); line(width*0.38,height*0.18,width*0.38,height*0.72); noStroke();
  fill(255,255,255,110); textSize(width*0.009); text("Conversion Point", width*0.38, height*0.16);

  textAlign(LEFT);
  fill(255); textSize(width*0.011); text("FIRST LAW", width*0.03, height*0.12);
  fill(255,200,0); ellipse(width*0.04,height*0.16,width*0.009,width*0.009); fill(255); text("Input Energy", width*0.055, height*0.16);
  fill(0,220,0); ellipse(width*0.04,height*0.19,width*0.009,width*0.009); fill(255); text("Useful Work Done", width*0.055, height*0.19);
  fill(255,100,100); ellipse(width*0.04,height*0.22,width*0.009,width*0.009); fill(255); text("Waste Heat Lost", width*0.055, height*0.22);
  fill(255); text("Energy In = Work + Heat Lost", width*0.03, height*0.88);
  textAlign(CENTER,CENTER);

  drawSlider(width*0.22, height*0.88, "Input Energy", energyInput);
  drawArrow(width*0.07, height*0.45, width*0.14, height*0.45, "Energy\nenters", color(255,200,0));
  drawArrow(width*0.385, height*0.41, width*0.49, height*0.3, "Useful\nwork", color(0,220,0));
  drawArrow(width*0.385, height*0.49, width*0.49, height*0.6, "Waste\nheat", color(255,100,100));
  fill(255,255,140); textSize(width*0.009);
  text("Total energy is always conserved across both paths", width/2, height*0.71);

  let bw = width*0.44, bh = height*0.18;
  drawExpBox(width*0.02, height*0.8, bw, bh, "What This Means:", [
    "Energy can never appear from nothing or vanish.",
    "Burning fuel becomes mechanical work (green)",
    "AND waste heat (red). Total always equals input.",
    "No machine can be 100% efficient: some energy",
    "always becomes waste heat. Your phone gets warm."
  ]);
  drawQBox(width*0.48, height*0.8, bw, bh, [
    "Q1: Increase input energy. Do red/green particles increase?",
    "Q2: Can you make ALL particles green? Why not?",
    "Q3: Where does wasted energy go in a real car engine?",
    "Q4: If energy is never destroyed, why do batteries run out?"
  ]);
}

// ==================== SECOND LAW ====================
function drawSecondLaw() {
  fill(255); textSize(width*0.014);
  text("Second Law: Entropy naturally increases - disorder always grows.", width/2, height*0.13);

  entropyLevel = constrain(entropyLevel + 0.08, 5, 120);
  for (let i=0; i<floor(entropyLevel); i++) {
    let spread = entropyLevel * 2.5;
    fill(120, random(255), random(255), 160); noStroke();
    ellipse(width/2+random(-spread,spread), height/2+random(-spread,spread), width*0.008, width*0.008);
  }
  fill(255,255,0,130); textSize(width*0.009); text("Ordered start", width/2, height/2);

  let mh = height*0.35, mx = width*0.9, my = height*0.25;
  fill(40,40,40); noStroke(); rect(mx, my, width*0.03, mh, 4);
  let filledH = map(entropyLevel, 5, 120, 0, mh);
  fill(lerpColor(color(0,220,0), color(255,0,0), entropyLevel/120));
  rect(mx, my+mh-filledH, width*0.03, filledH, 4);
  fill(255); textSize(width*0.009);
  text("Entropy\nMeter", mx+width*0.015, my-height*0.04);

  drawArrow(width*0.82, height*0.5, mx+width*0.032, height*0.5, "Disorder\nrising", color(255,100,100));
  drawArrow(width/2, height/2, width/2+width*0.16, height/2-height*0.12, "Spreading\noutward", color(255,80,80));
  drawArrow(width/2, height/2, width/2-width*0.14, height/2+height*0.12, "Cannot return\nspontaneously", color(100,200,255));

  let bw = width*0.44, bh = height*0.18;
  drawExpBox(width*0.02, height*0.8, bw, bh, "What This Means:", [
    "Entropy measures disorder. Processes always move",
    "toward higher entropy, never lower on their own.",
    "Tidying a room lowers its entropy but costs energy,",
    "creating more entropy elsewhere (your body heat).",
    "A broken egg never reassembles on its own."
  ]);
  drawQBox(width*0.48, height*0.8, bw, bh, [
    "Q1: Can you make particles return to center on their own?",
    "Q2: Why does heat flow hot to cold, never reversed?",
    "Q3: Is it possible to reverse entropy? What would it cost?",
    "Q4: Why does a dropped glass break but never reforms?"
  ]);
}

// ==================== THIRD LAW ====================
function drawThirdLaw() {
  fill(255); textSize(width*0.014);
  text("Third Law: As temperature approaches absolute zero, particle motion stops.", width/2, height*0.13);

  let targetTemp = map(mouseX, 0, width, 0, 100);
  thirdLawTemp += (targetTemp - thirdLawTemp) * 0.05;
  let spd = thirdLawTemp * 0.05;
  for (let p of thirdParticles) p.display(spd);

  if (mouseIsPressed && dist(mouseX,mouseY,ice3X+width*0.03,ice3Y+height*0.05) < width*0.03) draggingIce3=true;
  if (!mouseIsPressed) draggingIce3=false;
  if (draggingIce3) { ice3X=mouseX-width*0.03; ice3Y=mouseY-height*0.05; }
  for (let p of thirdParticles) {
    if (dist(ice3X+width*0.03, ice3Y+height*0.05, p.pos.x, p.pos.y) < width*0.04) {
      thirdLawTemp=max(0, thirdLawTemp-ice3Power*0.02); break;
    }
  }

  fill(180,230,255,200); noStroke(); rect(ice3X, ice3Y, width*0.06, height*0.07, 5);
  fill(255); textSize(width*0.009); text("Ice", ice3X+width*0.03, ice3Y-height*0.02);

  fill(255); textSize(width*0.011);
  text("Move mouse LEFT to cool the system", width/2, height*0.88);
  text("System Temp: "+round(thirdLawTemp)+"°C", width/2, height*0.93);

  let barX=width*0.06, barY=height*0.22, barH=height*0.5;
  fill(40,40,40); noStroke(); rect(barX, barY, width*0.025, barH, 4);
  for (let i=0; i<barH; i++) {
    let t=1-i/barH;
    stroke(lerpColor(color(0,100,255), color(255,50,0), t));
    line(barX, barY+i, barX+width*0.025, barY+i);
  }
  noStroke();
  let mY = map(thirdLawTemp, 0, 100, barY+barH, barY);
  fill(255,255,0); ellipse(barX+width*0.013, mY, width*0.015, width*0.015);
  fill(255); textSize(width*0.009); textAlign(LEFT);
  text("100°C", barX+width*0.032, barY+height*0.01);
  text("0°C (Abs. Zero)", barX+width*0.032, barY+barH-height*0.01);
  textAlign(CENTER,CENTER);
  drawArrow(barX+width*0.12, mY, barX+width*0.027, mY, "Current temp", color(255,255,0));

  fill(100,200,255,200); textSize(width*0.009);
  text("Absolute Zero (0 K = -273°C): the theoretical point where all molecular motion ceases.", width/2, height*0.2);

  let bw = width*0.44, bh = height*0.18;
  drawExpBox(width*0.15, height*0.8, bw, bh, "What This Means:", [
    "Temperature IS the average kinetic energy of particles.",
    "Hotter = faster particles. Absolute zero (0 K, -273°C)",
    "is where particles have zero kinetic energy and stop.",
    "We can get extremely close but never reach it:",
    "removing the last bit of energy requires infinite work."
  ]);
  drawQBox(width*0.61, height*0.8, width*0.37, bh, [
    "Q1: Move mouse left. What happens to particles?",
    "Q2: At what temp do particles almost stop?",
    "Q3: What does temperature measure at particle level?",
    "Q4: Why can we never reach absolute zero exactly?"
  ]);
}

// ==================== THERMOMETER TAB ====================
function drawThermometerTab() {
  fill(255); textSize(width*0.014); text("Interactive Thermometer: Beaker, Fire and Ice", width/2, height*0.07);

  let bx=width/2-width*0.07, by=height*0.18, bw=width*0.14, bh=height*0.42;
  fill(0,90,190,180); noStroke(); rect(bx, by, bw, bh, 10);
  fill(160,190,255,60); rect(bx, by, bw, bh, 10);

  let tx=bx+bw+width*0.05;
  fill(185); rect(tx-width*0.01, by, width*0.02, bh);
  let mH=map(tempA,0,100,0,bh-8);
  fill(210,50,50); rect(tx-width*0.01, by+bh-mH, width*0.02, mH);
  fill(255); textSize(width*0.011);
  text("Thermometer: "+round(tempA)+"°C", tx+width*0.06, by-height*0.02);
  text("Water: "+round(tempA)+"°C", bx+bw/2, by-height*0.03);

  let fx=bx+bw/2, fy=by+bh+height*0.07;
  fill(190,80,0); rect(fx-width*0.03, fy-height*0.04, width*0.06, height*0.04);
  fill(255,60,0,160); rect(fx-width*0.03, fy-height*0.04, fireSlider/100*width*0.06, height*0.04);
  fill(255,180,0); textSize(width*0.011); text("Fire: "+round(fireSlider)+"°C", fx, fy-height*0.06);

  fill(160,220,255,210); noStroke(); rect(iceX, iceY, width*0.05, height*0.07, 5);
  fill(255); textSize(width*0.009); text("Drag Ice", iceX+width*0.025, iceY-height*0.02);
  if (mouseIsPressed && dist(mouseX,mouseY,iceX+width*0.025,iceY+height*0.035)<width*0.04) {
    iceX=mouseX-width*0.025; iceY=mouseY-height*0.035;
  }

  drawSlider(width*0.7, height*0.88, "Ice Power", icePower);
  drawSlider(width*0.1, height*0.88, "Fire Power", fireSlider);

  let netHeat=fireSlider*0.01;
  if (iceX>bx && iceX<bx+bw && iceY>by && iceY<by+bh) netHeat-=icePower*0.01;
  tempA=constrain(tempA+netHeat, 0, 100);

  drawArrow(fx, fy-height*0.03, bx+bw/2, by+bh, "Heat upward", color(255,120,0));
  drawArrow(tx-width*0.01, by+bh-mH, tx-width*0.01, by+bh, "Mercury\nexpands", color(255,0,0));
  if (iceX>bx-50 && iceX<bx+bw+50 && iceY>by-50 && iceY<by+bh+50)
    drawArrow(iceX+width*0.025, iceY+height*0.035, bx+bw/2, by+bh/2, "Cooling\nwater", color(150,220,255));
  drawArrow(bx+bw+5, by+bh/2, tx-width*0.012, by+bh/2, "Equilibrium\nread here", color(200,200,255));

  let bw2=width*0.44, bh2=height*0.17;
  drawExpBox(width*0.02, height*0.81, bw2, bh2, "What This Means:", [
    "Zeroth Law in action: thermometer reaches equilibrium",
    "with the water, so its reading equals water temperature.",
    "Fire adds energy (First Law), ice removes it.",
    "Net temperature change depends on balance",
    "between heat added and heat removed."
  ]);
  drawQBox(width*0.48, height*0.81, bw2, bh2, [
    "Q1: What happens to thermometer with more fire power?",
    "Q2: Drag the ice in. What law governs what you see?",
    "Q3: Can water exceed 100°C here? What happens in reality?",
    "Q4: Which law explains the thermometer reading?"
  ]);
}

// ==================== PERPETUAL MOTION TAB ====================
function drawPerpetualMotionTab() {
  fill(255); textSize(width*0.014); text("Perpetual Motion Machine: Why It Cannot Exist", width/2, height*0.07);

  if (pmRunning && pmEnergy>0) {
    pmWheelSpeed=map(pmEnergy,0,100,0,4);
    pmWheelAngle+=pmWheelSpeed;
    let loss=pmFriction*(0.5+pmWheelSpeed*0.1);
    pmEnergy=max(0,pmEnergy-loss);
    pmEnergyLost+=loss;
    if (floor(pmWheelAngle)%360<4) pmCycleCount++;
  } else { pmWheelSpeed=0; pmRunning=false; }

  let wx=width*0.32, wy=height*0.45, wr=min(width,height)*0.14;
  stroke(180); strokeWeight(3); noFill(); ellipse(wx, wy, wr*2, wr*2);
  for (let i=0; i<8; i++) {
    let ang=pmWheelAngle*PI/180+i*TWO_PI/8;
    let sx=wx+cos(ang)*wr, sy=wy+sin(ang)*wr;
    stroke(150); strokeWeight(2); line(wx,wy,sx,sy);
    let wo=wr*0.15*sin(ang*2+frameCount*0.05);
    fill(200,120,50); noStroke();
    ellipse(sx+cos(ang)*wo, sy+sin(ang)*wo, wr*0.12, wr*0.12);
  }
  fill(90); noStroke(); ellipse(wx, wy, wr*0.12, wr*0.12);
  drawArrow(wx+wr*0.2, wy, wx+wr*0.5, wy-wr*0.35, "Friction at axle", color(255,100,100));

  // Energy bar
  let bx=width*0.62, by=height*0.2, bh=height*0.45, bw=width*0.04;
  fill(40,40,40); noStroke(); rect(bx, by, bw, bh, 5);
  let eH=map(pmEnergy,0,100,0,bh);
  fill(lerpColor(color(255,0,0),color(0,210,80),pmEnergy/100));
  rect(bx, by+bh-eH, bw, eH, 5);
  fill(255); textSize(width*0.01);
  text("Stored\nEnergy", bx+bw/2, by-height*0.04);
  text(round(pmEnergy)+"%", bx+bw/2, by+bh+height*0.03);

  // Lost bar
  let lx=width*0.72;
  fill(40,40,40); noStroke(); rect(lx, by, bw, bh, 5);
  let lH=map(min(pmEnergyLost,100),0,100,0,bh);
  fill(255,70,70); rect(lx, by+bh-lH, bw, lH, 5);
  fill(255); text("Heat\nLost", lx+bw/2, by-height*0.04);
  text(round(min(pmEnergyLost,100))+"%", lx+bw/2, by+bh+height*0.03);

  drawArrow(width*0.59, by+bh/2, bx+bw, by+bh-eH+5, "Depleting", color(255,80,80));
  drawArrow(width*0.69, by+bh/2, lx+bw, by+bh-lH+5, "Waste heat", color(255,80,80));

  fill(255); textSize(width*0.011); textAlign(LEFT);
  text("Cycles: "+pmCycleCount, width*0.62, height*0.72);
  text("Speed: "+nf(pmWheelSpeed,1,2)+" rpm", width*0.62, height*0.76);
  text("Energy: "+round(pmEnergy)+"%", width*0.62, height*0.80);
  text("Lost: "+round(pmEnergyLost)+"%", width*0.62, height*0.84);
  textAlign(CENTER,CENTER);

  // Friction slider
  fill(255); textSize(width*0.01); textAlign(LEFT);
  text("Friction:", width*0.62, height*0.71);
  textAlign(CENTER,CENTER);
  let slx=width*0.73, sly=height*0.715, slw=width*0.2;
  stroke(255); strokeWeight(1); line(slx, sly, slx+slw, sly); noStroke();
  fill(100,150,210); ellipse(slx+pmFriction*slw, sly, width*0.013, width*0.013);
  if (mouseIsPressed && mouseY>sly-10 && mouseY<sly+10 && mouseX>slx && mouseX<slx+slw)
    pmFriction=map(mouseX, slx, slx+slw, 0.05, 1.0);

  // Restart button
  fill(pmRunning ? color(70,80,100) : color(0,155,70));
  noStroke(); rect(width*0.38, height*0.89, width*0.24, height*0.07, 8);
  fill(255); textSize(width*0.012);
  text(pmRunning ? "Machine Running..." : "RESTART MACHINE", width/2, height*0.925);

  if (!pmRunning) {
    fill(255,70,70,220); textSize(width*0.013);
    text("The machine has stopped. All energy lost to heat.", width/2, height*0.82);
    fill(255,255,110); textSize(width*0.011);
    text("Proves a perpetual motion machine violates the 1st and 2nd Laws.", width/2, height*0.86);
  }

  fill(255,200,100,190); textSize(width*0.009); textAlign(LEFT);
  text("1st Law: Energy cannot be created. The machine cannot\ngenerate power to replace what friction steals.", width*0.02, height*0.73);
  text("2nd Law: Every mechanical process creates waste heat.\nThis energy is permanently unavailable for work.", width*0.02, height*0.79);
  textAlign(CENTER,CENTER);

  let bw2=width*0.44, bh2=height*0.17;
  drawExpBox(width*0.02, height*0.62, bw2, bh2, "Why It Cannot Work:", [
    "A perpetual machine would run forever without energy input.",
    "(1st Law) Energy cannot be created, so the machine",
    "cannot generate new energy to replace losses.",
    "(2nd Law) Every real process loses energy as heat.",
    "The wheel slows and stops; heat cannot spin it again."
  ]);
  drawQBox(width*0.48, height*0.62, bw2, bh2, [
    "Q1: What happens to the wheel over time? Which law?",
    "Q2: Increase friction. Does it stop faster? Why?",
    "Q3: Where does the lost energy go? Can we get it back?",
    "Q4: What would need to be true for perpetual motion to work?"
  ]);

  if (pmRunning) {
    let ang=pmWheelAngle*PI/180;
    let ax=wx+cos(ang)*(wr+wr*0.18), ay=wy+sin(ang)*(wr+wr*0.18);
    drawArrow(ax, ay, ax+cos(ang+PI/2)*wr*0.22, ay+sin(ang+PI/2)*wr*0.22, "Rotation", color(0,200,255));
  }
}
</script>
</body>
</html>
