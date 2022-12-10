'use strict';

(function() {

  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  // var clearButton = document.getElementsByClassName('clearButton');

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', Down_the_Mouse, false);
  canvas.addEventListener('mouseup', Up_Mousee, false);
  canvas.addEventListener('mouseout', Up_Mousee, false);
  canvas.addEventListener('mousemove', throttle(MoveTheMouse, 10), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', Down_the_Mouse, false);
  canvas.addEventListener('touchend', Up_Mousee, false);
  canvas.addEventListener('touchcancel', Up_Mousee, false);
  canvas.addEventListener('touchmove', throttle(MoveTheMouse, 10), false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', COlor_Updater, false);
  }

  socket.on('drawing', DrawEvent);
  // clearButton.addEventListener('click', onClearEvent);

  window.addEventListener('resize', Resizer, false);
  Resizer();


  function Line_Draw(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }
  // function onClearEvent() {
  //   // drawing = false;
  //   context.clearRect(0, 0, canvas.width, canvas.height);
  // }
  function Down_the_Mouse(e){
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function Up_Mousee(e){
    if (!drawing) { return; }
    drawing = false;
    Line_Draw(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  }

  function MoveTheMouse(e){
    if (!drawing) { return; }
    Line_Draw(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function COlor_Updater(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function DrawEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    Line_Draw(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  // make the canvas fill its parent
  function Resizer() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

})();
