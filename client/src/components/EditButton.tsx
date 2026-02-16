import styled from "styled-components";
import { BaseButton } from "./BaseButton";

export const EditButton = styled(BaseButton)`
  font-size: smaller;
  &:hover {
    text-decoration: underline;
  }
  color: #5383a1;
`;
