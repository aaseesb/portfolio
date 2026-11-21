// Port of the Python repo's gameenv.py (Player + training): epsilon-greedy tabular Q-learning
// by X-vs-O self-play. Boards are 9-char strings, "_" = empty. Q rows are indexed by
// position among the empty cells, as in the original.
export type QTable = Record<string, number[]>;
export type Tables = Record<"X" | "O", QTable>;

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export function result(b: string[]) {
  for (const [x, y, z] of LINES) if (b[x] !== "_" && b[x] === b[y] && b[y] === b[z]) return b[x];
  return b.includes("_") ? null : "draw";
}

const empties = (b: string[]) => b.flatMap((c, i) => (c === "_" ? [i] : []));
const argmax = (q: number[]) => q.reduce((best, v, i) => (v > q[best] ? i : best), 0);

export function qValues(t: Tables, side: "X" | "O", b: string[]) {
  const n = empties(b).length;
  return t[side][b.join("")] ?? Array<number>(n).fill(0);
}

// Greedy move, as the original's trained players (epsilon = 0).
export function agentMove(t: Tables, side: "X" | "O", b: string[]) {
  return empties(b)[argmax(qValues(t, side, b))];
}

class Player {
  q: QTable = {};
  lastState: string | null = null;
  lastAction = 0;
  constructor(public eps: number, public alpha: number, public gamma: number) {}

  row(key: string) {
    return (this.q[key] ??= Array<number>(key.split("_").length - 1).fill(0));
  }

  step(b: string[]) {
    const valid = empties(b);
    const state = b.join("");
    const q = this.row(state);
    const i = Math.random() < this.eps ? Math.floor(Math.random() * valid.length) : argmax(q);
    if (this.lastState !== null) this.update(this.lastState, this.lastAction, 0, state, false);
    this.lastState = state;
    this.lastAction = i;
    return valid[i];
  }

  update(state: string, a: number, reward: number, next: string | null, done: boolean) {
    const row = this.q[state];
    const target = done ? reward : reward + this.gamma * Math.max(...this.row(next!));
    row[a] += this.alpha * (target - row[a]);
  }

  final(reward: number) {
    if (this.lastState !== null) this.update(this.lastState, this.lastAction, reward, null, true);
    this.lastState = null;
  }
}

export class Trainer {
  x: Player;
  o: Player;
  constructor(eps: number, alpha: number, gamma: number) {
    this.x = new Player(eps, alpha, gamma);
    this.o = new Player(eps, alpha, gamma);
  }

  run(episodes: number) {
    for (let e = 0; e < episodes; e++) {
      const b = Array<string>(9).fill("_");
      let w: string | null = null;
      for (let turn = 0; !w; turn++) {
        const p = turn % 2 ? this.o : this.x;
        b[p.step(b)] = turn % 2 ? "O" : "X";
        w = result(b);
      }
      const [rx, ro] = w === "X" ? [1, -1] : w === "O" ? [-1, 1] : [0.5, 0.5];
      this.x.final(rx);
      this.o.final(ro);
    }
  }

  tables(): Tables {
    return { X: this.x.q, O: this.o.q };
  }
}
