import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FaFileCsv } from "react-icons/fa6";
import { PiFoldersLight } from "react-icons/pi";
import { BasicButton } from "../../components/BasicButton";
import { useRemoteBackends } from "../../storageBackends/useRemoteBackends";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { PiNetworkBold as IconLocal } from "react-icons/pi";
import {
  TbNetwork as IconNetwork,
  TbNetworkOff as IconNetworkOff,
  TbHourglass as IconProgress,
} from "react-icons/tb";
import { localStorageBackend } from "../../storageBackends/localStorageBackend";
import { apiBackend } from "../../storageBackends/apiBackend";
import {
  getCurrentRemoteUrl,
  REMOTE_URL_PARAM,
  setCurrentRemote,
} from "../../storageBackends/storageBackend";
import { useLocation } from "react-router-dom";

interface Sheet {
  id: string;
  name: string;
  created: string;
  updated: string;
}

const Background = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;

  background-color: #008483;
`;

const FolderContainer = styled.div`
  margin: 32px;
  padding: 6px;
  color: black;
  background-color: #c4c4c4;
  height: 80%;
  width: 80%;
  border-top: 3px solid white;
  border-left: 3px solid white;
  border-bottom: 3px solid black;
  border-right: 3px solid black;
  display: flex;
  flex-direction: column;
`;

const FolderHeader = styled.div`
  color: white;
  background-color: #000082;
  padding: 4px 8px;
  margin-bottom: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const MenuButton = styled(BasicButton)`
  padding: 4px;
`;

const HSep = styled.div`
  margin: 4px 0;
  width: 100%;
  height: 1px;
  background-color: #4e4e4e;
  border-bottom: 1px solid white;
`;

const VSep = styled.div`
  margin: 0;
  width: 1px;
  height: 80%;
  background-color: #4e4e4e;
  border-right: 1px solid white;
`;

const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0px;
  background-color: #c4c4c4;
  padding: 0;
`;

const TabButton = styled.a<{ $selected: boolean; $loading?: boolean }>`
  padding: 4px 8px;
  padding-bottom: ${({ $selected }) => ($selected ? 6 : 4)}px;
  color: ${({ $selected }) => ($selected ? "black" : "#000000a2")};
  font-weight: ${({ $selected }) => ($selected ? 600 : 500)};

  border-top-right-radius: 5px;
  border-top-left-radius: 5px;

  position: relative;
  z-index: ${({ $selected }) => ($selected ? 10 : 0)};

  border-top: 2px solid white;
  border-left: 2px solid white;
  border-bottom: ${({ $selected }) =>
    $selected ? "2px solid #c4c4c4" : "none"};
  border-right: 2px solid black;

  cursor: ${({ $loading }) => ($loading ? "wait" : "pointer")};
`;

const FilesContainerOutline = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #c4c4c4;
  padding: 8px;
  flex-grow: 1;

  position: relative;
  z-index: 5;
  margin-top: -2px;

  border-top: 2px solid white;
  border-left: 2px solid white;
  border-bottom: 2px solid black;
  border-right: 2px solid black;
`;

const FilesContainer = styled.div`
  color: black;
  background-color: white;
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  padding: 4px 8px;
  font-weight: bold;
  border-bottom: 1px solid #00000033;

  & > div:nth-child(2),
  & > div:nth-child(3) {
    text-align: right;
  }
`;

interface FileProps {
  $selected?: boolean;
}

const File = styled.a<FileProps>`
  color: inherit;
  text-decoration: none;
  height: 48px;
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  align-items: center;
  padding: 0 8px;
  background: ${({ $selected }) => ($selected ? "#00000045" : "transparent")};
  border: 1px solid #00000000;

  &:hover {
    border: 1px solid #00000033;
    text-decoration: ${({ $selected }) =>
      $selected ? "underline" : "inherit"};
    cursor: pointer;
  }

  & > div:nth-child(2),
  & > div:nth-child(3) {
    text-align: right;
  }
`;

