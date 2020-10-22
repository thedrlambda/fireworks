let canvasElem = document.getElementById("canvas") as HTMLCanvasElement;
let canvasBounds = canvasElem.getBoundingClientRect();
let ctx = canvasElem.getContext("2d")!;

const SOUNDS = [new Audio("01.wav"), new Audio("02.wav"), new Audio("03.wav")];

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 10, 10);

const COLORS = [
  "#ff0000",
  "#00ff00",
  "#0088ff",
  "#ff77ff",
  "#ffffff",
  "#ffee00",
];

class Particle {
  private glowTime: number;
  constructor(
    private x: number,
    private y: number,
    private velX: number,
    private velY: number,
    private accX: number,
    private accY: number,
    private initGlowTime: number,
    private color: string,
    private rocket: boolean,
    private tail: number
  ) {
    this.glowTime = initGlowTime;
  }
  update(dt: number) {
    this.velX += this.accX * dt;
    this.velY += this.accY * dt;
    this.x += this.velX * dt;
    this.y += this.velY * dt;
    this.glowTime -= dt;
    if (this.rocket && this.glowTime <= 0) {
      spawnExplosion(this.x, this.y, randomElement(COLORS));
    }
    if (this.tail > 0) {
      particles.push(
        new Particle(
          this.x,
          this.y,
          this.velX * 0.1,
          this.velY * 0.1,
          0,
          0,
          this.tail,
          this.color,
          false,
          0
        )
      );
    }
  }
  draw(g: CanvasRenderingContext2D) {
    g.fillStyle =
      this.color +
      (~~(smoothStep(this.glowTime / this.initGlowTime) * 255))
        .toString(16)
        .padStart(2, "0");
    g.beginPath();
    g.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    g.fill();
  }
  isVisible() {
    return this.glowTime > 0;
  }
}

function randomElement<T>(arr: T[]) {
  return arr[~~(Math.random() * arr.length)];
}

function smoothStep(x: number) {
  return x * x * (3 - 2 * x);
}

let particles: Particle[] = [];

function spawnRocket() {
  particles.push(
    new Particle(
      Math.random() * (canvasBounds.width - 100) + 50,
      canvasBounds.height,
      25 * (Math.random() - Math.random()),
      0,
      0,
      -70,
      3 + (Math.random() - Math.random()),
      "#ffcc00",
      true,
      0.3
    )
  );
}

setInterval(() => spawnRocket(), 1000);

function spawnExplosion(x: number, y: number, color: string) {
  randomElement(SOUNDS).play();
  let tail = Math.random() * 0.5;
  let second = randomElement(COLORS);
  let density = (Math.random() - Math.random()) * 40 + 80;
  let size = (Math.random() - Math.random()) * 40 + 70;
  for (let i = 0; i < density; i++) {
    let vx: number, vy: number;
    do {
      vx = Math.random() - Math.random();
      vy = Math.random() - Math.random();
    } while (Math.hypot(vx, vy) > 0.5);
    particles.push(
      new Particle(
        x,
        y,
        size * vx,
        size * vy,
        0,
        9.82,
        2 * Math.random() + 1,
        Math.random() < 0.4 ? color : second,
        false,
        tail
      )
    );
  }
}
// spawnExplosion(canvasBounds.width / 2, canvasBounds.height / 2);

function draw() {
  let img = document.createElement("canvas");
  img.width = canvasBounds.width;
  img.height = canvasBounds.height;
  let g = img.getContext("2d")!;
  g.fillStyle = "red";
  particles.forEach((x) => x.draw(g));
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasBounds.width, canvasBounds.height);
  ctx.globalCompositeOperation = "lighter";
  scaledDown(img, 3);
  ctx.drawImage(img, 0, 0);
}

function scaledDown(orig: HTMLCanvasElement, degree: number) {
  if (degree <= 0) return;
  let img = document.createElement("canvas");
  img.width = orig.width / 2;
  img.height = orig.height / 2;
  let g = img.getContext("2d")!;
  g.drawImage(
    orig,
    0,
    0,
    orig.width,
    orig.height,
    0,
    0,
    orig.width / 2,
    orig.height / 2
  );
  ctx.drawImage(
    img,
    0,
    0,
    orig.width / 2,
    orig.height / 2,
    0,
    0,
    canvasBounds.width,
    canvasBounds.height
  );
  scaledDown(img, degree - 1);
}

const FPS = 30;
const SLEEP = 1000 / FPS;

function update(dt: number) {
  particles.forEach((x) => x.update(dt));
  particles = particles.filter((x) => x.isVisible());
  /* Too slow
  for (let i = 0; i < particles.length; ) {
    let p = particles[i];
    p.update(dt);
    if (p.isVisible()) i++;
    else particles.splice(i, 1);
  }
*/
}

let count = 0;
let sum = 0;
let lastBefore: number = Date.now();
function gameLoop() {
  let before = Date.now();
  update((before - lastBefore) / 1000);
  draw();
  let after = Date.now();
  sum += after - before;
  count++;
  // console.log(sum / count);
  let sleep = SLEEP - (after - before);
  if (sleep < 5) console.log("Stayed up all night!");
  lastBefore = before;
  setTimeout(() => gameLoop(), sleep);
}
gameLoop();
