// 'use strict'
//* doest work with use strict
//* took hours to figurte

//* global
const BOOM = '💣'
const FLAG = '⛳'

//* levels of the game 
const levels = {
   4: { size: 4, mines: 2 },
    8: { size: 8, mines: 14 },
    12: { size: 12, mines: 32 }
}

var gBoard
var gBoomCount = 0
var gIntervalAdjacentMines
var timerInterval
var startTime
var gGameOver = false 
// var life = 0

//* active the function from the html
function onInitGame() {

    gScore = 0
   // updateScore(1)

   //* element in your HTML is used to allow the user to choose a difficulty level ( Beginner, Medium, Expert)
   //* property retrieves the current value of the selected option in the select
   //* in anther word  This value corresponds to the difficulty level selected by the user
    const selectedSize = parseInt(document.querySelector('select').value)
    gBoard = buildBoard(selectedSize)
    
//* each difficulty level to a specific board size and number of mines
    placeMines(levels[selectedSize].mines)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    stopTimer() 
}


function placeMines(minesCount) {
    var placedMines = 0
    while (placedMines < minesCount) {
        const locations = boomRandomLocations()
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
    console.log(board)
    
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
            strHtml += `<td class="cell-${i}-${j}" onclick="onCellClicked(event, ${i}, ${j})" oncontextmenu="onCellRightClicked(event, ${i}, ${j})">  
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
// function renderCell(location, value) {
//     //* Select the elCell and set the value
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }

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
function onCellClicked(event,i, j) {
    const cell = gBoard[i][j]
    if (cell.revealed || cell.flagged) return
    updateScore(1)
    startTimer()
    cell.revealed = true
    if (cell.mine) { 
        revealAllMines()
            gameOver(false)
              
    } else {
        renderBoard(gBoard)
        if (checkVictory()) {
            gameOver(true)
            stopTimer()
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
    gGameOver = true 
    clearInterval(timerInterval)
    stopTimer() 
    if (isWin) {
        alert('Victorious!')
    } else {
        alert('Game over! You lost.')
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
    onInitGame()
}
//* time
function startTimer() {
    if (timerInterval) return
    const startTime = Date.now()
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


function updateScore(score) {
    document.querySelector('.score').innerText = score
}

//////////////////////////////////////////////////  //! don't mind (down)

// function onCellClicked(elCell, i, j) {
//     const cell = gBoard[i][j]
//     if (cell.mine) {
//         elCell.innerHTML = BOOM
//         elCell.style.color = 'red'
//         gameOver()
//     } else {
//         elCell.innerHTML = cell.adjacentMines >0 ? cell.adjacentMines : ''
//         elCell.classList('revealed')
// }
// }


// function gameOver() {
// alert('game over!')
// }

// function minesAroundCount(i,j){
//     const cell = gBoard[i][j]

// }


// function showGameOverModal() {
//     const modal = document.querySelector('.Restart')
//     modal.classList.remove('hidden')
// }

// function onRestart() {
//     const modal = document.querySelector('.Restart')
//     modal.classList.add('hidden')
//     document.querySelector('.Restart').innerText = `play again!`
// }

// function collectAllTheNumbers(location) {

//     if (checkVictory()) {
//         gameOver(true)
//         alert('victorious!')
//     }

// }

// function moveMinesweeper(){
//     const moveDiff = getMoveDiff()
//     const nextLocation = {
//         i: ghost.location.i + moveDiff.i,
//         j: ghost.location.j + moveDiff.j,
// }
// const nextCell = gBoard[nextLocation.i][nextLocation.j]

// }

// // //^ Goes through the entire matrix and
//  // ^ checks if there is still  if one is game over


// function onKey(e) {


//     const i = gGamerPos.i
//     const j = gGamerPos.j

//    // switch (e)
// }


// function getMoveDiff() {

//     const randNum = getRandomIntInclusive(1, 4)

//     switch (randNum) {
//         case 1: return { i: 0, j: 1 }
//         case 2: return { i: 1, j: 0 }
//         case 3: return { i: 0, j: -1 }
//         case 4: return { i: -1, j: 0 }
//     }
// }

// function updateScore(diff) {
//     // update model
//     if (diff) {
//         gGame.score += diff
//     } else {
//         gGame.score = 0
//     }
//     // and dom
//     document.querySelector('span.score').innerText = gGame.score
// }



// function onMark(elBtn) {

//     gIsMark = !gIsMark
//     const elSpans = document.querySelectorAll('span')
//     //* The forEach method executes the provided function once for each span in the NodeList
//     //* the function foreach passes on every span in box
//         if (gIsMark) {
//             span.classList.add('mark')
//         } else {
//             span.classList.remove('mark')
//         }
    
//     elBtn.innerText = gIsMark ? 'UnMark' : 'Mark'
// }