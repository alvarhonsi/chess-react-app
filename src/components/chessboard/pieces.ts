import {BoardPosition, BoardState, CastleAvailability, Piece, ToMove} from './board-types'
import { boardPositionToIndex, nextToMove } from './utils'

export const piece_images = {
    '_' : '',
    'P' : '/chess-pieces/pawn_w.png',
    'N' : '/chess-pieces/knight_w.png',
    'B' : '/chess-pieces/bishop_w.png',
    'R' : '/chess-pieces/rook_w.png',
    'K' : '/chess-pieces/king_w.png',
    'Q' : '/chess-pieces/queen_w.png',
    'p' : '/chess-pieces/pawn_b.png',
    'n' : '/chess-pieces/knight_b.png',
    'b' : '/chess-pieces/bishop_b.png',
    'r' : '/chess-pieces/rook_b.png',
    'k' : '/chess-pieces/king_b.png',
    'q' : '/chess-pieces/queen_b.png',
}

export const pieceIsMovable = (piece : Piece, toMove : ToMove) : boolean => {
    if(piece === '_') {
        return false
    }
    const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b'
    return pieceColor === toMove
}

export const getMoves = (piece : string, index: number, boardState : BoardState) : number[] => {

    switch (piece) {
        case '_':
            return []
        case 'P':
            return getPawnMoves('w', index, boardState.pieces, boardState.enpessant)
        case 'p':
            return getPawnMoves('b', index, boardState.pieces, boardState.enpessant)
        case 'N':
            return getKnightMoves('w', index, boardState.pieces)
        case 'n':
            return getKnightMoves('b', index, boardState.pieces)
        case 'B':
            return getBishopMoves('w', index, boardState.pieces)
        case 'b':
            return getBishopMoves('b', index, boardState.pieces)
        case 'R':
            return getRookMoves('w', index, boardState.pieces)
        case 'r':
            return getRookMoves('b', index, boardState.pieces)
        case 'K':
            return getKingMoves('w', index, boardState)
        case 'k':
            return getKingMoves('b', index, boardState)
        case 'Q':
            return getQueenMoves('w', index, boardState.pieces)
        case 'q':
            return getQueenMoves('b', index, boardState.pieces)

        default:
            Error('unknown piece')
            return []
    }
}

export const isInCheck = (toMove : ToMove, boardState : BoardState) : boolean => {
    const enemy = nextToMove(toMove)
    let attacks = getAllAttacks(boardState)[enemy] //Dont include kings in search

    for (let attack of attacks) {
        if (toMove === 'w') {
            if (boardState.pieces[attack] === 'K') {
                return true
            }
        } else {
            if (boardState.pieces[attack] === 'k') {
                return true
            }
        }
    }
    return false 
}

export const getKingPos = (toMove : ToMove, boardState : BoardState) : number => {
    for (let i = 0; i < boardState.pieces.length; i++) {
        if (toMove === 'w' && boardState.pieces[i] === 'K') {
            return i
        } else if (toMove === 'b' && boardState.pieces[i] === 'k') {
            return i
        }
    }
    return -1
}

export const getAttacks = (piece : string, index: number, boardState : BoardState) : [ToMove, number[]] => {
    switch (piece) {
        case '_':
            return ['w', []]
        //Pawns and kings cannot attack the same way they move
        case 'P':
            return ['w', getPawnAttacks('w', index, boardState.pieces)]
        case 'p':
            return ['b', getPawnAttacks('b', index, boardState.pieces)]
        case 'K':
            return ['w', getKingAttacks('w', index, boardState)]
        case 'k':
            return ['b', getKingAttacks('b', index, boardState)]
        default:
            const toMove = piece === piece.toUpperCase() ? 'w' : 'b'
            const attacks: number[] = getMoves(piece, index, boardState)
            return [toMove, attacks]
    }
}

export const getAllAttacks = (boardState : BoardState) => {
    const pieces = boardState.pieces
    let attacksWhite : number[] = []
    let attacksBlack: number[] = []
    for (let i = 0; i < pieces.length; i++) {
        if(pieces[i] === '_') {
            continue
        }
        const [team, attacks] = getAttacks(pieces[i], i, boardState)
        if(team === 'w') {
            attacksWhite = attacksWhite.concat(attacks)
        } else {
            attacksBlack = attacksBlack.concat(attacks)
        }
    }
    return {
        'w' : Array.from(new Set(attacksWhite)),
        'b' : Array.from(new Set(attacksBlack))
    }
}

//When a pieve moves a tile the indexes changes as follows:
// up : -8
// down : +8
// left : -1
// right : +1

