// ============================================
// SELF-DESTRUCT MINI-GAME
// ============================================
(function () {
  'use strict';

  // ── ASCII Art ──────────────────────────────
  const EYES_OPEN = [
    '    @@@@@@@@@@@@@@           @@@@@@@@@@@@@@    ',
    '   @              @       @              @   ',
    '  @    ########    @     @    ########    @  ',
    '  @   ##@@@@@@##   @     @   ##@@@@@@##   @  ',
    '  @   #@      @#   @     @   #@      @#   @  ',
    '  @   #@  00  @#   @     @   #@  00  @#   @  ',
    '  @   #@      @#   @     @   #@      @#   @  ',
    '  @   ##@@@@@@##   @     @   ##@@@@@@##   @  ',
    '  @    ########    @     @    ########    @  ',
    '   @              @       @              @   ',
    '    @@@@@@@@@@@@@@           @@@@@@@@@@@@@@    ',
  ].join('\n');

  const EYES_CLOSED = [
    '                                               ',
    '                                               ',
    '                                               ',
    '    ______________           ______________    ',
    '   /              \\       /              \\   ',
    '   \\______________/       \\______________/   ',
    '                                               ',
    '                                               ',
    '                                               ',
    '                                               ',
    '                                               ',
  ].join('\n');

  const WIN_ART = [
    ' __        __ ___  _   _  _ ',
    ' \\ \\      / /|_ _|| \\ | || |',
    '  \\ \\ /\\ / /  | | |  \\| || |',
    '   \\ V  V /   | | | |\\  ||_|',
    '    \\_/\\_/   |___||_| \\_|(_)',
  ].join('\n');

  const PANIC_LINES = [
    'KERNEL PANIC - NOT SYNCING: FATAL EXCEPTION IN self_destruct.exe',
    '',
    'CPU: 0 PID: 1337 Comm: portfolio_daemon Not tainted 6.6.6-custom',
    'Hardware name: Joseph Decossard Portfolio Machine',
    '',
    'Call Trace:',
    ' [<0xdeadbeef>] explode_everything+0x42/0x100',
    ' [<0xcafebabe>] handle_chaos+0x13/0x37',
    ' [<0x1337c0de>] obliterate_css+0x88/0xff',
    ' [<0xbaadf00d>] nuke_from_orbit+0x01/0x01',
    ' [<0x0d15ea5e>] panic+0x00/0x2a',
    '',
    'Modules linked in: bad_decisions.ko overconfidence.ko hubris.so',
    '',
    'Kernel Offset: 0x0 from 0xffffffff81000000',
    '---[ end Kernel panic - not syncing: Fatal exception ]---',
  ];

  const JK_LINES = [
    '',
    '... just kidding.',
    "you can't break this portfolio that easily.",
    '',
    '[system restored]',
  ];

  // ── Obstacle pool ─────────────────────────
  const OBSTACLE_CHARS = ['0', '1', '{', '}', '<', '>', '#', '@'];
  const POOL_SIZE = 80;

  function createPool(size) {
    var pool = [];
    for (var i = 0; i < (size || POOL_SIZE); i++) {
      pool.push({ x: 0, y: 0, char: '0', active: false, speed: 0, w: 0, h: 0, dx: 0 });
    }
    return pool;
  }

  // ── Game registry ─────────────────────────
  var GAMES = [gameDodge, gameSnake, gameMemory, gameTyping];

  // ── Main entry point ──────────────────────
  window.launchSelfDestruct = function (overlay, linesContainer, cursor, btnRow) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion fallback — keep original shake behavior
    if (prefersReducedMotion) {
      if (overlay.classList.contains('boot-shaking')) return;
      overlay.classList.add('boot-shaking');
      var lines = linesContainer.querySelectorAll('.boot-line');
      lines.forEach(function (l) { l.style.opacity = Math.random() > 0.5 ? '0.2' : '1'; });
      setTimeout(function () {
        lines.forEach(function (l) { l.style.opacity = '1'; });
        overlay.classList.remove('boot-shaking');
        var errLine = document.createElement('div');
        errLine.className = 'boot-line visible';
        errLine.style.color = '#ff4444';
        errLine.textContent = '[FATAL] self_destruct failed ... nice try.';
        linesContainer.appendChild(errLine);
      }, 600);
      return;
    }

    // Game rotation
    var lastIndex = parseInt(sessionStorage.getItem('jd_sd_game_index') || '-1', 10);
    var nextIndex = (lastIndex + 1) % GAMES.length;
    sessionStorage.setItem('jd_sd_game_index', String(nextIndex));

    // Hide boot content
    linesContainer.style.display = 'none';
    cursor.style.display = 'none';
    btnRow.style.display = 'none';

    // Create game container
    var container = document.createElement('div');
    container.id = 'sd-game-container';
    overlay.appendChild(container);

    // Cleanup helper
    var cleanupFns = [];
    function addListener(el, evt, fn, opts) {
      el.addEventListener(evt, fn, opts);
      cleanupFns.push(function () { el.removeEventListener(evt, fn, opts); });
    }

    function cleanup() {
      cleanupFns.forEach(function (fn) { fn(); });
      cleanupFns.length = 0;
      if (container.parentNode) container.parentNode.removeChild(container);
    }

    function restoreButtons() {
      cleanup();
      linesContainer.style.display = '';
      cursor.style.display = 'none';
      btnRow.style.display = '';

      var oldErrors = linesContainer.querySelectorAll('.boot-line');
      oldErrors.forEach(function (l) {
        if (l.style.color === 'rgb(255, 68, 68)' || l.style.color === '#ff4444') {
          l.remove();
        }
      });
    }

    // ── Phase 1: Blinking Eyes ────────────
    function phase1() {
      var pre = document.createElement('pre');
      pre.className = 'sd-eyes-pre';
      pre.setAttribute('aria-label', 'ASCII eyes animation');
      pre.textContent = EYES_OPEN;
      container.appendChild(pre);

      // Stare green for 1.5s
      setTimeout(function () {
        // Blink 1
        pre.textContent = EYES_CLOSED;
        setTimeout(function () {
          pre.textContent = EYES_OPEN;
          // Blink 2 after 600ms
          setTimeout(function () {
            pre.textContent = EYES_CLOSED;
            setTimeout(function () {
              pre.textContent = EYES_OPEN;
              // Color shift green → red
              pre.classList.add('sd-eyes-red');
              // Red stare for 1s then show warning
              setTimeout(function () {
                var warning = document.createElement('div');
                warning.className = 'sd-skull-warning';
                warning.textContent = '[ SELF-DESTRUCT INITIATED ]';
                container.appendChild(warning);
                setTimeout(function () {
                  phase2();
                }, 1000);
              }, 1000);
            }, 150);
          }, 600);
        }, 150);
      }, 1500);
    }

    // ── Phase 2: Launch selected game ─────
    function phase2() {
      container.innerHTML = '';
      var dims = {
        get cw() { return overlay.clientWidth; },
        get ch() { return overlay.clientHeight; }
      };
      GAMES[nextIndex](container, addListener, dims, overlay, triggerWin, triggerLose);
    }

    // ── Phase 3a: Lose — Kernel Panic ────
    function triggerLose() {
      container.innerHTML = '';

      var flash = document.createElement('div');
      flash.className = 'sd-flash sd-flash--white';
      container.appendChild(flash);

      setTimeout(function () {
        container.innerHTML = '';
        var bsod = document.createElement('div');
        bsod.className = 'sd-bsod';
        var textEl = document.createElement('div');
        textEl.className = 'sd-bsod-text';
        bsod.appendChild(textEl);
        container.appendChild(bsod);

        var allText = PANIC_LINES.join('\n');
        var ti = 0;
        var charsPerTick = 3;
        function typeChar() {
          if (ti >= allText.length) {
            setTimeout(function () {
              bsod.classList.add('sd-glitch');
              setTimeout(function () {
                bsod.classList.remove('sd-glitch');
                var jk = document.createElement('div');
                jk.className = 'sd-bsod-jk';
                jk.textContent = JK_LINES.join('\n');
                bsod.appendChild(jk);
                setTimeout(restoreButtons, 2500);
              }, 900);
            }, 1500);
            return;
          }
          var end = Math.min(ti + charsPerTick, allText.length);
          textEl.textContent += allText.slice(ti, end);
          ti = end;
          setTimeout(typeChar, 15);
        }
        typeChar();
      }, 150);
    }

    // ── Phase 3b: Win ────────────────────
    function triggerWin() {
      container.innerHTML = '';

      var flash = document.createElement('div');
      flash.className = 'sd-flash sd-flash--green';
      container.appendChild(flash);

      setTimeout(function () {
        container.innerHTML = '';
        var win = document.createElement('div');
        win.className = 'sd-win';

        var art = document.createElement('pre');
        art.className = 'sd-win-text';
        art.textContent = WIN_ART;

        var msg = document.createElement('div');
        msg.className = 'sd-win-msg';
        msg.textContent = 'Self-destruct survived. System integrity: 100%';

        win.appendChild(art);
        win.appendChild(msg);
        container.appendChild(win);

        setTimeout(restoreButtons, 3500);
      }, 150);
    }

    // Start Phase 1
    phase1();
  };

  // ═══════════════════════════════════════════
  // GAME 1: DODGE
  // ═══════════════════════════════════════════
  function gameDodge(container, addListener, dims, overlay, triggerWin, triggerLose) {
    var canvas = document.createElement('canvas');
    canvas.className = 'sd-game-canvas';
    var cw = dims.cw;
    var ch = dims.ch;
    canvas.width = cw;
    canvas.height = ch;
    container.appendChild(canvas);
    var gctx = canvas.getContext('2d');

    // HUD
    var hud = document.createElement('div');
    hud.className = 'sd-hud';
    var statusEl = document.createElement('span');
    statusEl.className = 'sd-status';
    statusEl.textContent = 'STATUS: CRITICAL';
    var countdownEl = document.createElement('span');
    countdownEl.className = 'sd-countdown';
    var scoreEl = document.createElement('span');
    scoreEl.className = 'sd-score';
    scoreEl.textContent = '';
    hud.appendChild(statusEl);
    hud.appendChild(countdownEl);
    hud.appendChild(scoreEl);
    container.appendChild(hud);

    // Game state
    var GAME_DURATION = 30;
    var pool = createPool(POOL_SIZE);
    var playerW = 36;
    var playerH = 20;
    var playerX = cw / 2 - playerW / 2;
    var playerY = ch - 50;
    var running = true;
    var startTime = performance.now();
    var lastSpawn = 0;
    var prevTimestamp = 0;

    // Harder spawn parameters
    function getSpawnInterval(elapsed) {
      return 400 - (320 * Math.min(elapsed / (GAME_DURATION * 1000), 1));
    }
    function getFallSpeed(elapsed) {
      return 240 + 310 * Math.min(elapsed / (GAME_DURATION * 1000), 1);
    }
    function getMultiSpawn(elapsed) {
      var sec = elapsed / 1000;
      if (sec >= 20) return Math.floor(Math.random() * 3) + 1;
      if (sec >= 10) return Math.floor(Math.random() * 2) + 1;
      return 1;
    }

    // Input
    var keys = {};
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    }
    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    }
    addListener(document, 'keydown', onKeyDown);
    addListener(document, 'keyup', onKeyUp);

    // Touch controls
    var touchActive = false;
    function onTouchMove(e) {
      if (!running) return;
      var touch = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      playerX = (touch.clientX - rect.left) - playerW / 2;
      touchActive = true;
    }
    function onTouchEnd() { touchActive = false; }
    addListener(canvas, 'touchmove', onTouchMove, { passive: true });
    addListener(canvas, 'touchend', onTouchEnd, { passive: true });

    // Tab visibility
    function onVisibility() {
      if (document.hidden && running) {
        running = false;
        triggerLose();
      }
    }
    addListener(document, 'visibilitychange', onVisibility);

    // Spawn obstacle
    function spawnObstacle() {
      for (var i = 0; i < pool.length; i++) {
        if (!pool[i].active) {
          var o = pool[i];
          o.char = OBSTACLE_CHARS[Math.floor(Math.random() * OBSTACLE_CHARS.length)];
          o.w = 16;
          o.h = 20;
          o.x = Math.random() * (cw - o.w);
          o.y = -o.h;
          o.active = true;
          o.speed = 0;
          o.dx = (Math.random() - 0.5) * 60; // horizontal drift ±30 px/s
          return;
        }
      }
    }

    // AABB collision
    function collides(ox, oy, ow, oh) {
      var shrink = 4;
      return (
        playerX + shrink < ox + ow &&
        playerX + playerW - shrink > ox &&
        playerY + shrink < oy + oh &&
        playerY + playerH - shrink > oy
      );
    }

    // Resize
    function onResize() {
      cw = dims.cw;
      ch = dims.ch;
      canvas.width = cw;
      canvas.height = ch;
      playerY = ch - 50;
      if (playerX > cw - playerW) playerX = cw - playerW;
    }
    addListener(window, 'resize', onResize);

    // Game loop
    function gameLoop(timestamp) {
      if (!running) return;

      if (!prevTimestamp) prevTimestamp = timestamp;
      var dt = (timestamp - prevTimestamp) / 1000;
      prevTimestamp = timestamp;
      if (dt > 0.1) dt = 0.1;

      var elapsed = timestamp - startTime;
      var remaining = Math.max(0, GAME_DURATION - elapsed / 1000);
      countdownEl.textContent = remaining.toFixed(1) + 's';

      if (remaining <= 0) {
        running = false;
        triggerWin();
        return;
      }

      // Player movement
      var moveSpeed = 350;
      if (keys.left) playerX -= moveSpeed * dt;
      if (keys.right) playerX += moveSpeed * dt;
      if (playerX < 0) playerX = 0;
      if (playerX > cw - playerW) playerX = cw - playerW;

      // Spawn (multi-spawn)
      var spawnInterval = getSpawnInterval(elapsed);
      if (elapsed - lastSpawn > spawnInterval) {
        var count = getMultiSpawn(elapsed);
        for (var s = 0; s < count; s++) spawnObstacle();
        lastSpawn = elapsed;
      }

      // Update obstacles
      var fallSpeed = getFallSpeed(elapsed);
      for (var i = 0; i < pool.length; i++) {
        var o = pool[i];
        if (!o.active) continue;
        o.y += fallSpeed * dt;
        o.x += o.dx * dt;
        // Bounce off walls
        if (o.x < 0) { o.x = 0; o.dx = Math.abs(o.dx); }
        if (o.x > cw - o.w) { o.x = cw - o.w; o.dx = -Math.abs(o.dx); }
        if (o.y > ch) {
          o.active = false;
          continue;
        }
        if (collides(o.x, o.y, o.w, o.h)) {
          running = false;
          triggerLose();
          return;
        }
      }

      // Draw
      gctx.clearRect(0, 0, cw, ch);
      gctx.font = '16px "JetBrains Mono", monospace';
      gctx.fillStyle = '#39ff14';
      gctx.shadowColor = 'rgba(57,255,20,0.4)';
      gctx.shadowBlur = 4;
      for (var j = 0; j < pool.length; j++) {
        if (pool[j].active) {
          gctx.fillText(pool[j].char, pool[j].x, pool[j].y + pool[j].h);
        }
      }

      gctx.shadowColor = 'rgba(245,166,35,0.5)';
      gctx.shadowBlur = 6;
      gctx.fillStyle = '#f5a623';
      gctx.font = 'bold 18px "JetBrains Mono", monospace';
      gctx.fillText('[^]', playerX, playerY + playerH);
      gctx.shadowBlur = 0;

      requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
  }

  // ═══════════════════════════════════════════
  // GAME 2: SNAKE
  // ═══════════════════════════════════════════
  function gameSnake(container, addListener, dims, overlay, triggerWin, triggerLose) {
    var CELL = 30;
    var WIN_LENGTH = 12;
    var canvas = document.createElement('canvas');
    canvas.className = 'sd-game-canvas';
    var cw = dims.cw;
    var ch = dims.ch;
    // Snap to grid
    var cols = Math.floor(cw / CELL);
    var rows = Math.floor(ch / CELL);
    canvas.width = cols * CELL;
    canvas.height = rows * CELL;
    container.appendChild(canvas);
    var gctx = canvas.getContext('2d');

    // HUD
    var hud = document.createElement('div');
    hud.className = 'sd-hud';
    var statusEl = document.createElement('span');
    statusEl.className = 'sd-status';
    statusEl.textContent = 'STATUS: CRITICAL';
    var countdownEl = document.createElement('span');
    countdownEl.className = 'sd-countdown';
    countdownEl.textContent = 'SNAKE';
    var scoreEl = document.createElement('span');
    scoreEl.className = 'sd-score';
    scoreEl.textContent = 'LENGTH: 3/' + WIN_LENGTH;
    hud.appendChild(statusEl);
    hud.appendChild(countdownEl);
    hud.appendChild(scoreEl);
    container.appendChild(hud);

    // Snake state
    var snake = [
      { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
      { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
      { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
    ];
    var direction = { x: 1, y: 0 };
    var nextDirection = { x: 1, y: 0 };
    var running = true;
    var tickInterval = 170;
    var tickTimer = null;
    var obstacles = [];

    function spawnFood() {
      var fx, fy, collision;
      do {
        fx = Math.floor(Math.random() * cols);
        fy = Math.floor(Math.random() * rows);
        collision = false;
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === fx && snake[i].y === fy) { collision = true; break; }
        }
        if (!collision) {
          for (var j = 0; j < obstacles.length; j++) {
            if (obstacles[j].x === fx && obstacles[j].y === fy) { collision = true; break; }
          }
        }
      } while (collision);
      return { x: fx, y: fy, char: Math.random() > 0.5 ? '0' : '1' };
    }

    // Generate grid obstacles (~3% of cells)
    var obstacleCount = Math.floor((cols * rows) * 0.025);
    var centerX = Math.floor(cols / 2);
    var centerY = Math.floor(rows / 2);
    for (var oi = 0; oi < obstacleCount; oi++) {
      var ox, oy, valid;
      do {
        ox = Math.floor(Math.random() * cols);
        oy = Math.floor(Math.random() * rows);
        valid = true;
        // Avoid snake starting area (center ± 3)
        if (Math.abs(ox - centerX) <= 3 && oy === centerY) valid = false;
        // Avoid duplicate obstacle positions
        for (var oj = 0; oj < obstacles.length; oj++) {
          if (obstacles[oj].x === ox && obstacles[oj].y === oy) { valid = false; break; }
        }
      } while (!valid);
      obstacles.push({ x: ox, y: oy });
    }

    var food = spawnFood();

    // Space boost
    var spaceHeld = false;

    // Input — keyboard
    function onKeyDown(e) {
      if (!running) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown': case 's': case 'S':
          if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
          break;
        case ' ':
          spaceHeld = true;
          statusEl.textContent = 'STATUS: BOOST';
          statusEl.style.color = '#f5a623';
          break;
      }
    }
    function onKeyUp(e) {
      if (e.key === ' ') {
        spaceHeld = false;
        statusEl.textContent = 'STATUS: CRITICAL';
        statusEl.style.color = '';
      }
    }
    addListener(document, 'keydown', onKeyDown);
    addListener(document, 'keyup', onKeyUp);

    // Input — swipe (mobile)
    var touchStartX = 0, touchStartY = 0;
    function onTouchStart(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
      if (!running) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
        else if (dx < 0 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
      } else {
        if (dy > 0 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
        else if (dy < 0 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
      }
    }
    addListener(canvas, 'touchstart', onTouchStart, { passive: true });
    addListener(canvas, 'touchend', onTouchEnd, { passive: true });

    // Tab visibility
    function onVisibility() {
      if (document.hidden && running) {
        running = false;
        clearTimeout(tickTimer);
        triggerLose();
      }
    }
    addListener(document, 'visibilitychange', onVisibility);

    // Resize
    function onResize() {
      cw = dims.cw;
      ch = dims.ch;
      cols = Math.floor(cw / CELL);
      rows = Math.floor(ch / CELL);
      canvas.width = cols * CELL;
      canvas.height = rows * CELL;
    }
    addListener(window, 'resize', onResize);

    function draw() {
      gctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw obstacles
      gctx.font = 'bold 24px "JetBrains Mono", monospace';
      gctx.fillStyle = '#882288';
      gctx.shadowColor = 'rgba(136,34,136,0.5)';
      gctx.shadowBlur = 4;
      for (var oi = 0; oi < obstacles.length; oi++) {
        gctx.fillText('#', obstacles[oi].x * CELL + 5, obstacles[oi].y * CELL + 23);
      }
      gctx.shadowBlur = 0;

      // Draw food with glow
      gctx.font = 'bold 24px "JetBrains Mono", monospace';
      gctx.fillStyle = '#ff4444';
      gctx.shadowColor = 'rgba(255,68,68,0.7)';
      gctx.shadowBlur = 8;
      gctx.fillText(food.char, food.x * CELL + 5, food.y * CELL + 23);
      gctx.shadowBlur = 0;

      // Draw snake
      for (var i = 0; i < snake.length; i++) {
        var seg = snake[i];
        if (i === 0) {
          // Head
          gctx.fillStyle = '#f5a623';
          gctx.shadowColor = 'rgba(245,166,35,0.5)';
          gctx.shadowBlur = 6;
          gctx.font = 'bold 24px "JetBrains Mono", monospace';
          gctx.fillText('@', seg.x * CELL + 5, seg.y * CELL + 23);
          gctx.shadowBlur = 0;
        } else {
          gctx.fillStyle = '#39ff14';
          gctx.shadowColor = 'rgba(57,255,20,0.3)';
          gctx.shadowBlur = 3;
          gctx.font = '20px "JetBrains Mono", monospace';
          gctx.fillText(i % 2 === 0 ? '0' : '1', seg.x * CELL + 7, seg.y * CELL + 23);
          gctx.shadowBlur = 0;
        }
      }
    }

    function tick() {
      if (!running) return;

      direction = nextDirection;
      var head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      // Wall collision
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        running = false;
        triggerLose();
        return;
      }
      // Self collision
      for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          running = false;
          triggerLose();
          return;
        }
      }
      // Obstacle collision
      for (var oi = 0; oi < obstacles.length; oi++) {
        if (obstacles[oi].x === head.x && obstacles[oi].y === head.y) {
          running = false;
          triggerLose();
          return;
        }
      }

      snake.unshift(head);

      // Eat food?
      if (head.x === food.x && head.y === food.y) {
        // Grow (don't pop tail)
        food = spawnFood();
        scoreEl.textContent = 'LENGTH: ' + snake.length + '/' + WIN_LENGTH;
        // Speed up
        tickInterval = Math.max(80, tickInterval - 5);
        // Win?
        if (snake.length >= WIN_LENGTH) {
          running = false;
          triggerWin();
          return;
        }
      } else {
        snake.pop();
      }

      draw();
      var nextTick = spaceHeld ? Math.max(30, tickInterval * 0.4) : tickInterval;
      tickTimer = setTimeout(tick, nextTick);
    }

    draw();
    tickTimer = setTimeout(tick, tickInterval);
  }

  // ═══════════════════════════════════════════
  // GAME 3: MEMORY MATCH
  // ═══════════════════════════════════════════
  function gameMemory(container, addListener, dims, overlay, triggerWin, triggerLose) {
    var PAIRS = 8;
    var TOTAL = PAIRS * 2;
    var TIME_LIMIT = 90;
    var patterns = ['0110', '1001', '1010', '0101', '1100', '0011', '1111', '0000'];
    var running = true;

    // Build pair array
    var cards = [];
    for (var p = 0; p < PAIRS; p++) {
      cards.push(patterns[p], patterns[p]);
    }
    // Fisher-Yates shuffle
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = cards[i];
      cards[i] = cards[j];
      cards[j] = tmp;
    }

    // HUD
    var hud = document.createElement('div');
    hud.className = 'sd-hud';
    var statusEl = document.createElement('span');
    statusEl.className = 'sd-status';
    statusEl.textContent = 'STATUS: CRITICAL';
    var countdownEl = document.createElement('span');
    countdownEl.className = 'sd-countdown';
    var scoreEl = document.createElement('span');
    scoreEl.className = 'sd-score';
    scoreEl.textContent = 'MATCHED: 0/' + PAIRS;
    hud.appendChild(statusEl);
    hud.appendChild(countdownEl);
    hud.appendChild(scoreEl);
    container.appendChild(hud);

    // Grid
    var grid = document.createElement('div');
    grid.className = 'sd-memory-grid';
    container.appendChild(grid);

    var cardEls = [];
    var flipped = [];
    var matched = 0;
    var lockBoard = false;

    for (var c = 0; c < TOTAL; c++) {
      var card = document.createElement('div');
      card.className = 'sd-memory-card';
      card.dataset.idx = c;

      var inner = document.createElement('div');
      inner.className = 'sd-memory-card-inner';

      var front = document.createElement('div');
      front.className = 'sd-memory-card-front';
      front.textContent = '[ ? ]';

      var back = document.createElement('div');
      back.className = 'sd-memory-card-back';
      back.textContent = cards[c];

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      grid.appendChild(card);
      cardEls.push(card);

      (function (idx) {
        addListener(card, 'click', function () {
          if (!running || lockBoard) return;
          if (cardEls[idx].classList.contains('flipped')) return;
          if (cardEls[idx].classList.contains('sd-memory-matched')) return;

          cardEls[idx].classList.add('flipped');
          flipped.push(idx);

          if (flipped.length === 2) {
            lockBoard = true;
            var a = flipped[0], b = flipped[1];
            if (cards[a] === cards[b]) {
              // Match!
              cardEls[a].classList.add('sd-memory-matched');
              cardEls[b].classList.add('sd-memory-matched');
              matched++;
              scoreEl.textContent = 'MATCHED: ' + matched + '/' + PAIRS;
              flipped = [];
              lockBoard = false;
              if (matched >= PAIRS) {
                running = false;
                clearInterval(timerInterval);
                triggerWin();
              }
            } else {
              // Mismatch — flip back after 800ms
              setTimeout(function () {
                if (!running) return;
                cardEls[a].classList.remove('flipped');
                cardEls[b].classList.remove('flipped');
                flipped = [];
                lockBoard = false;
              }, 800);
            }
          }
        });
      })(c);
    }

    // Timer
    var timeLeft = TIME_LIMIT;
    countdownEl.textContent = timeLeft + 's';
    var timerInterval = setInterval(function () {
      if (!running) { clearInterval(timerInterval); return; }
      timeLeft--;
      countdownEl.textContent = timeLeft + 's';
      if (timeLeft <= 0) {
        running = false;
        clearInterval(timerInterval);
        triggerLose();
      }
    }, 1000);

    // Tab visibility
    function onVisibility() {
      if (document.hidden && running) {
        running = false;
        clearInterval(timerInterval);
        triggerLose();
      }
    }
    addListener(document, 'visibilitychange', onVisibility);
  }

  // ═══════════════════════════════════════════
  // GAME 4: TYPING CHALLENGE
  // ═══════════════════════════════════════════
  function gameTyping(container, addListener, dims, overlay, triggerWin, triggerLose) {
    var SEQUENCES = [
      '0xDEADBEEF',
      'sudo rm -rf /',
      'kill -9 1337',
      '10110011',
      'DELETE FROM *',
      'chmod 777 /',
      ':(){ :|:& };:',
      '0xCAFEBABE',
      'import chaos',
      'while(true){}'
    ];
    var TIME_LIMIT = 60;
    var running = true;
    var currentSeq = 0;
    var charIndex = 0;

    // HUD
    var hud = document.createElement('div');
    hud.className = 'sd-hud';
    var statusEl = document.createElement('span');
    statusEl.className = 'sd-status';
    statusEl.textContent = 'STATUS: CRITICAL';
    var countdownEl = document.createElement('span');
    countdownEl.className = 'sd-countdown';
    var scoreEl = document.createElement('span');
    scoreEl.className = 'sd-score';
    scoreEl.textContent = '0/' + SEQUENCES.length;
    hud.appendChild(statusEl);
    hud.appendChild(countdownEl);
    hud.appendChild(scoreEl);
    container.appendChild(hud);

    // Typing area
    var area = document.createElement('div');
    area.className = 'sd-typing-area';
    container.appendChild(area);

    var doneEl = document.createElement('div');
    doneEl.className = 'sd-typing-done';
    area.appendChild(doneEl);

    var targetEl = document.createElement('div');
    targetEl.className = 'sd-typing-target';
    area.appendChild(targetEl);

    // Hidden input for mobile
    var hiddenInput = document.createElement('input');
    hiddenInput.className = 'sd-typing-hidden-input';
    hiddenInput.setAttribute('autocomplete', 'off');
    hiddenInput.setAttribute('autocorrect', 'off');
    hiddenInput.setAttribute('autocapitalize', 'off');
    hiddenInput.setAttribute('spellcheck', 'false');
    hiddenInput.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
    container.appendChild(hiddenInput);

    function renderTarget() {
      targetEl.innerHTML = '';
      var seq = SEQUENCES[currentSeq];
      for (var i = 0; i < seq.length; i++) {
        var span = document.createElement('span');
        span.textContent = seq[i];
        if (i < charIndex) {
          span.className = 'sd-typing-correct';
        } else if (i === charIndex) {
          span.className = 'sd-typing-cursor';
        }
        targetEl.appendChild(span);
      }
    }

    function advanceChar() {
      charIndex++;
      var seq = SEQUENCES[currentSeq];
      if (charIndex >= seq.length) {
        // Sequence complete
        var done = document.createElement('div');
        done.textContent = seq;
        done.style.opacity = '0.3';
        doneEl.appendChild(done);
        currentSeq++;
        charIndex = 0;
        scoreEl.textContent = currentSeq + '/' + SEQUENCES.length;
        if (currentSeq >= SEQUENCES.length) {
          running = false;
          clearInterval(timerInterval);
          triggerWin();
          return;
        }
      }
      renderTarget();
    }

    function flashError() {
      var spans = targetEl.querySelectorAll('span');
      if (spans[charIndex]) {
        spans[charIndex].classList.add('sd-typing-error');
        setTimeout(function () {
          if (spans[charIndex]) spans[charIndex].classList.remove('sd-typing-error');
        }, 200);
      }
    }

    // Desktop keyboard input
    function onKeyDown(e) {
      if (!running) return;
      if (e.key.length !== 1 && e.key !== ' ') return;
      var expected = SEQUENCES[currentSeq][charIndex];
      if (e.key === expected) {
        advanceChar();
      } else {
        flashError();
      }
    }
    addListener(document, 'keydown', onKeyDown);

    // Mobile input via hidden field
    function onInput() {
      if (!running) return;
      var val = hiddenInput.value;
      if (val.length > 0) {
        var lastChar = val[val.length - 1];
        var expected = SEQUENCES[currentSeq][charIndex];
        hiddenInput.value = '';
        if (lastChar === expected) {
          advanceChar();
        } else {
          flashError();
        }
      }
    }
    addListener(hiddenInput, 'input', onInput);

    // Focus hidden input on touch
    addListener(container, 'click', function () {
      hiddenInput.focus();
    });

    // Timer
    var timeLeft = TIME_LIMIT;
    countdownEl.textContent = timeLeft + 's';
    var timerInterval = setInterval(function () {
      if (!running) { clearInterval(timerInterval); return; }
      timeLeft--;
      countdownEl.textContent = timeLeft + 's';
      if (timeLeft <= 0) {
        running = false;
        clearInterval(timerInterval);
        triggerLose();
      }
    }, 1000);

    // Tab visibility
    function onVisibility() {
      if (document.hidden && running) {
        running = false;
        clearInterval(timerInterval);
        triggerLose();
      }
    }
    addListener(document, 'visibilitychange', onVisibility);

    renderTarget();
    hiddenInput.focus();
  }

})();
