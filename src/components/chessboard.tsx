import React, {useRef, useState} from 'react'
import {Grid, GridItem} from '@chakra-ui/react'
import {piece_images, getMoves, getAttacks} from './pieces'
import Tile from './tile'
import {BoardState, Piece, ToMove} from './board-types'
import {testpos3} from './test-positions'
import {readFEN} from './fen'

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const board_columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_rows = ['1', '2', '3', '4', '5', '6', '7', '8']
const board_colors = {
    primary: 'white', 
    secondary: 'green'
}
const board_width = 600
const board_height = 600
const tile_width = Math.round(board_width / 8)
const tile_height = Math.round(board_height / 8)

//instantiate empty board
//Board is represented as a list of tiles from top-0 to bottom-8
const board : Piece[] = Array(64).fill('_')


const ChessBoard = () => {
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const [boardState, setBoardState] = useState<BoardState>(readFEN(startFEN))
    

    let activePiece: HTMLElement | null = null
    let originTile: HTMLElement | null = null
    let endTile: HTMLElement | null = null
    let originIndex: number | null = null
    let targetIndex: number | null = null

    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessBoardRef.current
        const elem = e.target as HTMLElement
        if(elem.classList.contains("chess-piece") && chessboard){
            const [gridX, gridY] = getTargetBoardCoordinate(e, chessboard)
            originIndex = coordinateToIndex(gridX, gridY)
            const piece = boardState.pieces[originIndex]

            const moves = getMoves(piece, originIndex, boardState)
            const attacks = getAttacks(piece, originIndex, boardState)

            const x = e.clientX - 40
            const y = e.clientY - 40
            elem.style.position = "absolute"
            elem.style.left = `${x}px`
            elem.style.top = `${y}px`
            activePiece = elem

            //Move visualization

            //Tile effects
            originTile = getBoardElementByIndex(originIndex, chessboard)
            if (originTile){
                originTile.style.backgroundColor = 'blue'
            }
            
            for (let i of moves) {
                const effectTile = getBoardElementByIndex(i, chessboard)
                effectTile.style.backgroundColor = 'aqua'
            }
            
            for (let i of attacks) {
                const effectTile = getBoardElementByIndex(i, chessboard)
                effectTile.style.backgroundColor = 'red'
            }
        }
    }

    const movePiece = (e : React.MouseEvent) => {
        const chessboard = chessBoardRef.current
        if(activePiece && chessboard) {
            const minX = chessboard.offsetLeft - 25
            const maxX = chessboard.offsetLeft + chessboard.offsetWidth - 50
            const minY = chessboard.offsetTop - 25
            const maxY = chessboard.offsetTop + chessboard.offsetHeight - 50
            const x = e.clientX - 40
            const y = e.clientY - 40
            activePiece.style.position = "absolute"
            if (x < minX) {
                activePiece.style.left = `${minX}px`
            } else if (x > maxX) {
                activePiece.style.left = `${maxX}px`
            } else {
                activePiece.style.left = `${x}px`
            }
            if (y < minY) {
                activePiece.style.top = `${minY}px`
            } else if (y > maxY) {
                activePiece.style.top = `${maxY}px`
            } else {
                activePiece.style.top = `${y}px`
            }
        }
    }

    const dropPiece = (e : React.MouseEvent) => {
        const chessboard = chessBoardRef.current
        if(activePiece && chessboard) {
            const [gridX, gridY] = getTargetBoardCoordinate(e, chessboard)
            targetIndex = coordinateToIndex(gridX, gridY)
            console.log('origin:', originIndex, 'target:', targetIndex)

            if(originIndex != null && targetIndex != null) {
                const piece = boardState.pieces[originIndex]
                const moves = getMoves(piece, originIndex, boardState)
                if(originIndex != targetIndex && moves.includes(targetIndex)) {
                    let pieces = boardState.pieces
                    const piece = pieces[originIndex]
                    console.log(piece, 'from', originIndex, 'to', targetIndex)
                    pieces[originIndex] = '_'
                    pieces[targetIndex] = piece
                    setBoardState({
                        ...boardState,
                        pieces : pieces
                    })
                    if(originTile) {
                        originTile = null
                    }

                    //Tile effects
                    //Clear all previous board-effects
                    clearEffectLayer(chessboard)
                    //color end-tile
                    endTile = getBoardElementByIndex(targetIndex, chessboard)
                    if (endTile) {
                        endTile.style.backgroundColor = 'yellow'
                    }

                    //Reset active piece
                    activePiece = null
                    originIndex = null
                    targetIndex = null
                }else {
                    console.log('abort move')
                    activePiece.style.position = ''
                    activePiece.style.left = ''
                    activePiece.style.top = ''
                    activePiece = null
                    originIndex = null
                    targetIndex = null

                    //Tile effects
                    //Clear all previous board-effects
                    clearEffectLayer(chessboard)

                }
            } else {
                console.log('abort move')
                activePiece.style.position = ''
                activePiece.style.left = ''
                activePiece.style.top = ''
                activePiece = null
                originIndex = null
                targetIndex = null
                //Tile effects
                //Clear all previous board-effects
                clearEffectLayer(chessboard)
        }
        }
    }

    return (
        <Grid
            h={`${board_height}px`}
            w={`${board_width}px`}
            templateColumns='repeat(8, 1fr)'
            templateRows='repeat(8, 1fr)'
            gap={0}
            onMouseDown={e => grabPiece(e)}
            onMouseMove={e => movePiece(e)}
            onMouseUp={e => dropPiece(e)}
            ref={chessBoardRef}
        >
            {boardState && generate_tiles( boardState )}
        </Grid>
    )
}

//Generates a list of tiles as HTMLElements based on boardState
const generate_tiles = (boardState : BoardState) => {
    const pieces = boardState.pieces
    let tiles = []
    let count = 0
    for(let j = board_rows.length-1; j >= 0; j--) {
        for(let i = 0; i < board_columns.length; i++) {
            const num = i + j;
            const piece = (pieces[count] as Piece)
            tiles.push(
                <GridItem 
                    key={count} 
                >
                    <Tile number={num} board_colors={board_colors} image={piece_images[piece]}/>
                </GridItem>
            )
            count++
        }
    }

    return tiles
}

const getTargetBoardCoordinate = (e : React.MouseEvent, chessboard: HTMLDivElement) => {
    let x = e.clientX - chessboard.offsetLeft
    let y = e.clientY - chessboard.offsetTop
    if (x < 0) {
        x = 0
    } else if (x > chessboard.offsetWidth) {
        x = chessboard.offsetWidth
    }
    if (y < 0) {
        y = 0
    } else if (y > chessboard.offsetHeight) {
        y = chessboard.offsetHeight
    }
    const gridX = Math.floor(x / tile_width)
    const gridY = Math.floor(y / tile_height)
    return [gridX, gridY]
} 

const getBoardElementByIndex = (index : number, chessboard : HTMLDivElement) => {
    const element = chessboard.children[index].firstChild?.lastChild as HTMLElement
    console.log(element)
    return element
}

const clearEffectLayer = (chessboard : HTMLDivElement) => {
    chessboard.childNodes.forEach(node => {
        const effectLayer = node.firstChild?.lastChild as HTMLElement
        if (effectLayer) {
            effectLayer.style.backgroundColor = ''
        }
    })
}

const coordinateToIndex = (x : number, y : number) : number => {
    return x + (y * 8)
}

export default ChessBoard