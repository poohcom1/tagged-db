import styled from "styled-components";
import Modal from "react-modal";
import { COLORS } from "../styles/colors";
import { WindowHeader } from "./desktop/WindowHeader";

// Styles
const Container = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

// Component
interface Props {
  title: string;
  children?: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
  blocking?: boolean;
}

export const ModalContainer = ({
  title,
  children,
  isOpen,
  onClose,
  containerStyle,
  blocking,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={!blocking}
      shouldCloseOnEsc={!blocking}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.664)",
          zIndex: 100,
        },
        content: {
          position: "absolute",
          width: "fit-content",
          height: "fit-content",
          minWidth: "20%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: COLORS.PANEL,
          borderTop: "3px solid white",
          borderLeft: "3px solid white",
          borderRight: "3px solid black",
          borderBottom: "3px solid black",
          borderRadius: "0",
          padding: "8px",
        },
      }}
    >
      <WindowHeader showCloseButton onClose={onClose} closeToolTip="Cancel">
        {title}
      </WindowHeader>
      <Container style={containerStyle}>{children}</Container>
    </Modal>
  );
};
