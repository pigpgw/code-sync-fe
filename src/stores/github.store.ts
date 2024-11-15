import { create } from "@/lib/zustand";
import {
  getFileContent,
  getPrCommentsData,
  getPrCommitsData,
  getPrData,
} from "@/apis/pr/pr";
import { GitHubCommentsResponse } from "@/apis/pr/dto";
import {
  getLanguageFromFileName,
  getNextSelectedFile,
  removeFileFromList,
} from "@/lib/file";
import { ADDITIONAL_FILES } from "@/constant/github";

export interface PrInfoProps {
  userId: string;
  requireUserInfo: PrUserInfo;
  requestUserInfo: PrUserInfo;
}

export interface PrMetaDataInfo {
  prUrl: string;
  owner: string;
  repo: string;
  prNumber: number;
}

export interface PrCommentMetaDataInfo {
  owner: string;
  repo: string;
  prNumber: number;
}

interface PrUserInfo {
  owner: string;
  branchName: string;
  commitHash: string;
}

interface PrInfoPropsStore {
  prInfo: PrInfoProps;
  setPrInfo: (prInfo: PrInfoProps) => void;
  resetPrInfo: () => void;
}

interface prMetaDataPropsStore {
  prMetaData: PrMetaDataInfo;
  setPrMetaData: (newPrMetaData: PrMetaDataInfo) => void;
  resetPrMeTaData: () => void;
}

export interface PrChangedFileStatusInfo {
  status: "init" | "modified" | "added" | "removed" | "renamed";
}
export interface PrChangedFileInfo extends PrChangedFileStatusInfo {
  filename: string;
  language: string;
  additions: number;
  deletions: number;
  afterContent: string;
  beforeContent: string;
}

export interface PrCommentsListInfo {
  filepath: string;
  filename: string;
  line: number;
  comments: PrCommentInfo[];
}

export interface PrCommentUserInfo {
  login: string;
  avatar_url: string;
}

export interface PrCommentDateInfo {
  created_at: string;
  updated_at: string;
}

export interface PrCommentInfo {
  filepath: string;
  filename: string;
  user: PrCommentUserInfo;
  body: string;
  date: PrCommentDateInfo;
  original_line: number;
  comment_id: number;
  in_reply_to_id: number | null;
}

interface fileSysyemPropsStore {
  selectedCommitFile: PrChangedFileInfo;
  otherUserSelectedCommitFile: string;
  commitFileList: PrChangedFileInfo[];
  commentsList: PrCommentsListInfo[];
  clickedFileList: PrChangedFileInfo[];
  setSelectedCommitFile: (newFile: PrChangedFileInfo) => void;
  setOtherUserSelectedCommitFile: (newFile: string) => void;
  setCommitFileList: (prMetaData: PrMetaDataInfo) => Promise<void>;
  initCommitFileList: (commitFileList: PrChangedFileInfo[]) => void;
  addClickedFileList: (newFile: PrChangedFileInfo) => void;
  removeClickedFileList: (newFile: PrChangedFileInfo) => void;
  setCommentsList: (prMetaData: PrCommentMetaDataInfo) => Promise<void>;
  initCommentsList: (commentsList: PrCommentsListInfo[]) => void;
}

export const prMetaDataStore = create<prMetaDataPropsStore>()((set) => ({
  prMetaData: {
    owner: "",
    repo: "",
    prNumber: 0,
    prUrl: "",
  },
  setPrMetaData: (newPrMetaData) => {
    set({ prMetaData: newPrMetaData });
  },
  resetPrMeTaData: () =>
    set({ prMetaData: { owner: "", repo: "", prNumber: 0, prUrl: "" } }),
}));

export const prInfoStore = create<PrInfoPropsStore>()((set) => ({
  prInfo: {
    userId: "",
    requireUserInfo: {
      owner: "",
      branchName: "",
      commitHash: "",
    },
    requestUserInfo: {
      owner: "",
      branchName: "",
      commitHash: "",
    },
  },
  setPrInfo: (prInfoData) => set({ prInfo: prInfoData }),
  resetPrInfo: () =>
    set({
      prInfo: {
        userId: "",
        requireUserInfo: {
          owner: "",
          branchName: "",
          commitHash: "",
        },
        requestUserInfo: {
          owner: "",
          branchName: "",
          commitHash: "",
        },
      },
    }),
}));

