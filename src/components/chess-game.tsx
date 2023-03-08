import React, { useRef, useState } from "react";
import { Grid, Flex, Box, Text, VStack, Button } from "@chakra-ui/react";
import {
  piece_images,
  getMoves,
  getAttacks,
  pieceIsMovable,
  isInCheck,
  isCapturable,
  getKingPos,
} from "./chessboard/pieces";
import { Effect } from "./chessboard/board-tiles";
import {
  BoardState,
  CastleAvailability,
  Piece,
  ToMove,
} from "./chessboard/board-types";
import { castleAvailability } from "./test-positions";
import {
  boardPositionToIndex,
  indexToBoardPosition,
  nextToMove,
} from "./chessboard/utils";
import { generateFEN, readFEN } from "./fen";
import ChessBoard from "./chessboard/chessboard";

const clone = require("rfdc")();

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const ChessGame = () => {
  const [boardState, setBoardState] = useState<BoardState>(readFEN(startFEN));
  const [effectGrid, setEffectGrid] = useState<Effect[]>(
    new Array<Effect>(64).fill(Effect.None)
  );
  const [origin, setOrigin] = useState<number | null>(null);
  const [movesList, setMovesList] = useState<[string, string, number][]>([
    ["start", startFEN, 0],
  ]);
  const [moveIndex, setMoveIndex] = useState<number>(0);

  console.log(moveIndex);
  console.log(movesList);

  let activePiece: HTMLElement | null = null;

  const registerMove = (originIndex: number, targetIndex: number) => {
    const piece = boardState.pieces[originIndex];
    console.log(
      piece,
      " from ",
      indexToBoardPosition(originIndex),
      " to ",
      indexToBoardPosition(targetIndex)
    );

    const newState = doMove(originIndex, targetIndex, boardState);
    setBoardState(newState);

    setMovesList((movesList) => {
      const newMove = getMoveNotation(originIndex, targetIndex, boardState);
      const newIndex = moveIndex + 1;
      const newList = movesList.slice(0, newIndex);
      setMoveIndex(newIndex);
      return [...newList, [newMove, generateFEN(newState), newIndex]];
    });

    //Tile effects
    //Clear all previous board-effects
    clearEffects(true, true);

    //color end-tile
    addEffect(targetIndex, Effect.End);

    if (isInCheck(newState.toMove, newState)) {
      addEffect(getKingPos(newState.toMove, newState), Effect.Check);
    }
  };

  const onClick = async (e: React.MouseEvent) => {
    const elem = e.target as HTMLElement;

    if (elem.classList.contains("chess-piece") && origin === null) {
      //A new piece is to be set as the active piece
      const originIndex = getPieceIndex(elem);
      if (originIndex != null) {
        const piece = boardState.pieces[originIndex];
        if (!pieceIsMovable(piece, boardState.toMove)) {
          return;
        }

        activePiece = elem;
        setOrigin(originIndex);
        const moves = getLegalMoves(piece, originIndex, boardState);

        //Move visualization
        //Tile effects
        clearEffects();
        addEffect(originIndex, Effect.Origin);

        for (let i of moves) {
          if (isCapturable(boardState.toMove, boardState.pieces[i])) {
            addEffect(i, Effect.Attack);
          } else {
            addEffect(i, Effect.Movable);
          }
        }
      } else {
        Error("Cannot find origin index of piece");
      }
    } else if (origin != null) {
      //An active piece is selected
      const targetIndex = getTargetBoardIndex(e);
      console.log("origin:", origin, "target:", targetIndex);

      if (origin != null && targetIndex != null) {
        //Attempt to register new move
        const piece = boardState.pieces[origin];
        const legalMoves = getLegalMoves(piece, origin, boardState);

        if (
          origin != targetIndex &&
          legalMoves.length > 0 &&
          legalMoves.includes(targetIndex)
        ) {
          //Move is legal
          registerMove(origin, targetIndex);

          //Reset active piece
          setOrigin(null);
        } else {
          //Move is aborted
          console.log("abort move");
          setOrigin(null);

          //Tile effects
          //Clear all previous board-effects
          clearEffects();
        }
      } else {
        //Move is aborted
        console.log("abort move");
        setOrigin(null);
        //Tile effects
        //Clear all previous board-effects
        clearEffects();
      }
    } else {
      return;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let index = 0;
    switch (e.key) {
      case "ArrowLeft":
        index = Math.max(0, moveIndex - 1);
        setBoardState(readFEN(movesList[index][1]));
        setMoveIndex(index);
        break;
      case "ArrowRight":
        index = Math.min(movesList.length - 1, moveIndex + 1);
        setBoardState(readFEN(movesList[index][1]));
        setMoveIndex(index);
        break;
    }
  };

  const addEffect = (index: number, effect: Effect) => {
    setEffectGrid((grid) => {
      grid[index] = effect;
      return [...grid];
    });
  };

  const clearEffects = (ends = false, checks = false) => {
    setEffectGrid((grid) => {
      let newGrid = [];
      for (let effect of grid) {
        if (!ends && effect === Effect.End) {
          newGrid.push(effect);
        } else if (!checks && effect === Effect.Check) {
          newGrid.push(effect);
        } else {
          newGrid.push(Effect.None);
        }
      }
      return newGrid;
    });
  };

  return (
    <Flex>
      <ChessBoard
        boardState={boardState}
        effectGrid={effectGrid}
        handleClick={onClick}
      />
      <Box
        bg="gray.700"
        w={["md", "lg", null, "xl"]}
        h="100%"
        ml={[15, null, null, 20]}
        shadow="xl"
      >
        <VStack justify="start">
          <Flex w="100%" p="0" wrap="wrap" onKeyDown={(e) => onKeyDown(e)}>
            {movesList.map((move) => {
              return (
                <Button
                  key={move[2]}
                  my={1}
                  mx={0.5}
                  colorScheme={"white"}
                  variant={"link"}
                  onClick={() => {
                    clearEffects(true, true);
                    setMoveIndex(move[2]);
                    setBoardState(readFEN(move[1]));
                  }}
                >
                  {move[0]}
                </Button>
              );
            })}
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
};

const doMove = (
  origin: number,
  target: number,
  boardState: BoardState
): BoardState => {
  let { pieces, toMove, castleAvailability, enpessant, halfmove, fullmove } =
    clone(boardState);
  const piece = pieces[origin];

  //reset enpessant
  enpessant = "-";

  //increment halfmove
  halfmove++;
  //increment fullmove
  if (toMove === "b") {
    fullmove++;
  }

  //Check special condition moves
  //pawn
  if (piece === "P") {
    //reset halfmove
    halfmove = 0;

    if (target === boardPositionToIndex(enpessant)) {
      //enpessant
      pieces[target + 8] = "_";
    } else if (target === origin - 16) {
      //pawn has moved two squares, making it available for enpessant capture
      enpessant = indexToBoardPosition(target + 8);
    }
  } else if (piece === "p") {
    if (target === boardPositionToIndex(enpessant)) {
      //enpessant
      pieces[target - 8] = "_";
    } else if (target === origin + 16) {
      //pawn has moved two squares, making it available for enpessant capture
      enpessant = indexToBoardPosition(target - 8);
    }
  }
  //king
  if (piece.toUpperCase() === "K") {
    //castle right
    if (target === origin + 2) {
      const rook = pieces[origin + 3];
      pieces[origin + 3] = "_";
      pieces[origin + 1] = rook;
    } else if (target === origin - 2) {
      const rook = pieces[origin - 4];
      pieces[origin - 4] = "_";
      pieces[origin - 1] = rook;
    }
    //remove castle availability
    if (toMove === "w") {
      castleAvailability = castleAvailability.replace(
        "K",
        ""
      ) as CastleAvailability;
      castleAvailability = castleAvailability.replace(
        "Q",
        ""
      ) as CastleAvailability;
    } else {
      castleAvailability = castleAvailability.replace(
        "k",
        ""
      ) as CastleAvailability;
      castleAvailability = castleAvailability.replace(
        "q",
        ""
      ) as CastleAvailability;
    }
  }
  //rook
  if (piece.toUpperCase() === "R") {
    //remove castle availability
    if (toMove === "w") {
      if (origin === 63) {
        castleAvailability = castleAvailability.replace(
          "K",
          ""
        ) as CastleAvailability;
      } else if (origin === 56) {
        castleAvailability = castleAvailability.replace(
          "Q",
          ""
        ) as CastleAvailability;
      }
    } else {
      if (origin === 7) {
        castleAvailability = castleAvailability.replace(
          "k",
          ""
        ) as CastleAvailability;
      } else if (origin === 0) {
        castleAvailability = castleAvailability.replace(
          "q",
          ""
        ) as CastleAvailability;
      }
    }
  }

  if (castleAvailability === "") {
    castleAvailability = castleAvailability = "-";
  }
  //check for capture
  if (pieces[target] != "_") {
    halfmove = 0;
  }

  //move piece to target
  pieces[origin] = "_";
  pieces[target] = piece;
  toMove = toMove === "w" ? "b" : "w";

  return {
    pieces: pieces,
    toMove: toMove,
    castleAvailability: castleAvailability,
    enpessant: enpessant,
    halfmove: halfmove,
    fullmove: fullmove,
  };
};

const getMoveNotation = (
  origin: number,
  target: number,
  boardState: BoardState
): string => {
  const piece = boardState.pieces[origin];
  const targetSquare = indexToBoardPosition(target);

  //Pawns
  if (piece.toUpperCase() === "P") {
    if (boardState.pieces[target] != "_") {
      const columnName = indexToBoardPosition(origin)[0];
      return `${columnName}x${targetSquare}`;
    } else {
      return `${indexToBoardPosition(target)}`;
    }
  }

  //Standard pieces
  if (boardState.pieces[target] != "_") {
    return `${piece}x${targetSquare}`;
  } else {
    return `${piece}${targetSquare}`;
  }
};

const getLegalMoves = (
  piece: Piece,
  index: number,
  boardState: BoardState
): number[] => {
  let legalMoves: number[] = [];
  const pseudoLegalMoves = getMoves(piece, index, boardState);
  for (let move of pseudoLegalMoves) {
    //Complete the move and check if own king is in check
    const newState = doMove(index, move, boardState);
    if (!isInCheck(boardState.toMove, newState)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
};

const getPieceIndex = (piece: HTMLElement): number | null => {
  const gridTile = piece.parentElement;
  if (gridTile) {
    const index = gridTile.getAttribute("data-index");
    return index ? parseInt(index) : null;
  } else {
    Error("Piece has undefined Parent Element");
  }
  return null;
};

const getTargetBoardIndex = (e: React.MouseEvent): number | null => {
  const element = document.elementFromPoint(e.pageX, e.pageY) as HTMLElement;
  if (element && element.classList.contains("chess-piece")) {
    return getPieceIndex(element);
  } else if (element.classList.contains("grid-tile")) {
    const index = element.getAttribute("data-index");
    return index ? parseInt(index) : null;
  }
  return null;
};

export default ChessGame;
