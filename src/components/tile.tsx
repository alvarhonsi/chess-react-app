import Image from 'next/image'
import {Box} from '@chakra-ui/react'

interface Props {
    number: number
    board_colors : {
        primary : string,
        secondary : string
    }
    image : string
}

const Tile = ({number, board_colors, image} : Props) => {
    return (
    <Box
        bg={number % 2 === 0 ? board_colors.primary : board_colors.secondary}
        display="flex" 
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100%"
    >
        {image && <Box
            w="70px"
            h="70px"
            backgroundImage={image}
            bgRepeat="no-repeat"
            bgPosition="center"
            className="chess-piece"
            _hover={{
                cursor: 'grab'
            }}
            _active={{
                cursor: 'grabbing'
            }}
        >
        </Box>}
    </Box>
    )
}

export default Tile