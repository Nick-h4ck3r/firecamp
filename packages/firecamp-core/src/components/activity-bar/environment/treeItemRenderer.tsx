import cx from 'classnames';
// import { VscChevronRight } from '@react-icons/all-files/vsc/VscChevronRight';
// import { VscChevronDown } from '@react-icons/all-files/vsc/VscChevronDown';
// import { VscFolderOpened } from '@react-icons/all-files/vsc/VscFolderOpened';
import { VscTriangleRight } from '@react-icons/all-files/vsc/VscTriangleRight';
import { VscTriangleDown } from '@react-icons/all-files/vsc/VscTriangleDown';
import { VscLock } from '@react-icons/all-files/vsc/VscLock';
import { AiTwotoneFolder } from '@react-icons/all-files/ai/AiTwotoneFolder';
import { AiTwotoneFolderOpen } from '@react-icons/all-files/ai/AiTwotoneFolderOpen';
import { VscJson } from '@react-icons/all-files/vsc/VscJson';
import { Button } from '@firecamp/ui-kit';
import { VscTrash } from '@react-icons/all-files/vsc/VscTrash';

export default {
  renderItemArrow: ({ item, context }) => {
    // console.log( item.data._meta, "arrow context");
    if (item.data._meta?.is_collection || item.data._meta?.is_workspace) {
      return context.isExpanded ? (
        <>
          <VscTriangleDown
            className="mr-1 flex-none"
            size={12}
            opacity={'0.6'}
          />
          <AiTwotoneFolderOpen
            className="mr-1 flex-none"
            size={16}
            opacity={'0.6'}
          />
        </>
      ) : (
        <>
          <VscTriangleRight
            className="mr-1 flex-none"
            size={12}
            opacity={'0.6'}
          />
          <AiTwotoneFolder
            className="mr-1 flex-none"
            size={16}
            opacity={'0.6'}
          />
        </>
      );
    } else if (item.data._meta?.is_environment) {
      return (
        <>
          {item.data.meta.visibility == 2 ? (
            <VscLock className="mr-0.5 flex-none" size={18} opacity={1} />
          ) : (
            <></>
          )}
          <VscJson className="mr-0.5 flex-none" size={18} opacity={1} />
        </>
      );
    } else {
      return <></>;
    }
  },

  renderItemTitle: ({ item, title, context, info }) => {
    // console.log(title, "title...")
    if (!info.isSearching || !context.isSearchMatching) {
      return (
        <>
          {title} - {item.children?.length}
        </>
      );
    } else {
      const startIndex = title
        .toLowerCase()
        .indexOf(info.search!.toLowerCase());
      return (
        <>
          {startIndex > 0 && <span>{title.slice(0, startIndex)}</span>}
          <span className="rct-tree-item-search-highlight">
            {title.slice(startIndex, startIndex + info.search!.length)}
          </span>
          {startIndex + info.search!.length < title.length && (
            <span>
              {title.slice(startIndex + info.search!.length, title.length)}
            </span>
          )}
        </>
      );
    }
  },

  renderItem: ({
    item,
    depth,
    children,
    title,
    context,
    arrow,
    info,
    openEnv,
    openCreateEnv,
    deleteEnv,
  }) => {
    const renderDepthOffset = 8;
    const InteractiveComponent = context.isRenaming ? 'div' : 'button';
    const type = context.isRenaming ? undefined : 'button';
    // TODO have only root li component create all the classes
    return (
      <li
        {...(context.itemContainerWithChildrenProps as any)}
        className={cx(
          'relative',
          'rct-tree-item-li',
          item.hasChildren && 'rct-tree-item-li-hasChildren',
          context.isSelected && 'rct-tree-item-li-selected',
          context.isExpanded && 'rct-tree-item-li-expanded',
          context.isFocused && 'rct-tree-item-li-focused',
          context.isDraggingOver && 'rct-tree-item-li-dragging-over',
          context.isSearchMatching && 'rct-tree-item-li-search-match'
        )}
      >
        <div
          {...(context.itemContainerWithoutChildrenProps as any)}
          style={{
            paddingLeft: `${
              (depth + 1) * renderDepthOffset + depth * renderDepthOffset
            }px`,
          }}
          className={cx(
            'pr-2',
            'rct-tree-item-title-container',
            item.hasChildren && 'rct-tree-item-title-container-hasChildren',
            context.isSelected && 'rct-tree-item-title-container-selected',
            context.isExpanded && 'rct-tree-item-title-container-expanded',
            context.isFocused && 'rct-tree-item-title-container-focused',
            context.isDraggingOver &&
              'rct-tree-item-title-container-dragging-over',
            context.isSearchMatching &&
              'rct-tree-item-title-container-search-match'
          )}
        >
          {context.isExpanded && item.hasChildren && (
            <span
              className="rct-tree-line absolute top-5 bottom-0 border-r border-appForegroundInActive z-10 opacity-50"
              style={{ paddingLeft: `${renderDepthOffset - 3}px` }}
            ></span>
          )}
          <span
            className={cx(
              'rct-tree-line horizontal absolute top-3 h-px bg-appForegroundInActive z-10 w-2 opacity-50',
              { '!top-4': item.data._meta.is_request }
            )}
            style={{ left: `${renderDepthOffset * 2 - 3}px` }}
          ></span>
          {arrow}
          <InteractiveComponent
            type={type}
            {...(context.interactiveElementProps as any)}
            className={cx(
              'pl-1 whitespace-pre overflow-hidden overflow-ellipsis rct-tree-item-button',
              item.hasChildren && 'rct-tree-item-button-hasChildren',
              context.isSelected && 'rct-tree-item-button-selected',
              context.isExpanded && 'rct-tree-item-button-expanded',
              context.isFocused && 'rct-tree-item-button-focused',
              context.isDraggingOver && 'rct-tree-item-button-dragging-over',
              context.isSearchMatching && 'rct-tree-item-button-search-match'
            )}
          >
            <span className="w-full overflow-hidden overflow-ellipsis items-center block">
              {title}

              {item.data._meta?.is_collection ||
              item.data._meta?.is_workspace ? (
                <span className={'text-sm'}>- {item.children?.length}</span>
              ) : (
                <></>
              )}
            </span>
          </InteractiveComponent>
          <div className="flex ml-auto rct-tree-item-li-action items-center">
            {/* <VscJson size={14} className="ml-1" onClick={(e)=> {
                e.preventDefault()
                e.stopPropagation()
                openEnv(item.index);
                console.log(1234)
              }}/> */}

            <Button
              text={
                item.data._meta?.is_collection || item.data._meta?.is_workspace
                  ? 'Add Env'
                  : 'Open'
              }
              sm
              className="hover:!bg-focus2 ml-1 !text-appForegroundInActive !py-0"
              ghost
              transparent
              secondary
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.data._meta?.is_collection || item.data._meta?.is_workspace
                  ? openCreateEnv(item.index)
                  : openEnv(
                      item.data._meta.collection_id ||
                        item.data._meta?.workspace_id,
                      item.data._meta.id
                    );
              }}
            />

            {item.data._meta.is_environment ? (
              <VscTrash
                className="ml-1 cursor-pointer"
                size={14}
                onClick={() => {
                  deleteEnv(item.index);
                }}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
        {children}
      </li>
    );
  },
};
