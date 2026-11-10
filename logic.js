/* logic.js - gate-level model of the MOD-10 traffic-light controller.
   Pure functions only (no DOM), so the website and tests share the same logic. */
(function (root) {
  'use strict';
  const NOT = a => (a ? 0 : 1);
  const AND = (...x) => (x.every(Boolean) ? 1 : 0);
  const OR = (...x) => (x.some(Boolean) ? 1 : 0);
  const XOR = (a, b) => a ^ b;

  const bits = n => ({ q3: (n >> 3) & 1, q2: (n >> 2) & 1, q1: (n >> 1) & 1, q0: n & 1 });
  const value = q => q.q3 * 8 + q.q2 * 4 + q.q1 * 2 + q.q0;
  const bin = n => n.toString(2).padStart(4, '0');

  // Terminal-count detector: T = Q3 . Q0 (first true at count 9 = 1001)
  const terminal = q => AND(q.q3, q.q0);

  // D inputs of the four flip-flops: D_i = INC_i . (NOT T)
  function nextState(q) {
    const a = AND(q.q1, q.q0);          // shared AND term  A = Q1.Q0
    const b = AND(q.q2, a);             // B = Q2.Q1.Q0
    const inc = [NOT(q.q0), XOR(q.q1, q.q0), XOR(q.q2, a), XOR(q.q3, b)];
    const nt = NOT(terminal(q));        // ~T
    return { q0: AND(inc[0], nt), q1: AND(inc[1], nt), q2: AND(inc[2], nt), q3: AND(inc[3], nt) };
  }

  // Combinational decoder: RED = NOR(Q3,Q2,A), YELLOW = Q3, GREEN = ~Q3 . (Q2 + A)
  function lights(q) {
    const a = AND(q.q1, q.q0);
    return { red: NOT(OR(q.q3, q.q2, a)), green: AND(NOT(q.q3), OR(q.q2, a)), yellow: q.q3 };
  }

  const PHASES = [
    { name: 'RED', from: 0, to: 2, len: 3 },
    { name: 'GREEN', from: 3, to: 7, len: 5 },
    { name: 'YELLOW', from: 8, to: 9, len: 2 }
  ];
  function phaseOf(n) {
    const L = lights(bits(n));
    const name = L.red ? 'RED' : L.green ? 'GREEN' : 'YELLOW';
    const p = PHASES.find(p => p.name === name);
    return { name, index: n <= 9 ? n - p.from + 1 : null, len: p.len, valid: n <= 9 };
  }

  class Counter {
    constructor() { this.q = bits(0); this.pulses = 0; }
    get value() { return value(this.q); }
    pulse() { this.q = nextState(this.q); this.pulses++; }   // one rising clock edge
    reset() { this.q = bits(0); this.pulses = 0; }            // manual (asynchronous) clear
  }

  // Start / pause / step / reset logic, with an injectable timer so it can be tested.
  class Simulator {
    constructor(onChange, sched) {
      this.counter = new Counter();
      this.onChange = onChange || (() => {});
      this.sched = sched || { set: (f, ms) => setInterval(f, ms), clear: id => clearInterval(id) };
      this.period = 1000; this.id = null;
    }
    get running() { return this.id !== null; }
    start() { if (this.running) return; this.id = this.sched.set(() => this.step(), this.period); this.onChange(); }
    pause() { if (!this.running) return; this.sched.clear(this.id); this.id = null; this.onChange(); }
    step() { this.counter.pulse(); this.onChange(); }
    reset() { this.counter.reset(); this.onChange(); }
    setPeriod(ms) { this.period = ms; if (this.running) { this.pause(); this.start(); } }
  }

  const api = { NOT, AND, OR, XOR, bits, value, bin, terminal, nextState, lights, PHASES, phaseOf, Counter, Simulator };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.DLC = api;
})(typeof window !== 'undefined' ? window : this);
