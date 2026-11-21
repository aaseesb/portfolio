import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

type Tables = Record<"X" | "O", Record<string, number[]>>;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const empty = () => Array<string>(9).fill("_");

function result(b: string[]) {
  for (const [x, y, z] of LINES) if (b[x] !== "_" && b[x] === b[y] && b[y] === b[z]) return b[x];
  return b.includes("_") ? null : "draw";
}

// Same policy as the Python agent: greedy argmax over the legal moves (first wins ties).
function agentMove(t: Tables, side: "X" | "O", b: string[]) {
  const moves = b.flatMap((c, i) => (c === "_" ? [i] : []));
  const q = t[side][b.join("")] ?? [];
  let best = 0;
  moves.forEach((_, i) => { if ((q[i] ?? 0) > (q[best] ?? 0)) best = i; });
  return moves[best];
}

export function TicTacToePlay() {
  const [tables, setTables] = useState<Tables | null>(null);
  const [failed, setFailed] = useState(false);
  const [human, setHuman] = useState<"X" | "O">("X");
  const [board, setBoard] = useState(empty);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}ttt-qtable.json`)
      .then((r) => r.json())
      .then(setTables, () => setFailed(true));
  }, []);

  const ai = human === "X" ? "O" : "X";
  const outcome = result(board);

  function start(side: "X" | "O") {
    setHuman(side);
    const b = empty();
    if (side === "O" && tables) b[agentMove(tables, "X", b)] = "X";
    setBoard(b);
  }

  function play(i: number) {
    if (!tables || outcome || board[i] !== "_") return;
    const b = [...board];
    b[i] = human;
    if (!result(b)) b[agentMove(tables, ai, b)] = ai;
    setBoard(b);
  }

  const status = failed
    ? "Couldn’t load the agent."
    : !tables
      ? "Loading the agent…"
      : outcome === "draw"
        ? "It’s a draw."
        : outcome
          ? outcome === human ? "You won!" : "The agent won."
          : "Your move.";

  return (
    <div className="ttt">
      <Link to="/projects/tic-tac-toe-ml" className="button button-outline">
        <ArrowLeft size={15} /> Back to project
      </Link>
      <h1>
        Play the agent<span className="title-dot">.</span>
      </h1>
      <p>
        Trained with Q-learning through self-play. Its learned values run right here in your
        browser. You are {human}.
      </p>
      <p className="ttt-status" role="status" aria-live="polite">{status}</p>
      <div className="ttt-board" role="group" aria-label="Tic-tac-toe board">
        {board.map((c, i) => (
          <button
            key={i}
            className="ttt-cell"
            disabled={!tables || !!outcome || c !== "_"}
            onClick={() => play(i)}
            aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${c === "_" ? "empty" : c}`}
          >
            {c === "_" ? "" : c}
          </button>
        ))}
      </div>
      <div className="inline-actions">
        <button className="button" onClick={() => start("X")}>New game as X</button>
        <button className="button button-outline" onClick={() => start("O")}>
          New game as O (agent first)
        </button>
      </div>
    </div>
  );
}
