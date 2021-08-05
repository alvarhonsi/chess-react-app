import React, {useState} from 'react'
import {Flex, Box, HStack, VStack, Button} from '@chakra-ui/react'
import ChessBoard from './chessboard/chessboard'

const ChessGame = () => {

    const [prevMoves, setPrevMoves] = useState(['pxe3', 'Pxe6', 'pxc3'])

    return (
        <Flex>
            <ChessBoard/>
            <Box
                bg='gray.700'
                w={['xl']}
                h='100%'
                ml={[15, null, null, 20]}
                shadow='xl'
            >
                <VStack border='2px' justify='start'>
                    <HStack border='2px'>
                        {prevMoves.map((move) => {
                            return (<Button colorScheme={'whiteAlpha'} variant={'link'}>
                                {move}
                            </Button>)
                        })}
                    </HStack>
                </VStack>
            </Box>
        </Flex>
    )
}

export default ChessGame