const COURTS = [
  { id: 1, name: "Court 1", lane: "KOTC Top", pairSlots: [1, 2], className: "kotc" },
  { id: 2, name: "Court 2", lane: "Pool A Top", pairSlots: [3, 4], className: "pool-a" },
  { id: 3, name: "Court 3", lane: "Pool A Bottom", pairSlots: [5, 6], className: "pool-a" },
  { id: 4, name: "Court 4", lane: "Pool B Top", pairSlots: [7, 8], className: "pool-b" },
  { id: 5, name: "Court 5", lane: "Pool B Bottom", pairSlots: [9, 10], className: "pool-b" },
];

const SAMPLE_PLAYERS = [
  "Avery Chen",
  "Blake Morgan",
  "Camila Rivera",
  "Drew Patel",
  "Elliot Brooks",
  "Finley Reed",
  "Gia Morales",
  "Harper Quinn",
  "Isaac Bennett",
  "Jordan Hayes",
  "Kai Thompson",
  "Logan Wright",
  "Maya Foster",
  "Noah Price",
  "Olivia Stone",
  "Parker Bell",
  "Quinn Ellis",
  "Riley James",
  "Sage Carter",
  "Taylor Kim",
];

const state = {
  currentGame: 0,
  players: [],
  pairs: new Map(),
  selectedWinners: new Map(),
  pendingResults: null,
  history: [],
  ended: false,
};

