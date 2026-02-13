import { IoSettingsOutline } from "react-icons/io5";
import styled from "styled-components";
import { BasicButton } from "../../../components/BasicButton";

// Style
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
`;

const EditButton = styled(BasicButton)`
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 50%;
  &:hover {
    opacity: 100%;
  }
`;

// Component
interface Props {
  title: string;
  onEdit?: () => void;
}

export const HeaderCell = ({ title, onEdit }: Props) => {
  return (
    <HeaderContainer>
      <div>{title}</div>
      <EditButton onClick={onEdit}>
        <IoSettingsOutline />
      </EditButton>
    </HeaderContainer>
  );
};
