import {BoardState, Piece} from './board-types'


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
        toMove : FEN[1],
        castleOpertunity : FEN[2],
        enpessant : FEN[3],
        halfmove : parseInt(FEN[4]),
        fullmove : parseInt(FEN[5])
    }
}

export const isValidFEN = (fen : string) : boolean => {
    return FENregex.test(fen)
}