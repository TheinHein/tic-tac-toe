const dom = (() => {
  const select = document.querySelector("select");
  const o = document.querySelector("#o");
  const x = document.querySelector("#x");
  const restart = document.querySelector("#restart-btn");
  const tiles = [...document.querySelectorAll("td")];
  const turn = document.querySelector(".turn-display");
  const instruction = document.querySelector(".note");
  const oScore = document.querySelector(".o-score");
  const xScore = document.querySelector(".x-score");
  const announce = document.querySelector(".announce");
  const note = document.querySelector(".note");

  return {
    select,
    o,
    x,
    restart,
    tiles,
    turn,
    instruction,
    oScore,
    xScore,
    announce,
    note,
  };
})();

const player = (sign) => {
  let score = 0;

  return {
    score,
    sign,
  };
};

const aiPlayer = (sign) => {
  let { score } = player(sign);
  const move = (board, ai, hu, lvl) => {
    let aiMove;
    let aiInt;

    if (finder.findWinner(board, hu)) return;
    else if (finder.findWinner(board, ai)) return;
    else if (finder.findTie(board)) return;
    if (lvl === "easy") aiInt = 1;
    if (lvl === "medium") aiInt = 5;
    if (lvl === "impossible") aiInt = 10;
    aiMove = moveBasedOnLvl(aiInt);
    board[aiMove.index] = ai.sign;
    // setTimeout(() => display.renderTiles(board, ai), 1500);
    function moveBasedOnLvl(aiPercentage) {
      let randPercentage = Math.floor(Math.random() * 10) + 1;
      if (randPercentage <= aiPercentage) {
        return minimax(board, ai, 0);
      } else {
        let randMove = {};
        let availSpots = finder.findEmptySpots(board);
        let randIndex = Math.floor(Math.random() * availSpots.length);
        randMove.index = availSpots[randIndex];
        return randMove;
      }
    }
    function minimax(newBoard, player, depth) {
      let availSpots = finder.findEmptySpots(newBoard);
      if (finder.findWinner(newBoard, hu)) return { score: depth - 10 };
      else if (finder.findWinner(newBoard, ai)) return { score: 10 - depth };
      else if (availSpots.length <= 0) return { score: 0 };
      const moves = [];
      for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player.sign;
        if (player.sign === ai.sign) {
          let result = minimax(newBoard, hu, depth + 1);
          move.score = result.score;
        } else {
          let result = minimax(newBoard, ai, depth + 1);
          move.score = result.score;
        }
        newBoard[availSpots[i]] = move.index;
        moves.push(move);
      }
      let bestMove;
      if (player.sign === ai.sign) {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }
      return moves[bestMove];
    }
  };

  return {
    score,
    sign,
    move,
  };
};
const ctrl = (() => {
  let lvl;
  let p1 = {};
  let p2 = {};
  let preferredSign = "o";
  let ai = {};
  let turn;
  let board = [];
  let oScore = 0;
  let xScore = 0;

  const init = () => {
    turn = "o";
    lvl = dom.select.value;
    board = Array.from(Array(9).keys());
    dom.note.classList.add("hideNote");
    if (finder.isGameEnd()) {
      finder.resetGameEnd();
      display.clearTiles();
    }
    if (lvl === "friend") {
      p1 = player("o");
      p2 = player("x");
    } else {
      if (preferredSign === "o") {
        p1 = player("o");
        ai = aiPlayer("x");
      } else if (preferredSign === "x") {
        p1 = player("x");
        ai = aiPlayer("o");
        ai.move(board, ai, p1);
        turn = p1.sign;
        display.renderTurn(turn);
        display.renderTiles(board, ai);
      }
    }
    display.renderScore(p1);
    display.renderScore(p2);
    display.renderScore(ai);
    display.closeAnnounce();
  };
  const pickSign = (e) => {
    preferredSign = e.target.id;
    display.clearTiles();
    init();
  };
  const selectLvl = () => {
    display.clearTiles();
    init();
  };
  const restart = () => {
    display.clearTiles();
    init();
    oScore = 0;
    xScore = 0;
    display.renderScore("o", oScore);
    display.renderScore("x", xScore);
  };
  const mark = (e) => {
    const index = e.target.id;
    if (board.length <= 0) init();
    if (typeof board[index] !== "number") return;
    if (finder.findWinner(board, p1)) return;
    else if (finder.findWinner(board, p2)) return;
    else if (finder.findWinner(board, ai)) return;
    if (lvl === "friend") {
      if (turn === "o") {
        board[index] = p1.sign;
        turn = "x";
      } else if (turn === "x") {
        board[index] = p2.sign;
        turn = "o";
      }
      display.renderTurn(turn);
      display.renderTiles(board);
      if (finder.findWinner(board, p1)) {
        if (p1.sign === "o") oScore = oScore + 1;
        if (p1.sign === "x") xScore = xScore + 1;
        display.renderScore("o", oScore);
        display.renderScore("x", xScore);
        display.renderWinTiles(finder.findWinner(board, p1).index);
        display.renderAnnounce(p1);
      } else if (finder.findWinner(board, p2)) {
        if (p2.sign === "o") oScore = oScore + 1;
        if (p2.sign === "x") xScore = xScore + 1;
        display.renderScore("o", oScore);
        display.renderScore("x", xScore);
        display.renderWinTiles(finder.findWinner(board, p2).index);
        display.renderAnnounce(p2);
      } else if (finder.findTie(board)) display.renderAnnounce("Tie");
    } else if (lvl !== "friend") {
      if (turn === p1.sign) {
        board[index] = p1.sign;
        turn = ai.sign;
        ai.move(board, ai, p1, lvl);
        turn = p1.sign;
        display.renderTurn(p1.sign);
        setTimeout(() => {
          display.renderTurn(ai.sign);
        }, 500);
        setTimeout(() => {
          display.renderTurn(p1.sign);
        }, 1200);
      }
      // display.renderTurn(turn);
      display.renderTiles(board, ai);
      if (finder.findWinner(board, p1)) {
        if (p1.sign === "o") oScore = oScore + 1;
        if (p1.sign === "x") xScore = xScore + 1;
        display.renderScore("o", oScore);
        display.renderScore("x", xScore);
        display.renderWinTiles(finder.findWinner(board, p1).index);
        display.renderAnnounce(p1);
      } else if (finder.findWinner(board, ai)) {
        if (ai.sign === "o") oScore = oScore + 1;
        if (ai.sign === "x") xScore = xScore + 1;
        display.renderScore("o", oScore);
        display.renderScore("x", xScore);
        display.renderWinTiles(finder.findWinner(board, ai).index);
        display.renderAnnounce(ai);
      } else if (finder.findTie(board)) display.renderAnnounce("Tie");
    }
  };
  return {
    init,
    pickSign,
    mark,
    selectLvl,
    restart,
  };
})();

