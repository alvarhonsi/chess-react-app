import React, {useRef, useState} from 'react'
import {Grid, GridItem, Box, Text} from '@chakra-ui/react'
import {piece_images, getMoves, getAttacks, pieceIsMovable} from './pieces'
import {BoardTile, BoardPiece} from './board-tiles'
import {BoardState, Piece, ToMove} from './board-types'
import {enpassant_white} from '../test-positions'
import {boardPositionToIndex, indexToBoardPosition} from './utils'
import {readFEN} from '../fen'

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const board_columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_rows = ['8', '7', '6', '5', '4', '3', '2', '1']
const board_colors = {
    primary: 'white', 
    secondary: 'green'
}
const board_width = 800
const board_height = 800
const tile_width = Math.round(board_width / 8)
const tile_height = Math.round(board_height / 8)

//instantiate empty board
//Board is represented as a list of tiles from top-0 to bottom-8
const board : Piece[] = Array(64).fill('_')


const ChessBoard = () => {
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const getPieceLayer = () => chessBoardRef.current?.firstChild?.lastChild as HTMLDivElement
    const getBoardLayer = () => chessBoardRef.current?.firstChild?.firstChild as HTMLDivElement

    const [boardState, setBoardState] = useState<BoardState>(readFEN(enpassant_white))

    console.log(boardState.toMove)
    

    let activePiece: HTMLElement | null = null
    let originTile: HTMLElement | null = null
    let endTile: HTMLElement | null = null
    let originIndex: number | null = null
    let targetIndex: number | null = null

    const registerMove = (originIndex: number, targetIndex: number) => {
        const piece = boardState.pieces[originIndex]
        console.log(piece, 'from', indexToBoardPosition(originIndex) , 'to', indexToBoardPosition(targetIndex))

        setBoardState(doMove(originIndex, targetIndex, boardState))

        if(originTile) {
            originTile = null
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        const boardLayer = getBoardLayer()
        const chessboard = chessBoardRef.current
        const elem = e.target as HTMLElement

        if(elem.classList.contains("chess-piece") && originIndex === null){
            //A new piece is to be set as the active piece
            originIndex = getPieceIndex(elem)
            if(originIndex != null) {
                const piece = boardState.pieces[originIndex]
                if(!pieceIsMovable(piece, boardState.toMove)){
                    originIndex = null
                    return
                }

                activePiece = elem
                const moves = getMoves(piece, originIndex, boardState)
                const attacks = getAttacks(piece, originIndex, boardState)

                //Move visualization

                //Tile effects
                if(boardLayer) {
                    clearEffectTiles(boardLayer)
                    originTile = getBoardEffectTile(originIndex, boardLayer)
                    if (originTile){
                        originTile.classList.add('originTile')
                    }
                    
                    for (let i of moves) {
                        const effectTile = getBoardEffectTile(i, boardLayer)
                        effectTile.classList.add('movableTile')
                    }
                    
                    for (let i of attacks) {
                        const effectTile = getBoardEffectTile(i, boardLayer)
                        effectTile.classList.add('attackTile')
                    }
                }
            } else {
                Error("Cannot find origin index of piece")
            }
        } else {
            //An active piece is selected
            targetIndex = getTargetBoardIndex(e)
            console.log('origin:', originIndex, 'target:', targetIndex)

            if(originIndex != null && targetIndex != null) {
                //Attempt to register new move
                const piece = boardState.pieces[originIndex]
                const moves = getMoves(piece, originIndex, boardState)

                if(originIndex != targetIndex && moves.includes(targetIndex)) {
                    //Move is legal
                    registerMove(originIndex, targetIndex)
                    //Tile effects
                    if(boardLayer) {
                        //Clear all previous board-effects
                        clearEffectTiles(boardLayer)
                        //color end-tile
                        endTile = getBoardEffectTile(targetIndex, boardLayer)
                        if (endTile) {
                            endTile.classList.add('endTile')
                        }
                    }

                    //Reset active piece
                    activePiece = null
                    originIndex = null
                    targetIndex = null
                }else {
                    //Move is aborted
                    console.log('abort move')
                    activePiece = null
                    originIndex = null
                    targetIndex = null

                    //Tile effects
                    //Clear all previous board-effects
                    if(boardLayer) {
                        clearEffectTiles(boardLayer)
                    }

                }
            } else {
                //Move is aborted
                console.log('abort move')
                activePiece = null
                originIndex = null
                targetIndex = null
                //Tile effects
                //Clear all previous board-effects
                if(boardLayer) {
                    clearEffectTiles(boardLayer)
                }
            }
        }
    }

    return (
        <Box
            ref={chessBoardRef}
            position='relative'
        >
            <Box
                h={`${board_height}px`}
                w={`${board_width}px`}
                onMouseDown={e => handleClick(e)}
                //onMouseMove={e => movePiece(e)}
                //onMouseUp={e => dropPiece(e)}
                position='relative'
                
            >
                <Grid
                    h={`${board_height}px`}
                    w={`${board_width}px`}
                    templateColumns='repeat(8, 1fr)'
                    templateRows='repeat(8, 1fr)'
                    gap={0}
                >
                    {generateBoard()}
                </Grid>
                <Grid
                    h={`${board_height}px`}
                    w={`${board_width}px`}
                    templateColumns='repeat(8, 1fr)'
                    templateRows='repeat(8, 1fr)'
                    gap={0}
                    position='absolute'
                    top={0}
                    left={0}
                >
                    {boardState && generatePieceLayer( boardState )}
                </Grid>
            </Box>
            <Grid
                h={`${board_height}px`}
                w={'40px'}
                templateColumns='repeat(1, 1fr)'
                templateRows='repeat(8, 1fr)'
                gap={3}
                position='absolute'
                left={'-50px'}
                top={'25px'}
            >
                {board_rows.map(row => {
                    return (
                        <Text
                            key={row}
                            textAlign='end'
                            textColor='white'
                            fontSize='25px'
                        >
                            {row}
                        </Text>
                    )
                })}
            </Grid>
            <Grid
                h={'30px'}
                w={`${board_width}px`}
                templateColumns='repeat(8, 1fr)'
                templateRows='repeat(1, 1fr)'
                gap={3}
                position='absolute'
                left={0}
                bottom={'-35px'}
            >
                {board_columns.map(column => {
                    return (
                        <Text
                            key={column}
                            textAlign='center' 
                            textColor='white'
                            fontSize='25px'
                        >
                            {column}
                        </Text>
                    )
                })}
            </Grid>
        </Box>
    )
}

const doMove = (origin : number, target : number, boardState : BoardState) : BoardState => {
    let {pieces, toMove, castleAvailability, enpessant, halfmove, fullmove} = boardState
    const piece = pieces[origin]

    //Check special condition moves
    //pawn
    if(piece === 'P') {
        if(target === boardPositionToIndex(enpessant)){
            //enpessant
            pieces[target+8] = '_'
        } else if (target === origin - 16) {
            //pawn has moved two squares, making it available for enpessant capture
            enpessant = indexToBoardPosition(target + 8)
        }
    } else if (piece === 'p') {
        if(target === boardPositionToIndex(enpessant)){
            //enpessant
            pieces[target-8] = '_'
        } else if (target === origin + 16) {
            //pawn has moved two squares, making it available for enpessant capture
            enpessant = indexToBoardPosition(target - 8)
        } 
    }

    //move piece to target
    pieces[origin] = '_'
    pieces[target] = piece
    toMove = toMove === 'w' ? 'b' : 'w'

    return {
        pieces : pieces,
        toMove : toMove,
        castleAvailability : castleAvailability,
        enpessant : enpessant,
        halfmove : halfmove,
        fullmove : fullmove,
    }
}

const generateBoard = () => {
    let tiles = []
    let count = 0
    for(let j = board_rows.length-1; j >= 0; j--) {
        for(let i = 0; i < board_columns.length; i++) {
            const num = i + j;
            tiles.push(
                <BoardTile key={count} number={num} board_colors={board_colors}/>
            )
            count++
        }
    }

    return tiles
}

//Generates a grid of BoardPieces as the piece layer
const generatePieceLayer = (boardState : BoardState) => {
    const pieces = boardState.pieces
    let tiles = []
    let count = 0
    for(let j = board_rows.length-1; j >= 0; j--) {
        for(let i = 0; i < board_columns.length; i++) {
            const piece = (pieces[count] as Piece)
            tiles.push(
                <BoardPiece key={count} selectable={pieceIsMovable(piece, boardState.toMove)} index={count} image={piece_images[piece]}/>
            )
            count++
        }
    }

    return tiles
}

const getPieceIndex = (piece : HTMLElement) : number | null => {
    const gridTile = piece.parentElement
    if(gridTile) {
        const index = gridTile.getAttribute('index')
        return index ? parseInt(index) : null
    } else {
        Error("Piece has undefined Parent Element")
    }
    return null
}

const getTargetBoardIndex = (e : React.MouseEvent) : number | null=> {
    const element = document.elementFromPoint(e.pageX, e.pageY) as HTMLElement
    console.log(element)
    if(element && element.classList.contains("chess-piece")) {
        return getPieceIndex(element)
    }else if(element.classList.contains("grid-tile")) {
        const index = element.getAttribute('index')
        return index ? parseInt(index) : null
    }
    return null
}

const getBoardEffectTile = (index : number, boardLayer : HTMLDivElement) => {
    const element = boardLayer.children[index].firstChild as HTMLElement
    return element
}

const clearEffectTiles = (boardLayer : HTMLDivElement) => {
    boardLayer.childNodes.forEach(node => {
        const effectTile = node.firstChild as HTMLElement
        if (effectTile) {
            effectTile.classList.remove('movableTile', 'attackTile', 'originTile', 'endTile')
        }
    })
}

export default ChessBoard