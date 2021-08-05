import React, {useRef, useState} from 'react'
import {Grid, GridItem, Box, Text, effect} from '@chakra-ui/react'
import {piece_images, getMoves, getAttacks, pieceIsMovable, isInCheck, isCapturable, getKingPos} from './pieces'
import {BoardTile, BoardPiece, Effect} from './board-tiles'
import {BoardState, CastleAvailability, Piece, ToMove} from './board-types'
import {castleAvailability} from '../test-positions'
import {boardPositionToIndex, indexToBoardPosition, nextToMove} from './utils'
import {readFEN} from '../fen'
const clone = require('rfdc')()

const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const board_columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_rows = ['8', '7', '6', '5', '4', '3', '2', '1']
const board_colors = {
    primary: 'yellow.500', 
    secondary: 'yellow.700'
}
const board_width = [500, null, 1000]
const board_height = [500, null, 1000]


const ChessBoard = () => {
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const getBoardLayer = () => chessBoardRef.current?.firstChild?.firstChild as HTMLDivElement

    const [boardState, setBoardState] = useState<BoardState>(readFEN(castleAvailability))
    const [effectGrid, setEffectGrid] = useState<Effect[]>(new Array<Effect>(64).fill(Effect.None))
    const [origin, setOrigin] = useState<number | null>(null)

    console.log('to Move:', boardState.toMove)
    
    let activePiece: HTMLElement | null = null

    const registerMove = (originIndex: number, targetIndex: number) => {
        const piece = boardState.pieces[originIndex]
        console.log(piece, ' from ', indexToBoardPosition(originIndex) , ' to ', indexToBoardPosition(targetIndex))

        setBoardState(doMove(originIndex, targetIndex, boardState))
    }

    const handleClick = (e: React.MouseEvent) => {
        const boardLayer = getBoardLayer()
        const chessboard = chessBoardRef.current
        const elem = e.target as HTMLElement

        if(elem.classList.contains("chess-piece") && origin === null){
            //A new piece is to be set as the active piece
            const originIndex = getPieceIndex(elem)
            if(originIndex != null) {
                const piece = boardState.pieces[originIndex]
                if(!pieceIsMovable(piece, boardState.toMove)){
                    return
                }

                activePiece = elem
                setOrigin(originIndex)
                const moves = getLegalMoves(piece, originIndex, boardState)

                //Move visualization

                //Tile effects
                clearEffects()
                addEffect(originIndex, Effect.Origin)
                
                for (let i of moves) {
                    if(isCapturable(boardState.toMove, boardState.pieces[i])) {
                        addEffect(i, Effect.Attack)
                    }else {
                        addEffect(i, Effect.Movable)
                    }
                }
            } else {
                Error("Cannot find origin index of piece")
            }
        } else {
            //An active piece is selected
            const targetIndex = getTargetBoardIndex(e)
            console.log('origin:', origin, 'target:', targetIndex)

            if(origin != null && targetIndex != null) {
                //Attempt to register new move
                const piece = boardState.pieces[origin]
                const legalMoves = getLegalMoves(piece, origin, boardState)

                if(origin != targetIndex && legalMoves.length > 0 && legalMoves.includes(targetIndex)) {
                    //Move is legal
                    registerMove(origin, targetIndex)
                    //Tile effects
                    //Clear all previous board-effects
                    clearEffects(true, true)

                    //Color tile if king is checked
                    if (isInCheck(boardState.toMove, boardState)) {
                        addEffect(getKingPos(boardState.toMove, boardState), Effect.Check)
                        console.log(boardState.toMove, 'King is in check!')
                        }
                    //color end-tile
                    addEffect(targetIndex, Effect.End)

                    //Reset active piece
                    setOrigin(null)

                    //Tile effects
                }else {
                    //Move is aborted
                    console.log('abort move')
                    setOrigin(null)

                    //Tile effects
                    //Clear all previous board-effects
                    clearEffects()

                }
            } else {
                //Move is aborted
                console.log('abort move')
                setOrigin(null)
                //Tile effects
                //Clear all previous board-effects
                clearEffects()
            }
        }
    }

    const addEffect = (index : number, effect : Effect) => {
        setEffectGrid((grid) => {
            grid[index] = effect
            return [...grid]
        })
    }
    
    const clearEffects = (ends=false, checks=false) => {
        setEffectGrid((grid) => {
            let newGrid = []
            for (let effect of grid) {
                if (!ends && effect === Effect.End) {
                    newGrid.push(effect)
                }
                if (!checks && effect === Effect.Check) {
                    newGrid.push(effect)
                }
                newGrid.push(Effect.None)
            }
            return newGrid
        })
    }

    return (
        <Box
            ref={chessBoardRef}
            position='relative'
        >
            <Box
                h={board_height}
                w={board_width}
                onMouseDown={e => handleClick(e)}
                position='relative'
                
            >
                <Grid
                    h={board_height}
                    w={board_width}
                    templateColumns='repeat(8, 1fr)'
                    templateRows='repeat(8, 1fr)'
                    gap={0}
                >
                    {effectGrid && generateBoard(effectGrid)}
                </Grid>
                <Grid
                    h={board_height}
                    w={board_width}
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
                h={board_height}
                w={'40px'}
                templateColumns='repeat(1, 1fr)'
                templateRows='repeat(8, 1fr)'
                gap={3}
                position='absolute'
                left={'-50px'}
                top={0}
            >
                {board_rows.map(row => {
                    return (
                        <Text
                            key={row}
                            textAlign='end'
                            textColor='white'
                            fontSize='25px'
                            marginY='auto'
                        >
                            {row}
                        </Text>
                    )
                })}
            </Grid>
            <Grid
                h={'30px'}
                w={board_width}
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
                            fontSize={['10px', null, '25px']}
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
    let {pieces, toMove, castleAvailability, enpessant, halfmove, fullmove} = clone(boardState)
    const piece = pieces[origin]

    //reset enpessant
    enpessant = '-'

    //increment halfmove
    halfmove++
    //increment fullmove
    if(toMove === 'b') {
        fullmove++
    }

    //Check special condition moves
    //pawn
    if(piece === 'P') {
        //reset halfmove
        halfmove = 0

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
    //king
    if(piece.toUpperCase() === 'K') {
        //castle right
        if(target === origin + 2) {
            const rook = pieces[origin + 3]
            pieces[origin + 3] = '_'
            pieces[origin + 1] = rook
        } else if(target === origin - 2) {
            const rook = pieces[origin - 4]
            pieces[origin - 4] = '_'
            pieces[origin - 1] = rook
        }
        //remove castle availability
        if(toMove === 'w') {
            castleAvailability = castleAvailability.replace('K', '') as CastleAvailability
            castleAvailability = castleAvailability.replace('Q', '') as CastleAvailability
        } else {
            castleAvailability = castleAvailability.replace('k', '') as CastleAvailability
            castleAvailability = castleAvailability.replace('q', '') as CastleAvailability
        }
    }
    //rook
    if(piece.toUpperCase() === 'R') {
        //remove castle availability
        if(toMove === 'w') {
            if (origin === 63) {
                castleAvailability = castleAvailability.replace('K', '') as CastleAvailability
            } else if (origin === 56) {
                castleAvailability = castleAvailability.replace('Q', '') as CastleAvailability
            }
        } else {
            if (origin === 7) {
                castleAvailability = castleAvailability.replace('k', '') as CastleAvailability
            } else if (origin === 0) {
                castleAvailability = castleAvailability.replace('q', '') as CastleAvailability
            }
        }
    }

    if(castleAvailability === '') {
        castleAvailability = castleAvailability = '-'
    }
    //check for capture
    if(pieces[target] != '_') {
        halfmove = 0
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

const getLegalMoves = (piece : Piece, index : number, boardState : BoardState) : number[] => {
    let legalMoves : number[] = []
    const pseudoLegalMoves = getMoves(piece, index, boardState)
    for (let move of pseudoLegalMoves) {
        //Complete the move and check if own king is in check
        const newState = doMove(index, move, boardState)
        if (!isInCheck(boardState.toMove, newState)) {
            legalMoves.push(move)
        }
    }

    return legalMoves
}

const generateBoard = (effectGrid : Effect[]) => {
    let tiles = []
    let index = 0
    for(let j = board_rows.length-1; j >= 0; j--) {
        for(let i = 0; i < board_columns.length; i++) {
            const num = i + j;
            tiles.push(
                <BoardTile key={index} tileEffect={effectGrid[index]} number={num} board_colors={board_colors}/>
            )
            index++
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
    if(element && element.classList.contains("chess-piece")) {
        return getPieceIndex(element)
    }else if(element.classList.contains("grid-tile")) {
        const index = element.getAttribute('index')
        return index ? parseInt(index) : null
    }
    return null
}

export default ChessBoard