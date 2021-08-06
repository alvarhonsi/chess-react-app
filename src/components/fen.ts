import {BoardPosition, BoardState, CastleAvailability, Piece, ToMove} from './chessboard/board-types'


const FENregex = new RegExp("((([prnbqkPRNBQK12345678]*/){7})([prnbqkPRNBQK12345678]*)) (w|b) ((K?Q?k?q?)|\\-) (([abcdefgh][36])|\\-) (\\d*) (\\d*)")

export const readFEN = (fen : string) : BoardState => {
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
        toMove : FEN[1] as ToMove,
        castleAvailability : FEN[2] as CastleAvailability,
        enpessant : FEN[3] as BoardPosition,
        halfmove : parseInt(FEN[4]),
        fullmove : parseInt(FEN[5]),
    }
}

export const generateFEN = (boardState: BoardState) : string => {
    let FEN = ''

    let row = ''
    let empty = 0
    for (let i = 0; i < boardState.pieces.length; i++) {
        if(i % 8 === 0 && i != 0) {
            if(empty != 0) {
                row = row.concat(empty.toString())
                empty = 0
            }
            //new row
            FEN = FEN.concat(row)
            FEN = FEN.concat('/')
            row = ''
            empty = 0
        }
        if(boardState.pieces[i] === '_') {
            empty += 1
        } else {
            if(empty != 0) {
                row = row.concat(empty.toString())
                empty = 0
            }
            row = row.concat(boardState.pieces[i])
        }
    }
    //last row
    if(empty != 0) {
        row = row.concat(empty.toString())
    }
    FEN = FEN.concat(row)

    //toMove
    FEN = FEN.concat(` ${boardState.toMove}`)
    //CastleAvailability
    FEN = FEN.concat(` ${boardState.castleAvailability}`)
    //Enpessant
    FEN = FEN.concat(` ${boardState.enpessant}`)
    FEN = FEN.concat(` ${boardState.halfmove.toString()}`)
    FEN = FEN.concat(` ${boardState.fullmove.toString()}`)

    console.log(FEN)

    return FEN
}

export const isValidFEN = (fen : string) : boolean => {
    return FENregex.test(fen)
}