import { nanoid } from 'nanoid';
import _cleanDeep from 'clean-deep';
import _cloneDeep from 'lodash/cloneDeep';
import {
  TId,
  IWebSocket,
  ERequestTypes,
  IWebSocketConnection,
  TRequestPath,
} from '@firecamp/types';
import { _object, _array, _string } from '@firecamp/utils';
import _url from '@firecamp/url';

import {
  initialPlaygroundMessage,
  IStoreState,
  IUiConnectionPanel,
} from '../store';
import { DefaultConnectionState, DefaultConfigState } from '../constants';
import { EConnectionState, ERequestPanelTabs } from '../types';

const getPathFromUrl = (url: string) => {
  return url.split(/[?#]/)[0];
};

/**
 * prepare the connection panel ui state from the existing request/connection information
 * and return the state.
 */
export const prepareConnectionPanelUiState = (request: Partial<IWebSocket>): IUiConnectionPanel => {
  const cPanelUi = {
    headers: 0,
    params: 0,
  };
  const { url, connection } = request;
  if (connection?.headers) cPanelUi.headers = connection.headers?.length || 0;
  if (url) cPanelUi.params = request.url.queryParms?.length || 0;
  return cPanelUi;
};

/** normalize the websocket request */
export const normalizeRequest = (request: Partial<IWebSocket>): IWebSocket => {
  const _nr: IWebSocket = {
    //ws url will only have { raw: ""} but in ui we need actual url object IUrl
    //@ts-ignore
    url: { raw: '', queryParams: [], pathParams: [] },
    __meta: {
      name: '',
      type: ERequestTypes.WebSocket,
      version: '2.0.0',
    },
    __ref: { id: '', collectionId: '' },
  };

  const {
    url,
    connection = _cloneDeep(DefaultConnectionState),
    config = {},
    __meta = _nr.__meta,
    __ref = _nr.__ref,
  } = request;

  //normalize url
  if (url?.raw) {
    _nr.url.raw = getPathFromUrl(url.raw);
  }

  // normalize __meta
  _nr.__meta.name = __meta.name || 'Untitled Request';
  _nr.__meta.description = __meta.description || '';
  _nr.__meta.fOrders = __meta.fOrders || [];
  _nr.__meta.iOrders = __meta.iOrders || [];
  _nr.__meta.type = ERequestTypes.WebSocket;
  _nr.__meta.version = '2.0.0'; /* ERestRequestVersion.V1; */ // TODO: check version

  // normalize __ref
  _nr.__ref.id = __ref.id || nanoid();
  _nr.__ref.collectionId = __ref.collectionId;
  _nr.__ref.folderId = __ref.folderId;
  _nr.__ref.createdAt = __ref.createdAt || new Date().valueOf();
  _nr.__ref.updatedAt = __ref.updatedAt || new Date().valueOf();
  _nr.__ref.createdBy = __ref.createdBy || '';
  _nr.__ref.updatedBy = __ref.updatedBy || '';

  // normalize connection
  _nr.connection = _object.mergeDeep(
    _cloneDeep(DefaultConnectionState),
    connection
  ) as IWebSocketConnection;

  // normalize config
  _nr.config = _object.mergeDeep(_cloneDeep(DefaultConfigState), config || {});
  return _nr;
};

export const initialiseStoreFromRequest = (
  _request: Partial<IWebSocket>,
  __meta?: {
    tabId?: TId;
    requestPath?: TRequestPath;
  }
): IStoreState => {
  const request: IWebSocket = normalizeRequest(_request);
  const defaultConnection =
    request.connection || _cloneDeep(DefaultConnectionState);
  const playgroundId = defaultConnection.id;
  const url = _url.updateByQuery(request.url, defaultConnection.queryParams);
  const newRequest = { ...request, url };
  const cPanelUi = prepareConnectionPanelUiState(_request);

  return {
    request: newRequest,
    playground: {
      id: playgroundId,
      connectionState: EConnectionState.Ideal,
      logFilters: {
        type: '',
      },
      message: initialPlaygroundMessage,
      selectedMessageId: '',
    },
    runtime: {
      isRequestSaved: !!request.__ref.collectionId,
      tabId: __meta?.tabId,
      requestPath: __meta?.requestPath,
    },
    ui: {
      // ...state.ui,
      connectionPanel: {
        activeTab: ERequestPanelTabs.Playgrounds, //uiActiveTab,
        ...cPanelUi,
      },
      isFetchingRequest: false,
    },
    logs: [],
  };
};
