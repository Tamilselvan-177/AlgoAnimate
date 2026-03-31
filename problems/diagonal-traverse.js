/**
 * Diagonal traverse animation — LeetCode 498
 * Direction constants mirror the Python up flag (True = move ↗ next).
 */
var DIR_UP_RIGHT = true;
var DIR_DOWN_LEFT = false;

var MAX_CELLS = 49;
var HL_MAX = 22;
var SPDS = [900, 550, 280, 140, 60];
var SPNAMES = ['Very slow', 'Slow', 'Normal', 'Fast', 'Very fast'];

var _mat = [],
  _steps = [],
  _si = 0,
  _built = false,
  _timer = null,
  _playing = false;

function parseMat(s) {
  var rows = s
    .trim()
    .split('|')
    .map(function (r) {
      return r.trim();
    })
    .filter(Boolean);
  if (!rows.length) return null;
  var mat = rows.map(function (r) {
    return r.split(',').map(function (v) {
      return parseInt(v.trim(), 10);
    });
  });
  if (mat.some(function (row) {
    return row.some(function (v) {
      return isNaN(v);
    });
  }))
    return null;
  var n = mat[0].length;
  if (!n || mat.some(function (r) {
    return r.length !== n;
  }))
    return null;
  if (mat.length * n > MAX_CELLS) return null;
  return mat;
}

function isInterviewMode() {
  return document.body.classList.contains('learn-interview');
}

function diagColorsEnabled() {
  var chk = document.getElementById('chk-diag-colors');
  return chk && chk.checked && !isInterviewMode();
}

function hslDiagBg(k, maxK, light) {
  var t = maxK <= 0 ? 0 : k / maxK;
  var h = Math.round(38 + t * 220);
  if (light) return 'hsla(' + h + ',42%,88%,0.95)';
  return 'hsla(' + h + ',38%,20%,0.92)';
}

function buildSteps(mat) {
  var m = mat.length,
    n = mat[0].length;
  var steps = [];
  var r = 0,
    c = 0,
    up = DIR_UP_RIGHT;
  var out = [];
  steps.push({
    phase: 'intro',
    r: 0,
    c: 0,
    out: [],
    upNext: DIR_UP_RIGHT,
    done: false,
    cl: 6,
    edgeTurn: false,
    noteTech: 'Init: r=0, c=0, up=True · line 6: while len(res) < m*n — press Next to append mat[0][0].',
    noteSimple:
      'We start at the top-left of the matrix: row index r=0, column index c=0. That cell will be read first. The walk will try to go up-right (↗) along a diagonal until a border forces a turn.',
  });
  while (out.length < m * n) {
    var r0 = r,
      c0 = c,
      up0 = up;
    var val = mat[r0][c0];
    out.push(val);
    var done = out.length >= m * n;
    var branch = '';
    var cl = 7;
    var noteSimple = '';
    var noteTech = '';
    if (!done) {
      if (up0 === DIR_UP_RIGHT) {
        if (c0 === n - 1) {
          r = r0 + 1;
          c = c0;
          up = DIR_DOWN_LEFT;
          branch = 'Hit right edge → go down, flip to ↙';
          cl = 10;
          noteSimple =
            'We are in the last column, so we cannot step up-right (that would leave the grid). Instead we step one row down and switch to walking down-left (↙).';
          noteTech = 'Line 10: r+=1, up=False (right border while moving ↗).';
        } else if (r0 === 0) {
          r = r0;
          c = c0 + 1;
          up = DIR_DOWN_LEFT;
          branch = 'Hit top edge → go right, flip to ↙';
          cl = 12;
          noteSimple =
            'We are on the top row (and not the right corner), so we cannot go up-right. We step one column to the right and switch to walking ↙.';
          noteTech = 'Line 12: c+=1, up=False (top row while moving ↗).';
        } else {
          r = r0 - 1;
          c = c0 + 1;
          up = DIR_UP_RIGHT;
          branch = 'Step ↗ along diagonal';
          cl = 14;
          noteSimple =
            'We are safely inside the grid: move one row up and one column right — a true diagonal step ↗.';
          noteTech = 'Line 14: r-=1, c+=1 (interior ↗).';
        }
      } else {
        if (r0 === m - 1) {
          r = r0;
          c = c0 + 1;
          up = DIR_UP_RIGHT;
          branch = 'Hit bottom edge → go right, flip to ↗';
          cl = 17;
          noteSimple =
            'We are on the bottom row, so we cannot step down-left. We move one column right and switch to walking up-right (↗).';
          noteTech = 'Line 17: c+=1, up=True (bottom border while moving ↙).';
        } else if (c0 === 0) {
          r = r0 + 1;
          c = c0;
          up = DIR_UP_RIGHT;
          branch = 'Hit left edge → go down, flip to ↗';
          cl = 19;
          noteSimple =
            'We are in the first column, so we cannot go down-left. We step one row down and switch to walking ↗.';
          noteTech = 'Line 19: r+=1, up=True (left border while moving ↙).';
        } else {
          r = r0 + 1;
          c = c0 - 1;
          up = DIR_DOWN_LEFT;
          branch = 'Step ↙ along diagonal';
          cl = 21;
          noteSimple =
            'Inside the grid: move one row down and one column left — diagonal step ↙.';
          noteTech = 'Line 21: r+=1, c-=1 (interior ↙).';
        }
      }
    } else {
      branch = 'All cells collected.';
      cl = 22;
      noteSimple = 'Every cell has been copied into the answer list. The algorithm returns that list.';
      noteTech = 'Line 22: return res — done.';
    }
    var edgeTurn = up !== up0;
    noteTech =
      (done ? '' : 'Line 7: append ' + val + ' from mat[' + r0 + '][' + c0 + ']. ') + noteTech;
    steps.push({
      phase: 'visit',
      r: r0,
      c: c0,
      k: r0 + c0,
      val: val,
      out: out.slice(),
      upNext: up,
      done: done,
      cl: cl,
      edgeTurn: edgeTurn,
      noteTech: noteTech,
      noteSimple: noteSimple,
    });
  }
  return steps;
}

