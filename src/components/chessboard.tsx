import React, {useRef, useState} from 'react'
import Image from 'next/image'
import {Grid, GridItem, Box} from '@chakra-ui/react'
import {piece_images, Piece} from './pieces'
import Tile from './tile'
import {testpos3} from './test-positions'

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const FENregex = new RegExp("((([prnbqkPRNBQK12345678]*/){7})([prnbqkPRNBQK12345678]*)) (w|b) ((K?Q?k?q?)|\\-) (([abcdefgh][36])|\\-) (\\d*) (\\d*)")

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
    let originIndex: number | null = null
    let targetIndex: number | null = null

    const grabPiece = (e: React.MouseEvent) => {
        const chessboard = chessBoardRef.current
        const elem = e.target as HTMLElement
        if(elem.classList.contains("chess-piece") && chessboard){
            const [gridX, gridY] = getTargetBoardCoordinate(e, chessboard)
            originIndex = coordinateToIndex(gridX, gridY)
            const x = e.clientX - 40
            const y = e.clientY - 40
            elem.style.position = "absolute"
            elem.style.left = `${x}px`
            elem.style.top = `${y}px`
            activePiece = elem
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
                if(originIndex != targetIndex) {
                    let pieces = boardState.pieces
                    const piece = pieces[originIndex]
                    console.log(piece, 'from', originIndex, 'to', targetIndex)
                    pieces[originIndex] = '_'
                    pieces[targetIndex] = piece
                    setBoardState({
                        ...boardState,
                        pieces : pieces
                    })
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
                }
            }

            activePiece = null
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

//Generate list of tiles to be displayed
//Generates from top to bottom of the chessboard
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

const readFEN = (fen : string) : BoardState => {
    if(!isValidFEN(fen)) {
        throw new Error('Invalid FEN string')
    }
    const board : Piece[] = []
    const FEN = fen.split(" ")
    
    const rows = FEN[0].split("/")
    let pieces: Piece[] = []
    for (var row of rows) {
        for (var v of row) {
            if(isNaN(Number(v))){
                pieces.push(v as Piece)
            } else {
                for(var i = 0; i < Number(v); i++) {
                    pieces.push('_')
                }
            }
        }
    }
    return {
        pieces : pieces,
        toMove : FEN[1],
        castleOpertunity : FEN[2],
        enpessant : FEN[3],
        halfmove : parseInt(FEN[4]),
        fullmove : parseInt(FEN[5])
    }
}

const isValidFEN = (fen : string) : boolean => {
    return FENregex.test(fen)
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

const coordinateToIndex = (x : number, y : number) : number => {
    return x + (y * 8)
}

type BoardState = {
    pieces : string[],
    toMove: string,
    castleOpertunity : string,
    enpessant : string,
    halfmove: number,
    fullmove: number
}

export default ChessBoard