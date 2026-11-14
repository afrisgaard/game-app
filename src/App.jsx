import { useState, useEffect, useMemo } from "react";
const KEY = "scorepad-v1";
const SUITS = ["♠","♥","♦","♣"];
const uid = () => Math.random().toString(36).slice(2, 9);

function load() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; }
}
const fresh = { players: [], rounds: [], lowWins: false, target: "" };

export default function App() {
  const [st, setSt] = useState(() => ({ ...fresh, ...(load() || {}) }));
  const [name, setName] = useState("");
  const [draft, setDraft] = useState({});
  const [neg, setNeg] = useState({});
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }, [st]);
  useEffect(() => { if (!confirm) return; const t = setTimeout(() => setConfirm(null), 3000); return () => clearTimeout(t); }, [confirm]);

  const totals = useMemo(() => {
    const t = {};
    st.players.forEach(p => { t[p.id] = st.rounds.reduce((a, r) => a + (Number(r.scores[p.id]) || 0), 0); });
    return t;
  }, [st.players, st.rounds]);

  const ranked = useMemo(() => {
    const list = st.players.map(p => ({ ...p, total: totals[p.id] }));
    list.sort((a, b) => st.lowWins ? a.total - b.total : b.total - a.total);
    let rank = 0, prev = null;
    return list.map((p, i) => { if (p.total !== prev) { rank = i + 1; prev = p.total; } return { ...p, rank }; });
  }, [st.players, totals, st.lowWins]);

  const target = parseInt(st.target, 10);
  const someoneHit = target > 0 && st.rounds.length > 0 && st.players.some(p => totals[p.id] >= target);
  const leaders = ranked.filter(p => p.rank === 1 && st.rounds.length > 0);

  const addPlayer = () => {
    const n = name.trim(); if (!n) return;
    setSt(s => ({ ...s, players: [...s.players, { id: uid(), name: n }] }));
    setName("");
  };
  const removePlayer = (id) => {
    if (st.rounds.length && confirm !== "rm-" + id) { setConfirm("rm-" + id); return; }
    setSt(s => ({ ...s, players: s.players.filter(p => p.id !== id) }));
    setConfirm(null);
  };

  const resetEntry = () => { setDraft({}); setNeg({}); setEditing(null); };

  const saveRound = () => {
    const scores = {};
    st.players.forEach(p => {
      const v = parseInt(draft[p.id], 10);
      scores[p.id] = isNaN(v) ? 0 : (neg[p.id] ? -Math.abs(v) : Math.abs(v));
    });
    setSt(s => editing
      ? { ...s, rounds: s.rounds.map(r => r.id === editing ? { ...r, scores } : r) }
      : { ...s, rounds: [...s.rounds, { id: uid(), scores }] });
    resetEntry();
  };

  const editRound = (r) => {
    const d = {}, n = {};
    st.players.forEach(p => { const v = r.scores[p.id] || 0; d[p.id] = v === 0 ? "" : String(Math.abs(v)); n[p.id] = v < 0; });
    setDraft(d); setNeg(n); setEditing(r.id);
    document.getElementById("entry")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const deleteRound = () => {
    if (confirm !== "del") { setConfirm("del"); return; }
    setSt(s => ({ ...s, rounds: s.rounds.filter(r => r.id !== editing) }));
    resetEntry(); setConfirm(null);
  };
  const newGame = () => {
    if (confirm !== "new") { setConfirm("new"); return; }
    setSt(s => ({ ...s, rounds: [] })); resetEntry(); setConfirm(null);
  };
  const clearAll = () => {
    if (confirm !== "clear") { setConfirm("clear"); return; }
    setSt({ ...fresh, lowWins: st.lowWins }); resetEntry(); setConfirm(null);
  };

  const editingIndex = st.rounds.findIndex(r => r.id === editing);
  const hasDraft = Object.values(draft).some(v => v !== "" && v != null);

  return (
    <div className="wrap">
      <header className="top">
        <h1>Scorepad<span className="suit" aria-hidden="true">♥</span></h1>
        <span className="meta">{st.rounds.length === 0 ? "No rounds yet" : st.rounds.length === 1 ? "1 round" : `${st.rounds.length} rounds`}</span>
      </header>

      {someoneHit && leaders.length > 0 && (
        <div className="banner" role="status">
          <span><strong>{leaders.map(l => l.name).join(" & ")}</strong> {leaders.length > 1 ? "win" : "wins"} with {leaders[0].total}</span>
          <button className="btn" onClick={newGame}>{confirm === "new" ? "Tap again to start over" : "Play again"}</button>
        </div>
      )}

      {st.players.length > 0 && (
        <section className="hand" aria-label="Standings">
          {ranked.map((p, i) => (
            <div key={p.id} className={"pcard" + (p.rank === 1 && st.rounds.length ? " lead" : "")}>
              <span className="corner" aria-hidden="true">{SUITS[st.players.findIndex(x => x.id === p.id) % 4]}</span>
              <span className="rank">{st.rounds.length ? ordinal(p.rank) : "\u00A0"}</span>
              <span className="name" title={p.name}>{p.name}</span>
              <span className="total">{p.total}</span>
            </div>
          ))}
        </section>
      )}

      <section className="sheet">
        <h2>Players</h2>
        {st.players.length === 0 && <p className="hint">Add everyone at the table to start keeping score.</p>}
        <div className="row">
          <input className="field" placeholder="Name" value={name} maxLength={24}
            onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()} aria-label="Player name" />
          <button className="btn primary" onClick={addPlayer} disabled={!name.trim()}>Add player</button>
        </div>
        {st.players.length > 0 && (
          <div className="chips">
            {st.players.map(p => (
              <span className="chip" key={p.id}>
                {confirm === "rm-" + p.id ? "Tap × again" : p.name}
                <button onClick={() => removePlayer(p.id)} aria-label={"Remove " + p.name}>×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {st.players.length > 0 && (
        <section className="sheet" id="entry">
          <h2>{editing ? `Edit round ${editingIndex + 1}` : `Round ${st.rounds.length + 1}`}</h2>
          <p className="hint">Leave a box empty for zero. Tap ± for minus points.</p>
          <div className="entry">
            {st.players.map(p => (
              <div className="entry-row" key={p.id}>
                <label htmlFor={"in-" + p.id}>{p.name}</label>
                <button className={"sign" + (neg[p.id] ? " neg" : "")} aria-pressed={!!neg[p.id]}
                  aria-label={(neg[p.id] ? "Minus" : "Plus") + " for " + p.name}
                  onClick={() => setNeg(n => ({ ...n, [p.id]: !n[p.id] }))}>{neg[p.id] ? "−" : "+"}</button>
                <input id={"in-" + p.id} className="num" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                  value={draft[p.id] || ""}
                  onChange={e => setDraft(d => ({ ...d, [p.id]: e.target.value.replace(/[^0-9]/g, "") }))}
                  onKeyDown={e => e.key === "Enter" && saveRound()} />
              </div>
            ))}
          </div>
          <div className="entry-actions">
            {editing && <button className="btn danger" onClick={deleteRound}>{confirm === "del" ? "Tap again to delete" : "Delete round"}</button>}
            {(editing || hasDraft) && <button className="btn ghost" onClick={resetEntry}>Cancel</button>}
            <button className="btn primary" onClick={saveRound}>{editing ? "Save changes" : "Add round"}</button>
          </div>
        </section>
      )}

      {st.players.length > 0 && (
        <section className="sheet">
          <h2>Score sheet</h2>
          {st.rounds.length === 0 ? <p className="empty">Rounds you add show up here. Tap a round to fix it.</p> : (
            <div className="tablebox">
              <table>
                <thead><tr><th scope="col">Round</th>{st.players.map(p => <th key={p.id} scope="col">{p.name}</th>)}</tr></thead>
                <tbody>
                  {st.rounds.map((r, i) => (
                    <tr key={r.id} className={r.id === editing ? "editing" : ""} onClick={() => editRound(r)}
                      tabIndex={0} onKeyDown={e => e.key === "Enter" && editRound(r)}>
                      <td>{i + 1}</td>
                      {st.players.map(p => { const v = r.scores[p.id] || 0; return <td key={p.id} className={v < 0 ? "neg" : ""}>{v}</td>; })}
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td>Total</td>{st.players.map(p => <td key={p.id}>{totals[p.id]}</td>)}</tr></tfoot>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="sheet settings">
        <h2>Game rules</h2>
        <div className="setting">
          <span className="lbl">Who wins</span>
          <div className="seg" role="group" aria-label="Who wins">
            <button aria-pressed={!st.lowWins} onClick={() => setSt(s => ({ ...s, lowWins: false }))}>Highest score</button>
            <button aria-pressed={st.lowWins} onClick={() => setSt(s => ({ ...s, lowWins: true }))}>Lowest score</button>
          </div>
        </div>
        <div className="setting">
          <label className="lbl" htmlFor="target">Game ends at<span className="sub">Optional. Ends when anyone reaches it.</span></label>
          <input id="target" className="field target" inputMode="numeric" placeholder="None" value={st.target}
            onChange={e => setSt(s => ({ ...s, target: e.target.value.replace(/[^0-9]/g, "") }))} />
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn ghost" onClick={newGame} disabled={!st.rounds.length}>{confirm === "new" ? "Tap again to confirm" : "New game, same players"}</button>
          <button className="btn danger" onClick={clearAll}>{confirm === "clear" ? "Tap again to confirm" : "Clear everything"}</button>
        </div>
      </section>
      <footer className="foot">Scorepad {__APP_VERSION__}</footer>
    </div>
  );
}

function ordinal(n) { const s = ["th","st","nd","rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
