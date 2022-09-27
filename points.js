class Obstacle {
  constructor(pos) {
    this.pos = createVector(pos.x, pos.y);
  }
  show(){
    stroke(color(255,0,0));
    strokeWeight(2);
    point(this.pos.x,this.pos.y);
  }
}
