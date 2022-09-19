export type BoardState = {
    pieces : Piece[],
    toMove: ToMove,
    castleAvailability : CastleAvailability,
    enpessant : BoardPosition,
    halfmove: number,
    fullmove: number
}

export type ToMove = 'w' | 'b'

export type Piece = '_' | 'P' | 'N' | 'B' | 'R' | 'K' | 'Q' | 'p' | 'n' | 'b' | 'r' | 'k' | 'q'

export type Column = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h'

export type Row = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

export type BoardPosition = `${Column}${Row}`

export type CastleAvailability = '-' | `${'' | 'Q'}${'' | 'K'}${'' | 'q'}${'' | 'k'}`