function gridCoordsPrefix(mat, k) {
  var m = mat.length,
    n = mat[0].length,
    r = 0,
    c = 0,
    u = DIR_UP_RIGHT,
    coords = [];
  for (var t = 0; t < k; t++) {
    coords.push([r, c]);
    if (t === k - 1) break;
    if (u === DIR_UP_RIGHT) {
      if (c === n - 1) {
        r++;
        u = DIR_DOWN_LEFT;
      } else if (r === 0) {
        c++;
        u = DIR_DOWN_LEFT;
      } else {
        r--;
        c++;
      }
    } else {
      if (r === m - 1) {
        c++;
        u = DIR_UP_RIGHT;
      } else if (c === 0) {
        r++;
        u = DIR_UP_RIGHT;
      } else {
        r++;
        c--;
      }
    }
  }
  return coords;
}

function renderMat(mat, step) {
  var viz = document.getElementById('mat-viz');
  if (!mat || !mat.length) {
    viz.innerHTML = '<span style="font-family:var(--mono);font-size:13px;color:var(--ph)">Press ▶ Load</span>';
    return;
  }
  var s = step || {};
  var coords = null,
    vis = null,
    last = null;
  if (s.phase === 'visit' && s.out && s.out.length && !s.done) {
    coords = gridCoordsPrefix(mat, s.out.length);
    vis = new Set();
    for (var i = 0; i < coords.length - 1; i++) vis.add(coords[i][0] + ',' + coords[i][1]);
    last = coords[coords.length - 1];
  }
  var maxK = mat.length + mat[0].length - 2;
  var light = document.documentElement.getAttribute('data-theme') === 'light';
  var useDiag = diagColorsEnabled();
  var html = '<div class="mat-grid">';
  mat.forEach(function (row, ri) {
    html += '<div class="mat-row"><span class="row-label">' + ri + '</span>';
    row.forEach(function (v, cj) {
      var cls = 'mat-cell ';
      var key = ri + ',' + cj;
      var kk = ri + cj;
      var isCur = false,
        isVis = false;
      if (s.done) {
        cls += 'mc-vis';
        isVis = true;
      } else if (s.phase === 'intro') {
        if (ri === 0 && cj === 0) {
          cls += 'mc-cur';
          isCur = true;
        } else cls += 'mc-idle';
      } else if (last) {
        if (ri === last[0] && cj === last[1]) {
          cls += 'mc-cur';
          isCur = true;
        } else if (vis.has(key)) {
          cls += 'mc-vis';
          isVis = true;
        } else cls += 'mc-idle';
      } else cls += 'mc-idle';
      var extra = '';
      if (useDiag && !isCur && !isVis && (!s.phase || s.phase === 'intro' || last)) {
        extra = ' style="background:' + hslDiagBg(kk, maxK, light) + '"';
      }
      var title = 'Value: ' + v + ' · Position: (' + ri + ', ' + cj + ') · k = r+c = ' + kk;
      html += '<div class="' + cls + '"' + extra + ' title="' + title.replace(/"/g, '&quot;') + '">' + v + '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  viz.innerHTML = html;
}

function renderOut(step) {
  var el = document.getElementById('out-viz');
  if (!step || !step.out || !step.out.length) {
    el.innerHTML = '<span style="color:var(--ph);font-family:var(--mono);font-size:12px">[]</span>';
    return;
  }
  el.innerHTML = step.out
    .map(function (v, idx) {
      var isLast = idx === step.out.length - 1;
      return '<span class="out-chip' + (isLast ? ' last' : '') + '">' + v + '</span>';
    })
    .join('');
}

function renderDir(step) {
  var box = document.getElementById('dir-box');
  if (!step) {
    box.textContent = '';
    return;
  }
  if (step.phase === 'intro') {
    box.innerHTML =
      '<span class="dir-pill dir-up">Variable <code>up</code> is True → the <em>next</em> move tries to walk ↗ (up-right).</span>';
    return;
  }
  if (step.done) {
    box.innerHTML = '<span style="color:var(--green)">Traversal complete.</span>';
    return;
  }
  var upN = step.upNext;
  box.innerHTML = upN
    ? '<span class="dir-pill dir-up">After this step, <code>up</code> = True → next walk uses ↗</span>'
    : '<span class="dir-pill dir-down">After this step, <code>up</code> = False → next walk uses ↙</span>';
}

function renderHud(step) {
  var hud = document.getElementById('debug-hud');
  if (!hud) return;
  if (isInterviewMode() || !_built) {
    hud.style.display = 'none';
    return;
  }
  hud.style.display = 'grid';
  var rEl = document.getElementById('dh-r');
  var cEl = document.getElementById('dh-c');
  var kEl = document.getElementById('dh-k');
  var dEl = document.getElementById('dh-dir');
  if (!step) {
    if (rEl) rEl.textContent = '—';
    if (cEl) cEl.textContent = '—';
    if (kEl) kEl.textContent = '—';
    if (dEl) dEl.textContent = '—';
    return;
  }
  if (step.phase === 'intro') {
    if (rEl) rEl.textContent = '0';
    if (cEl) cEl.textContent = '0';
    if (kEl) kEl.textContent = '0';
    if (dEl) dEl.innerHTML = '<strong>↗</strong> (up-right diagonal) — not moved yet';
    return;
  }
  if (rEl) rEl.textContent = String(step.r);
  if (cEl) cEl.textContent = String(step.c);
  if (kEl) kEl.textContent = String(step.k != null ? step.k : step.r + step.c);
  if (dEl) {
    if (step.done) dEl.textContent = '— (finished)';
    else
      dEl.innerHTML = step.upNext
        ? '<strong>↗</strong> up-right diagonal'
        : '<strong>↙</strong> down-left diagonal';
  }
}

function renderSimplePanel(step) {
  var wrap = document.getElementById('simple-explain');
  var txt = document.getElementById('simple-explain-txt');
  if (!wrap || !txt) return;
  if (isInterviewMode() || !step) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';
  txt.textContent = step.noteSimple || '';
}

function getTechNote(s) {
  return s.noteTech || s.note || '';
}

function applyVisualStep(s, stepLabel) {
  setHlFromStep(s);
  document.getElementById('bt-note').textContent = getTechNote(s);
  document.getElementById('step-info').textContent = stepLabel;
  renderMat(_mat, s);
  renderOut(s.phase === 'intro' ? { out: [] } : s);
  renderDir(s);
  renderHud(s);
  renderSimplePanel(s);
}

function clearHl() {
  for (var i = 0; i <= HL_MAX; i++) {
    var e = document.getElementById('cl' + i);
    if (e) e.classList.remove('active');
  }
}

function setHlFromStep(s) {
  clearHl();
  if (!s) return;
  var lines = [];
  if (s.phase === 'intro') lines = [6];
  else if (s.phase === 'visit') {
    lines = [7];
    if (s.cl !== 7) lines.push(s.cl);
  }
  lines.forEach(function (l) {
    var e = document.getElementById('cl' + l);
    if (e) e.classList.add('active');
  });
  var scrollId = s.phase === 'intro' ? 6 : s.done ? s.cl : 7;
  var el = document.getElementById('cl' + scrollId);
  if (el && el.scrollIntoView)
    try {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (x) {
      el.scrollIntoView(false);
    }
}

function setStatus(ok, msg) {
  var dot = document.getElementById('st-dot');
  var t = document.getElementById('st-txt');
  if (dot) dot.style.background = ok ? 'var(--green)' : ok === false ? 'var(--coral)' : 'var(--ph)';
  if (t) t.textContent = msg || '';
}

function updateProg() {
  var el = document.getElementById('prog-fill');
  if (!el || !_built || !_steps.length) {
    if (el) el.style.width = '0%';
    return;
  }
  var pct = Math.min(100, Math.round((_si / _steps.length) * 100));
  el.style.width = pct + '%';
}

function updCtrl() {
  var h = _built && _steps.length > 0;
  document.getElementById('btn-prev').disabled = !h || _si <= 0;
  document.getElementById('btn-next').disabled = !h || _si >= _steps.length;
  document.getElementById('btn-auto').disabled = !h;
  document.getElementById('btn-reset').disabled = !h;
  var br = document.getElementById('btn-replay');
  if (br) br.disabled = !h || _si <= 0;
  updateProg();
}

function applyStep() {
  if (_si >= _steps.length) return false;
  var s = _steps[_si];
  applyVisualStep(s, _si + 1 + '/' + _steps.length);
  setStatus(true, 'Step ' + (_si + 1) + ' of ' + _steps.length);
  _si++;
  updCtrl();
  return _si < _steps.length;
}

function rewindTo(t) {
  _si = 0;
  clearHl();
  if (t > 0) {
    _si = t;
    var s = _steps[t - 1];
    applyVisualStep(s, t + '/' + _steps.length);
    setStatus(true, 'Step ' + t + ' of ' + _steps.length);
  } else {
    document.getElementById('bt-note').textContent = 'Use ← / → or ▶ Auto-play after Load.';
    document.getElementById('step-info').textContent = '';
    document.getElementById('dir-box').innerHTML = '';
    renderMat(_mat, null);
    document.getElementById('out-viz').innerHTML =
      '<span style="color:var(--ph);font-family:var(--mono);font-size:12px">[]</span>';
    renderHud(null);
    renderSimplePanel(null);
    var sp = document.getElementById('simple-explain');
    if (sp) sp.style.display = 'none';
    setStatus(null, 'Ready — press Next to begin');
  }
  updCtrl();
}

function replayStep() {
  stopAuto();
  if (!_built || _si <= 0) return;
  var s = _steps[_si - 1];
  applyVisualStep(s, _si + '/' + _steps.length);
  setStatus(true, 'Replayed step ' + _si + ' of ' + _steps.length);
  updCtrl();
}

function loadEx(s) {
  document.getElementById('mat-inp').value = s;
  runViz();
}

function runViz() {
  stopAuto();
  var mat = parseMat(document.getElementById('mat-inp').value);
  if (!mat) {
    document.getElementById('bt-note').textContent =
      'Invalid input, ragged rows, or more than ' + MAX_CELLS + ' cells. Use | between rows, commas between values.';
    _built = false;
    updCtrl();
    setStatus(false, 'Parse error');
    return;
  }
  _mat = mat;
  _steps = buildSteps(mat);
  _si = 0;
  _built = true;
  rewindTo(0);
  document.getElementById('bt-note').textContent =
    'Press Next to step. Amber = cell copied this step; green = already in output.';
  setStatus(true, 'Loaded ' + mat.length + '×' + mat[0].length + ' — ' + _steps.length + ' steps');
  updCtrl();
}

function stepBy(d) {
  stopAuto();
  if (!_built) return;
  if (d > 0) {
    if (_si < _steps.length) applyStep();
  } else {
    if (_si <= 0) return;
    rewindTo(Math.max(0, _si - 1));
  }
  updCtrl();
}

function stopAuto() {
  if (_timer) {
    clearTimeout(_timer);
    _timer = null;
  }
  _playing = false;
  var b = document.getElementById('btn-auto');
  if (b) {
    b.textContent = '▶ Auto-play';
    b.classList.add('primary');
  }
}

function getAutoPlayDelayMs() {
  var inp = document.getElementById('speed-ms');
  if (inp && inp.value.trim() !== '') {
    var v = parseInt(inp.value, 10);
    if (!isNaN(v) && v >= 50 && v <= 5000) return v;
  }
  var sl = document.getElementById('speed-sl');
  return SPDS[sl ? parseInt(sl.value, 10) - 1 : 2];
}

function autoPlay() {
  if (_playing) {
    stopAuto();
    return;
  }
  if (!_built) return;
  if (_si >= _steps.length) rewindTo(0);
  _playing = true;
  var b = document.getElementById('btn-auto');
  b.textContent = '⏸ Pause';
  b.classList.add('primary');
  function schedule() {
    if (!_playing) return;
    var delay = getAutoPlayDelayMs();
    _timer = setTimeout(function () {
      _timer = null;
      if (!_playing) return;
      var more = applyStep();
      if (!more) {
        stopAuto();
        updCtrl();
        return;
      }
      var last = _steps[_si - 1];
      var chk = document.getElementById('pause-edge');
      if (chk && chk.checked && last && last.edgeTurn) {
        stopAuto();
        updCtrl();
        return;
      }
      schedule();
    }, delay);
  }
  schedule();
}

function resetViz() {
  stopAuto();
  if (!_built) return;
  rewindTo(0);
  updCtrl();
}

function setLearnMode(mode, btn) {
  var beg = document.getElementById('mode-beginner');
  var intr = document.getElementById('mode-interview');
  if (mode === 'interview') {
    document.body.classList.add('learn-interview');
    if (beg) beg.classList.remove('on');
    if (intr) intr.classList.add('on');
  } else {
    document.body.classList.remove('learn-interview');
    if (beg) beg.classList.add('on');
    if (intr) intr.classList.remove('on');
  }
  if (_built && _si > 0) replayStep();
  else if (_built) rewindTo(0);
  else updCtrl();
}

document.addEventListener('keydown', function (e) {
  var tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  var anim = document.getElementById('tab-animation');
  if (!anim || !anim.classList.contains('active')) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    stepBy(1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stepBy(-1);
  } else if (e.key === ' ') {
    e.preventDefault();
    autoPlay();
  }
});

var sl = document.getElementById('speed-sl');
if (sl) {
  sl.addEventListener('input', function () {
    document.getElementById('speed-lbl').textContent = SPNAMES[sl.value - 1];
    var inp = document.getElementById('speed-ms');
    if (inp) inp.value = '';
  });
}

var chkDiag = document.getElementById('chk-diag-colors');
if (chkDiag)
  chkDiag.addEventListener('change', function () {
    if (_built && _si > 0) replayStep();
    else if (_mat.length) renderMat(_mat, null);
  });

window.addEventListener('load', function () {
  if (!window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', 'light');
  loadEx('1,2,3|4,5,6|7,8,9');
});
