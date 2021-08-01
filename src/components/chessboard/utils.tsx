import { BoardPosition, Column, Row } from "./board-types"

export const coordinateToIndex = (x : number, y : number) : number => {
    return x + (y * 8)
}

export const boardPositionToIndex = (pos : BoardPosition) : number => {
    const board_columns: Column[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const board_rows: Row[] = ['8', '7', '6', '5', '4', '3', '2', '1']
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