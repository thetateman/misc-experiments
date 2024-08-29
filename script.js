// Set up basic variables for app
const record = document.querySelector(".record");
const stop = document.querySelector(".stop");
const soundClips = document.querySelector(".sound-clips");
const canvas = document.querySelector(".visualizer");
const freqTitle = document.querySelector("#freq-title");
//const mainSection = document.querySelector("body");

// Disable stop button while not recording
stop.disabled = true;

// Visualiser setup - create web audio api context and canvas
let audioCtx;
const canvasCtx = canvas.getContext("2d");

// Main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
  console.log("The mediaDevices.getUserMedia() method is supported.");

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function (stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    // record.onclick = function () {
    //   mediaRecorder.start();
    //   console.log(mediaRecorder.state);
    //   console.log("Recorder started.");
    //   record.style.background = "red";

    //   stop.disabled = false;
    //   record.disabled = true;
    // };

    // stop.onclick = function () {
    //   mediaRecorder.stop();
    //   console.log(mediaRecorder.state);
    //   console.log("Recorder stopped.");
    //   record.style.background = "";
    //   record.style.color = "";

    //   stop.disabled = true;
    //   record.disabled = false;
    // };

    // mediaRecorder.onstop = function (e) {
    //   console.log("Last data to read (after MediaRecorder.stop() called).");

    //   const clipName = prompt(
    //     "Enter a name for your sound clip?",
    //     "My unnamed clip"
    //   );

    //   const clipContainer = document.createElement("article");
    //   const clipLabel = document.createElement("p");
    //   const audio = document.createElement("audio");
    //   const deleteButton = document.createElement("button");

    //   clipContainer.classList.add("clip");
    //   audio.setAttribute("controls", "");
    //   deleteButton.textContent = "Delete";
    //   deleteButton.className = "delete";

    //   if (clipName === null) {
    //     clipLabel.textContent = "My unnamed clip";
    //   } else {
    //     clipLabel.textContent = clipName;
    //   }

    //   clipContainer.appendChild(audio);
    //   clipContainer.appendChild(clipLabel);
    //   clipContainer.appendChild(deleteButton);
    //   soundClips.appendChild(clipContainer);

    //   audio.controls = true;
    //   const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
    //   chunks = [];
    //   const audioURL = window.URL.createObjectURL(blob);
    //   audio.src = audioURL;
    //   console.log("recorder stopped");

    //   deleteButton.onclick = function (e) {
    //     e.target.closest(".clip").remove();
    //   };

    //   clipLabel.onclick = function () {
    //     const existingName = clipLabel.textContent;
    //     const newClipName = prompt("Enter a new name for your sound clip?");
    //     if (newClipName === null) {
    //       clipLabel.textContent = existingName;
    //     } else {
    //       clipLabel.textContent = newClipName;
    //     }
    //   };
    // };

    // mediaRecorder.ondataavailable = function (e) {
    //   chunks.push(e.data);
    // };
  };

  let onError = function (err) {
    console.log("The following error occured: " + err);
  };

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
} else {
  console.log("MediaDevices.getUserMedia() not supported on your browser!");
}


function visualize(stream) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  var testSource = new Uint8Array([84,104,105,115,32,105,115,32,97,32,85,105,110,116,
    56,65,114,114,97,121,32,99,111,110,118,101,114,116,
    101,100,32,116,111,32,97,32,115,116,114,105,110,103]);

  let sourceIndex = 0;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const binFreqRange = audioCtx.sampleRate / analyser.fftSize
  console.log(`Bin range ${binFreqRange}`)
  const bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  const dataArray = new Uint8Array(bufferLength);
  let sampleBuckets = new Array(bufferLength).fill(0);

  const osc = audioCtx.createOscillator();
  osc.connect(audioCtx.destination);
  osc.start(0);

  let interval = setInterval(()=>{
    if(sourceIndex >= testSource.length){
      clearInterval(interval);
      return;
    }
    const freq = ((testSource[sourceIndex] + 50) * binFreqRange) - (binFreqRange / 2);
    osc.frequency.value = freq;
    sourceIndex++;
  }, 1000)


  source.connect(analyser);

  function sampleTick(){
    const byteRead = indexOfMax(sampleBuckets);
    const freqMode = ((byteRead + 50) * binFreqRange) - (binFreqRange / 2);
    console.log(byteRead);
    freqTitle.textContent = byteRead;
    sampleBuckets = new Array(256).fill(0);
  }
  setInterval(sampleTick, 200)
  
  function drawSpectrogram(){ 
    const maxFreq = indexOfMax(dataArray.slice(50, 306));
    sampleBuckets[maxFreq]++;
    //freqTitle.textContent = maxFreq;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    drawVisual = requestAnimationFrame(drawSpectrogram);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "rgb(0 0 0)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    const barWidth = (WIDTH / bufferLength);
    let barHeight;
    let x = 0;


    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
      
        canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);
      
        x += barWidth + 1;
      }

  }
  drawSpectrogram();

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}