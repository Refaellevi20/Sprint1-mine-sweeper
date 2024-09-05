// 'use strict'
//* doest work with use strict
//* took hours to figurte


const BOOM = '💣'
const FLAG = '⛳'

//* levels of the game 
const levels = {
    4: { size: 4, mines: 2 },
    8: { size: 8, mines: 14 },
    12: { size: 12, mines: 32 }
}
//* g global
var gBoard
var gBoomCount = 0
var gIntervalAdjacentMines
var gFirstClick = true
var gMaxLife = 3
var gScore = 0
var gHints = 3
var gHintActive = false

var timerInterval
var startTime
var gGameOver = false

// '💗'
// '💡'
//* active the function from the html
function onInitGame() {
    //* every time i start the game i want them to start from the arigonal numbers
    gScore = 0
    gMaxLife = 3
    updateLife(gMaxLife)
    // updateScore(1)

    //* element in your HTML is used to allow the user to choose a difficulty level ( Beginner, Medium, Expert)
    //* property retrieves the current value of the selected option in the select
    //* in anther word  This value corresponds to the difficulty level selected by the user
    const selectedSize = parseInt(document.querySelector('select').value)
    gBoard = buildBoard(selectedSize)

    //* each difficulty level to a specific board size and number of mines
    placeMines(levels[selectedSize].mines)
    setMinesNegsCount(gBoard)
    updateIcon(1)
    renderBoard(gBoard)
    stopTimer()
}


function placeMines(minesCount) {
    var placedMines = 0
    while (placedMines < minesCount) {
        const locations = boomRandomLocations()
        console.log(locations)

        const cell = gBoard[locations.i][locations.j]
        if (!cell.mine) {
            cell.mine = true
            placedMines++
        }
    }
}



function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                mine: false,
                adjacentMines: 0,
                revealed: false,
                flagged: false
            }
        }
    }
    //  console.log(board)

    return board
}

function boomRandomLocations() {
    //* random location for thr mines
    //* i choosed  Math.floor(Math.random() not using a lot of code like getRandomIT (i like this one)
    const size = gBoard.length
    return {
        i: Math.floor(Math.random() * size),
        j: Math.floor(Math.random() * size)
    }
}


function renderBoard(board) {
    //* Initializes an empty string strHtml
    //* which will hold the HTML for the board.

    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            var cellContent = ''
            //* mine is the boom (not really)
            if (cell.revealed) {
                cellContent = cell.mine ? BOOM : cell.adjacentMines || ''
            } else if (cell.flagged) {
                cellContent = FLAG
            }
            //* For each cell adds a cellContent
            //* on the right click + left
            strHtml += `<td class="cell-${i}-${j} ${cell.revealed ? 'revealed' : ''}"  onclick="onCellClicked(event, ${i}, ${j})" oncontextmenu="onCellRightClicked(event, ${i}, ${j})">  
                          ${cellContent}
                        </td>`
            //*  which is an empty string (for now)
        }
        strHtml += '</tr>'
    }
    //* Select the tbody element with class "game-board" and set its innerHTML
    const elGameBoard = document.querySelector('.game-board')
    elGameBoard.innerHTML = strHtml
}


//* location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    //* Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

// 

//* checking 
function setMinesNegsCount(board) {
    //*  This starts a loop that iterates over each row of the board.
    //* row is an index variable that will range from 0 to the total number of rows (board.length).
    //* and the same about col but moving with row together 
    for (var row = 0; row < board.length; row++) {
        for (var col = 0; col < board[row].length; col++) {
            if (!board[row][col].mine) {
                //* the tNeighbors are around the place i clicked
                board[row][col].adjacentMines = countNeighbors(row, col, board)
            }
            //* the j +i in the location of the row and the cal 
            //* for example row 2 cal 2 so the location is 2,2
            //* adjacentMines around the cell i clicked (Neighbors)
            console.log(`Cell (${row}, ${col}) has ${board[row][col].adjacentMines} adjacent mines. cool`)
            //  renderBoard(board[row][col].adjacentMines,mine)
        }
    }
}

//* checking who is the Neighbors of the place that i clicked
//* and ofc not including the place i clicked
//* continue meaning skip/jump 
function countNeighbors(row, col, board) {
    var mineCount = 0
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === row && j === col) continue
            if (board[i][j].mine) mineCount++
        }
    }
    return mineCount
}
//* the score does not work yet
function onCellClicked(event, i, j) {

    const cell = gBoard[i][j]
    if (cell.revealed || cell.flagged) return

    //* If hint mode is active, reveal the cell and neighbors for 1 second
    if (gHintActive) {
        revealHint(i, j)
        setTimeout(() => {
            hideHint(i, j)
            gHintActive = false;
        }, 1000)
        return
    }

    updateLife(gMaxLife)
    startTimer()
    cell.revealed = true

    if (cell.mine) {
        if (gFirstClick) {
            gFirstClick = false

            while (true) {

                const locations = boomRandomLocations()
                if (i !== locations.i || j !== locations.j) {

                    const changeCell = gBoard[locations.i][locations.j]
                    if (changeCell.mine === false) {
                        changeCell.mine = true
                        cell.mine = false
                        setMinesNegsCount(gBoard)
                        renderBoard()
                        return
                    }

                }
            }

        } else {
            gameOver(false)
            return
        }
    } else {
        gFirstClick = false

        // Trigger full expand if the cell has no adjacent mines
        if (cell.adjacentMines === 0) {
            fullExpand(i, j)
        }

        //* score add only  when i click on cell.adjacentMines also update the score
        if (cell.adjacentMines) {
            gScore++
            updateScore(gScore)
        }

        renderBoard(gBoard)

        if (checkVictory()) {
            gameOver(true)
            stopTimer()

            //* Update the best score if it is in the new record

        }
    }
}

