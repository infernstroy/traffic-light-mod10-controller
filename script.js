/* script.js - connects the page to logic.js (DLC). */
(function () {
  'use strict';
  const { bits, value, bin, terminal, nextState, lights, phaseOf, Simulator } = DLC;
  const $ = id => document.getElementById(id);
  const names = ['q3', 'q2', 'q1', 'q0'];

  const sim = new Simulator(render);
  const c = sim.counter;

  function render() {
    const n = c.value, q = c.q, L = lights(q), p = phaseOf(n);
    ['red', 'yellow', 'green'].forEach(k => $('lamp-' + k).classList.toggle('on', !!L[k]));
    names.forEach(k => { $('bit-' + k).textContent = q[k]; $('bit-' + k).classList.toggle('hi', !!q[k]); });
    $('bin').textContent = bin(n);
    $('dec').textContent = n;
    $('phase').textContent = p.name;
    $('phase').className = 'phase ' + p.name.toLowerCase();
    $('pulses').textContent = c.pulses;
    $('progress').textContent = 'Pulse ' + p.index + ' of ' + p.len + ' in this phase';
    $('term').textContent = terminal(q) ? 'T = 1 (next pulse clears to 0000)' : 'T = 0';
    document.querySelectorAll('[data-n]').forEach(e => e.classList.toggle('now', +e.dataset.n === n));
    $('start').disabled = sim.running;
    $('pause').disabled = !sim.running;
    $('status').textContent = sim.running ? 'Running' : 'Paused';
  }

  function row(cells, n, cls) {
    return '<tr data-n="' + n + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + cells.map(x => '<td>' + x + '</td>').join('') + '</tr>';
  }
  const head = a => '<thead><tr>' + a.map(x => '<th>' + x + '</th>').join('') + '</tr></thead>';
  const nb = q => bin(value(q));

  function buildTables() {
    let t1 = head(['Present state Q3Q2Q1Q0', 'Dec', 'T = Q3·Q0', 'Next state', 'Dec']), t2 = head(['Count', 'Q3Q2Q1Q0', 'RED', 'GREEN', 'YELLOW', 'Phase']), t3 = head(['State', 'Dec', 'Valid?', 'Next state', 'Lights']);
    for (let n = 0; n < 16; n++) {
      const q = bits(n), nx = nextState(q), L = lights(q), valid = n <= 9;
      if (valid) {
        t1 += row([bin(n), n, terminal(q), nb(nx), value(nx)], n);
        t2 += row([n, bin(n), L.red, L.green, L.yellow, phaseOf(n).name], n);
      }
      t3 += row([bin(n), n, valid ? 'Valid' : 'Invalid', nb(nx) + ' (' + value(nx) + ')', 'R=' + L.red + ' G=' + L.green + ' Y=' + L.yellow], n, valid ? '' : 'bad');
    }
    $('tbl-trans').innerHTML = t1; $('tbl-decode').innerHTML = t2; $('tbl-valid').innerHTML = t3;
    $('seq').innerHTML = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => '<li data-n="' + n + '" class="' + phaseOf(n).name.toLowerCase() + '">' + bin(n) + '</li>').join('') + '<li class="wrap">→ 0000</li>';
  }

  function speedLabel() { $('speedval').textContent = sim.period + ' ms per clock pulse'; }
  $('start').onclick = () => sim.start();
  $('pause').onclick = () => sim.pause();
  $('step').onclick = () => sim.step();
  $('reset').onclick = () => sim.reset();
  $('speed').oninput = e => { sim.setPeriod(2200 - +e.target.value); speedLabel(); };
  buildTables(); speedLabel(); render();
})();
