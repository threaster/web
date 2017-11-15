(function(d) {
  "use strict"
  
  const
    UPDATE_STEP_MS = 35,
    ASPECT = 16/9;
  
  var
    canvas  = d.createElement('canvas'),
    ctx     = canvas.getContext('2d'),
    dim     = {},
    stars   = [],
    doodles = [],
    scale   = 1;
  
  function Star() {
    var
      x,
      y,
      r,
      c = 'white',
      v = 2,
      d = 1;
    
    this.setDirection = function(direction) { d = direction; }
    
    this.setVelocity = function(velocity) { v = velocity/20; }
    
    this.setColor = function(color) { c = color; }
    
    this.setRadius = function(radius) { r = radius; }
    
    this.setCoords = function(coordX, coordY) {
      x = coordX/100;
      y = coordY/100;
    }
    
    
    this.update = function() {
      x -= v / 100;
      y -= v * d / 100;
      
      if (x < -.01) { x += 1.02; }
      if (y < -.01) { y += 1.02; }
      if (x > 1.01) { x -= 1.02; }
      if (y > 1.01) { y -= 1.02; }
    }
    
    this.render = function(ctx) {
      ctx.save();
      
      for (let i = r; i > 0; i--) {
        ctx.beginPath();
        ctx.globalAlpha = (r - i + 1) / (2 * r);
        ctx.arc(x * ctx.canvas.width, y * ctx.canvas.height, i * scale, 0, Math.PI * 2, true);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.closePath();
      }
      
      
      ctx.restore();
    }
    
  }
  
  // An object simulating a drawn sketch 
  // Supports outline and fill animations
  function Sketch() {
    var
      finishedSketching = false,
      sketchColor = 'rgb(200, 200, 200)',
      fillColor = 'rgb(0, 18, 51)',
      callback = () => {},
      coords = [],
      fillBoxCoords = [],
      drawCoords = [],
      opacity = 1;
    
    
    function calculateDrawCoords() {
      var
        x,
        y,
        c = [],
        newCoords = [],
        total,
        d;
      
      finishedSketching = Date.now();
      drawCoords = [];
      
      for (let i = 0; i < coords.length; i++) {
        total = coords[i].dist;
        newCoords = [];
        newCoords.push([coords[i].coords[0][0], coords[i].coords[0][1]]);
        for (let j = 1; j < coords[i].coords.length; j++) {
          x = coords[i].coords[j][0] - coords[i].coords[j-1][0];
          y = coords[i].coords[j][1] - coords[i].coords[j-1][1];
          
          c = [coords[i].coords[j][0], coords[i].coords[j][1]];
          
          d = Math.sqrt((y * y) + (x * x));
          total -= d;
          
          if (total < 0) {
            x = ((d + total) / d) * x;
            y = ((d + total) / d) * y;
        
            c[0] = coords[i].coords[j-1][0] + x;
            c[1] = coords[i].coords[j-1][1] + y;
            finishedSketching = false;
          }
          
          newCoords.push(c);
      
          if (total < 0) { break; }
        }
        
        drawCoords.push(newCoords);
      }
      
      if (finishedSketching) {
        callback();
      }
    }
    
    function drawPolygon(opts) {
      
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < drawCoords.length; i++) {
        
        ctx.moveTo((drawCoords[i][0][0] * dim.w) + dim.x, (drawCoords[i][0][1] * dim.h) + dim.y);
        for (let j = 1; j < drawCoords[i].length; j++) {
          let
            x = drawCoords[i][j][0] * dim.w + dim.x,
            y = drawCoords[i][j][1] * dim.h + dim.y;
            
          ctx.lineTo(x, y);
        }
      }
    
      if (opts && opts.lineWidth) { ctx.lineWidth = opts.lineWidth; }
      if (opts && opts.color) {
        ctx.strokeStyle = opts.color;
        ctx.fillStyle = opts.color;
      }
      
      ctx.globalAlpha = opacity;
      (opts && opts.useFill) ? ctx.fill() : ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
    
    this.setCallback = function(func) {
      callback = func.bind(this);
    }
    
    this.setSketchColor = function(color) {
      sketchColor = color;
    }
    
    this.setFillColor = function(color) {
      fillColor = color;
    }
    
    this.getSketchFinishTime = function() { return finishedSketching; }
    
    this.getCoords = function() { return coords; }
    
    this.setFillBoxCoords = function(coordinates) {
      fillBoxCoords = coordinates;
    }
    
    this.setCoords = function(coordinates) {
      for (let i = 0; i < coordinates.length; i++) { 
        this.appendCoords(coordinates[i]);
      }
    }
    
    this.appendCoords = function(coordinates) {
      coordinates.speed = (coordinates.speed) ? coordinates.speed : 2;
      coordinates.delay = (coordinates.delay) ? Date.now() + coordinates.delay : Date.now() - 1;
      coordinates.dist = 0;
      coords.push(coordinates);
    }
    
    this.popCoords = function() { coords.pop(); }
    
    this.update = function() {
      for (let i = 0; i < coords.length; i++) {
        if (Date.now() > coords[i].delay && coords[i].dist !== false) {
        
          coords[i].dist += coords[i].speed / 100;
          calculateDrawCoords();
        }
      }
    }
    
    this.render = function(ctx) {
      var
        f = fillBoxCoords;
      
      ctx.beginPath();
      
      for (let i = 0; i < f.length; i++) {
        let
          x0 = f[i][0] * dim.w + dim.x,
          x1 = f[i][2] * dim.w + dim.x,
          y0 = f[i][1] * dim.h + dim.y,
          y1 = f[i][3] * dim.h + dim.y;
        
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1, y0);
      }
      
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.closePath();
      
      
      ctx.beginPath();
      drawPolygon({lineWidth:4 * scale, color:sketchColor});
      ctx.closePath();
    }
    
  }
  
  function getColorMix(initColor, endColor, start, duration) {
    var 
      t = Date.now(),
      color,
      coef;
    
    if (!start) { return rgb(initColor); }
    if (t - start > duration) { return rgb(endColor); }
    
    coef = Math.sin((Math.PI/2) * (t - start) / duration);
    
    color = [
      initColor[0] + ((endColor[0] - initColor[0]) * coef),
      initColor[1] + ((endColor[1] - initColor[1]) * coef),
      initColor[2] + ((endColor[2] - initColor[2]) * coef)
    ]
    
    return rgb(color);
    
    function rgb(c) {
      return 'rgb(' + c.join(',') + ')';
    }
    
  }
  
  
  function init() {
    
    d.getElementsByTagName('main')[0].appendChild(canvas);
    
    
    
    sizeCanvas();
    initDoodles();
    initStars();
    main(Date.now(), 0);
  }
  
  function initStars() {
    for (let i = 0; i < 100; i++) {
      let
        x = Math.round(Math.random() * 100),
        y = Math.round(Math.random() * 100),
        r = Math.round(Math.random() * 8) + 3,
        v = Math.random() * 0.5 + 0.4,
        d = Math.random() * 0.5 - 1,
        star = new Star();
        
      star.setCoords(x, y);
      star.setRadius(r);
      star.setVelocity(v);
      //star.setDirection(d);
      
      stars.push(star);
    }
  }
  
  function initDoodles() {
    var
      y = [.33, .67],
      x = [.33, .5, .67],
      xt = .05,
      yt = xt * ASPECT,
      doodle = new Sketch();
    
    doodle.setFillBoxCoords([
      [x[0] - xt, y[0] - yt, x[2] + xt, y[0]],
      [x[0] - xt, y[1] + yt, x[2] + xt, y[1]],
      [x[0], y[0], x[0] + xt, y[1]],
      [x[1] - xt/2, y[0], x[1] + xt/2, y[1]],
      [x[2] - xt, y[0], x[2], y[1]]
    ]);
    
    doodle.appendCoords({
      speed  : 2,
      delay  : 1000,
      coords : [
        [x[0] - xt, y[0] - yt],
        [x[0] - xt, y[0]],
        [x[0], y[0]],
        [x[0], y[1]],
        [x[0] - xt, y[1]],
        [x[0] - xt, y[1] + yt],
        [x[2] + xt, y[1] + yt],
        [x[2] + xt, y[1]],
        [x[2], y[1]],
        [x[2], y[0]],
        [x[2] + xt, y[0]],
        [x[2] + xt, y[0] - yt],
        [x[0] - xt, y[0] - yt]
      ]
    });
    
    
    doodle.appendCoords({
      speed  : .95,
      delay  : 1500,
      coords : [
        [x[0] + xt, y[0]],
        [x[0] + xt, y[1]],
        [x[1] - (xt / 2), y[1]],
        [x[1] - (xt / 2), y[0]],
        [x[0] + xt, y[0]]
      ]
    });
    
    
    doodle.appendCoords({
      speed  : 1.2,
      delay  : 2200,
      coords : [
        [x[1] + xt/2, y[0]],
        [x[1] + xt/2, y[1]],
        [x[2] - xt, y[1]],
        [x[2] - xt, y[0]],
        [x[1] + xt/2, y[0]]
      ]
    });
    
    doodle.setCallback(function() {
      var
        duration = 1000,
        t = Date.now();
        
      // Uses the Sketch object's context
      this.update = function() {
        this.setSketchColor(getColorMix([200, 200, 200], [39,87,170], t, duration));
        this.setFillColor(getColorMix([0,18,51], [39,87,170], t, duration));
        
        if (Date.now() > t + duration) {
          this.update = () => {};
        }
      }
        
      
    });
    
    doodles.push(doodle);
  }
  
  function sizeCanvas() {
    var
      x,
      y,
      w,
      h;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (window.innerWidth > ASPECT * window.innerHeight) {
      w = window.innerHeight * ASPECT;
      h = window.innerHeight;
    } else {
      w = window.innerWidth;
      h = window.innerWidth / ASPECT;
    }
    
    x = (canvas.width - w) / 2;
    y = (canvas.height - h) / 2;
    
    // Cache dimensions
    dim = {
      w: w,
      h: h,
      x: x,
      y: y
    }
    
    scale = Math.min(canvas.width/2100, canvas.height/1100);
    
    render();
  }
  
  function main(t, lag) {
    var
      currentTime = Date.now();
      
    lag += currentTime - t;  
    t = currentTime;
    
    while (lag > UPDATE_STEP_MS) {
      update();
      lag -= UPDATE_STEP_MS;
    }
    
    render();
    
    window.requestAnimationFrame(main.bind(null, t, lag));
  }
  
  function update() {
    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
    }
    
    for (let i = 0; i < doodles.length; i++) {
      doodles[i].update();
    }
  }
  
  function render() {
    
    clear();
    
    for (let i = 0; i < stars.length; i++) {
      stars[i].render(ctx);
    }
    
    for (let i = 0; i < doodles.length; i++) {
      doodles[i].render(ctx);
    }
  }
  
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  function mousemove(e) {
    
  }
  
  window.addEventListener('DOMContentLoaded', init);
  window.addEventListener('resize', sizeCanvas);
  window.addEventListener('mousemove', mousemove);
  
})(document);