const finder = (() => {
  let gameEnd = false;
  const winCond = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const findWinner = (board, player) => {
    let marked = board.reduce(
      (a, e, i) => (e === player.sign ? a.concat(i) : a),
      []
    );
    let winner = null;
    for (let [index, win] of winCond.entries()) {
      if (win.every((ele) => marked.indexOf(ele) > -1)) {
        winner = { index, player };
        gameEnd = true;
        break;
      }
    }
    return winner;
  };
  const findEmptySpots = (board) => {
    return board.filter((spot) => typeof spot === "number");
  };
  const findTie = (board) => {
    if (findEmptySpots(board).length <= 0) {
      gameEnd = true;
      return true;
    }
  };
  const isGameEnd = () => gameEnd;
  const resetGameEnd = () => (gameEnd = false);
  return {
    findWinner,
    findEmptySpots,
    findTie,
    isGameEnd,
    resetGameEnd,
    winCond,
  };
})();

const events = (() => {
  dom.tiles.forEach((tile) => tile.addEventListener("click", ctrl.mark, false));
  dom.o.addEventListener("click", ctrl.pickSign, false);
  dom.x.addEventListener("click", ctrl.pickSign, false);
  dom.restart.addEventListener("click", ctrl.restart, false);
  dom.select.addEventListener("change", ctrl.selectLvl, false);
  dom.announce.addEventListener("click", ctrl.init, false);
})();

