// __ Global Variables __

let socket = io();

//var myCursor;
var myParticles = [];

var otherCursors = [];

var clickEffect = [];
var palette = [
  {r: 3, g: 196, b: 216 },
  {r: 0, g: 146, b: 255 },
  {r: 151, g: 71, b: 214 },
  {r: 178, g: 0, b: 114 },
  {r: 234, g: 31, b: 109 },
  {r: 255, g: 80, b: 51 },
  {r: 255, g: 103, b: 0 }
];


// __ Preload __

function preload(){
  prova = loadImage('assets/images/1.png');
}

// __ Setup __

function setup() {
  createCanvas(windowWidth, windowHeight);

  myCursor = new myCursor();

  pointer = createSprite(0, 0);
  pointer.addImage(loadImage('assets/images/pointer.png'));

  slider0 = createSprite(-50, -120);
  slider0.addImage(loadImage('assets/images/slider.png'));
  slider0.visible = true;

  click0 = createSprite(width / 30 * 5, height / 20 * 5);
  click0.addImage(prova);
  click0.visible = true;

  socket.on("mouseBroadcast", mousePos);
}


// __ Draw __

function draw() {
  background("#030c24");

  let mousePosition = {
    x: mouseX,
    y: mouseY,
    width: width,
    height: height,
  };
  socket.emit("mouse", mousePosition);

  translate(width / 2, height / 2);

  angleMode(DEGREES);
  var rotAngle = (360 / (otherCursors.length+1));

  drawSprites();

  pointer.position.x = mouseX - width / 2;
  pointer.position.y = mouseY - height / 2;

  noCursor();
  myCursor.update();
  myCursor.display();

  for(var i = 0; i < otherCursors.length; i++){
    push();
    rotate(rotAngle * (i+1));
    otherCursors[i].display();
    otherCursors[i].update();
    pop();
  }

  if (mouseIsPressed) {
    for (var i = 0; i < random(0, 80); i++) {
      myParticles.push(new myParticle());
    }
  }

  for (var i = 0; i < myParticles.length; i++) {
    myParticles[i].update();
    myParticles[i].render();
    if (myParticles[i].particleIsFinished()) {
      myParticles.splice(i, 1);
    }
  }

  for (var i = 0; i < clickEffect.length; i++) {
    var circle = clickEffect[i];
    circle.display();
  }

}


// __ Sockets Listeners __

socket.on("connect", newPlayerConnected);

function newPlayerConnected() {
  console.log("your id:", socket.id);
}

socket.on('deleteCursor', function(data) {
  var getPos = otherCursors.findIndex(cursor => cursor.id === data.id);
  otherCursors.splice(getPos, 1);
});


// __ Socket functions __

function mousePos(data) {
  data.x = map(data.x, 0, data.width, 0, width, true);
  data.y = map(data.y, 0, data.height, 0, height, true);

  data.x = data.x - width / 2;
  data.y = data.y - height / 2;

  var getPos = otherCursors.find(otherCursor => otherCursor.id === data.id);

  if (getPos == undefined) {
    otherCursors.push(new otherCursor(data.x, data.y, data.id));
  } else {
    getPos.x = data.x;
    getPos.y = data.y;
  }

}


// __ Class and functions __

class myCursor {
  constructor() {
    this.x = mouseX - width / 2;
    this.y = mouseY - height / 2;
    this.size = 50;
    this.history = [];
  }
  update() {
    var prevPos = {
      x: mouseX - width / 2,
      y: mouseY - height / 2
    }
    this.history.push(prevPos);

    if (this.history.length > 40) {
      this.history.splice(0, 1);
    }
  }

  display() {
    noStroke();
    for (var i = 0; i < this.history.length; i++) {
      fill(255, 255, 255, 50);
      ellipse(this.history[i].x, this.history[i].y, i / 1.5);
    }
  }
}


class myParticle {
  constructor() {
    this.x = random(-15, 15) + mouseX - width / 2;
    this.y = random(-15, 15) + mouseY - height / 2;
    this.speed = 3;
    this.gravity = 0.1;
    this.diameter = (dist(this.x, this.y, mouseX - width / 2, mouseY - height / 2)) * 0.7;
    this.colour = color(255, 255, 255, random(1, 150));
    //this.color = palette[round(random(palette.length-1))];
    this.ax = random(-this.speed, this.speed);
    this.ay = random(-this.speed, this.speed);
  }

  update() {
    this.diameter = this.diameter - 0.3;
    this.x += this.ax;
    this.y += this.ay;

    this.x += random(-this.speed / 2, this.speed / 2);
    this.y += random(-this.speed / 2, this.speed / 2);
  }

  particleIsFinished() {
    if (this.diameter < 0) {
      return true;
    }
  }

  render() {
    noStroke();
    if (this.diameter > 0) {
      fill(this.colour);
      //fill(this.color.r, this.color.g, this.color.b);
      ellipse(this.x, this.y, this.diameter, this.diameter);
    }
  }
}


function otherCursor(temp_x, temp_y, temp_id) {
  this.x = temp_x;
  this.y = temp_y;
  this.id = temp_id;
  this.color = palette[round(random(palette.length-1))];
  this.size = 50;
  this.history = [];

  this.update = function() {
    var prevPos = {
      x: this.x,
      y: this.y
    }
    this.history.push(prevPos);

    if (this.history.length > 40) {
      this.history.splice(0, 1);
    }
  }

  this.display = function() {
    noStroke();
    fill(this.color.r, this.color.g, this.color.b, 50);
    for (var i = 0; i < this.history.length; i++) {
      ellipse(this.history[i].x, this.history[i].y, i / 1.5);
    }
  }
}

function circles() {
  this.x = mouseX - width / 2;
  this.y = mouseY - height / 2;
  this.dim = 0;
  this.opacity = 200;

  this.display = function() {
    this.dim += 10;
    this.opacity -= 10;

    noFill()
    strokeWeight(3);
    stroke(255, 255, 255, this.opacity);
    ellipse(this.x, this.y, this.dim);
  }
}

function mousePressed() {
  //if () {
    var circle = new circles();
    clickEffect.push(circle);

    if (clickEffect.length > 3) { // per far sparire i cerchi dopo un tot
      clickEffect.splice(0, 1);
    }
  //}
}
