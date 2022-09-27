let qt;
function setup() {
  createCanvas(800, 800);

  let boundary = new Rectangle(width/2, height/2,width/2,height/2);
  qt = new QuadTree(boundary, 4);
  console.log(qt);

   for(let i = 0; i<1000; i++){
        let p = new Point(random(0, width),random(0, height));
        qt.insert(p);
    }
    if (mouseIsPressed) {
        let m = new Point(mouseX, mouseY);
        qt.insert(m);
      }
    
}

function draw() {
    background(51);
    qt.show();
    stroke(0,255,0);
    rectMode(CENTER);
    let range = new Rectangle(mouseX,mouseY,200,200);
    rect(range.x,range.y,range.w*2,range.h*2);
    let points = qt.query(range);
    for(let p of points){
        strokeWeight(5);
        point(p.x,p.y);
    }
}
