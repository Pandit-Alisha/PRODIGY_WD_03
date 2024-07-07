document.addEventListener('DOMContentLoaded', function() {
    const settingsContainer = document.getElementById('settingsContainer');
    const gameContainer = document.getElementById('gameContainer');
    const playerNameInput = document.getElementById('playerName');
    const aiNameInput = document.getElementById('aiName');
    const difficultySelect = document.getElementById('difficulty');
    const startGameButton = document.getElementById('startGameButton');
    const backButton = document.getElementById('backButton');
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restartButton');
    const warningMessage = document.getElementById('warningMessage');

    let currentPlayer = '';
    let aiPlayer = '';
    let currentPlayerTurn = '';
    let boardState = ['', '', '', '', '', '', '', '', '']; 

    function startGame() {
        const player = playerNameInput.value.trim();
        const ai = aiNameInput.value.trim();

        if (!player || !ai) {
            warningMessage.style.display = 'block';
            return;
        } else {
            warningMessage.style.display = 'none';
        }

        const difficulty = difficultySelect.value;

        currentPlayer = player;
        aiPlayer = ai;
        currentPlayerTurn = currentPlayer;

        settingsContainer.style.display = 'none';
        gameContainer.style.display = 'block';

        initializeBoard();

        message.textContent = `${currentPlayer}'s turn`;

        if (currentPlayerTurn === aiPlayer) {
            setTimeout(makeAiMove, 1000); 
        }
    }

    function initializeBoard() {
        boardState = ['', '', '', '', '', '', '', '', ''];
        board.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('x', 'o');
            cell.textContent = '';
            cell.removeEventListener('click', handleCellClick); 
            cell.addEventListener('click', handleCellClick, { once: true });
        });
    }

    function handleCellClick(event) {
        const cell = event.target;
        const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);

        if (cell.classList.contains('cell') && !boardState[cellIndex]) {
            boardState[cellIndex] = currentPlayerTurn === currentPlayer ? 'X' : 'O';
            updateCell(cell, boardState[cellIndex]);

            if (checkWin(currentPlayerTurn)) {
                endGame(`${currentPlayerTurn} wins!`);
            } else if (checkDraw()) {
                endGame('Draw!');
            } else {
                currentPlayerTurn = currentPlayerTurn === currentPlayer ? aiPlayer : currentPlayer;
                message.textContent = `${currentPlayerTurn === currentPlayer ? currentPlayer : aiPlayer}'s turn`;

                if (currentPlayerTurn === aiPlayer) {
                    setTimeout(makeAiMove, 1000); 
                }
            }
        }
    }

    function updateCell(cell, symbol) {
        cell.textContent = symbol;
        cell.classList.add(symbol.toLowerCase());
    }

    function makeAiMove() {
        let cellIndex;

        switch (difficultySelect.value) {
            case 'easy':
                cellIndex = getRandomEmptyCell();
                break;
            case 'medium':
                cellIndex = getBestMove('medium');
                break;
            case 'hard':
                cellIndex = getBestMove('hard');
                break;
            default:
                cellIndex = getRandomEmptyCell();
                break;
        }

        if (cellIndex !== undefined && boardState[cellIndex] === '') {
            boardState[cellIndex] = 'O';
            const selectedCell = board.querySelector(`.cell:nth-child(${cellIndex + 1})`);
            updateCell(selectedCell, 'O');

            if (checkWin(aiPlayer)) {
                endGame(`${aiPlayer} wins!`);
            } else if (checkDraw()) {
                endGame('Draw!');
            } else {
                currentPlayerTurn = currentPlayer;
                message.textContent = `${currentPlayer}'s turn`;
            }
        }
    }

    function getRandomEmptyCell() {
        const emptyCells = boardState.reduce((acc, cell, index) => {
            if (!cell) acc.push(index);
            return acc;
        }, []);

        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : undefined;
    }

    function getBestMove(difficulty) {
        let bestMove;
        if (difficulty === 'medium') {
            bestMove = getBlockMove();
            if (bestMove === undefined) {
                bestMove = getRandomEmptyCell();
            }
        } else if (difficulty === 'hard') {
            bestMove = minimax(boardState, 'O').index;
        }
        return bestMove;
    }

    function getBlockMove() {
        const playerMark = 'X';
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = playerMark;
                if (checkWin(currentPlayer)) {
                    boardState[i] = '';
                    return i;
                }
                boardState[i] = '';
            }
        }
        return undefined;
    }

    function minimax(newBoard, player) {
        const availSpots = newBoard.reduce((acc, cell, index) => {
            if (!cell) acc.push(index);
            return acc;
        }, []);

        if (checkWin(currentPlayer)) {
            return { score: -10 };
        } else if (checkWin(aiPlayer)) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === 'O') {
                const result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                const result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    }

    function checkWin(player) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6] 
        ];

        return winningCombinations.some(combination => {
            return combination.every(index => boardState[index] === (player === currentPlayer ? 'X' : 'O'));
        });
    }

    function checkDraw() {
        return boardState.every(cell => cell !== '');
    }

function endGame(messageText) {
    message.textContent = messageText;

// Adding congratulations note..
    if (messageText.includes('wins')) {
        message.textContent += ' Congratulations!';
    }

    board.querySelectorAll('.cell').forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
}

    // Function to restart the game
    function restartGame() {
        // Reset game variables
        currentPlayerTurn = currentPlayer;

        // Initialize the board again
        initializeBoard();

        // Display initial message
        message.textContent = `${currentPlayer}'s turn`;

        if (currentPlayerTurn === aiPlayer) {
            setTimeout(makeAiMove, 1000); 
        }
    }

    startGameButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    backButton.addEventListener('click', function() {
        gameContainer.style.display = 'none';
        settingsContainer.style.display = 'block';
    });
});
