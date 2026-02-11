import { IoSettingsOutline } from "react-icons/io5";
import styled from "styled-components";
import { BaseButton } from "../../../components/BaseButton";

// Style
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
`;

const EditButton = styled(BaseButton)`
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
