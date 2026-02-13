import { css } from "styled-components";
import { COLORS } from "./colors";

interface BorderProps {
  thickness?: number;
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
}
export const border = ({
  thickness = 3,
  top = true,
  left = true,
  bottom = true,
  right = true,
}: BorderProps) => css`
  background-color: ${COLORS.PANEL};
  border-top: ${top ? `${thickness}px solid white;` : "none"};
  border-left: ${left ? `${thickness}px solid white;` : "none"};
  border-bottom: ${bottom ? `${thickness}px solid black;` : "none"};
  border-right: ${right ? `${thickness}px solid black;` : "none"};
`;
