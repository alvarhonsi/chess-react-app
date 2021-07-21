export type BoardState = {
    pieces : Piece[],
    toMove: ToMove,
    castleOpertunity : string,
    enpessant : string,
    halfmove: number,
    fullmove: number
}

export type ToMove = 'w' | 'b'

export type Piece = '_' | 'P' | 'N' | 'B' | 'R' | 'K' | 'Q' | 'p' | 'n' | 'b' | 'r' | 'k' | 'q'
