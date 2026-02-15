import styled from "styled-components";
import { IoMdClose } from "react-icons/io";
import { DragHandleProps } from "../../hooks/useDraggableWindow";
import { COLORS } from "../../styles/colors";
import { border } from "../../styles/mixins";

const Header = styled.div<{ $dragEnable: boolean; $dragging: boolean }>`
  color: white;
  background-color: ${COLORS.HEADER};
  padding: 4px 8px;
  margin-bottom: 4px;

  display: flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ $dragEnable, $dragging }) =>
    $dragEnable ? ($dragging ? "grabbing" : "grab") : "inherit"};
  user-select: none;
  touch-action: none;
`;

const CloseButton = styled.button`
  margin-left: auto;

  background-color: ${COLORS.PANEL};
  ${border({ thickness: 2, isButton: true })};

  &:hover {
    cursor: pointer;
  }
`;

// Component

type Props = (
  | {
      children?: React.ReactNode;
      isDragging?: undefined;
      dragHandleProps?: undefined;
    }
  | {
      children?: React.ReactNode;
      isDragging: boolean;
      dragHandleProps: DragHandleProps;
    }
) &
  (
    | { showCloseButton?: false }
    | { showCloseButton: true; onClose?: () => void; closeToolTip?: string }
  );

export const WindowHeader = (props: Props) => {
  const { children, isDragging, dragHandleProps, showCloseButton } = props;
  return (
    <Header
      {...dragHandleProps}
      $dragEnable={!!dragHandleProps}
      $dragging={isDragging ?? false}
    >
      {children}
      {showCloseButton && (
        <CloseButton
          title={props.closeToolTip ?? "Close"}
          onClick={props.onClose}
        >
          <IoMdClose />
        </CloseButton>
      )}
    </Header>
  );
};
