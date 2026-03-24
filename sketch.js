// ==================== GLOBAL VARIABLES ====================
let currentTab = 0;
let tabs = ["Zeroth Law", "First Law", "Second Law", "Third Law", "Thermometer", "Heat Flow"];

let tempA = 50;
let tempB = 20;
let energyInput = 60;
let entropyLevel = 10;

let iceX = 500, iceY = 400, icePower = 50;
let fireSlider = 50;

let energyParticles = [];
let thirdParticles = [];

let hotTemp = 80;
let coldTemp = 20;
let workInput = 0;

let thirdLawTemp = 100;
let ice3X = 500, ice3Y = 400;
let ice3Power = 20;
let draggingIce3 = false;

let sliderDragging = false;
let activeSlider = "";

// ==================== SETUP ====================
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);

  // First Law particles
  for (let i = 0; i < 150; i++) {
    energyParticles.push(new EnergyParticle(random(width), random(height)));
  }

  // Third Law particles
  for (let i = 0; i < 60; i++) {
    thirdParticles.push(new ThirdLawParticle(width/2 + random(-120,120), height/2 + random(-120,120)));
  }
}

// ==================== WINDOW RESIZE ====================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==================== DRAW ====================
function draw() {
  // Full-screen gradient background
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(30, 40, 60), color(10, 20, 50), inter);
    stroke(c);
    line(0, y, width, y);
  }

  drawFullBackgroundParticles();
  drawTopTabs();
  handleTabs();

  switch(currentTab){
    case 0: drawZerothLaw(); break;
    case 1: drawFirstLaw(); break;
    case 2: drawSecondLaw(); break;
    case 3: drawThirdLaw(); break;
    case 4: drawThermometerTab(); break;
    case 5: drawHeatFlowTab(); break;
  }
}

// ==================== FULL BACKGROUND PARTICLES ====================
function drawFullBackgroundParticles(){
  noStroke();
  for (let i = 0; i < 300; i++){
    fill(255, 255, 255, 15);
    ellipse(random(width), random(height), 2, 2);
  }
}

// ==================== HANDLE TABS ====================
function handleTabs() {
  if (mouseIsPressed && mouseY < 60 && !sliderDragging) {
    currentTab = floor(mouseX / 190);
  }
}

// ==================== TOP TABS ====================
function drawTopTabs(){
  fill(20);
  rect(0,0,width,60);

  for(let i=0; i<tabs.length; i++){
    fill(i===currentTab ? color(0,180,255) : 120);
    rect(20 + i*190, 10, 180, 40, 12);

    fill(255);
    text(tabs[i], 110 + i*190, 30);
  }
}

// ==================== ZEROTH LAW ====================
function drawZerothLaw(){
  fill(255);
  textSize(24);
  text("Zeroth Law: Thermal Equilibrium", width/2, 80);

  drawThermometer(300, 350, tempA, "Object A");
  drawThermometer(750, 350, tempB, "Object B");

  // Heat flow particles
  let transferCount = int(abs(tempA-tempB)*4);
  for(let i=0; i<transferCount; i++){
    let x = lerp(300, 750, random());
    let y = 350 + random(-60,60);
    fill(255,160,0,200);
    ellipse(x, y, 6, 6);
  }

  if(abs(tempA-tempB) > 0.05){
    let flow = (tempA-tempB)*0.01;
    tempA -= flow;
    tempB += flow;
  }

  drawSlider(150, 520, "Temp A", tempA);
  drawSlider(650, 520, "Temp B", tempB);
}

// ==================== FIRST LAW ====================
function drawFirstLaw(){
  fill(255);
  textSize(24);
  text("First Law: Energy cannot be created or destroyed", width/2, 80);

  // spawn new particles based on input
  if(frameCount % int(map(energyInput,0,100,30,5)) === 0){
    energyParticles.push(new EnergyParticle(180,300));
  }

  for(let i=energyParticles.length-1; i>=0; i--){
    let p = energyParticles[i];
    p.update();
    p.display();
    if(p.offscreen()) energyParticles.splice(i,1);
  }

  drawSlider(300, 620, "Input Energy", energyInput);
}