export const fileSysyemStore = create<fileSysyemPropsStore>()((set, get) => ({
  selectedCommitFile: ADDITIONAL_FILES.DEFAULT_FILE,
  otherUserSelectedCommitFile: "",
  commitFileList: [],
  commentsList: [],
  clickedFileList: [],
  setSelectedCommitFile: (newFile) => {
    set((state) => {
      const isFileInList = state.clickedFileList.some(
        (file) => file.filename === newFile.filename,
      );
      return {
        selectedCommitFile: newFile,
        clickedFileList: isFileInList
          ? state.clickedFileList
          : [...state.clickedFileList, newFile],
      };
    });
  },
  setOtherUserSelectedCommitFile: (newFile) => {
    set({ otherUserSelectedCommitFile: newFile });
  },
  addClickedFileList: (newFile) =>
    set((state) => ({
      clickedFileList: [...state.clickedFileList, newFile],
    })),
  removeClickedFileList: (removeFile) =>
    set((state) => {
      const updateClickedFileList = removeFileFromList(
        state.clickedFileList,
        removeFile,
      );
      const isCurrentFileCanRemoved =
        state.selectedCommitFile.filename === removeFile.filename;
      if (isCurrentFileCanRemoved) {
        get().setSelectedCommitFile(
          getNextSelectedFile(
            updateClickedFileList,
            ADDITIONAL_FILES.DEFAULT_FILE,
          ),
        );
      }
      return { clickedFileList: updateClickedFileList };
    }),
  setCommitFileList: async ({ owner, repo, prNumber }) => {
    try {
      const prResponse = await getPrData({ owner, repo, prNumber });
      const [requireUser, requireBranchName] = prResponse.head.label.split(":");
      const [requestOwner, requestBranchName] =
        prResponse.base.label.split(":");
      const requireSha = prResponse.head.sha;
      const requesteSha = prResponse.base.sha;
      prMetaDataStore.getState().setPrMetaData({
        owner,
        repo,
        prNumber,
        prUrl: prResponse.html_url,
      });
      const prInfoData: PrInfoProps = {
        userId: prResponse.user.login,
        requireUserInfo: {
          owner: requireUser,
          branchName: requireBranchName,
          commitHash: requireSha,
        },
        requestUserInfo: {
          owner: requestOwner,
          branchName: requestBranchName,
          commitHash: requesteSha,
        },
      };

      prInfoStore.getState().setPrInfo(prInfoData);

      const fetchCommitsData = await getPrCommitsData({
        owner,
        repo,
        prNumber,
      });
      const processedFiles = await Promise.all(
        fetchCommitsData.map(async (commit) => {
          let beforeContent = "";
          let afterContent = "";
          try {
            if (commit.status === "modified") {
              const beforeContentResponse = await getFileContent(
                prInfoData.requestUserInfo.owner,
                repo,
                prInfoData.requestUserInfo.commitHash,
                commit.filename,
              );
              beforeContent =
                typeof beforeContentResponse === "object"
                  ? JSON.stringify(beforeContentResponse, null, 2)
                  : beforeContentResponse;
            }

            if (commit.status === "added" || commit.status === "modified") {
              const afterContentResponse = await getFileContent(
                prInfoData.requireUserInfo.owner,
                repo,
                prInfoData.requireUserInfo.commitHash,
                commit.filename,
              );
              afterContent =
                typeof afterContentResponse === "object"
                  ? JSON.stringify(afterContentResponse, null, 2)
                  : afterContentResponse;
            }
          } catch (error) {
            console.warn(
              `Failed to get content for file ${commit.filename}:`,
              error,
            );
          }

          return {
            filename: commit.filename,
            status: commit.status,
            language: getLanguageFromFileName(
              String(commit.filename.split(".").at(-1)),
            ),
            additions: commit.additions,
            deletions: commit.deletions,
            afterContent,
            beforeContent,
          };
        }),
      );
      set({ commitFileList: processedFiles });
    } catch (error) {
      console.error("PR 데이터 가져오기 실패", error);
      set({ commitFileList: [] });
      throw new Error("PR 데이터 가져오기 실패");
    }
  },
  initCommitFileList: (commitFileList) => set({ commitFileList }),
  initCommentsList: (commentsList) => set({ commentsList }),

  setCommentsList: async ({ owner, repo, prNumber }) => {
    const commitFileList = new Map();
    const getComments = async () => {
      try {
        const response = await getPrCommentsData({
          owner,
          repo,
          prNumber,
        });
        response.map((comment) => {
          const uuid = `${comment.path}-${comment.original_line}`;
          if (!commitFileList.get(uuid)) {
            commitFileList.set(uuid, []);
            commitFileList.get(uuid).push(comment);
          } else {
            commitFileList.get(uuid).push(comment);
          }
        });
        const sortedMap = new Map(
          [...commitFileList.entries()].sort((a, b) => {
            const aNumber = a[0].split("-")[1];
            const bNumber = b[0].split("-")[1];
            return aNumber - bNumber;
          }),
        );
        const transformList = Array.from(sortedMap).map(([key, comments]) => {
          const [filepath, lineNumber] = key.split("-");
          const sortedComentList = comments.map(
            (comment: GitHubCommentsResponse) => ({
              filepath,
              filename: comment.path.split("/").at(-1)?.split("-")[0],
              user: comment.user,
              body: comment.body,
              date: {
                created_at: comment.created_at,
                updated_at: comment.updated_at,
              },
              original_line: comment.original_line,
              comment_id: comment.id,
              in_reply_to_id: comment.in_reply_to_id || null,
            }),
          );
          return {
            filepath,
            filename: filepath.split("/").at(-1),
            line: lineNumber,
            comments: sortedComentList,
          };
        });
        set({ commentsList: transformList });
      } catch (e) {
        console.error(e);
      }
    };
    await getComments();
  },
}));
