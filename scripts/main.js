(function(d) {
  "use strict"
  
  const
    UPDATE_STEP_MS = 10,
    RESIZE_STEP_MS = 100,
    ASPECT = 16/9;
  
  var
    canvas       = d.createElement('canvas'),
    ctx          = canvas.getContext('2d'),
    renderLayer1 = [],
    renderLayer2 = [],
    scale        = 1,
    lastResize   = 0,
    about,
    portfolio;
  
  function Element() {
    var
      loc = {x:0,y:0},
      origin = {x:0,y:0},
      dimensions = {x:0,y:0,w:0,h:0};
      
    this.isMarkedForDeletion = false;
    
    this.setLocation = function(locationX, locationY) {
      loc = {x:locationX, y:locationY};
    }
    
    this.getLocation = function() {
      return loc;
    }
    
    this.setOrigin = function(x, y) {
      origin = {x:x, y:y};
    }
    
    this.getOrigin = function() {
      return origin;
    }
    
    this.setLayerDimensions = function(obj) {
      dimensions = obj;
    }
    
    this.getLayerDimensions = function() {
      return dimensions;
    }
  }
  
  function Hitbox() {
    var
      x = 50,
      y = 50,
      w = 0,
      h = 0,
      action = function() {},
      mouseover = function() {},
      mouseout = function() {},
      isHovering,
      isExecutable = true;
    
    Element.call(this);
    
    this.setCoords = function(coordX, coordY, width, height) {
      x = coordX;
      y = coordY;
      if (width) { w = width; }
      if (height) { h = height; }
    }
    
    this.getCoords = function() {
      return {
        x : x,
        y : y,
        w : w,
        h : h
      };
    }
    
    this.setAction = function(func) {
      action = func.bind(this);
    }
    
    this.setHover = function(func) {
      mouseover = func.bind(this);
    }
    
    this.setMouseout = function(func) {
      mouseout = func.bind(this);
    }
    
    
    this.hover = function(moveX, moveY) {
      if (!isHovering && isWithinBounds(moveX, moveY)) {
        mouseover();
        isHovering = true;
      }
      
      if (isHovering && !isWithinBounds(moveX, moveY)) {
        mouseout();
        isHovering = false;
      }
    }
    
    
    this.execute = function(clickX, clickY) {
      if (isExecutable && isWithinBounds(clickX, clickY)) {
        isExecutable = false;
        action();
      }
    }
    
    function isWithinBounds(testX, testY) {
      if (testX > x && testX < x + w
      && testY > y && testY < y + h) {
        return true;
      }
      
      return false;
    }
    
  }
  
  function Link(ctx) {
    var
      a = 0,
      o = 'rgb(39,87,170)',
      c = 'rgb(255,255,255)',
      s,
      f,
      t = '',
      p = 0,
      align = '',
      baseline = '';
    
    Hitbox.call(this);
    
    function getRealX(x, w, align, layer) {
      var
        realX;
        
      switch(align.toLowerCase()) {
        case 'left':
          realX = layer.x + layer.w * x;
          break;
        case 'right':
          realX = layer.x - w + layer.w * x;
          break;
        case 'center':
        default:
          realX = layer.x - w/2 + layer.w * x;
      }
      
      return realX;
    }
    
    function getRealY(y, h, baseline, layer) {
      var
        realY;
        
      switch(baseline.toLowerCase()) {
         case 'top':
          realY = layer.y + layer.h * y;
          break;
        case 'bottom':
          realY = layer.y - s + layer.h * y;
          break;
        case 'middle':
        default:
          realY = layer.y - s/2 + layer.h * y;
      }
      
      return realY;
    }
    
    function getWidth(ctx, text, font) {
      var
        width = 0;
        
      ctx.save();
      ctx.font = font;
      width = ctx.measureText(text).width;
      ctx.restore();
      
      return width;
    }
    
    this.setAlign = function(textAlign) {
      align = textAlign;
    }
    
    this.setBaseline = function(textBaseline) {
      baseline = textBaseline;
    }
    
    this.setHitboxCoords = function() {
      var
        x,
        y,
        w = getWidth(ctx, t, f),
        origin = this.getOrigin(),
        layer = this.getLayerDimensions();
        
      
      x = getRealX(origin.x, w, align, layer);
      y = getRealY(origin.y, s, baseline, layer);
      
      this.setCoords(x,y,w,s);
    }
    
    this.setFontSize = function(size) {
      s = size;
      f = s + 'px sans-serif';
    }
    
    this.setOutline = function(color) {
      o = color;
    }
    
    this.setColor = function(color) {
      c = color;
    }
    
    this.setText = function(text) {
      var
        coords = this.getCoords();
        
      t = text;
      
      this.setHitboxCoords();
    }
    
    this.update = function() {
      a += .01;
      
      if (a > 1) {
        a = 1;
        this.update = function() {};
      }
    }
    
    this.render = function() {
      var
        x,
        y,
        w = getWidth(ctx, t, f),
        layer = this.getLayerDimensions(),
        origin = this.getOrigin();
      
      ctx.save();
      
      x = getRealX(origin.x, w, align, layer);
      y = getRealY(origin.y, s, baseline, layer);
      
      ctx.translate(x, y);
      
      ctx.globalAlpha = a;
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.lineJoin = 'round';
      ctx.font = f;
      ctx.lineWidth = 6;
      ctx.strokeStyle = o;
      ctx.strokeText(t, 0, 0);
      ctx.lineWidth = 1;
      ctx.fillStyle = c;
      ctx.fillText(t, 0, 0);
      ctx.restore();
    }
    
    // Defaults
    this.setFontSize(26);
  }
  
  function Star(ctx) {
    var
      x,
      y,
      r,
      c = 'white',
      v = 2,
      d = 1;
    
    Element.call(this);
    
    this.setDirection = function(direction) { d = direction; }
    
    this.setVelocity = function(velocity) { v = velocity/20; }
    
    this.setColor = function(color) { c = color; }
    
    this.setRadius = function(radius) { r = radius; }
    
    this.setCoords = function(coordX, coordY) {
      x = coordX/100;
      y = coordY/100;
    }
    
    
    this.update = function() {
      var
        origin = this.getOrigin();
        
      origin.x -= v * UPDATE_STEP_MS / 1000;
      origin.y -= v * d * UPDATE_STEP_MS / 1000;
      
      /*
      if (origin.x < -10 || origin.y < -10
      || origin.x > ctx.canvas.width + 10 || origin.y > ctx.canvas.height + 10) { 
        //this.isMarkedForDeletion = true;
      }
      */
      
      if (origin.x < -.1) {
        origin.x = 1.1;
      }
      
      if (origin.x > 1.1) {
        origin.x = -.1;
      }
      
      if (origin.y < -.1) {
        origin.y = 1.1;
      }
      
      if (origin.y > 1.1) {
        origin.y = -.1;
      }
      
      
      this.setOrigin(origin.x, origin.y);
    }
    
    this.render = function() {
      var
        origin = this.getOrigin();
      
      ctx.save();
      
      ctx.translate(origin.x * ctx.canvas.width, origin.y * ctx.canvas.height);
      
      for (let i = r; i > 0; i -= 2) {
        ctx.beginPath();
        ctx.globalAlpha = (r - i + 1) / (2 * r);
        ctx.arc(0, 0, i * scale, 0, Math.PI * 2, true);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.closePath();
      }
      
      
      ctx.restore();
      
      /*
      ctx.save();
      ctx.strokeStyle = 'white';
      ctx.strokeText(origin.x, 10, 10);
      ctx.restore();
      */
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
      translate = false,
      scale = false,
      rotate = false;
    
    Element.call(this);
    
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
    
    function drawPolygon(opts, dimensions) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < drawCoords.length; i++) {
        
        ctx.moveTo((drawCoords[i][0][0] * dimensions.w), (drawCoords[i][0][1] * dimensions.h));
        for (let j = 1; j < drawCoords[i].length; j++) {
          let
            x = drawCoords[i][j][0] * dimensions.w,
            y = drawCoords[i][j][1] * dimensions.h;
            
          ctx.lineTo(x, y);
        }
      }
      
      if (opts) {
        if (opts.lineWidth) { ctx.lineWidth = opts.lineWidth; }
        if (opts.color) {
          ctx.strokeStyle = opts.color;
          ctx.fillStyle = opts.color;
        }
      }
      
      ctx.globalAlpha = 1;
      (opts && opts.useFill) ? ctx.fill() : ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
    
    this.getSketchFinishTime = function() { return finishedSketching; }
    
    this.getCoords = function() { return coords; }
    
    this.setCallback = function(func) {
      callback = func.bind(this);
    }
    
    this.setSketchColor = function(color) {
      sketchColor = color;
    }
    
    this.setFillColor = function(color) {
      fillColor = color;
    }
    
    this.setFillBoxCoords = function(coordinates) {
      fillBoxCoords = coordinates;
    }
    
    this.setCoords = function(coordinates) {
      for (let i = 0; i < coordinates.length; i++) { 
        this.appendCoords(coordinates[i]);
      }
    }
    
    this.setScale = function(x, y) {
      scale = [x, y];
    }
    
    this.setTranslate = function(x, y) {
      translate = [x, y];
    }
    
    this.setRotate = function(a) {
      rotate = a;
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
        
          coords[i].dist += coords[i].speed * UPDATE_STEP_MS / 1000;
          calculateDrawCoords();
        }
      }
    }
    
    this.render = function(ctx) {
      var
        f = fillBoxCoords,
        origin = this.getOrigin(),
        layer = this.getLayerDimensions();
      
      ctx.save();
      ctx.beginPath();
      
      ctx.translate(layer.x + layer.w/2, layer.y + layer.h/2);
      
      if (translate) {
        ctx.translate(translate[0], translate[1]);
      }
      
      if (rotate) {
        ctx.rotate(rotate);
      }
      
      if (scale) {
        ctx.scale(scale[0], scale[1]);
      }
      
      
      for (let i = 0; i < f.length; i++) {
        let
          x0 = f[i][0] * layer.w,
          x1 = f[i][2] * layer.w,
          y0 = f[i][1] * layer.h,
          y1 = f[i][3] * layer.h;
        
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1, y0);
      }
      
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.closePath();
      
      
      ctx.beginPath();
      drawPolygon({lineWidth:4 * scale, color:sketchColor}, layer);
      ctx.closePath();
      ctx.restore();
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
      Math.round(initColor[0] + ((endColor[0] - initColor[0]) * coef)),
      Math.round(initColor[1] + ((endColor[1] - initColor[1]) * coef)),
      Math.round(initColor[2] + ((endColor[2] - initColor[2]) * coef))
    ]
    
    return rgb(color);
    
    function rgb(c) {
      return 'rgb(' + c.join(',') + ')';
    }
    
  }
  
  function initAbout() {
    console.log('initAbout');
  }
  
  
  function init() {
    
    d.getElementsByTagName('main')[0].appendChild(canvas);
    
    initDoodles();
    initStars();
    resize();
    main(Date.now(), 0);
  }
  
  function initLinks() {
    about = new Link(ctx);
    about.setBaseline('top');
    about.setAlign('left');
    about.setOrigin(.26, .8);
    about.setText('About Me');
    about.setAction(initAbout);
    about.setHover(function() {
      this.setOutline('red');
    });
    about.setMouseout(function() {
      this.setOutline('green');
    });
    
    portfolio = new Link(ctx);
    portfolio.setBaseline('top');
    portfolio.setAlign('right');
    portfolio.setOrigin(.74, .8);
    portfolio.setText('Portfolio');
    portfolio.setAction(initAbout);
    portfolio.setHover(function() {
      this.setOutline('orange');
    });
    portfolio.setMouseout(function() {
      this.setOutline('purple');
    });
  }
  
  function initStars() {
    for (let i = 0; i < 100; i++) {
      let
        star = createStar();
      
      renderLayer2.push(star);
    }
  }
  
  function createStar(posX, posY) {
    let
      x = posX || Math.random() * 1.2 - .1,
      y = posY || Math.random() * 1.2 - .1,
      r = Math.round(Math.random() * 8) + 3,
      v = Math.random() * 4 + 1,
      d = Math.random() * 0.5 - 1,
      star = new Star(ctx);
        
      star.setOrigin(x, y);
      star.setLocation(x, y);
      star.setRadius(r);
      star.setVelocity(v / 10);
    
    return star;
  }
  
  function initDoodles() {
    var
      //y = [.33, .67],
      //x = [.33, .5, .67],
      y = [-0.17,  0.17],
      x = [-0.17, 0, 0.17],
      xt = .05,
      yt = xt * ASPECT,
      doodle = new Sketch();
    
    doodle.setFillBoxCoords([
      [x[0] - xt, y[0] - yt, x[2] + xt, y[0]],
      [x[0] - xt, y[1], x[2] + xt, y[1] + yt],
      [x[0], y[0] - yt, x[0] + xt, y[1] + yt],
      [x[1] - xt/2, y[0] - yt, x[1] + xt/2, y[1] + yt],
      [x[2] - xt, y[0] - yt, x[2], y[1] + yt]
    ]);
    
    // Outer trace
    doodle.appendCoords({
      speed  : .81,
      delay  : 500,
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
    
    // Left inner trace
    doodle.appendCoords({
      speed  : .38,
      delay  : 800,
      coords : [
        [x[0] + xt, y[0]],
        [x[0] + xt, y[1]],
        [x[1] - (xt / 2), y[1]],
        [x[1] - (xt / 2), y[0]],
        [x[0] + xt, y[0]]
      ]
    });
    
    // Right inner trace
    doodle.appendCoords({
      speed  : .7,
      delay  : 1800,
      coords : [
        [x[1] + xt/2, y[0]],
        [x[1] + xt/2, y[1]],
        [x[2] - xt, y[1]],
        [x[2] - xt, y[0]],
        [x[1] + xt/2, y[0]]
      ]
    });
    
    
    doodle.setLocation(.5, .45);
    //doodle.setOrigin(dim.x + dim.w * .5, dim.y + dim.h * .45);
    
    doodle.setCallback(function() {
      var
        scale,
        duration = 1000,
        t = Date.now();
      
      // Uses the Sketch object's context
      this.update = function() {
        
        // Fade in effect
        this.setSketchColor(getColorMix([200, 200, 200], [39,87,170], t, duration));
        this.setFillColor(getColorMix([0,18,51], [39,87,170], t, duration));
        
        
        if (Date.now() > t + duration) {
          t = Date.now();
          this.update = function() {
            
            // Grow effect
            duration = 700;
            scale = 1;
            scale += .1 * Math.sin((Math.PI / 2) * (Date.now() - t) / duration);
            this.setScale(scale, scale);
            
            if (Date.now() > t + duration) {
              // Finished animating
              this.update = function() {};
              initLinks();
              resize();
              renderLayer1.push(about);
              renderLayer1.push(portfolio);
            }
          }
        }
      }
    });
    
    renderLayer1.push(doodle);
  }
  
  function createActionLinks() {
    
  }
  
  function resize() {
    var
      x,
      y,
      w,
      h,
      t = Date.now(),
      dim;
    
    if (t < lastResize + RESIZE_STEP_MS) { return; }
    
    lastResize = t;
    
    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    scale = Math.min(canvas.width/2100, canvas.height/1100);
    
    // Calculate layer1 drawing space dimensions
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
    
    renderLayer1.forEach(function(object) {
      object.setLayerDimensions(dim);
    });
    
    if (about) {
      about.setLayerDimensions(dim);
      about.setFontSize(Math.max(Math.round(56 * scale), 11));
      about.setHitboxCoords();
    }
    
    if (portfolio) {
      portfolio.setLayerDimensions(dim);
      portfolio.setFontSize(Math.max(Math.round(56 * scale), 11));
      portfolio.setHitboxCoords();
    }
    
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
    renderLayer1.forEach(function(object, ind) {
      object.update();
      
      if (object.isMarkedForDeletion) {
        renderLayer1.splice(ind, 1);
      }
    });
    
    renderLayer2.forEach(function(object, ind) {
      object.update();
      
      if (object.isMarkedForDeletion) {
        //renderLayer2.splice(ind, 1);
      }
    });
  }
  
  function render() {
    
    clear();
    renderLayer2.forEach(function(object) {
      object.render(ctx);
    });
    renderLayer1.forEach(function(object) {
      object.render(ctx);
    });
  }
  
  function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  function mousemove(e) {
    var
      x = e.clientX,
      y = e.clientY;
      
    if (about) { about.hover(x, y); }
    if (portfolio) { portfolio.hover(x, y); }
  }
  
  function click(e) {
    var
      x = e.clientX,
      y = e.clientY;
      
    if (about) { about.execute(x, y); }
    if (portfolio) { portfolio.execute(x, y); }
  }
  
  window.addEventListener('DOMContentLoaded', init);
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('click', click);
  
})(document);