// ==================== SECOND LAW ====================
function drawSecondLaw(){
  fill(255);
  textSize(24);
  text("Second Law: Entropy Increases", width/2, 80);

  entropyLevel += 0.1;
  entropyLevel = constrain(entropyLevel, 5, 150);

  for(let i=0;i<entropyLevel;i++){
    let spread = entropyLevel*4;
    fill(random(100,255), random(100,255), random(100,255), 150);
    ellipse(width/2 + random(-spread, spread), height/2 + random(-spread, spread), 12,12);
  }

  fill(255);
  text("Order → Disorder", width/2, height-60);

  drawSlider(300, 620, "Entropy Level", entropyLevel);
}

// ==================== THIRD LAW ====================
function drawThirdLaw(){
  fill(255);
  textSize(24);
  text("Third Law: Motion Stops Near Absolute Zero", width/2, 80);

  let targetTemp = map(mouseX, 0, width, 0, 100);
  thirdLawTemp += (targetTemp - thirdLawTemp) * 0.05;

  for(let p of thirdParticles){
    let speed = thirdLawTemp * 0.05;
    p.move(speed);
    p.display();
  }

  // Drag ice cube
  if(mouseIsPressed && dist(mouseX,mouseY,ice3X+20,ice3Y+20)<40){
    draggingIce3 = true;
  } 
  if(!mouseIsPressed) draggingIce3 = false;
  if(draggingIce3){
    ice3X = mouseX-20;
    ice3Y = mouseY-20;
  }

  // Cool nearby particles
  for(let p of thirdParticles){
    let d = dist(ice3X+20, ice3Y+20, p.pos.x, p.pos.y);
    if(d<50){
      thirdLawTemp -= ice3Power*0.02;
      thirdLawTemp = max(thirdLawTemp,0);
      break;
    }
  }

  fill(150,220,255);
  rect(ice3X, ice3Y, 40, 40, 5);
  fill(255);
  text("Drag Ice", ice3X+20, ice3Y-10);
  text("System Temp: "+int(thirdLawTemp)+"°C", width/2, height-50);
}

// ==================== THERMOMETER TAB ====================
function drawThermometerTab(){
  fill(255);
  textSize(24);
  text("Interactive Thermometer", width/2, 50);

  let bx = width/2 - 60;
  let by = height/2 - 125;
  let bw = 120;
  let bh = 250;

  fill(180,180,255,100);
  rect(bx, by, bw, bh, 10);

  fill(0,100,200,180);
  rect(bx+5, by+5, bw-10, bh-10);

  let thermX = bx + bw + 60;
  fill(200); rect(thermX-10, by, 20, bh);
  fill(255,0,0);
  let mercuryHeight = map(tempA,0,100,0,bh-10);
  rect(thermX-10, by+bh-mercuryHeight, 20, mercuryHeight);

  fill(255);
  text("Thermometer Temp: "+int(tempA)+"°C", thermX, by-10);
  text("Water Temp: "+int(tempA)+"°C", bx+bw/2, by-20);

  let fireX = bx + bw/2;
  let fireY = by + bh + 50;
  fill(255,100,0);
  rect(fireX-20, fireY-20, 40, 20);
  fill(255,0,0,150);
  rect(fireX-20, fireY-20, fireSlider*0.4, 20);
  fill(255);
  text("Fire Temp: "+int(fireSlider)+"°C", fireX, fireY-40);

  fill(150,220,255);
  rect(iceX, iceY, 40, 40, 5);
  fill(255);
  text("Drag Ice", iceX+20, iceY-10);

  if(mouseIsPressed && dist(mouseX, mouseY, iceX+20, iceY+20)<40){
    iceX = mouseX-20;
    iceY = mouseY-20;
  }

  drawSlider(900, 680, "Ice Power", icePower);
  drawSlider(200, 700, "Fire Power", fireSlider);

  let netHeat = fireSlider*0.01;
  if(iceX > bx && iceX < bx+bw && iceY > by && iceY < by+bh){
    netHeat -= icePower*0.01;
  }
  tempA += netHeat;
  tempA = constrain(tempA,0,100);
}

