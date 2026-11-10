# DESIGN.md

## 1. Project Title
Design and Simulation of a Traffic-Light Controller Using a MOD-10 Counter

## 2. Abstract
This project designs a traffic-light controller from basic digital logic. A 4-bit synchronous MOD-10 counter built from four D flip-flops counts 0 to 9 and repeats. A combinational decoder converts each count into one of three lights: RED for 3 clock pulses, GREEN for 5 and YELLOW for 2. The design was checked by a JavaScript gate-level simulation and automated tests, and is presented as an interactive web page. No physical hardware was built.

## 3. Introduction
Counters are sequential circuits whose outputs step through a fixed series of binary values on each clock pulse. A MOD-N counter has N states and returns to its first state after the last one. Traffic lights are a familiar example of a fixed repeating sequence, so a counter plus a decoder is a natural first project.

## 4. Problem Statement
Design a controller that shows RED, GREEN and YELLOW in a repeating cycle, with durations 3, 5 and 2 clock pulses, using a synchronous counter and logic gates, with a manual reset. Only one light may be ON at any time.

## 5. Objectives
- Build a 4-bit synchronous MOD-10 counter from D flip-flops and gates.
- Decode the count into RED, GREEN and YELLOW with Boolean expressions.
- Show state tables, truth tables and a circuit diagram.
- Verify the design by simulation and automated tests.

## 6. Required Components
Logic needed for a hardware build (a possible implementation only; not built or tested):
| Component | Quantity | Possible IC |
|---|---|---|
| D flip-flop (with asynchronous clear) | 4 | 74HC74 (2 per chip) |
| XOR gate | 3 | 74HC86 |
| AND gate (2-input) | 8 | 74HC08 |
| NOT gate | 3 | 74HC04 |
| OR gate (2-input) | 1 | 74HC32 |
| NOR gate (3-input) | 1 | 74HC27 |
| Clock source, reset switch, 3 LEDs with resistors | 1 set | 555 timer or pulse generator |

Gate count, taken from the circuit diagram: 8 two-input ANDs (A, B, T, four D-input gates, GREEN), 3 XORs, 3 NOTs (Q0′, T′, Q3′), 1 OR, 1 three-input NOR, 4 flip-flops.

## 7. Block Diagram
![Block diagram](diagrams/block-diagram.svg)

The clock drives the counter. The counter outputs Q3 Q2 Q1 Q0 go to the decoder (which drives the lamps) and to the terminal-count detector (which feeds back to clear the counter after 9).

## 8. Circuit Diagram
![Circuit diagram](diagrams/circuit-diagram.svg)

Four D flip-flops share one clock. Each D input comes from an AND gate: the increment term for that bit ANDed with T′. Net labels with the same name are connected.

## 9. MOD-10 Counter Operation
Four flip-flops can hold 16 values (0000 to 1111). The counter uses only the first 10. Normally each clock edge adds 1 (binary increment). When the count is 9 (1001), the terminal-count detector T = Q3·Q0 becomes 1, which forces all D inputs to 0, so the next edge loads 0000. Because this clear happens on a clock edge, it is a **synchronous** reset.

The **counting cycle** (10 states) and the **light phases** (3 groups) are different things. The decoder groups counts 0–2, 3–7 and 8–9 into the three phases. The manual Reset is an asynchronous clear on each flip-flop (it acts immediately, without a clock edge).

Why T = Q3·Q0 works: among counts 0 to 9, only 9 (1001) has both Q3 and Q0 equal to 1. Counts 11, 13, 15 also have both bits 1 but they are invalid states that never occur in normal operation.

## 10. Counter State Table
| Present Q3Q2Q1Q0 | Dec | T | Next Q3Q2Q1Q0 | Dec |
|---|---|---|---|---|
| 0000 | 0 | 0 | 0001 | 1 |
| 0001 | 1 | 0 | 0010 | 2 |
| 0010 | 2 | 0 | 0011 | 3 |
| 0011 | 3 | 0 | 0100 | 4 |
| 0100 | 4 | 0 | 0101 | 5 |
| 0101 | 5 | 0 | 0110 | 6 |
| 0110 | 6 | 0 | 0111 | 7 |
| 0111 | 7 | 0 | 1000 | 8 |
| 1000 | 8 | 0 | 1001 | 9 |
| 1001 | 9 | 1 | 0000 | 0 |

Invalid states (never entered in normal operation; the same equations were checked for them): 1010 → 1011 → 0000, 1100 → 1101 → 0000, 1110 → 1111 → 0000. Each returns to a valid state within 2 pulses.

## 11. Traffic-Light Truth Table
| Count | Q3 Q2 Q1 Q0 | RED | GREEN | YELLOW |
|---|---|---|---|---|
| 0 | 0 0 0 0 | 1 | 0 | 0 |
| 1 | 0 0 0 1 | 1 | 0 | 0 |
| 2 | 0 0 1 0 | 1 | 0 | 0 |
| 3 | 0 0 1 1 | 0 | 1 | 0 |
| 4 | 0 1 0 0 | 0 | 1 | 0 |
| 5 | 0 1 0 1 | 0 | 1 | 0 |
| 6 | 0 1 1 0 | 0 | 1 | 0 |
| 7 | 0 1 1 1 | 0 | 1 | 0 |
| 8 | 1 0 0 0 | 0 | 0 | 1 |
| 9 | 1 0 0 1 | 0 | 0 | 1 |