const getPawnMoves = (toMove : ToMove, index : number, pieces: Piece[], enpassant : BoardPosition) => {
    //pawns can move one or two tiles up or down
    const piece = pieces[index]
    let dir = 0
    if(toMove == 'w') {
        dir = -8
    } else {
        dir = 8
    }
    let moves: number[] = []
    //moving forward

    //check if pawn has moved before
    if (index < 16 && piece === piece.toLowerCase()  || index > 47 && piece === piece.toUpperCase()) {
        //pawn has not been moved before, and can be moved two squares up
        for (let i = 1; i <= 2; i++) {
            const target = index + (dir * i)
            if (!indexInsideBounds(target) || pieces[target] != '_') {
                break
            } else {
                moves.push(target)
            }
        }
    } else {
        const target = index + dir
        if (indexInsideBounds(target) && pieces[target] === '_') {
            moves.push(target)
        }
    }
    
    //attacking to the side
    const left = index + dir - 1
    const right = index + dir + 1
                                    //piece is not on left edge of the board
    if (indexInsideBounds(left) && index % 8 != 0 && (pieces[left] != '_')) {
        if(isCapturable(toMove, pieces[left])) {
            moves.push(left)
        }
    }
                                    //piece is not on right edge of the board
    if (indexInsideBounds(right) && (index + 1) % 8 != 0 && (pieces[right] != '_')) {
        if(isCapturable(toMove, pieces[right])) {
            moves.push(right)
        }
    }

    //enpassant
    if (indexInsideBounds(left) && index % 8 != 0 && pieces[left] === '_' && left === boardPositionToIndex(enpassant)) {
        moves.push(left)
    }
                                    //piece is not on right edge of the board
    if (indexInsideBounds(right) && (index + 1) % 8 != 0 && pieces[right] === '_' && right === boardPositionToIndex(enpassant)) {
        moves.push(right)
    }


    return moves
}

const getPawnAttacks = (toMove : ToMove, index : number, pieces: Piece[]) : number[] => {
    let dir = 0
    if(toMove == 'w') {
        dir = -8
    } else {
        dir = 8
    }
    let attacks: number[] = []
    //attacking to the side
    const left = index + dir - 1
    const right = index + dir + 1
                                    //piece is not on left edge of the board
    if (indexInsideBounds(left) && index % 8 != 0) {
        if(pieces[left] === '_' || isCapturable(toMove, pieces[left])) {
            attacks.push(left)
        }
    }
                                    //piece is not on right edge of the board
    if (indexInsideBounds(right) && (index + 1) % 8 != 0) {
        if(pieces[right] === '_' || isCapturable(toMove, pieces[right])) {
            attacks.push(right)
        }
    }
    return attacks
}

const getKnightMoves = (toMove: ToMove, index: number, pieces: Piece[]) => {
    let moves : number[] = []
    let possible: number[] = []
    
    //build list of possible moves to prevent wrapping in grid 
    if (index % 8 > 0){
        possible = possible.concat([
            (index + 16) - 1,
            (index - 16) - 1
        ])
    }
    if(index % 8 > 1) {
        possible = possible.concat([
            (index - 2) - 8,
            (index - 2) + 8
        ])
    }
    if(index % 8 < 7) {
        possible = possible.concat([
            (index + 16) + 1,
            (index - 16) + 1
        ])
    }
    if(index % 8 < 6) {
        possible = possible.concat([
            (index + 2) + 8,
            (index + 2) - 8
        ])
    }

    //check possible moves
    for (let index of possible) {
        if (indexInsideBounds(index)){
            const targetPiece = pieces[index]
            if (targetPiece === '_' || isCapturable(toMove, targetPiece)) {
                moves.push(index)
            }
            else {
                continue
            }
        }
    }

    return moves
}

const getBishopMoves = (toMove: ToMove, index: number, pieces: Piece[]) => {
    let moves : number[] = []

    const getDiagonalMoves = (index: number, onEdge: { (target: number): boolean}, nextIndex: {(index: number): number}) => {
        let moves : number[] = []
        let target = index
        while (true) {
            if(onEdge(target)) {
                break
            }
            target = nextIndex(target)
            if (indexInsideBounds(target)) {
                const targetPiece = pieces[target]
                if (targetPiece === '_') {
                    moves.push(target)
                } else if (isCapturable(toMove, targetPiece)) {
                    moves.push(target)
                    break
                } else {
                    break
                }
                //prevent grid wrapping
                if(onEdge(target)) {
                    break
                }
            } else {
                break
            }
        }
        return moves
    }

    //north-west
    moves = moves.concat(
        getDiagonalMoves(index, 
            (target: number) => target % 8 === 0,
            (index: number) => (index - 8) - 1)
    )
    //south-west
    moves = moves.concat(
        getDiagonalMoves(index, 
            (target: number) => target % 8 === 0,
            (index: number) => (index + 8) - 1)
    )
    //north-east
    moves = moves.concat(
        getDiagonalMoves(index, 
            (target: number) => target % 8 === 7,
            (index: number) => (index - 8) + 1)
    )
    //north-east
    moves = moves.concat(
        getDiagonalMoves(index, 
            (target: number) => target % 8 === 7,
            (index: number) => (index + 8) + 1)
    )

    return moves
}