// ==================== HEAT FLOW TAB ====================
function drawHeatFlowTab(){
  fill(255);
  textSize(24);
  text("Interactive Heat Flow", width/2, 50);

  fill(255,100,0); rect(350,300,120,200);
  fill(255); text("Hot Tank",410,510);
  fill(0,100,255); rect(700,300,120,200);
  fill(255); text("Cold Tank",760,510);

  fill(255,0,0); rect(350,300+(200-map(hotTemp,0,100,0,200)), 120, map(hotTemp,0,100,0,200));
  fill(0,0,255); rect(700,300+(200-map(coldTemp,0,100,0,200)), 120, map(coldTemp,0,100,0,200));

  textSize(16);
  text("Hot Temp: "+int(hotTemp), 410, 290);
  text("Cold Temp: "+int(coldTemp), 760, 290);

  drawSlider(950,650,"Work Input", workInput);

  let dTemp = (hotTemp-coldTemp)*0.005;
  hotTemp -= dTemp;
  coldTemp += dTemp;

  let forced = workInput*0.01;
  coldTemp -= forced;
  hotTemp += forced;

  for(let i=0;i<5;i++){
    let x = random(700,820);
    let y = random(300,500);
    fill(150,random(255),random(255),150);
    ellipse(x, y, 8,8);
  }
}

// ==================== SLIDER ====================
function drawSlider(x,y,label,val){
  stroke(255); line(x,y,x+200,y); noStroke();
  fill(255); text(label + ": " + int(val), x+100, y-25);
  fill(120); ellipse(x+val*2, y, 18,18);

  if(mouseIsPressed && dist(mouseX,mouseY,x+val*2,y)<15){
    sliderDragging = true;
    activeSlider = label;
  }

  if(!mouseIsPressed){
    sliderDragging = false;
    activeSlider = "";
  }

  if(sliderDragging && activeSlider===label){
    let newVal = constrain((mouseX-x)/2,0,100);
    if(label==="Temp A") tempA=newVal;
    if(label==="Temp B") tempB=newVal;
    if(label==="Input Energy") energyInput=newVal;
    if(label==="Ice Power") icePower=newVal;
    if(label==="Fire Power") fireSlider=newVal;
    if(label==="Work Input") workInput=newVal;
    if(label==="Entropy Level") entropyLevel=newVal;
  }
}

// ==================== THERMOMETER ====================
function drawThermometer(x,y,temp,label){
  fill(200); rect(x-20,y-150,40,150);
  fill(255,0,0); rect(x-20, y-temp*1.5,40,temp*1.5);
  fill(255); text(label,x,y+40);
}

// ==================== PARTICLES ====================
class EnergyParticle{
  constructor(x,y){
    this.pos = createVector(x,y);
    this.vel = createVector(2,0);
    this.type = 0; // 0=input, 1=work, 2=waste
  }

  update(){
    this.pos.add(this.vel);
    if(this.type===0 && this.pos.x>400){
      let r=random();
      if(r<0.6){ this.type=1; this.vel=createVector(2,-1.5);}
      else{ this.type=2; this.vel=createVector(2,1.5);}
    }
  }

  display(){
    if(this.type===0) fill(255,200,0);
    else if(this.type===1) fill(0,220,0);
    else fill(255,100,100);
    noStroke();
    ellipse(this.pos.x,this.pos.y,10,10);
  }

  offscreen(){ return this.pos.x>width || this.pos.y<0 || this.pos.y>height; }
}

class ThirdLawParticle{
  constructor(x,y){ this.pos = createVector(x,y); }

  move(speed){
    this.pos.x += random(-speed,speed);
    this.pos.y += random(-speed,speed);
  }

  display(){ ellipse(this.pos.x,this.pos.y,10,10); }
}