const els = {
  appTitle: document.querySelector("#appTitle"),
  gameChip: document.querySelector("#gameChip"),
  setupView: document.querySelector("#setupView"),
  gameView: document.querySelector("#gameView"),
  statsView: document.querySelector("#statsView"),
  playerInput: document.querySelector("#playerInput"),
  playerCount: document.querySelector("#playerCount"),
  setupStatus: document.querySelector("#setupStatus"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  startButton: document.querySelector("#startButton"),
  newSessionButton: document.querySelector("#newSessionButton"),
  statsNewSessionButton: document.querySelector("#statsNewSessionButton"),
  roundTitle: document.querySelector("#roundTitle"),
  roundSubtitle: document.querySelector("#roundSubtitle"),
  courtGrid: document.querySelector("#courtGrid"),
  reviewStatus: document.querySelector("#reviewStatus"),
  submitButton: document.querySelector("#submitButton"),
  clearButton: document.querySelector("#clearButton"),
  confirmButton: document.querySelector("#confirmButton"),
  endButton: document.querySelector("#endButton"),
  statsSubtitle: document.querySelector("#statsSubtitle"),
  statsTable: document.querySelector("#statsTable"),
  resultsRecap: document.querySelector("#resultsRecap"),
};

function ordinal(day) {
  if (day > 3 && day < 21) return `${day}th`;
  const suffixes = { 1: "st", 2: "nd", 3: "rd" };
  return `${day}${suffixes[day % 10] || "th"}`;
}

function formatToday() {
  const today = new Date();
  const month = today.toLocaleString("en-US", { month: "short" });
  return `${month} ${ordinal(today.getDate())}, ${today.getFullYear()}`;
}

function parsePlayers(value) {
  return value
    .split(/[\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function randomId(prefix) {
  return globalThis.crypto?.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function makePlayers(names) {
  return names.map((name, index) => ({
    id: randomId(`player-${index}`),
    name,
    wins: 0,
    losses: 0,
    kotcWins: 0,
  }));
}

function createPair(players, previousSlot = null) {
  return {
    id: randomId("pair"),
    previousSlot,
    players,
  };
}

function assignInitialPairs(players) {
  const shuffled = shuffle(players);
  const pairs = new Map();
  for (let index = 0; index < 10; index += 1) {
    pairs.set(index + 1, createPair(shuffled.slice(index * 2, index * 2 + 2), index + 1));
  }
  return pairs;
}

function playerNames(pair) {
  return pair.players.map((player) => escapeHtml(player.name)).join(" / ");
}

function namesList(names) {
  return names.map((name) => escapeHtml(name)).join(" / ");
}

function renderHeader() {
  els.appTitle.textContent = `CCPC | King of the Court (20 Players) - ${formatToday()}`;
  els.gameChip.textContent = state.currentGame ? `Game ${state.currentGame}` : "Setup";
}

function renderSetupStatus() {
  const names = parsePlayers(els.playerInput.value);
  const uniqueNames = new Set(names.map((name) => name.toLocaleLowerCase()));
  els.playerCount.textContent = `${names.length} / 20`;
  els.startButton.disabled = names.length !== 20 || uniqueNames.size !== 20;

  if (!names.length || names.length === 20) {
    els.setupStatus.textContent = uniqueNames.size !== names.length ? "Player names must be unique." : "";
    return;
  }

  els.setupStatus.textContent =
    names.length < 20 ? `${20 - names.length} more needed.` : `${names.length - 20} too many.`;
}

function setView(view) {
  els.setupView.classList.toggle("hidden", view !== "setup");
  els.gameView.classList.toggle("hidden", view !== "game");
  els.statsView.classList.toggle("hidden", view !== "stats");
}

function renderGame() {
  state.pendingResults = null;
  state.selectedWinners.clear();
  renderHeader();
  els.roundTitle.textContent = `Game ${state.currentGame}`;
  els.roundSubtitle.textContent = state.ended ? "Games complete" : "Five courts active";
  els.courtGrid.innerHTML = COURTS.map(renderCourt).join("");
  els.reviewStatus.textContent = "Select one winner per court.";
  els.submitButton.disabled = state.ended;
  els.clearButton.disabled = true;
  els.confirmButton.disabled = true;
  els.endButton.classList.toggle("hidden", state.currentGame < 4);
  els.endButton.disabled = true;
  setView("game");
}

function renderCourt(court) {
  const [slotA, slotB] = court.pairSlots;
  const pairA = state.pairs.get(slotA);
  const pairB = state.pairs.get(slotB);
  return `
    <article class="court-card ${court.className}">
      <div class="court-heading">
        <strong>${court.name}</strong>
        <span>${court.lane}</span>
      </div>
      <div class="matchup">
        ${renderTeamOption(court.id, slotA, pairA)}
        ${renderTeamOption(court.id, slotB, pairB)}
      </div>
    </article>
  `;
}

function renderTeamOption(courtId, slot, pair) {
  const inputId = `court-${courtId}-slot-${slot}`;
  return `
    <label class="team-option" for="${inputId}">
      <input id="${inputId}" type="radio" name="court-${courtId}" value="${slot}" ${state.ended ? "disabled" : ""}>
      <span>
        <span class="team-name">Pair ${slot}</span>
        <span class="players">${playerNames(pair)}</span>
      </span>
    </label>
  `;
}

function getCourtResults() {
  return COURTS.map((court) => {
    const selectedSlot = state.selectedWinners.get(court.id);
    const [slotA, slotB] = court.pairSlots;
    const loserSlot = selectedSlot === slotA ? slotB : slotA;
    return {
      court,
      winnerSlot: selectedSlot,
      loserSlot,
      winnerPair: state.pairs.get(selectedSlot),
      loserPair: state.pairs.get(loserSlot),
    };
  });
}

function allCourtsSelected() {
  return COURTS.every((court) => state.selectedWinners.has(court.id));
}

function buildBlockedPartners(losingPairs) {
  const blocked = new Map();
  losingPairs.forEach((pair) => {
    const [first, second] = pair.players;
    if (!blocked.has(first.id)) blocked.set(first.id, new Set());
    if (!blocked.has(second.id)) blocked.set(second.id, new Set());
    blocked.get(first.id).add(second.id);
    blocked.get(second.id).add(first.id);
  });
  return blocked;
}

function hasBlockedPartner(pairPlayers, blocked) {
  const [first, second] = pairPlayers;
  return blocked.get(first.id)?.has(second.id) || false;
}

function createReassignedPairs(players, losingPairs, targetSlots) {
  const blocked = buildBlockedPartners(losingPairs);

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const shuffled = shuffle(players);
    const nextPairs = [];
    let valid = true;

    for (let index = 0; index < targetSlots.length; index += 1) {
      const pairPlayers = shuffled.slice(index * 2, index * 2 + 2);
      if (hasBlockedPartner(pairPlayers, blocked)) {
        valid = false;
        break;
      }
      nextPairs.push(createPair(pairPlayers, targetSlots[index]));
    }

    if (valid) return nextPairs;
  }

  return targetSlots.map((slot, index) => createPair(players.slice(index * 2, index * 2 + 2), slot));
}

function commitGame(results) {
  results.forEach(({ court, winnerPair, loserPair }) => {
    winnerPair.players.forEach((player) => {
      player.wins += 1;
      if (court.id === 1) {
        player.kotcWins += 1;
      }
    });
    loserPair.players.forEach((player) => {
      player.losses += 1;
    });
  });

  state.history.push({
    game: state.currentGame,
    results: results.map(({ court, winnerSlot, loserSlot, winnerPair, loserPair }) => ({
      court: court.name,
      lane: court.lane,
      winnerSlot,
      loserSlot,
      winners: winnerPair.players.map((player) => player.name),
      losers: loserPair.players.map((player) => player.name),
    })),
  });

  const nextPairs = new Map();
  nextPairs.set(1, createPair(results[0].winnerPair.players, 1));
  nextPairs.set(2, createPair(results[1].winnerPair.players, 2));
  nextPairs.set(3, createPair(results[2].winnerPair.players, 3));
  nextPairs.set(5, createPair(results[3].winnerPair.players, 5));
  nextPairs.set(7, createPair(results[4].winnerPair.players, 7));

  const poolALosers = [results[0].loserPair, results[1].loserPair];
  const poolBLosers = [results[2].loserPair, results[3].loserPair, results[4].loserPair];
  const poolAPlayers = poolALosers.flatMap((pair) => pair.players);
  const poolBPlayers = poolBLosers.flatMap((pair) => pair.players);

  createReassignedPairs(poolAPlayers, poolALosers, [4, 6]).forEach((pair, index) => {
    nextPairs.set([4, 6][index], pair);
  });
  createReassignedPairs(poolBPlayers, poolBLosers, [8, 9, 10]).forEach((pair, index) => {
    nextPairs.set([8, 9, 10][index], pair);
  });

  state.pairs = nextPairs;
}

function submitResults() {
  if (!allCourtsSelected()) {
    els.reviewStatus.textContent = "Every court needs a winner.";
    return;
  }

  state.pendingResults = getCourtResults();
  els.reviewStatus.textContent = "Results ready to confirm.";
  els.clearButton.disabled = false;
  els.confirmButton.disabled = false;
  els.submitButton.disabled = true;
  els.endButton.classList.toggle("hidden", state.currentGame < 4);
  els.endButton.disabled = state.currentGame < 4;
}

function clearResults() {
  state.pendingResults = null;
  state.selectedWinners.clear();
  document.querySelectorAll(".team-option input").forEach((input) => {
    input.checked = false;
  });
  els.reviewStatus.textContent = "Select one winner per court.";
  els.clearButton.disabled = true;
  els.confirmButton.disabled = true;
  els.submitButton.disabled = false;
  els.endButton.disabled = true;
}

function confirmResults() {
  if (!state.pendingResults) return;
  commitGame(state.pendingResults);

  if (state.currentGame >= 4) {
    state.ended = true;
    state.pendingResults = null;
    els.reviewStatus.textContent = "Game 4 results confirmed. End games when ready.";
    els.submitButton.disabled = true;
    els.clearButton.disabled = true;
    els.confirmButton.disabled = true;
    els.endButton.classList.remove("hidden");
    els.endButton.disabled = false;
    document.querySelectorAll(".team-option input").forEach((input) => {
      input.disabled = true;
    });
    return;
  }

  state.currentGame += 1;
  renderGame();
}

function renderStats() {
  const sortedPlayers = [...state.players].sort((first, second) => {
    const firstTotal = first.wins + first.losses;
    const secondTotal = second.wins + second.losses;
    const firstPct = firstTotal ? first.wins / firstTotal : 0;
    const secondPct = secondTotal ? second.wins / secondTotal : 0;
    return secondPct - firstPct || second.wins - first.wins || first.name.localeCompare(second.name);
  });

  els.statsSubtitle.textContent = `${state.history.length} games completed`;
  els.statsTable.innerHTML = sortedPlayers
    .map((player) => {
      const total = player.wins + player.losses;
      const winPct = total ? Math.round((player.wins / total) * 100) : 0;
      return `
        <tr>
          <td>${escapeHtml(player.name)}</td>
          <td>${player.wins}</td>
          <td>${player.losses}</td>
          <td>${player.kotcWins}</td>
          <td>${winPct}%</td>
        </tr>
      `;
    })
    .join("");
  els.resultsRecap.innerHTML = renderResultsRecap();

  els.gameChip.textContent = "Stats";
  setView("stats");
}

function renderResultsRecap() {
  if (!state.history.length) {
    return "";
  }

  return `
    <div class="recap-heading">
      <h2>Game Results Recap</h2>
      <p>Winners vs losers by court</p>
    </div>
    <div class="recap-list">
      ${state.history
        .map(
          (game) => `
            <article class="recap-game">
              <h3>Game ${game.game}</h3>
              <div class="recap-courts">
                ${game.results
                  .map(
                    (result) => `
                      <div class="recap-court">
                        <span class="recap-court-name">${escapeHtml(result.court)} | ${escapeHtml(result.lane)}</span>
                        <div class="recap-match">
                          <strong>Pair ${result.winnerSlot}: ${namesList(result.winners)}</strong>
                          <span>defeated</span>
                          <strong>Pair ${result.loserSlot}: ${namesList(result.losers)}</strong>
                        </div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function startGame() {
  const names = parsePlayers(els.playerInput.value);
  const uniqueNames = new Set(names.map((name) => name.toLocaleLowerCase()));
  if (names.length !== 20 || uniqueNames.size !== 20) {
    renderSetupStatus();
    return;
  }

  state.players = makePlayers(names);
  state.currentGame = 1;
  state.pairs = assignInitialPairs(state.players);
  state.history = [];
  state.ended = false;
  renderGame();
}

function resetSession() {
  state.currentGame = 0;
  state.players = [];
  state.pairs = new Map();
  state.selectedWinners.clear();
  state.pendingResults = null;
  state.history = [];
  state.ended = false;
  renderHeader();
  renderSetupStatus();
  setView("setup");
}

els.playerInput.addEventListener("input", renderSetupStatus);
els.loadSampleButton.addEventListener("click", () => {
  els.playerInput.value = SAMPLE_PLAYERS.join("\n");
  renderSetupStatus();
});
els.startButton.addEventListener("click", startGame);
els.newSessionButton.addEventListener("click", resetSession);
els.statsNewSessionButton.addEventListener("click", resetSession);
els.submitButton.addEventListener("click", submitResults);
els.clearButton.addEventListener("click", clearResults);
els.confirmButton.addEventListener("click", confirmResults);
els.endButton.addEventListener("click", () => {
  if (state.pendingResults) {
    commitGame(state.pendingResults);
    state.pendingResults = null;
  }
  state.ended = true;
  renderStats();
});
els.courtGrid.addEventListener("change", (event) => {
  if (!event.target.matches("input[type='radio']")) return;
  const courtId = Number(event.target.name.replace("court-", ""));
  const slot = Number(event.target.value);
  state.selectedWinners.set(courtId, slot);
  state.pendingResults = null;
  els.submitButton.disabled = false;
  els.clearButton.disabled = true;
  els.confirmButton.disabled = true;
  els.reviewStatus.textContent = allCourtsSelected()
    ? "Ready to submit."
    : "Select one winner per court.";
});

renderHeader();
renderSetupStatus();
