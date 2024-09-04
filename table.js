// 'use strict'
//* doest work with use strict
//* took hours to figurte

//* global
const BOOM = '💣'
const FLAG = '⛳'

var gBoard
var gBoomCount = 0
var gIntervalAdjacentMines

//* active the function from the html
function onInitGame() {
    gBoard = buildBoard()
//* running on 2 mines
    for (var d = 0; d < 2; d++) {
    const   locations = boomRandomLocations()
    
        gBoard[locations.i][locations.j].mine = true
    
        // If mine is already placed, retry
    }
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}


function buildBoard() {
    const board = []
    //* Build the 4x4 board with empty strings
    for (var i = 0; i < 4; i++) {
        board[i] = []
        for (var j = 0; j < 4; j++) {
            board[i][j] = {
                mine: false,
                adjacentMines: 0,
                revealed: false,
                flagged: false 
            }
        }
    }
    return board
}

function boomRandomLocations() {
    //* random location for thr mines
    //* i choosed  Math.floor(Math.random() not using a lot of code like getRandomIT (i like this one)
    const locations = {
        i: Math.floor(Math.random() * 4),
        j: Math.floor(Math.random() * 4)
    }
    console.log(locations)
    return locations
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
    const gameBoard = document.querySelector('.game-board')
    gameBoard.innerHTML = strHtml
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
    var mineCount = 0;
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

//* same as elCell
//* make no difference then Cell

//* on the left click
//* and showing the boom or the numbers or the empty cells
function onCellClicked(event, i, j) {
    const cell = gBoard[i][j]

  
    if (cell.revealed || cell.flagged) return

    cell.revealed = true

    if (cell.mine) {
        revealAllMines()
        gameOver(false)
    } else {
        renderBoard(gBoard)
        if (checkVictory()) {
            gameOver(true)
        }
    }
}


//* on the right click
//* Toggle the flag on a cell
function onCellRightClicked(event, i, j) {
    event.preventDefault() 
    //* Prevent default context menu
    const cell = gBoard[i][j]

   if (cell.revealed) return

   cell.flagged = !cell.flagged 
  console.log(gBoard[i][j])
  
    renderBoard(gBoard)
}


function gameOver(isWin) {
    clearInterval(gIntervalAdjacentMines)
   
    if (isWin) {
        alert('Victorious!')
    } else {
        alert('Game over! You lost.')
    }
}
    




function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const cell = gBoard[i][j]
           if((cell.mine && !cell.flagged) || (!cell.mine && !cell.revealed)) return false
           
           }
             }
                return true
            }
        

//* Reveal all mines on game over
//* if i clicked on one mine all revealed
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


function onRestart() {
    const modal = document.querySelector('.Restart')
    modal.classList.add('hidden')
    document.querySelector('.Restart').innerText = '😒'
    onInitGame()
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