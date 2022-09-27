class Boid{
  constructor(pos) {
    this.hue = 0;
    this.pos = pos;
    this.vel = p5.Vector.random2D();
    this.vel.setMag(random(2, 4)); // Geschwindigkeit des Boids
    this.acc = createVector(); // Beschleunigung des Boids
    this.maxF = random(0.02, 0.1); // Maximale Kraft des Boids
    this.col = colorarr[int(random(0, colorarr.length-1))]; // Farbe des Boids
    this.boidlength = random(25,25); // Länge des Boids
    this.boidwidth = this.boidlength/2; // Breite des Boids
    this.maxV = map(this.boidlength,15,25,4,8); // Maximale Geschwindigkeit des Boids
  }

  flock(boids) {
    // Funktion für die Logik des Schwarms
    this.acc.set(0, 0); // Beschleunigkeit jedesmal zurücksetzen um sie neu zu kalkulieren
    if(align){
      let alignment = this.align(boids); // die Ausrichtung Kalkulieren und die Beschleunigung als Vektor Speichern
      alignment.mult(al); // Jeweils mit einem Faktor belegen
      this.acc.add(alignment);

    }
    if(choes){
      let cohesion = this.cohesion(boids); // den Zusammenschluss der Boids kalkulieren
      cohesion.mult(co);
      this.acc.add(cohesion);

    }
    if(seper){
      let seperation = this.seperation(boids); // das ausweichen der einzelnen Boids kalkulieren
      seperation.mult(se);
      this.acc.add(seperation); // Und jeweils auf die Beschleunigung drauf addieren.

    }
    if(rest){
      let avoid = this.avoid(); // das umsteuern der Hindernisse kalkulieren
      let flee = this.flee(); // die Flucht vor der Maus kalkulieren
      let vBoidFlee = this.vBoidFlee();
      avoid.mult(0.2);
      this.acc.add(flee);
      //this.acc.add(vBoidFlee);
      this.acc.add(avoid);

    }
  }

  align(boids) { // Logik für die Lokale, Durchschnittliche Ausrichtung aller Boids in einer Gewissen Reichweite
    let perception = 100; // Reichweite
    let steering = createVector();
    let total = 0; // Wie viele Boids befinden sich in der Range
    for (let points of boids) { // Für jeden Boid in einer Range, über den Quad-Tree herasugenommen (So muss man nicht jeden Boid gegen jeden Boid testen)
      let other = points.userData;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y); // Die Entfernung zwischen sich selber und dem Getesteten Boid kalkulieren
      if (d < perception && other != this) { // Wenn diese Entfernung kleiner ist als die Reichweite, dann die Beschleungigung zum Vektoren hinzufügen
        steering.add(other.vel); // Die Geschwindigkeit des anderen Boid zum Vektor hinzufügen
        total++;
      }
    }
    if (total > 0) { // Wenn es überhaupt einen Punkt gibt dann
      steering.div(total); // Durch die Anzahl der gefundenen Punkte dividieren, somit hat man die Durchschnittliche Geschwindigkeit 
      steering.setMag(this.maxV); // Die Länge des Vektorens auf die Maximale Geschwindigkeit begrenzen
      steering.sub(this.vel); // Die momentane Geschwindigkeit vom Zielvektoren abziehen, in Vektorenlogik bedeutet das --> sich in die Zielrichtung zu bewegen
      steering.limit(this.maxF); // Den Zielvektor auf eine Maximale Kraft begrenzen.
    }
    return steering;
  }

  cohesion(boids) { // Logik für den Zusammenschluss --> Durchschnittliche Lokale Position
    let perception = 100;
    let steering = createVector();
    let total = 0;
    for (let points of boids) {
      let other = points.userData;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < perception && other != this) {
        steering.add(other.pos); // Die Position zum Zielvektoren hinzufügen
        total++;
      }
    }
    if (total > 0) {
      steering.div(total); // Durchschnittliche Position
      steering.sub(this.pos); // Richtung abhöngig, der aktuellen position wird festgemacht
      steering.sub(this.vel); // Richtung abhängig, der aktuellen Geschwindigkeit wird festgemacht.
      steering.limit(this.maxF); // Begrenzte Kraft
    }
    return steering;
  }

  seperation(boids) { // Logik für das ausweichen der Boids 
    let perception = 150;
    let steering = createVector();
    let total = 0;
    for (let points of boids) {
      let other = points.userData;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (d < perception && other != this) {
        let diff = p5.Vector.sub(this.pos, other.pos); // Vektor um dem Zielboid auszuweichen
        diff.div(d); // diesen Vektor durch die Distanz teilen, höhere dsitanz = weniger Geschwindigkeit
        steering.add(diff); 
        total++;
      }
    }

    if (total > 0) {
      steering.div(total); // Durchschnittlichen Vektor bekommen
      steering.setMag(this.maxV); // maximale Geschwindigkeit
      steering.sub(this.vel); // Richtung wechseln
      steering.limit(this.maxF); // Begrenzte Kraft
    }
    return steering;
  }
  vBoidFlee(){
    let perception = 200;
    let steering = createVector();

    let d = dist(this.pos.x, this.pos.y, vBoid.pos.x, vBoid.pos.y); // Distanz zwischen Maus und dem Boid
    if (d < perception) {
      let diff = p5.Vector.sub(this.pos, createVector(mouseX, mouseY)); // Selbe wie beim Ausweichen
      diff.div(d);
      steering.add(diff);
    }

    return steering;
  }
  flee() { // Logik für das Fliehen vor der Maus-Position
    let perception = 100;
    let steering = createVector();

    let d = dist(this.pos.x, this.pos.y, mouseX, mouseY); // Distanz zwischen Maus und dem Boid
    if (d < perception) {
      let diff = p5.Vector.sub(this.pos, createVector(mouseX, mouseY)); // Selbe wie beim Ausweichen
      diff.div(d);
      steering.add(diff);
    }

    return steering;
  }
  avoid() { // Logik für das Ausweichen der Hindernisse (Den Buchstaben)
    let perception = 40;
    let steering = createVector();
    for (let obs of obstacles) { // Für jedes Hinderniss (Ein Punkt)
      let d = dist(this.pos.x, this.pos.y, obs.pos.x, obs.pos.y);
      if (d < perception) {
        let diff = p5.Vector.sub(this.pos, obs.pos); // wie beim ausweichen und/oder Fliehen
        diff.div(d);
        steering.add(diff);
      }
    }
    return steering;
  }
  update() { // Jeden Frame wird die Position und die Geschwindigkeit beeinflusst.
    // Borderless Canvas
    if (this.pos.x > width) {
      this.pos.x = 0;
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
    }
    if (this.pos.y> height) {
      this.pos.y = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
    }
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.vel.limit(this.maxV);
  }

  show() { // Der Boid wird anhand eines dreicecks angezeigt
    strokeWeight(2);
    noStroke();
    fill(this.col); // Die Farbe des Boids
    push(); // push(); und pop(); wird verwendet um transformationen zurückzusetzen nach dem pop();
    translate(this.pos.x, this.pos.y); // die position wird zu der Boid position gesetzt
    rotate(this.vel.heading() + HALF_PI); // es wird in die Richtung gedrecht in welche der Boid zeigen soll + pi/2 um noch eine Teildrehung zu haben
    translate(-this.pos.x, -this.pos.y); // die position wird wieder zurück gesetzt.
    triangle( // das Dreieck wird animiert
      this.pos.x - this.boidwidth/2, // punkt eins links unten
      this.pos.y + this.boidlength,
      this.pos.x, // punkt zwei als nase und gibt die tatsächliche position an
      this.pos.y,
      this.pos.x + this.boidwidth/2, // punkt 3 unten rechts.
      this.pos.y + this.boidlength
    );

    pop();
  }
}
