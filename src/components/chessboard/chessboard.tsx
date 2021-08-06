import React, {useRef, useState} from 'react'
import {Grid, Flex, Box, Text, VStack, Button} from '@chakra-ui/react'
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
const board_width = [400, null, 600, null, 800]
const board_height = [400, null, 600, null, 800]

interface Props {
    boardState : BoardState,
    effectGrid : Effect[],
    handleClick : (e: React.MouseEvent) => Promise<void>
}

const ChessBoard = ({boardState, effectGrid, handleClick} : Props) => {
    const chessBoardRef = useRef<HTMLDivElement>(null)
    const getBoardLayer = () => chessBoardRef.current?.firstChild?.firstChild as HTMLDivElement

    return (
        <Box
            h={board_height}
            w={board_width}
            colSpan={4}
            onMouseDown={e => handleClick(e)}
            position='relative'
            shadow='xl'
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
            <Grid
                h={board_height}
                w={'20px'}
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
                            fontSize={['lg', null, 'xl', null, '2xl']}
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
                            fontSize={['lg', null, 'xl', null, '2xl']}
                        >
                            {column}
                        </Text>
                    )
                })}
            </Grid>
        </Box>
    )
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

export default ChessBoard