let flock = []; // Schwarm-Array
let vBoid;
let obstacles = []; // Hinderniss Array
let debug = false; // Debug Mode
let al = 3; // Alignment --> Faktor der Ausrichtung aller Elemente, Bester wert: 3 --> Höhere Wert = Ehere Gruppierung
let co = 0.9999; // Cohesion --> Faktor der Gruppierung, Beser Wert: 0.2 -- > Höherer Wert = Weniger Abstand
let se = 1; // Seperation --> Faktor der "Flucht", Bester wert : 0 --> Höherer Wert = Eherer Abstand
let colorarr; // Array Für die Farben der Boids
let debugbutton; // Button zum Debuggen
let points, points2, points3; // Punkte des Textes
var font; // Speicherort der Font-Family
let qt; // quad-tree (Für eine bessere Performance)

// Logiken Abschalten
let align = false;
let choes = false;
let seper = false;
let rest = true;

let maxBoids = 50; // Anzahl der Maximalen Boids
let initialBoids = 50; // Anzahl der Anfangs Boids


function preload() {
  font = loadFont("Roboto-Thin.ttf"); // Schriftart
}

function setup() {
  vBoid = new Void(createVector(100,100));
  createCanvas(window.innerWidth, window.innerHeight);
  debugbutton = createButton("Debug");
  debugbutton.addClass("style");
  debugbutton.mouseClicked(() => {
    debug = !debug;
  });
  colorarr = [
    color(136, 179, 188),
    color(61, 111, 148),
    color(104, 156, 177),
    color(255, 255, 255)
  ];

  // Punkte für die Texte werden gespeichert.
  textFont(font);
  textSize(150);
  points = font.textToPoints("KSN Stuttgart Nord", 150, height / 2);
  textSize(50);
  points2 = font.textToPoints("Schulinformationstag", 550, height / 2 + 85);
  textSize(40);
  points3 = font.textToPoints("Wirtschaftsinformatik", 595, height / 2 + 130);

  // Boids werden erstellt
  for (let i = 0; i < initialBoids; i++) {
    flock.push(new Boid(createVector(random(0, width), random(0, height))));
  }
  // Die 3 Texte werden als Hinderniss gespeichert
  for (let i = 0; i < points.length; i++) {
    obstacles.push(new Obstacle(points[i]));
  }
  for (let i = 0; i < points2.length; i++) {
    obstacles.push(new Obstacle(points2[i]));
  }
  for (let i = 0; i < points3.length; i++) {
    obstacles.push(new Obstacle(points3[i]));
  }
 
}
function mouseClicked() {
  // Wenn die Maus Geklickt wird, dann wird ein neuer Boid an der Mausposition erstellt
  flock.push(new Boid(createVector(mouseX, mouseY)));
  if(flock.length > maxBoids){ // Falls die Maximale anzahl dadurch überschritten wird, dann lösche den ältesten Boid
    flock.shift();
  }
}
function draw() { 
  background(51);
  noStroke();

  // Text wird als wirklicher Text geschrieben
  textFont(font); 
  textSize(150);
  fill(61, 111, 148);
  text("KSN Stuttgart Nord", 150, height / 2);
  textSize(50);
  fill(136, 179, 188);
  text("Schulinformationstag", 550, height / 2 + 85);
  textSize(40);
  fill(136, 179, 188);
  text("Wirtschaftsinformatik", 595, height / 2 + 130);


  // Eine Boundary für den Quadtree wird erstellt auf maximalen Größe des Canvas
  let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
  qt = new QuadTree(boundary, 1);
  for (let boid of flock) { // Für jeden Boid
    qt.insert(new Point(boid.pos.x, boid.pos.y, boid)); // Der punkt für den Quadtree wird aus dem Boid objekt Übergeben mit dem Array selber, woher dieser kommt.
    rectMode(CENTER);
    let points = qt.query(new Rectangle(boid.pos.x, boid.pos.y, 100, 100)); // Die anderen Boids in einer gewissen Range gegen sich selber testen 
    noFill();
    stroke(color(0, 255, 0));
    if (debug) { // falls im Debug-Mode die Range um die einzelnen Boids anzeigen in Grüner Farbe.
      rect(boid.pos.x, boid.pos.y, 100, 100);
    }
    boid.flock(points); // Die Schwarm-Logik für die Gefilterten Boids benutzen, nicht für jeden.
    boid.update(); // Die Schwarm Position wird geupdated
    boid.show(); // Der Schwarm wird animiert
  }
  //qt.insert(new Point(vBoid.pos.x, vBoid.pos.y, vBoid));
  //let pts = qt.query(new Rectangle(vBoid.pos.x, vBoid.pos.y,100,100));
  //vBoid.flock(pts);
  //vBoid.update();
 // vBoid.show();
  noFill();
  stroke(255);
    textSize(50);
    noStroke();
    if (frameRate() <= 20) {
      fill(255, 0, 0);
    } else {
      fill(0, 255, 0);
    }
    text(int(frameRate()), width - 65, 50); // Fps werden oben rechts angezeigt
  if (debug && rest) { // Falls man im Debug Mode ist, dann 
    noFill();
    stroke(color(255,0,0)); 
    circle(mouseX,mouseY,100); // Eine Rote Boundary um die Maus.
    qt.show(); // Die Quadtree Logik animieren.
    for(let o of obstacles){
      o.show(); // Die Obstacle Punkte als Rote Dots anzeigen.
    }
  }

   
}
