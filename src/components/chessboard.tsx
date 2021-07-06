import React from 'react'
import {Grid, GridItem} from '@chakra-ui/react'

const board_columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_rows = ['1', '2', '3', '4', '5', '6', '7', '8']
const board_colors = {
    primary: 'white', 
    secondary: 'green'
}

const ChessBoard = () => {
    return (
        <Grid
            h='40rem'
            w='40rem'
            templateColumns='repeat(8, 1fr)'
            templateRows='repeat(8, 1fr)'
            gap={1}
        >
            {generate_grid()}
        </Grid>
    )
}

const generate_grid = () => {
    let tiles = []
    let count = 0
    for(let j = board_rows.length-1; j >= 0; j--) {
        for(let i = 0; i < board_columns.length; i++) {
            tiles.push(
                <GridItem key={count++} bg={(i + j + 2) % 2 === 0 ? board_colors.primary : board_colors.secondary}>

                </GridItem>
            )
        }
    }
    return tiles
}

export default ChessBoard