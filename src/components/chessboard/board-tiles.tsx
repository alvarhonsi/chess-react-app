import {GridItem, Box} from '@chakra-ui/react'


interface PieceProps {
    index : number,
    image? : string
}

export const BoardPiece = ({index, image} : PieceProps) => {
    return (
    <GridItem
        display="flex" 
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100%"
        className='grid-tile'
        index={index}
    >
        {image && <Box
            w="70px"
            h="70px"
            backgroundImage={image}
            bgRepeat="no-repeat"
            bgPosition="center"
            className="chess-piece"
            _hover={{
                cursor: 'pointer'
            }}
        >
        </Box>}
    </GridItem>
    )
}


interface TileProps {
    number: number
    board_colors : {
        primary : string,
        secondary : string
    }
}

export const BoardTile = ({number, board_colors} : TileProps) => {
    return (
    <GridItem
        bg={number % 2 === 0 ? board_colors.primary : board_colors.secondary}
        display="flex" 
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100%"
    >
        <Box
            className='effect-tile'
        >

        </Box>
    </GridItem>
    )
}