const getRookMoves = (toMove: ToMove, index: number, pieces: Piece[]) => {
    let moves : number[] = []
    const getStraightMoves = (index: number, onEdge: { (target: number): boolean}, nextIndex: {(index: number): number}) => {
        let moves : number[] = []
        let target = index
        while (true) {
            if(onEdge(target)) {
                break
            }
            target = nextIndex(target)
            if (indexInsideBounds(target)) {
                const targetPiece = pieces[target]
                if (targetPiece === '_') {
                    moves.push(target)
                } else if (isCapturable(toMove, targetPiece)) {
                    moves.push(target)
                    break
                } else {
                    break
                }
                //prevent grid wrapping
                if(onEdge(target)) {
                    break
                }
            } else {
                break
            }
        }
        return moves
    }

    //north
    moves = moves.concat(
        getStraightMoves(index,
            (index: number) => false, //redundant for vertical movement
            (index: number) => index - 8
            )
    )
    //south
    moves = moves.concat(
        getStraightMoves(index,
            (index: number) => false, //redundant for vertical movement
            (index: number) => index + 8
            )
    )
    //west
    moves = moves.concat(
        getStraightMoves(index,
            (index: number) => index % 8 === 0,
            (index: number) => index - 1
            )
    )
    //east
    moves = moves.concat(
        getStraightMoves(index,
            (index: number) => index % 8 === 7,
            (index: number) => index + 1
            )
    )

    return moves
}

const getKingMoves = (toMove: ToMove, index: number, boardState: BoardState) => {
    const {pieces, castleAvailability} = boardState
    let moves: number[] = []
    
    let possible: number[] = [(index + 8), (index - 8)]
    //left
    if (index % 8 > 0) {
        possible = possible.concat([
            (index - 1),
            (index - 1) - 8,
            (index - 1) + 8
        ])
    }
    //right
    if (index % 8 < 7) {
        possible = possible.concat([
            (index + 1),
            (index + 1) - 8,
            (index + 1) + 8
        ])
    }

    //check possible moves
    for (let index of possible) {
        if (indexInsideBounds(index)){
            const targetPiece = boardState.pieces[index]
            if (targetPiece === '_' || isCapturable(toMove, targetPiece)) {
                moves.push(index)
            }
            else {
                continue
            }
        }
    }

    //check castle availability
    //King cannot castle if it is in check
    if(!isInCheck(toMove, boardState)){
        const enemy = nextToMove(toMove)
        let attacks = getAllAttacks(boardState)[enemy] //Dont include kings in search
        if(toMove === 'w') {
            if(castleAvailability.includes('K') && !attacks.includes(index+1) && !attacks.includes(index+2) && pieces[index + 1] === '_' && pieces[index + 2] === '_') {
                //kingside
                moves.push(index + 2)
            }
            if (castleAvailability.includes('Q') && !attacks.includes(index-1) && !attacks.includes(index-2) && pieces[index - 1] === '_' && pieces[index - 2] === '_' && pieces[index - 3] === '_'){
                //queenside
                moves.push(index - 2)
            }
        } else {
            if(castleAvailability.includes('k') && !attacks.includes(index+1) && !attacks.includes(index+2) && pieces[index + 1] === '_' && pieces[index + 2] === '_') {
                //kingside
                moves.push(index + 2)
            }
            if (castleAvailability.includes('q') && !attacks.includes(index-1) && !attacks.includes(index-2) && pieces[index - 1] === '_' && pieces[index - 2] === '_' && pieces[index - 3] === '_'){
                //queenside
                moves.push(index - 2)
            }
        }
    }

    return moves
}

const getKingAttacks = (toMove: ToMove, index: number, boardState: BoardState) : number[] => {
    const {pieces, castleAvailability} = boardState
    let attacks: number[] = []
    
    let possible: number[] = [(index + 8), (index - 8)]
    //left
    if (index % 8 > 0) {
        possible = possible.concat([
            (index - 1),
            (index - 1) - 8,
            (index - 1) + 8
        ])
    }
    //right
    if (index % 8 < 7) {
        possible = possible.concat([
            (index + 1),
            (index + 1) - 8,
            (index + 1) + 8
        ])
    }

    //check possible moves
    for (let index of possible) {
        if (indexInsideBounds(index)){
            const targetPiece = boardState.pieces[index]
            if (isCapturable(toMove, targetPiece)) {
                attacks.push(index)
            }
            else {
                continue
            }
        }
    }

    return attacks
}

const getQueenMoves = (toMove: ToMove, index: number, pieces: Piece[]) => {
    let moves: number[] = []

    moves = moves.concat(getBishopMoves(toMove, index, pieces))
    moves = moves.concat(getRookMoves(toMove, index, pieces))

    return moves
}

export const isCapturable = (toMove: ToMove, piece: Piece) => {
    if (piece === '_') {
        return false
    }
    if (toMove === 'w' && piece === piece.toLowerCase()) {
        //white moves and piece is black
        return true
    } else if (toMove === 'b' && piece === piece.toUpperCase()) {
        //black moves and piece is white
        return true
    } else {
        return false
    }
}

const indexInsideBounds = (index : number) => {
    const minIndex = 0
    const maxIndex = 63
    return index >= minIndex && index <= maxIndex
}