const FileCreating = styled.div`
  color: grey;
  font-size: small;
  height: 24px;
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  align-items: center;
  padding: 0 8px;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Component

export const MySheetsPage = () => {
  const remoteBackends = useRemoteBackends();
  const { search } = useLocation();

  const [selectedStorage, setSelectedStorage] = useState<string>(""); // "" = localStorage
  const [addingStorage, setAddingStorage] = useState<boolean>(false);
  const [loadingStorages, setLoadingStorages] = useState<string[]>([]);
  const [brokenStorages, setBrokenStorages] = useState<string[]>([]);

  const [sheetsMap, setSheetsMap] = useState<
    Record<string, Sheet[] | undefined>
  >({});
  const sheets = useMemo(
    () => sheetsMap[selectedStorage],
    [sheetsMap, selectedStorage],
  );
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [creatingSheet, setCreatingSheet] = useState<string>("");

  useEffect(() => {
    setSelectedStorage(getCurrentRemoteUrl(search));
  }, [search]);

  useEffect(() => {
    setCurrentRemote(selectedStorage);
  }, [selectedStorage]);

  const storageBackend = useMemo(() => {
    if (selectedStorage) {
      return apiBackend(selectedStorage);
    } else {
      return localStorageBackend;
    }
  }, [selectedStorage]);

  const fetchSheets = useCallback(async () => {
    setLoadingStorages((s) => [...s, selectedStorage]);
    setBrokenStorages((s) => s.filter((s) => s !== selectedStorage));
    const res = await storageBackend.getSheets();
    setLoadingStorages((s) => s.filter((s) => s !== selectedStorage));
    if (res.ok) {
      setSheetsMap((m) => ({ ...m, [selectedStorage]: res.value }));
      setSelectedSheet("");
    } else if (remoteBackends.backends.find((b) => b.url === selectedStorage)) {
      setBrokenStorages((s) => [...s, selectedStorage]);
      await new Promise((resolve) => setTimeout(resolve, 50));
      alert(
        `Failed to connect to remote: ${selectedStorage}.\n\nReason: ${res.error}`,
      );
    }
  }, [remoteBackends.backends, selectedStorage, storageBackend]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const onCreateSheet = useCallback(() => {
    const title = prompt("Enter sheet title:");
    if (!title) return;

    if (sheets?.find((sheet) => sheet.name === title)) {
      alert(`Error: Sheet "${title}" already exists!`);
      return;
    }

    setCreatingSheet(title);
    storageBackend.createSheet(title).then((res) => {
      setCreatingSheet("");
      if (res.ok) {
        setSheetsMap((m) => {
          const storageSheets = m[selectedStorage] || [];
          return {
            ...m,
            [selectedStorage]: [...storageSheets, res.value],
          };
        });
      } else {
        alert(res.error);
        fetchSheets();
      }
    });
  }, [fetchSheets, selectedStorage, sheets, storageBackend]);

  const onRenameSheet = useCallback(() => {
    if (!selectedSheet) {
      return;
    }

    const sheet = sheets?.find((sheet) => sheet.id === selectedSheet);
    if (!sheet) {
      alert("Sheet not found");
      return;
    }
    const title = prompt(`Enter new sheet title:`, sheet.name);
    if (!title) {
      return;
    }
    sheet.name = title;
    setSheetsMap((s) => ({ ...s }));

    storageBackend.renameSheet(selectedSheet, title).then((res) => {
      if (!res.ok) {
        alert(res.error);
        fetchSheets();
      }
    });
  }, [selectedSheet, sheets, storageBackend, fetchSheets]);

  const onDeleteSheet = useCallback(() => {
    if (!selectedSheet) {
      return;
    }

    const sheet = sheets?.find((sheet) => sheet.id === selectedSheet);
    if (!sheet) {
      alert("Sheet not found");
      return;
    }

    if (confirm(`Are you sure you want to delete "${sheet.name}"?`)) {
      setSheetsMap((s) => {
        const storageSheets = s[selectedStorage] || [];
        return {
          ...s,
          [selectedStorage]: storageSheets.filter(
            (s) => s.id !== selectedSheet,
          ),
        };
      });

      storageBackend.deleteSheet(selectedSheet).then((res) => {
        if (!res.ok) {
          alert(res.error);
          fetchSheets();
        }
      });
    }
  }, [selectedSheet, sheets, storageBackend, selectedStorage, fetchSheets]);

  const getUrl = useCallback(() => {
    let url = `/sheet/${selectedSheet}`;
    if (selectedStorage) {
      url += `?${REMOTE_URL_PARAM}=${selectedStorage}`;
    }
    return url;
  }, [selectedSheet, selectedStorage]);

  const onOpenSheet = useCallback(() => {
    if (!selectedSheet) {
      return;
    }
    window.open(getUrl());
  }, [getUrl, selectedSheet]);

  useEffect(() => {
    document.title = "My Sheets | TaggedDB";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedSheet("");
      } else if (e.key === "n") {
        onCreateSheet();
      } else if (e.key === "r") {
        onRenameSheet();
      } else if (e.key === "d") {
        onDeleteSheet();
      } else if (e.key === "o") {
        onOpenSheet();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCreateSheet, onDeleteSheet, onOpenSheet, onRenameSheet]);

  return (
    <Background onClick={() => setSelectedSheet("")}>
      <FolderContainer>
        <FolderHeader>
          <PiFoldersLight /> My Sheets
        </FolderHeader>
        <ButtonContainer>
          <MenuButton onClick={onCreateSheet} disabled={!!creatingSheet}>
            <u>N</u>ew
          </MenuButton>
          <VSep />
          <MenuButton onClick={onOpenSheet} disabled={!selectedSheet}>
            <u>O</u>pen
          </MenuButton>
          <MenuButton onClick={onRenameSheet} disabled={!selectedSheet}>
            <u>R</u>ename
          </MenuButton>
          <MenuButton onClick={onDeleteSheet} disabled={!selectedSheet}>
            <u>D</u>elete
          </MenuButton>
        </ButtonContainer>
        <HSep />

        <TabsContainer>
          <TabButton
            tabIndex={0}
            key="localStorage"
            $selected={!selectedStorage && !addingStorage}
            onClick={() => setSelectedStorage("")}
          >
            <IconLocal /> localStorage://
          </TabButton>
          {remoteBackends.backends.map((backend) => (
            <TabButton
              tabIndex={0}
              key={backend.url}
              $selected={selectedStorage === backend.url && !addingStorage}
              $loading={loadingStorages.includes(backend.url)}
              onClick={() => setSelectedStorage(backend.url)}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              {loadingStorages.includes(backend.url) ? (
                <IconProgress />
              ) : brokenStorages.includes(backend.url) ? (
                <IconNetworkOff />
              ) : (
                <IconNetwork />
              )}
              {backend.url}/
              <BasicButton
                style={{ display: "flex", alignItems: "center" }}
                onClick={(e) => {
                  if (!confirm(`Close backend: ${backend.url}?`)) {
                    return;
                  }
                  e.stopPropagation();
                  remoteBackends.remove(backend);
                  setBrokenStorages((s) => s.filter((s) => s !== backend.url));
                  setSelectedStorage("");
                }}
              >
                <IoMdClose style={{ marginLeft: "auto" }} />
              </BasicButton>
            </TabButton>
          ))}
          <TabButton
            tabIndex={0}
            key="add"
            $selected={addingStorage}
            title="Add remote backend"
            onClick={async () => {
              setAddingStorage(true);
              await new Promise((resolve) => setTimeout(resolve, 0));
              let url = prompt("Remote backend URL:");
              if (url && remoteBackends.backends.find((b) => b.url === url)) {
                alert("Already connected to remote!");
                setSelectedStorage(url);
              } else if (
                url &&
                (url.startsWith("http://") || url.startsWith("https://"))
              ) {
                if (url.endsWith("/")) {
                  url = url.slice(0, -1);
                }

                remoteBackends.add({
                  url,
                });
                setSelectedStorage(url);
              } else {
                if (url) {
                  alert("Invalid URL: " + url);
                }
              }
              setAddingStorage(false);
            }}
          >
            <IoMdAdd />
          </TabButton>
        </TabsContainer>
        <FilesContainerOutline>
          <FilesContainer>
            <Columns>
              <div>Name</div>
              <div>Updated</div>
              <div>Created</div>
            </Columns>

            {sheets?.map((sheet, ind) => (
              <File
                tabIndex={ind}
                key={sheet.id}
                href={sheet.id === selectedSheet ? getUrl() : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  if (sheet.id !== selectedSheet) {
                    setTimeout(() => setSelectedSheet(sheet.id), 0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (sheet.id !== selectedSheet) {
                      setTimeout(() => setSelectedSheet(sheet.id), 0);
                    }
                  }
                }}
                $selected={sheet.id === selectedSheet}
              >
                <NameCell>
                  <FaFileCsv />
                  {sheet.name}
                </NameCell>
                <Time dateTime={sheet.updated} />
                <Time dateTime={sheet.created} />
              </File>
            ))}
            {loadingStorages.includes(selectedStorage) && (
              <FileCreating key="_">
                {(sheetsMap[selectedStorage] ?? []).length === 0
                  ? "Connecting to remote..."
                  : "Updating remote..."}
              </FileCreating>
            )}
            {creatingSheet && (
              <FileCreating key="_">Creating "{creatingSheet}"...</FileCreating>
            )}
          </FilesContainer>
        </FilesContainerOutline>
      </FolderContainer>
    </Background>
  );
};

const TimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeText = styled.div`
  font-size: smaller;
`;

const Time = ({ dateTime }: { dateTime: string }) => {
  const timeString = new Date(dateTime).toLocaleString();

  const [date, time] = timeString.split(", ");
  return (
    <TimeContainer>
      <TimeText>{date}</TimeText>
      <TimeText>{time}</TimeText>
    </TimeContainer>
  );
};
