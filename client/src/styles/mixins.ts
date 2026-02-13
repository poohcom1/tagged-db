import { css } from "styled-components";
import { COLORS } from "./colors";

export const center = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface BorderProps {
  thickness?: number;
  isButton?: boolean;
  top?: boolean;
  left?: boolean;
  bottom?: boolean;
  right?: boolean;
}
export const border = ({
  thickness = 3,
  isButton = false,
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

  ${isButton &&
  `
  &:active {
    border-top: ${top ? `${thickness}px solid black;` : "none"};
    border-left: ${left ? `${thickness}px solid black;` : "none"};
    border-bottom: ${bottom ? `${thickness}px solid white;` : "none"};
    border-right: ${right ? `${thickness}px solid white;` : "none"};
  }
    
  &:active > * {
    transform: translate(1px, 1px);
  }
  `}
`;