const element = (() => {
  const createScore = (src) => {
    const score = document.createElement("img");
    score.src = `./images/${src}-symbol.svg`;
    return score;
  };
  const createSign = (src, ai) => {
    if (src === "o") {
      const o = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      o.setAttribute("aria-hidden", "true");
      o.setAttribute("viewBox", "0 0 100 100");
      o.setAttribute("width", "90px");
      o.setAttribute("height", "90px");
      o.setAttribute("preserveAspectRatio", "xMidYMid meet");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", "36");
      circle.setAttribute("stroke", "rgb(150,0,0)");
      circle.setAttribute("stroke-linecap", "round");
      circle.setAttribute("stroke-dashoffset", "0");
      circle.setAttribute("stroke-dasharray", "226");
      circle.setAttribute("stroke-width", "20");
      circle.setAttribute("fill", "none");
      circle.classList.add("circle");
      if (ai && src === ai.sign) setTimeout(() => o.appendChild(circle), 500);
      else o.appendChild(circle);
      return o;
    } else if (src === "x") {
      const x = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      x.setAttribute("aria-hidden", "true");
      x.setAttribute("viewBox", "0 0 100 100");
      x.setAttribute("width", "80px");
      x.setAttribute("height", "90px");
      line1.setAttribute("x1", "10");
      line1.setAttribute("y1", "10");
      line1.setAttribute("x2", "90");
      line1.setAttribute("y2", "90");
      line1.setAttribute("stroke", "rgb(30,30,30)");
      line1.setAttribute("stroke-linecap", "round");
      line1.setAttribute("stroke-width", "20");
      line1.setAttribute("stroke-dasharray", "200");

      line2.setAttribute("x1", "90");
      line2.setAttribute("y1", "10");
      line2.setAttribute("x2", "10");
      line2.setAttribute("y2", "90");
      line2.setAttribute("stroke", "rgb(30,30,30)");
      line2.setAttribute("stroke-linecap", "round");
      line2.setAttribute("stroke-width", "20");
      line2.setAttribute("stroke-dasharray", "200");

      line1.classList.add("line1");
      line2.classList.add("line2");
      if (ai && src === ai.sign) {
        setTimeout(() => {
          x.appendChild(line1);
          x.appendChild(line2);
        }, 500);
      } else {
        x.appendChild(line1);
        x.appendChild(line2);
      }

      return x;
    }
  };
  const createTxt = (data) => {
    const txt = document.createElement("div");
    txt.textContent = data;
    return txt;
  };
  return {
    createScore,
    createSign,
    createTxt,
  };
})();

const display = (() => {
  const renderScore = (player, score) => {
    if (player === "o") dom.oScore.textContent = score;
    if (player === "x") dom.xScore.textContent = score;
  };
  const renderTurn = (turn) => {
    if (dom.turn.firstChild) {
      dom.turn.removeChild(dom.turn.firstChild);
      dom.turn.appendChild(element.createScore(turn));
    } else {
      dom.turn.appendChild(element.createScore(turn));
    }
  };
  const renderTiles = (board, ai) => {
    for (let i = 0; i < 9; i++) {
      if (typeof board[i] !== "number") {
        if (!dom.tiles[i].firstChild) {
          dom.tiles[i].appendChild(element.createSign(board[i], ai));
        }
      }
    }
  };

  const renderWinTiles = (index) => {
    for (let i of finder.winCond[index]) {
      dom.tiles.forEach((tile) => {
        if (parseInt(tile.id) === i) {
          setTimeout(() => {
            tile.style.setProperty("background-color", "#FF3737");
          }, 500);
        }
      });
    }
  };

  const clearTiles = () => {
    dom.tiles.forEach((tile) => {
      tile.style.removeProperty("background-color", "green");
      if (tile.firstChild) tile.removeChild(tile.firstChild);
    });
  };
  const renderAnnounce = (player) => {
    const announce = dom.announce;
    if (announce.firstChild) announce.removeChild(announce.firstChild);
    if (announce.lastChild) announce.removeChild(announce.lastChild);
    if (player !== "Tie") {
      setTimeout(() => {
        dom.announce.appendChild(element.createSign(player.sign));
        dom.announce.appendChild(element.createTxt("WINNER"));
      }, 1500);
    } else if (player === "Tie") {
      const div = document.createElement("div");
      div.appendChild(element.createSign("o"));
      div.appendChild(element.createSign("x"));
      setTimeout(() => {
        dom.announce.appendChild(div);
        dom.announce.appendChild(element.createTxt("TIE"));
      }, 1500);
    }
    dom.announce.classList.add("showAnnounce");
  };
  const closeAnnounce = () => {
    dom.announce.classList.remove("showAnnounce");
  };
  return {
    renderScore,
    renderTurn,
    renderTiles,
    renderWinTiles,
    clearTiles,
    renderAnnounce,
    closeAnnounce,
  };
})();
