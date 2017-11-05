/*-------*/
/*-------*/
/*globals*/
/*-------*/
/*-------*/

var canvas;
var i = 0;
var square = new p5.SqrOsc();
var sine = new p5.SinOsc();
var mic = new p5.AudioIn();
var fft = new p5.FFT();
var mode = 'cube';
var caption;

/*------------*/
/*------------*/
/*p5 functions*/
/*------------*/
/*------------*/

//
//one-time initializations
//
function setup() {
  //alert the masses that this won't work well without headphones
  alert('use headphones for optimal experience');

  //only need to find the caption text html element once
  caption = $('#caption');

  //set canvas to be centered rectangle
  var h = windowHeight - 100;
  canvas = createCanvas((2 * h / 3), (2 * h / 3), WEBGL);
  canvas.parent('canvasDiv');
  
  //drawing settings
  colorMode(HSB);
  fill(0, 0, 0, 0);
  frameRate(60);

  //setup square wave object
  square.amp(.1);
  square.freq(60);
  square.start();

  //setup square wave object
  sine.amp(0);
  sine.freq(200);
  sine.start();

  //start the mic and set it as input for a fourier object to analyze pitch
  mic.start();
  fft.setInput(mic);
}

//
//execution loop FOREVER :O
//
function draw() {
  //mute the sine wave before we know if there is input sound or not
  sine.amp(0);

  //find the primary frequency of the mic input
  var spectrum = fft.analyze();
  var maxIndex = 0;

  for (var j = 1; j < spectrum.length; j++) {
    if (spectrum[j] > spectrum[maxIndex] + 100) {
      maxIndex = j;
    }
  }

  //read the input mic pitch and map it after some adjustments
  if (maxIndex > (spectrum.length / 20)) {
    maxIndex = spectrum.length / 20;
  }

  var pitch = map(maxIndex, 0, (spectrum.length / 20), 0, 20);

  //read the mic volume in and map it after some adjustments
  var volume = mic.getLevel();

  if (volume > .4) {
    volume = .4;
  }

  volume = map(volume, 0, .4, 0, 20);
  
  //map the time counter to some perlin noises
  var noiseOne = map(noise(i), 0, 1, -10, 15);
  var noiseTwo = pitch * map(noise(i / 30), 0, 1, -300, 300);

  //add perlin noise variation to the background square and sine waves
  square.freq(60 + noiseOne);
  sine.freq(100 + noiseTwo);
  
  //play the higher sine wave if high enough sound is detected
  if (pitch > 1) {
    sine.amp(.5);
  }
  
  //for shape edges, cycle hue based on pitch. draw background as transparent
  var fg = map(pitch, 0, 20, 0, 359);
  background(0, 0, 0, 0);
  stroke(fg, 30, 100);

  //update top text to match this hue
  var hsb = 'hsl(' + fg + ', 30%, 60%)';
  caption.css({'color': hsb });
  
  //depending on noiseTwo variable, change stroke thickness
  var beefiness = map(volume, 0, 20, 5, 120); //beef
  strokeWeight(beefiness * (width / 1000));

  //draw a rotating shape. the rotations depend on time, noise, and j
  rotateX(i / 120);
  rotateY(pitch);
  rotateZ(noiseOne / 100);
  if (mode == 'cube') {
    box((width / 3), (width / 3), (width / 3));
  } else if (mode == 'sphere') {
    sphere((width / 3), 10, 8);
  } else {
    torus((width / 4), (width / 9), 10, 8);
  }
  
  //tick counter up
  i++;
}

/*----------------------*/
/*----------------------*/
/*jQuery event listeners*/
/*----------------------*/
/*----------------------*/

//
//on canvas click, change the shape type and inform the user
//
$(document).on('click', 'canvas', function() {
  if (mode == 'cube') {
    mode = 'sphere';
  } else if (mode == 'sphere') {
    mode = 'torus';
  } else {
    mode = 'cube';
  }

  $('#shapeName').text('current shape: ' + mode + '.');
});