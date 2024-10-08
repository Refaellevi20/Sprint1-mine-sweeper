//  'use strict'
//* doest work with use strict
//* took hours to figure

const EMPTY = ''
const BOOM = '💣'
const FLAG = '⛳'

//* levels of the game 
const levels = {
    4: { size: 4, mines: 2 },
    8: { size: 8, mines: 14 },
    12: { size: 12, mines: 32 },
    16: { size: 16, mines: 44 },
    20: { size: 20, mines: 56 }
}
//* g global
var gEndGame = false
var gBoard
var gBoomCount = 0
var gIntervalAdjacentMines
var gFirstClick = true
var gMaxLife = 3
var gScore = 0
var gScoreAllTimes = 0
var gSafeClicks = 3
var gHint1 = false
var gHint2 = false
var gHint3 = false


var timerInterval
var startTime
var gGameOver = false

//const life = '💗💗💗'
// toString.gMaxLife

//* active the function from the html
function onInitGame() {
    //* every time i start the game i want them to start from the arigonal numbers
    gEndGame = false
    gScore = 0
    gMaxLife = 3
    gSafeClicks = 3

    updateLife(gMaxLife)

    updateSafeClickDisplay()

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

    // loadBestScore(selectedSize)
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
                cellContent = cell.mine ? BOOM : (cell.adjacentMines || EMPTY)
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

function onCellClicked(event, i, j) {

    if (gEndGame)
        return


    const cell = gBoard[i][j]
    if (cell.revealed || cell.flagged) return

    //* If hint mode is active, reveal the cell and neighbors for 1 second
    if (gHint1 || gHint2 || gHint3) {
        revealHint(i, j)
        setTimeout(() => {
            hideHint(i, j)
            gHint1 = false
            gHint2 = false
            gHint3 = false

        }, 1000)
        //  gHint1
        return
    }
    // if (gHint2) {
    //     revealHint(i, j)
    //     setTimeout(() => {
    //         hideHint(i, j)
    //         gHint2 = false
    //     }, 1000)
    //  //   gHint2
    //     return
    // }
    // if (gHint3) {
    //     revealHint(i, j)
    //     setTimeout(() => {
    //         hideHint(i, j)
    //         gHint3 = false
    //     }, 1000)
    //   //  gHint3
    //     return
    // }

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
            if (gScore > gScoreAllTimes) {
                gScoreAllTimes = gScore
                updateBestScore(gScoreAllTimes)
            }
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
    gGameOver = true;
    if (isWin) {
        clearInterval(timerInterval)
        stopTimer()
        revealAllMines()
        updateIcon(2)
        alert('Victorious!')

        gEndGame = true
    } else {
        if (gMaxLife === 1) {
            //  clearInterval(timerInterval)
            stopTimer()
            revealAllMines()
            updateIcon(0)
            gEndGame = true
            alert('Game over! You lost.')
            //* when the game over go to every cell and reveal

            renderBoard(gBoard)
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
            if ((!cell.mine && cell.flagged) || (!cell.mine && !cell.revealed)) return false
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
                renderCell({ i, j }, BOOM)
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
    gHints = 3
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
    document.querySelector('.life').innerText = `lives ${gMaxLife} 💗`
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

function updateBestScore(gScore) {
    document.querySelector('.best-score').innerText = `Best Score  ${gScore}`

}

//*  a few second reveal your self and your nebs
function revealHint(row, col) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            //   if (cell.revealed && cell.mine && cell.adjacentMines) return false
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
            gBoard[i][j].revealed = false
        }
    }
    renderBoard(gBoard)
}
//* i know there is a better way with loop 
function activateHint1() {
    document.querySelector('.hint1').style.display = gHint1 ? 'block' : 'none';
    gHint2 = 'Used'
    updateHint1Display()
}

function activateHint2() {
    document.querySelector('.hint2').style.display = gHint1 ? 'block' : 'none';
    gHint2 = 'Used'
    updateHint2Display()

}

function activateHint3() {
    document.querySelector('.hint3').style.display = gHint1 ? 'block' : 'none';
    gHint3 = 'used'
    updateHint3Display()

}

//* i want to update every time i click on light 
function updateHint1Display() {
    document.querySelector('.hint1').innerText = `${gHint1}`
    // const el = document.querySelector(selector)
    //  document.querySelector('.hint1').style.display === 'hide'
}

function updateHint2Display() {
    document.querySelector('.hint2').innerText = `${gHint2}`
}

function updateHint3Display() {
    document.querySelector('.hint3').innerText = `${gHint3}`
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
                //* If the neighbor is also empty (no adjacent 0r  mines), expand further
                if (neighborCell.adjacentMines === 0) {
                    fullExpand(i, j)
                }
            }
        }
    }
}

function useSafeClick() {
    if (gSafeClicks <= 0 || gEndGame) return

    gSafeClicks--
    updateSafeClickDisplay()
    const safeCell = getRandomSafeCell()
    if (safeCell) {

        const { i, j } = safeCell
        const cell = gBoard[i][j]
        cell.revealed = true
        renderCell({ i, j }, '🛟')

        setTimeout(() => {
            cell.revealed = false
            renderBoard(gBoard)
        }, 1500)
    }
}

function getRandomSafeCell() {
    const coveredCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
            if (!cell.revealed && !cell.mine) {
                coveredCells.push({ i, j })
            }
        }
    }

    if (coveredCells.length === 0) return null
    const randomIndex = Math.floor(Math.random() * coveredCells.length)
    return coveredCells[randomIndex]
}

function updateSafeClickDisplay() {
    document.querySelector('.safeClick span').innerText = `Safe Click: ${gSafeClicks}🛟`
}
