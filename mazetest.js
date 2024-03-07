const pixelSize = 4;
const canvasWidthReal = 804;
const colors = ["#56b15a", "#228d27"];

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
    const canvas = document.getElementById("canvas0");
    const ctx = canvas.getContext("2d");

    for (let i = 0; i < bigBits.length; i++) {
      let x = i % canvasWidth;
      let y = Math.floor(i / canvasWidth);
      let bit = bigBits[i];
      let color = colors[bit];
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  });
});
