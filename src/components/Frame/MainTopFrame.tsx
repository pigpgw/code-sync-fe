import { SyncButton } from "@/components/Conversation/SyncButton";
import { PRBottomFileExplorer } from "@/components/File/PRBottomFileExplorer";
import { PrFileNameViewer } from "@/components/File/PrSelectedFileViewer/PrFileNameViewer";
import { PrFilePathViewer } from "@/components/File/PrSelectedFileViewer/PrFilePathViewer";
import SelectedFileViewer from "@/components/File/SelectedFile";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useConvertToImage } from "@/hooks/useConvertToImage";
import { SocketManager } from "@/lib/socketManager";
import { initCommentStructSync, initFileStructSync } from "@/lib/yjs";
import { sectionSelectStore } from "@/stores/chattingRoom.store";
import { useCommunicationStore } from "@/stores/communicationState.store";
import { fileSysyemStore } from "@/stores/github.store";
import { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";

const MainTopFrom = () => {
  const clickedFileList = fileSysyemStore((state) => state.clickedFileList);
  const selectedCommitFile = fileSysyemStore(
    (state) => state.selectedCommitFile,
  );
  const selectedTotalFilePath = selectedCommitFile.filename.split("/");
  const bottomSection = sectionSelectStore((state) => state.bottomSection);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const commitFileList = fileSysyemStore((state) => state.commitFileList);
  const commentsList = fileSysyemStore((state) => state.commentsList);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | null>(
    null,
  );
  const initCommitFileList = fileSysyemStore(
    (state) => state.initCommitFileList,
  );
  const initCommentsList = fileSysyemStore((state) => state.initCommentsList);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const { convertToImage } = useConvertToImage({ elementRef, size });

  const isSocketManagerReady = useCommunicationStore(
    (state) => state.isSocketManagerReady,
  );
  if (!isSocketManagerReady) throw new Error("socketManager is not ready");

  const ydoc = SocketManager.getInstance().yjsSocket.ydoc;
  const provider = SocketManager.getInstance().yjsSocket.provider;

  const onEditorMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    setEditor(editorInstance);
  };

  const onDiffEditorMount = (diffEditor: editor.IStandaloneDiffEditor) => {
    const modifiedEditor = diffEditor.getModifiedEditor();
    setEditor(modifiedEditor);
  };

  useEffect(() => {
    if (!editor || !selectedCommitFile || !provider) return;

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const model = editor.getModel();
    if (!model) return;

    const ytext = ydoc.getText(selectedCommitFile.filename);
    bindingRef.current = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness,
    );
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [ydoc, editor, selectedCommitFile, provider]);

  useEffect(() => {
    initFileStructSync(ydoc, provider, commitFileList, initCommitFileList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ydoc]);

  useEffect(() => {
    initCommentStructSync(ydoc, provider, commentsList, initCommentsList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ydoc, commentsList]);

  useEffect(() => {
    if (!commitFileList || commitFileList.length === 0) return;
    commitFileList.forEach((file) => {
      const ytext = ydoc.getText(`${file.filename}`);
      if (ytext.length === 0) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, file.afterContent);
      }
    });
  }, [commitFileList, ydoc]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedCommitFile]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={70}
        className="flex items-center justify-center"
      >
        <div
          ref={elementRef}
          className="flex h-full w-full flex-col items-center justify-center"
        >
          {selectedCommitFile.filename !== "" && (
            <div className="relative w-full flex-1">
              <div className="flex items-center justify-between">
                <div className="flex w-full overflow-x-scroll border-b">
                  {clickedFileList.map((file, index) => (
                    <PrFileNameViewer key={index} fileName={file.filename} />
                  ))}
                </div>
              </div>
              <PrFilePathViewer filePaths={selectedTotalFilePath} />
              <div className="absolute right-0 top-9 z-[100] bg-white p-0">
                <SyncButton />
                {(selectedCommitFile.status === "added" ||
                  selectedCommitFile.status === "modified" ||
                  selectedCommitFile.status === "removed") && (
                  <Button
                    onClick={convertToImage}
                    className="fifth-step rounded-none border-b-2 border-blue-700 text-sm text-slate-800"
                    size="sm"
                    variant="ghost"
                  >
                    코드 이미지로 추출
                  </Button>
                )}
              </div>
            </div>
          )}
          {selectedCommitFile && (
            <SelectedFileViewer
              status={selectedCommitFile.status}
              selectedCommitFile={selectedCommitFile}
              commitFileList={commitFileList}
              onEditorMount={onEditorMount}
              onSplitEditorMount={onDiffEditorMount}
            />
          )}
        </div>
      </ResizablePanel>
      {bottomSection !== "" && (
        <>
          <ResizableHandle />
          <ResizablePanel defaultSize={30} className="min-h-[4rem]">
            <PRBottomFileExplorer />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default MainTopFrom;
