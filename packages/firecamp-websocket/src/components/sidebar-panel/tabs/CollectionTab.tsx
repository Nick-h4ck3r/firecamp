import { useEffect, useRef } from 'react';
import shallow from 'zustand/shallow';
import { VscNewFolder } from '@react-icons/all-files/vsc/VscNewFolder';
import { VscRefresh } from '@react-icons/all-files/vsc/VscRefresh';
import { Tree, UncontrolledTreeEnvironment } from '@firecamp/ui/src/tree';
import { Pane, ToolBar, Empty } from '@firecamp/ui';
import treeRenderer from './collection-tree/treeItemRenderer';
import { useStore, useStoreApi, IStore } from '../../../store';

const CollectionTab = () => {
  const { promptCreateFolder } = useStoreApi().getState() as IStore;
  return (
    <Pane
      expanded={true}
      bodyClassName={'!p-0'}
      headerTitleRenderer={() => {
        return <span>Message Collection</span>;
      }}
      headerActionRenderer={() => {
        return (
          <ToolBar>
            <div className="action">
              <VscRefresh size={14} className="cursor-pointer" />
            </div>
            <div>
              <VscNewFolder
                size={14}
                className="cursor-pointer"
                onClick={() => promptCreateFolder()}
              />
            </div>
          </ToolBar>
        );
      }}
      bodyRenderer={({ expanded }) => {
        return <Collection openCreateFolderPrompt={promptCreateFolder} />;
      }}
    />
  );
};
export default CollectionTab;

const Collection = ({ openCreateFolderPrompt }) => {
  const treeRef = useRef();
  const { context, tdpInstance } = useStore(
    (s: IStore) => ({
      context: s.context,
      tdpInstance: s.collection.tdpInstance,
      __manualUpdates: s.collection.__manualUpdates,
    }),
    shallow
  );
  const {
    openMessageInPlayground,
    registerTDP,
    unRegisterTDP,
    deleteItem,
    deleteFolder,
    isCollectionEmpty,
  } = useStoreApi().getState() as IStore;

  useEffect(() => {
    registerTDP();
    return unRegisterTDP;
  }, []);

  const _deleteFolder = (id: string) => {
    context.window
      .confirm({
        title: 'Are you sure to delete the Folder?',
        texts: {
          btnConfirm: 'Yes, delete it.',
        },
      })
      .then((yes) => {
        if (yes) deleteFolder(id);
      });
  };

  const deleteMsg = (msgId: string) => {
    context.window
      .confirm({
        title: 'Are you sure to delete the message?',
        texts: {
          btnConfirm: 'Yes, delete it.',
        },
      })
      .then((yes) => {
        if (yes) deleteItem(msgId);
      });
  };

  if (!tdpInstance) return <></>;
  return (
    <>
      {isCollectionEmpty() ? (
        <div className="items-center">
          <Empty
            title="No saved messages"
            message="This WebSocket request does not have any saved messages.."
          />
        </div>
      ) : (
        <></>
      )}

      {/* even if the collection is empty, the tree must be initialized with tdp.
        however it'll not show anything but when new item'll get added/created then tree will pop up the entry 
      */}
      <UncontrolledTreeEnvironment
        canRename={true}
        canReorderItems={true}
        canDragAndDrop={true}
        canDropOnFolder={true}
        keyboardBindings={{
          renameItem: ['enter', 'f2'],
          abortRenameItem: ['esc'],
        }}
        dataProvider={tdpInstance}
        onStartRenamingItem={(a) => {
          console.log(a, 'onStartRenamingItem');
        }}
        // onSelectItems={onSelectItems}
        getItemTitle={(item) => item.data?.name}
        viewState={{}}
        renderItemArrow={treeRenderer.renderItemArrow}
        renderItem={(props) =>
          treeRenderer.renderItem({
            ...props,
            openMessageInPlg: (msgId) => {
              props.context.focusItem();
              openMessageInPlayground(msgId);
            },
            createFolder: openCreateFolderPrompt,
            deleteFolder: _deleteFolder,
            deleteMsg,
          })
        }
      >
        <Tree
          treeId="fc-ws-message-collection-tree"
          rootItem="root"
          treeLabel="WebSocket Message Collection"
          ref={treeRef}
        />
      </UncontrolledTreeEnvironment>
    </>
  );
};
