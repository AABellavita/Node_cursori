// __ Global Variables __

let socket = io();
//var myCursor;
var otherCursors = [];
var particles0 = [];
var clickEffect = [];
var cnv;
var palette = [
  {r: 3, g: 196, b: 216 },
  {r: 0, g: 146, b: 255 },
  {r: 151, g: 71, b: 214 },
  {r: 178, g: 0, b: 114 },
  {r: 234, g: 31, b: 109 },
  {r: 255, g: 80, b: 51 },
  {r: 255, g: 103, b: 0 }
];


// __ Setup __

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);

  myCursor = new myCursor();

  pointer = createSprite(0, 0);
  pointer.addImage(loadImage('assets/images/pointer.png'));

  socket.on("mouseBroadcast", mousePos);
}


// __ Draw __

function draw() {

  let mousePosition = {
    x: mouseX,
    y: mouseY,
    win_w: width,
    win_h: height
  };
  socket.emit("mouse", mousePosition);

  translate(width / 2, height / 2);
  angleMode(DEGREES);
  background("#030c24");
  noCursor();

  drawSprites();

  pointer.position.x = mouseX - width / 2;
  pointer.position.y = mouseY - height / 2;

  myCursor.update();
  myCursor.display();

  for(var i = 0; i < otherCursors.length; i++){
    push();
    //rotate(360 / otherCursors.length); //???
    otherCursors[i].display();
    otherCursors[i].update();
    pop();
  }

  if (mouseIsPressed) {
    for (var i = 0; i < random(0, 80); i++) {
      particles0.push(new particelle(255, 255, 255));
    }
  }

  for (var i = 0; i < particles0.length; i++) {
    particles0[i].update();
    particles0[i].render();
    if (particles0[i].particlesIsFinished()) {
      particles0.splice(i, 1);
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
  otherCursors.splice(getPos, 1)
});


// __ Socket functions __

function mousePos(data) {
  // Find the cursor that has the same ID of the data received
  var getPos = otherCursors.find(otherCursor => otherCursor.id === data.id);

  data.x = map(data.x, 0, data.win_w, 0, width, true);
  data.y = map(data.y, 0, data.win_h, 0, height, true);

  // If no cursor with that ID is find ---> "getPos" is set to undefined
  // so create a new cursor with that ID
  if (getPos == undefined) {
    var tempCursor = new otherCursor(data.x, data.y, data.id); // Create new cursor
    otherCursors.push(tempCursor); // Push it on the "cursors" array
  }
  // If there is a cursor with that ID update the position
  else {
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

function otherCursor(temp_x, temp_y, temp_id){

  push();

    this.x = temp_x - width / 2;
    this.y = temp_y - height / 2;

    this.color = palette[round(random(palette.length-1))];
    fill(this.color.r, this.color.g, this.color.b, 50);

    ellipse(this.x, this.y, 100);
  pop();
}

/*function otherCursor(temp_x, temp_y, temp_id) {
  this.x = temp_x - width / 2;
  this.y = temp_y - height / 2;
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
}*/


class particelle {
  constructor(temp_r, temp_g, temp_b) {
    this.x = random(-15, 15) + mouseX - width / 2;
    this.y = random(-15, 15) + mouseY - height / 2;
    this.speed = 3;
    this.gravity = 0.1;
    this.diameter = (dist(this.x, this.y, mouseX - width / 2, mouseY - height / 2)) * 0.7;
    this.r = temp_r;
    this.g = temp_g;
    this.b = temp_b;
    this.colour = color(this.r, this.g, this.b, random(1, 150));
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

  particlesIsFinished() {
    if (this.diameter < 0) {
      return true;
    }
  }

  render() {
    noStroke();
    if (this.diameter > 0) {
      fill(this.colour);
      ellipse(this.x, this.y, this.diameter, this.diameter);
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
