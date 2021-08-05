import { BoardPosition, Column, Row, ToMove } from "./board-types"

const board_columns: Column[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_rows: Row[] = ['8', '7', '6', '5', '4', '3', '2', '1']

export const boardPositionToIndex = (pos : BoardPosition) : number => {
    const column = pos[0] as Column
    const row = pos[1] as Row

    const x = board_columns.indexOf(column)
    const y = board_rows.indexOf(row)
    if(x != null && y != null) {
        return coordinateToIndex(x, y) 
    } else {
        return -1
    }
}

export const indexToBoardPosition = (index : number) : BoardPosition => {
    const x = Math.floor(index/8);
    const y = index % 8;

    return `${board_columns[y]}${board_rows[x]}`
}

export const coordinateToIndex = (x : number, y : number) : number => {
    return x + (y * 8)
}

export const nextToMove = (toMove : ToMove) : ToMove => {
    return toMove === 'w' ? 'b' : 'w'
}