//* for the flag Right clicked 
function onCellRightClicked(event, i, j) {
    event.preventDefault()
    const cell = gBoard[i][j]
    if (cell.revealed) return
    cell.flagged = !cell.flagged
    renderBoard(gBoard)
}
//* the game is finish when 
function gameOver(isWin) {

    clearInterval(timerInterval)
    stopTimer()
    gGameOver = true
    if (isWin) {
        clearInterval(timerInterval)
        stopTimer()
        revealAllMines()

        gGameOver = true
        updateIcon(2)
        alert('Victorious!')

        //*select is from the html and
        //* the value  Retrieves the currently selected value from the-> <select> element 
        //* Converts the selected value (which is a string) into an integer using parseInt
        // debugger 
        const selectSize = parseInt(document.querySelector('select').value)
        updateBestScore(selectSize, gScore)

    } else {
        if (gMaxLife === 0) {
            clearInterval(timerInterval)
            stopTimer()

            revealAllMines()

            updateIcon(0)
            alert('Game over! You lost.')
        } else {
            gMaxLife--
            updateLife(gMaxLife)
        }


    }
}
//* check victory if i won by finding all the mines
//* means i open all the cell except mine and empty cells
function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if ((cell.mine && !cell.flagged) || (!cell.mine && !cell.revealed)) return false
        }
    }
    return true
}
//* if i hit one mine i can see all the mine and i also lost
function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].mine) {
                gBoard[i][j].revealed = true
            }
        }
    }
    renderBoard(gBoard)
}
//* starting a new game
function onRestart() {
    stopTimer()
    gMaxLife = 3
    gScore = 0
    gFirstClick = true
    gGameOver = false
    onInitGame()

}
//* creating time
function startTimer() {
    if (timerInterval) return
    startTime = Date.now()
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const seconds = Math.floor(elapsedTime / 1000)
        const milliseconds = elapsedTime % 1000
        document.getElementById('timer').innerText = `Timer: ${seconds} : ${milliseconds.toString().padStart(3, '0')}`
    }, 10)
}

//* after i win or lose 
function stopTimer() {
    clearInterval(timerInterval)
    timerInterval = null
}


function updateLife(gMaxLife) {
    document.querySelector('.life').innerText = `ives ${gMaxLife}`
}

function updateIcon(state) {
    if (state === 0)
        document.querySelector('.icon').innerText = `😒`
    if (state === 1)
        document.querySelector('.icon').innerText = `😃`
    if (state === 2)
        document.querySelector('.icon').innerText = `😎`
}

function updateScore(score) {
    document.querySelector('.score').innerText = `score  ${score}`
}

//*  a few second reveal your self and your nebs
function revealHint(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            gBoard[i][j].revealed = true
        }
    }
    renderBoard(gBoard)
}

//* after a few second hide your self and your nebs back 
//* active the second up when i click on it 
function hideHint(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (!gBoard[i][j].mine) {
                gBoard[i][j].revealed = false
                //* Hide cell again if not a mine
            }
        }
    }
    renderBoard(gBoard)
}

function activateHint() {
    if (gHints > 0 && !gHintActive) {
        gHintActive = true
        gHints--
        updateHintDisplay()
    }
}
//* i want to update every time i click on light 
function updateHintDisplay() {
    document.querySelector('.hints').innerText = `Hints left: ${gHints}`
}
//* if i clicked on empty cell only empty and he has neighborCell he open them too
//* u can play and see foe your self. wow!
//* like who is the open negs 
function fullExpand(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === row && j === col) continue

            const neighborCell = gBoard[i][j]
            if (!neighborCell.revealed && !neighborCell.mine) {
                neighborCell.revealed = true
                //* If the neighbor is also empty (no adjacent mines), expand further
                if (neighborCell.adjacentMines === 0) {
                    fullExpand(i, j)
                }
            }
        }
    }
}



//~ localStorage.setItem('score', timeDiff.toFixed(3));
//~ parseFloat(document.getElementById("best_score").innerHTML = "My best time is " + localStorage.getItem('score') + " s")
//^ from google to understad how to do it 
//& for every level i want to have best score 
//?  do i have to update every level - ofc i am 
function updateBestScore(level, score) {
    //* This retrieves the current best score for the specified level from the browser's 
    const bestScore = localStorage.setItem(`bestScore ${level}`)
    if (!bestScore || score < bestScore) {
        localStorage.setItem(`bestScore ${level}`, score)
        //* replace to the best score if the score is bigger
        document.querySelector('.best-score').innerText = `bestScore `

    }
}
//* the best score for the level
function loadBestScore(level) {
    const bestScore = localStorage.setItem(`bestScore ${level}`)
    //* only if he already have a bestScore i want to update it so
    if (bestScore) {
        document.querySelector('.best-score').innerText = `bestScore ${bestScore}`
    } else {
        document.querySelector('score-score').innerText = `bestScore : none`
    }
}

// TODO only when we have a winner we have also best score
//& well lets check
//~ I believe i should to change it
//^ not working Grrrrrrrr