## 12. Boolean Logic and Output Decoding
**Next-state logic.** Let A = Q1·Q0, B = Q2·Q1·Q0 and T = Q3·Q0.
- Binary increment: Q0 toggles every pulse, Q1 toggles when Q0 = 1, Q2 toggles when Q1·Q0 = 1, Q3 toggles when Q2·Q1·Q0 = 1. A toggle is an XOR, so INC0 = Q0′, INC1 = Q1 ⊕ Q0, INC2 = Q2 ⊕ A, INC3 = Q3 ⊕ B.
- D0 = INC0·T′, D1 = INC1·T′, D2 = INC2·T′, D3 = INC3·T′.

**Output decoding.**
- YELLOW = Q3 (counts 8 and 9 are the only valid counts with Q3 = 1).
- RED (0, 1, 2) = Q3′·Q2′·(Q1·Q0)′ = (Q3 + Q2 + A)′.
- GREEN (3 to 7) = Q3′·(Q2 + Q1·Q0): count 3 has Q1·Q0 = 1, counts 4 to 7 have Q2 = 1.

Counts 10 to 15 are don't-care conditions in the design. With these equations they light only YELLOW, so exactly one lamp is still ON.

## 13. Working Principle
1. Reset sets Q3Q2Q1Q0 = 0000 and RED lights.
2. On each rising clock edge all four flip-flops copy their D inputs at the same moment.
3. The D inputs were already prepared by the increment gates, so the stored value goes up by 1.
4. At count 9, T′ = 0 blocks all D inputs, so the following edge gives 0000.
5. The decoder watches Q3 Q2 Q1 Q0 and lights exactly one lamp. The light changes only when the count changes, so each count lasts one clock period.

## 14. Algorithm
```
on reset:           Q = 0000
on each clock edge: if Q == 1001 then Q = 0000 else Q = Q + 1   (done in hardware by the gates above)
continuously:       if Q <= 2 -> RED;  else if Q <= 7 -> GREEN;  else -> YELLOW
```

## 15. Simulation Results
The simulation is a software model written in JavaScript (`logic.js`) using AND, OR, NOT and XOR functions that follow the equations above. It is not a circuit-simulator or hardware result. The automated test run (`node tests/test.js`) produced:

```
PASS  1. Counter counts 0 to 9 in order
PASS  2. Pulse after 9 returns to 0 (0000)
PASS     Sequence repeats for 5 full cycles
PASS  3. RED lasts exactly 3 pulses each cycle
PASS  4. GREEN lasts exactly 5 pulses each cycle
PASS  5. YELLOW lasts exactly 2 pulses each cycle
PASS  6. Exactly one light ON for every state 0-15
PASS     Decoder phase map matches spec for 0-9
PASS  7. Reset clears state and pulse count
PASS  8. Pause and resume (fake timer)
PASS  9. Manual clock pulse advances by exactly one
PASS  10. Binary string and decimal always agree
PASS  11. Logic equals reference: next = (n+1) mod 10 for 0-9
PASS     Terminal count T is 1 only at state 9 (among 0-9)
PASS     Invalid states 10-15 recover to a valid state within 2 pulses
PASS     Counter never enters an invalid state from reset (1000 pulses)

16 passed, 0 failed
```

Checks performed by hand in a browser are not listed above: smooth fade of lamps, button appearance and layout on small screens. Do your own check of these before submitting. The truth tables on the website are generated from the same functions the simulator uses.

## 16. Applications
Digital clocks and timers, frequency dividers (divide by 10), event counters, and simple fixed-time controllers such as basic traffic or machine-sequence controllers.

## 17. Advantages
- All flip-flops change together, so there are no ripple delays.
- Small, easy to understand, and uses only basic gates.
- Exactly one lamp is ON at all times for every state.
- Invalid states return to the valid cycle within 2 pulses.

## 18. Limitations
- Fixed timing only: no sensors, no pedestrian button, no junction with several roads.
- Light durations are tied to the clock period; changing 3-5-2 means redesigning the decoder.
- Real traffic signals need extra safety features (conflict monitor, all-red interval) not covered here.
- Verified only in software; not tested on hardware or in a gate-level circuit simulator.

## 19. Conclusion
A 4-bit synchronous counter with a synchronous clear at 9 gives a reliable MOD-10 sequence. A three-expression decoder maps it to RED (3 pulses), GREEN (5) and YELLOW (2). The software model and tests agree with the state table and truth table. The design is simple and suitable for learning counters, Boolean algebra and decoding.

## 20. References
1. M. Morris Mano and Michael D. Ciletti, *Digital Design*, Pearson.
2. Thomas L. Floyd, *Digital Fundamentals*, Pearson.
3. Your DLC course notes and lecture material (add exact details here).
