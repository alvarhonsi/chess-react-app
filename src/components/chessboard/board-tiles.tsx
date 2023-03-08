import { GridItem, Box } from "@chakra-ui/react";

interface PieceProps {
  index: number;
  image?: string;
  selectable: boolean;
}

export const BoardPiece = ({ index, image, selectable }: PieceProps) => {
  return (
    <GridItem
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="100%"
      h="100%"
      className="grid-tile"
      data-index={index}
    >
      {image && (
        <Box
          w="100%"
          h="100%"
          backgroundImage={image}
          bgRepeat="no-repeat"
          bgPosition="center"
          className="chess-piece"
          _hover={
            selectable
              ? {
                  cursor: "pointer",
                }
              : {}
          }
        ></Box>
      )}
    </GridItem>
  );
};

interface TileProps {
  number: number;
  board_colors: {
    primary: string;
    secondary: string;
  };
  tileEffect: Effect;
}

export const BoardTile = ({ number, board_colors, tileEffect }: TileProps) => {
  return (
    <GridItem
      bg={number % 2 === 0 ? board_colors.secondary : board_colors.primary}
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="100%"
      h="100%"
    >
      {TileEffect(tileEffect)}
    </GridItem>
  );
};

export enum Effect {
  None,
  Origin,
  End,
  Movable,
  Attack,
  Check,
}

const TileEffect = (effect: Effect) => {
  let styleProps: any = {};
  switch (effect) {
    case Effect.Origin:
      styleProps = {
        bg: "yellow.200",
        w: "100%",
        h: "100%",
        cursor: "pointer",
        opacity: 0.7,
      };
      break;
    case Effect.End:
      styleProps = {
        bg: "yellow.300",
        w: "100%",
        h: "100%",
        cursor: "pointer",
        opacity: 1,
      };
      break;
    case Effect.Movable:
      styleProps = {
        bg: "green.800",
        w: "20%",
        h: "20%",
        borderRadius: "50%",
        cursor: "pointer",
        opacity: 0.5,
      };
      break;
    case Effect.Attack:
      styleProps = {
        bg: "red.500",
        w: "50%",
        h: "50%",
        borderRadius: "50%",
        cursor: "pointer",
        opacity: 0.7,
      };
      break;
    case Effect.Check:
      styleProps = {
        bg: "red.500",
        w: "70%",
        h: "70%",
        borderRadius: "50%",
        cursor: "pointer",
        opacity: 0.7,
      };
      break;
    default:
      break;
  }

  return (
    <Box className="tile-effect" {...styleProps}>
      {" "}
    </Box>
  );
};
