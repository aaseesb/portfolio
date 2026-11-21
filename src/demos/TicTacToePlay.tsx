import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Trainer, agentMove, qValues, result, type Tables } from "./ttt-learn";

const empty = () => Array<string>(9).fill("_");
const DEFAULTS = { epsilon: "0.5", alpha: "0.1", gamma: "0.9", episodes: "100000" }; // gameenv.py defaults
const MAX_EPISODES = 300000;
const CHUNK = 5000;

export function TicTacToePlay() {
  const [tables, setTables] = useState<Tables | null>(null);
  const [source, setSource] = useState("pre-trained");
  const [failed, setFailed] = useState(false);
  const [human, setHuman] = useState<"X" | "O">("X");
  const [board, setBoard] = useState(empty);
  const [showQ, setShowQ] = useState(true);
  const [progress, setProgress] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [params, setParams] = useState(DEFAULTS);
  const run = useRef(0);

  const pretrained = async () => {
    try {
      const r = await fetch(`${import.meta.env.BASE_URL}ttt-qtable.json`);
      return (await r.json()) as Tables;
    } catch {
      setFailed(true);
      return null;
    }
  };

  function reset(side: "X" | "O", t: Tables | null) {
    setHuman(side);
    const b = empty();
    if (side === "O" && t) b[agentMove(t, "X", b)] = "X";
    setBoard(b);
  }

  useEffect(() => {
    pretrained().then(setTables);
    return () => { run.current++; };
  }, []);

  async function usePretrained() {
    run.current++;
    setProgress(null);
    const t = await pretrained();
    if (!t) return;
    setTables(t);
    setSource("pre-trained");
    setNote("Pre-trained agent loaded.");
    reset(human, t);
  }

  async function train(e: React.FormEvent) {
    e.preventDefault();
    const [eps, alpha, gamma, episodes] = [params.epsilon, params.alpha, params.gamma, params.episodes].map(Number);
    const id = ++run.current;
    const tr = new Trainer(eps, alpha, gamma);
    setNote("");
    for (let done = 0; done < episodes; done += CHUNK) {
      tr.run(Math.min(CHUNK, episodes - done));
      setProgress(Math.min(100, Math.round(((done + CHUNK) / episodes) * 100)));
      await new Promise((r) => setTimeout(r));
      if (run.current !== id) return; // superseded or unmounted
    }
    const t = tr.tables();
    setProgress(null);
    setTables(t);
    setSource(`trained: ε ${eps}, α ${alpha}, γ ${gamma}, ${episodes.toLocaleString()} episodes`);
    setNote(`Training finished: ${episodes.toLocaleString()} episodes. Your game was reset.`);
    reset(human, t);
  }

  const ai = human === "X" ? "O" : "X";
  const outcome = result(board);
  const training = progress !== null;
  const q = tables && !outcome ? qValues(tables, human, board) : null;
  const cellsLeft = board.flatMap((c, i) => (c === "_" ? [i] : []));
  const qAt = (i: number) => q?.[cellsLeft.indexOf(i)];
  const best = q ? cellsLeft[q.reduce((m, v, i) => (v > q[m] ? i : m), 0)] : -1;

  function play(i: number) {
    if (!tables || outcome || board[i] !== "_" || training) return;
    const b = [...board];
    b[i] = human;
    if (!result(b)) b[agentMove(tables, ai, b)] = ai;
    setBoard(b);
  }

  const status = failed
    ? "Couldn’t load the agent."
    : !tables
      ? "Loading the agent…"
      : training
        ? `Training… ${progress}%`
        : outcome === "draw"
          ? "It’s a draw."
          : outcome
            ? outcome === human ? "You won!" : "The agent won."
            : "Your move.";

  const field = (name: keyof typeof DEFAULTS, label: string, min: number, max: number, step: string) => (
    <label className="ttt-field">
      {label}
      <input
        type="number" required min={min} max={max} step={step} inputMode="decimal"
        value={params[name]} disabled={training}
        onChange={(e) => setParams({ ...params, [name]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="ttt">
      <Link to="/projects/tic-tac-toe-ml" className="button button-outline">
        <ArrowLeft size={15} /> Back to project
      </Link>
      <h1>
        Play the agent<span className="title-dot">.</span>
      </h1>
      <p>
        A Q-learning agent that learned by playing itself. Train your own with the settings below,
        or use the pre-trained one. Everything runs in your browser. You are {human}.
      </p>

      <form className="ttt-form" onSubmit={train}>
        {field("epsilon", "Greed ε (0–1)", 0, 1, "any")}
        {field("alpha", "Learning rate α (0.001–1)", 0.001, 1, "any")}
        {field("gamma", "Discount γ (0–1)", 0, 1, "any")}
        {field("episodes", `Episodes (1,000–${MAX_EPISODES.toLocaleString()})`, 1000, MAX_EPISODES, "1")}
        <div className="inline-actions">
          <button className="button" type="submit" disabled={training}>
            {training ? "Training…" : "Train"}
          </button>
          <button className="button button-outline" type="button" disabled={training} onClick={usePretrained}>
            Use pre-trained agent
          </button>
        </div>
      </form>
      <p className="ttt-source">Agent: {source}</p>
      <p className="ttt-note" role="status" aria-live="polite">{note}</p>

      <p className="ttt-status" role="status" aria-live="polite">{status}</p>
      <label className="ttt-check">
        <input type="checkbox" checked={showQ} onChange={(e) => setShowQ(e.target.checked)} />
        Show Q-values (the agent’s value for each of your moves)
      </label>
      <div className="ttt-board" role="group" aria-label="Tic-tac-toe board">
        {board.map((c, i) => {
          const v = showQ ? qAt(i) : undefined;
          return (
            <button
              key={i}
              className={`ttt-cell ${i === best && showQ ? "is-best" : ""}`}
              disabled={!tables || !!outcome || c !== "_" || training}
              onClick={() => play(i)}
              aria-label={`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${c === "_" ? "empty" : c}${
                v !== undefined ? `, Q-value ${v.toFixed(2)}${i === best ? ", agent’s favourite" : ""}` : ""
              }`}
            >
              {c === "_" ? "" : c}
              {v !== undefined && <span className="ttt-q">{v.toFixed(2)}</span>}
            </button>
          );
        })}
      </div>
      <div className="inline-actions">
        <button className="button" onClick={() => reset("X", tables)} disabled={training}>New game as X</button>
        <button className="button button-outline" onClick={() => reset("O", tables)} disabled={training}>
          New game as O (agent first)
        </button>
      </div>
    </div>
  );
}
