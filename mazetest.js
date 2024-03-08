const pixelSize = 16;
const canvasWidthReal = 3216;
const colors = ["#56b15a", "#228d27"];
const canvas = document.getElementById("canvas0");
const ctx = canvas.getContext("2d");
const canvas1 = document.getElementById("canvas1");
const ctx1 = canvas1.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
canvas1.width = innerWidth;
canvas1.height = innerHeight;
let speed = 200;
let velocity = [0, 0];
const pressedKeys = {};
window.onkeyup = (e) => {
  pressedKeys[e.keyCode] = false;
};
window.onkeydown = (e) => {
  pressedKeys[e.keyCode] = true;
};
const rectColliders = (m = Array.from({ length: canvasWidthReal }, (e) =>
  Array.from({ length: canvasWidthReal }, (e) => 0)
));
// {x: , y: , width: , height, layer? mask?}

const circleColliders = [];

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

// const mouse = {
//   x: innerWidth / 2,
//   y: innerHeight / 2,
// };
// // Event Listeners
// addEventListener("mousemove", (event) => {
//   mouse.x = event.clientX;
//   mouse.y = event.clientY;
// });

function dec2bin(dec) {
  return dec.toString(2).padStart(8, "0");
}

let bigBits = "";
fetch("/mazeout.txt", { method: "GET" }).then((response) => {
  response.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let bits = "";
    for (let i = 0; i < bytes.length; i++) {
      let byte = bytes[i];
      let bits = dec2bin(byte);
      bigBits += bits;
    }

    let canvasWidth = canvasWidthReal / pixelSize;

    for (let i = 0; i < bigBits.length; i++) {
      let x = i % canvasWidth;
      let y = Math.floor(i / canvasWidth);
      let bit = bigBits[i];
      let color = colors[bit];
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      // Add collidable object?
      if (bit === "1") {
        for (let x_idx = 0; x_idx < pixelSize; x_idx++) {
          for (let y_idx = 0; y_idx < pixelSize; y_idx++) {
            rectColliders[x * pixelSize + x_idx][y * pixelSize + y_idx] = 1;
          }
        }
      }
    }
  });
});

const spriteWidth = pixelSize / 2;

let lastTime = performance.now();
let deltaTime = 0;
const character = {
  x: Math.trunc(innerWidth / 2),
  y: Math.trunc(innerHeight / 2),
};

function animate(time) {
  deltaTime = time - lastTime;
  velocity = [0, 0];

  if (pressedKeys[38] || pressedKeys[87]) {
    velocity[0]--;
  }
  if (pressedKeys[40] || pressedKeys[83]) {
    velocity[0]++;
  }
  if (pressedKeys[68] || pressedKeys[39]) {
    velocity[1]++;
  }
  if (pressedKeys[65] || pressedKeys[37]) {
    velocity[1]--;
  }

  if (velocity[0] != 0 || velocity[1] != 0) {
  }
  character.y += Math.trunc(velocity[0] * speed * (deltaTime / 1000));
  character.x += Math.trunc(velocity[1] * speed * (deltaTime / 1000));

  let looping = true;

  ctx1.fillStyle = "black";
  for (let x = character.x; x < character.x + spriteWidth && looping; x++) {
    for (let y = character.y; y < character.y + spriteWidth && looping; y++) {
      if (rectColliders?.[x]?.[y]) {
        ctx1.fillStyle = "red";
        console.log("Collision!!!!");
        if (
          rectColliders[character.x + spriteWidth][
            character.y + spriteWidth / 2
          ] ||
          rectColliders[character.x][character.y + spriteWidth / 2]
        ) {
          // if right or left mid pixel is coliding
          character.x -= Math.trunc(velocity[1] * speed * (deltaTime / 1000));
        }
        if (
          rectColliders[character.x + spriteWidth / 2][character.y] ||
          rectColliders[character.x + spriteWidth / 2][
            character.y + spriteWidth
          ]
        ) {
          // if top or bottom mid pixel is coliding
          character.y -= Math.trunc(velocity[0] * speed * (deltaTime / 1000));
        }
        looping = false;
      }
    }
  }

  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx1.fillRect(character.x, character.y, pixelSize / 2, pixelSize / 2);
  lastTime = time;
  requestAnimationFrame(animate);

  // what you would want to do here is lookup the objects position? in an array and see if it collides
  // you really don't want to do a search every frame
  // objects.forEach(object => {
  //  object.update()
  // })
}

window.requestAnimationFrame(animate);
