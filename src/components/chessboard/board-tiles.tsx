import {GridItem, Box} from '@chakra-ui/react'


interface PieceProps {
    index : number,
    image? : string,
    selectable : boolean,
}

export const BoardPiece = ({index, image, selectable} : PieceProps) => {
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
            w="100%"
            h="100%"
            backgroundImage={image}
            bgRepeat="no-repeat"
            bgPosition="center"
            className="chess-piece"
            _hover={selectable ? {
                cursor: 'pointer'
            } : {}}
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
    tileEffect : Effect
}

export const BoardTile = ({number, board_colors, tileEffect} : TileProps) => {
    return (
    <GridItem
        bg={number % 2 === 0 ? board_colors.primary : board_colors.secondary}
        display="flex" 
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100%"
    >
        {TileEffect(tileEffect)}
    </GridItem>
    )
}

export enum Effect {
    None,
    Origin,
    End,
    Movable,
    Attack,
    Check,
}

const TileEffect = (effect : Effect) => {
    let styleProps: any = {}
    switch (effect) {
        case Effect.Origin:
            styleProps = {
                bg : 'yellow.200',
                w: '100%',
                h: '100%',
                cursor: 'pointer',
                opacity: 0.7
            }
            break
        case Effect.End:
            styleProps = {
                bg : 'yellow.400',
                w: '100%',
                h: '100%',
                cursor: 'pointer',
                opacity: 0.7
            }
            break
        case Effect.Movable:
            styleProps = {
                bg : 'blue.200',
                w: '100%',
                h: '100%',
                cursor: 'pointer',
                opacity: 0.7
            }
            break
        case Effect.Attack:
            styleProps = {
                bg : 'red.200',
                w: '100%',
                h: '100%',
                cursor: 'pointer',
                opacity: 0.7
            }
            break
        case Effect.Check:
            styleProps = {
                bg : 'red.400',
                w: '100%',
                h: '100%',
                cursor: 'pointer',
                opacity: 0.7
            }
            break
        default:
            break
    }

    return <Box className='tile-effect' {...styleProps}> </Box>
}