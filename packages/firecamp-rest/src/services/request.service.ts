import _cleanDeep from 'clean-deep';
import _cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import isEqual from 'react-fast-compare';
import {
  TId,
  EAuthTypes,
  ERestBodyTypes,
  IRest,
  EHttpMethod,
  ERequestTypes,
  EKeyValueTableRowType,
  EFirecampAgent,
  IRestBody,
  IAuth,
  IOAuth2UiState,
  EScriptLanguages,
  EScriptTypes,
} from '@firecamp/types';
import {
  _object,
  _array,
  _string,
  _auth,
  _misc,
  _table,
} from '@firecamp/utils';
import { isValidRow } from '@firecamp/utils/dist/table';
import { IStoreState, IUiRequestPanel } from '../store';
import { ERequestPanelTabs } from '../types';
import { configState, RuntimeBodies } from '../constants';
import { IAuthHeader } from './auth/types';
import { Auth } from '.';

export const prepareUIRequestPanelState = (
  request: Partial<IRest>
): IUiRequestPanel => {
  let updatedUiStore: IUiRequestPanel = {};

  for (let key in request) {
    switch (key) {
      case 'auth':
        if (request.auth?.type != 'none') {
          updatedUiStore = {
            ...updatedUiStore,
            hasAuth: true,
          };
        }
        break;
      case 'body':
        if (request.body.type != 'none') {
          updatedUiStore = {
            ...updatedUiStore,
            hasBody: true,
          };
        }
        break;
      case 'headers':
        const headers = request?.headers.length;
        updatedUiStore = {
          ...updatedUiStore,
          // activeTab: ERequestPanelTabs.Headers,
          headers,
          hasHeaders: headers !== 0,
        };
        break;
      case 'url':
        if (request['url']?.queryParams || request['url']?.pathParams) {
          const queryParamsLength = request?.url?.queryParams?.length || 0;
          const pathParamsLength = request?.url?.pathParams?.length || 0;
          updatedUiStore = {
            ...updatedUiStore,
            // activeTab: ERequestPanelTabs.Params,
            params: queryParamsLength + pathParamsLength,
            hasParams: queryParamsLength !== 0 || pathParamsLength !== 0,
          };
        }
        break;
      case 'preScripts':
        let preScript = request?.preScripts[0]; //@note: currently considering the first script in the array as we'll only have one prerequest
        let hasPreScripts = preScript && !!preScript.value?.join('').length;
        updatedUiStore = {
          ...updatedUiStore,
          hasPreScripts,
        };
        break;
      case 'postScripts':
        let postScript = request?.postScripts[0]; //@note: currently considering the first script in the array as we'll only have one prerequest
        let hasPostScripts = postScript && !!postScript.value?.join('').length;
        updatedUiStore = {
          ...updatedUiStore,
          hasPostScripts,
        };
        break;
      case 'config':
        const hasConfig = !isEqual(request.config, _cloneDeep(configState));
        updatedUiStore = {
          ...updatedUiStore,
          // activeTab: ERequestPanelTabs.Config,
          hasConfig,
        };
        break;
      default:
      // do nothing
    }
  }
  return updatedUiStore;
};

export const isRestBodyEmpty = (body: IRestBody): boolean => {
  return !body?.value || !body?.type;
};

/**
 * normalize the request with all required fields/keys, It'll add missing keys of the request or remove any extra keys if exists.
 */
export const normalizeRequest = (request: Partial<IRest>): IRest => {
  // prepare normalized request aka _nr
  const _nr: IRest = {
    url: { raw: '', queryParams: [], pathParams: [] },
    method: EHttpMethod.GET,
    body: { value: '', type: ERestBodyTypes.None },
    auth: { value: '', type: EAuthTypes.None },
    preScripts: [
      {
        id: nanoid(),
        value: [''],
        type: EScriptTypes.PreRequest,
        language: EScriptLanguages.JavaScript,
      },
    ],
    postScripts: [
      {
        id: nanoid(),
        value: [''],
        type: EScriptTypes.Test,
        language: EScriptLanguages.JavaScript,
      },
    ],
    __meta: {
      name: '',
      description: '',
      type: ERequestTypes.Rest,
      version: '2.0.0',
    },
    __ref: { id: '', collectionId: '' },
  };

  const {
    url = _nr.url,
    method = _nr.method,
    body = _nr.body,
    auth = _nr.auth,
    headers,
    config,
    preScripts = _nr.preScripts,
    postScripts = _nr.postScripts,
    __meta = _nr.__meta,
    __ref = _nr.__ref,
  } = request;

  //normalize url
  _nr.url = {
    raw: url.raw || '',
    queryParams: url.queryParams || [],
    pathParams: url.pathParams || [],
  };
  if (!_array.isEmpty(_nr.url.queryParams)) {
    const queryParams = [];
    if (!url.queryParams?.length) url.queryParams = [];
    url.queryParams.map((qp) => {
      // add default key: `type: text`
      qp.id = nanoid();
      qp.type = EKeyValueTableRowType.Text;
      qp.value = qp.value || '';
      if (isValidRow(qp)) queryParams.push(qp);
    });
    _nr.url.queryParams = queryParams;
  }
  if (!_array.isEmpty(_nr.url.pathParams)) {
    const pathParams = [];
    if (!url.pathParams?.length) url.pathParams = [];
    url.pathParams.map((pp) => {
      // add default key: `type: text`
      pp.id = nanoid();
      pp.type = EKeyValueTableRowType.Text;
      pp.value = pp.value || '';
      if (isValidRow(pp)) pathParams.push(pp);
    });
    _nr.url.pathParams = pathParams;
  }

  //normalize method
  _nr.method = EHttpMethod[method.toUpperCase()] ? method : EHttpMethod.GET;

  // normalize headers
  _nr.headers = !headers || _array.isEmpty(headers) ? [] : headers;
  _nr.headers = _nr.headers.filter((h) => {
    // add default key: `type: text`
    h.id = nanoid();
    h.type = EKeyValueTableRowType.Text;
    h.value = h.value ? h.value : '';
    return isValidRow(h);
  });

  // normalize config
  _nr.config = _object.isEmpty(config)
    ? _cloneDeep(configState)
    : _object.mergeDeep(_cloneDeep(configState), config);
  Object.keys(_nr.config).map((key) => {
    // remove extra keys if exists config values
    if (!configState.hasOwnProperty(key)) {
      delete _nr.config[key];
      return;
    }
    if (typeof _nr.config[key] !== typeof configState[key]) {
      _nr.config[key] = configState[key];
    }
  });

  // normalize body
  if (!_object.isEmpty(body)) {
    _nr.body = { value: body.value, type: body.type };
  } else {
    _nr.body = { value: '', type: ERestBodyTypes.None };
  }

  // normalize auth
  if (!_object.isEmpty(auth)) {
    _nr.auth = { value: auth.value, type: auth.type };
  } else {
    //@ts-ignore
    _nr.auth = { value: '', type: EAuthTypes.None };
  }
  // _nr.auth = !_object.isEmpty(auth)
  //   ? (_auth.normalizeToUi(auth) as IUiAuth)
  //   : _cloneDeep(_auth.defaultAuthState);

  // normalize scripts
  if (preScripts?.length) {
    _nr.preScripts = [...preScripts];
    _nr.preScripts.map((s) => ({
      id: s.id,
      value: s.value || [''],
      type: s.type || EScriptTypes.PreRequest,
      language: s.language || EScriptLanguages.JavaScript,
    }));
  }
  if (postScripts?.length) {
    _nr.postScripts = [...postScripts];
    _nr.postScripts.map((s) => ({
      id: s.id,
      value: s.value || [''],
      type: s.type || EScriptTypes.Test,
      language: s.language || EScriptLanguages.JavaScript,
    }));
  }

  // normalize __meta
  _nr.__meta.name = __meta.name || 'Untitled Request';
  _nr.__meta.description = __meta.description || '';
  _nr.__meta.version = '2.0.0';
  _nr.__meta.type = ERequestTypes.Rest;

  // normalize __ref
  _nr.__ref.id = __ref.id || nanoid();
  _nr.__ref.collectionId = __ref.collectionId;
  _nr.__ref.folderId = __ref.folderId;
  _nr.__ref.createdAt = __ref.createdAt || new Date().valueOf();
  _nr.__ref.updatedAt = __ref.updatedAt || new Date().valueOf();
  _nr.__ref.createdBy = __ref.createdBy || '';
  _nr.__ref.updatedBy = __ref.updatedBy || '';

  return _nr;
};

export const initialiseStoreFromRequest = (
  _request: Partial<IRest>,
  tabId: TId
): IStoreState => {
  const request: IRest = normalizeRequest(_request);
  const requestPanel = prepareUIRequestPanelState(_cloneDeep(request));
  console.log({ request });

  return {
    originalRequest: _cloneDeep(request) as IRest,
    request,
    ui: {
      isFetchingRequest: false,
      isCodeSnippetOpen: false,
      requestPanel: {
        ...requestPanel,
        activeTab: ERequestPanelTabs.Body,
      },
    },
    runtime: {
      bodies: _cloneDeep(RuntimeBodies),
      auths: _cloneDeep(_auth.defaultAuthState),
      authHeaders: [],
      parentArtifacts: {
        collection: {
          auth: { type: EAuthTypes.None, value: '' },
          preScripts: [],
          postScripts: [],
        },
        folder: {
          auth: { type: EAuthTypes.None, value: '' },
          preScripts: [],
          postScripts: [],
        },
      },
      isRequestSaved: !!request.__ref.collectionId,
      oauth2LastFetchedToken: '',
      tabId,
    },
  };
};

/**
 * prepare normalize payload for send request.
 */
export const normalizeSendRequestPayload = async (
  request: IRest,
  originalRequest: IRest
) => {
  const _request: IRest = _object.pick(request, [
    'url',
    'method',
    'body',
    'config',
    'headers',
    '__meta',
    '__ref',
  ]) as IRest;

  try {
    // Send active body payload
    if (request.body?.type) {
      _request.body = {
        value: request.body?.value,
        type: request.body?.type,
      };

      //TODO: handle multipart formdata

      if (
        request.body.type === ERestBodyTypes.Binary &&
        originalRequest.body.value
      ) {
        // handle binary body payload
        let text: string | ArrayBuffer = await readFile(
          originalRequest.body.value
        )
          .then((r) => r)
          .catch((e) => {
            return '';
          });
        _request.body.value = text;
      }
    }

    // Send active auth payload
    if (request.auth?.type !== EAuthTypes.Inherit) {
      _request.auth = {
        value: request.auth.value,
        type: request.auth.type,
      };
    } else if (request.auth?.type === EAuthTypes.Inherit) {
      // const inheritedAuth = request.__meta.inheritedAuth;
      // if (inheritedAuth) {
      //   _request.auth = {
      //     value: inheritedAuth.value,
      //     type: inheritedAuth.auth,
      //   };
      // }
    }
    _request.__ref = { id: request.__ref.id, collectionId: '' };
    // console.log({ _request });

    //  merge headers and auth headers
    const authHeaders = await getAuthHeaders(request, request.auth?.type);
    const headersAry = _table.objectToTable(authHeaders) || [];
    // console.log({ headersAry, request });

    _request.headers = [...request.headers, ...headersAry];
  } catch (error) {
    console.log({ normalizeSendRequestPayload: error });
  }

  return Promise.resolve(_request);
};

/**
 *  Read binary file return file text
 */
export const readFile = (file): Promise<string | ArrayBuffer> => {
  return new Promise(async (rs, rj) => {
    let reader = new FileReader();
    reader.onload = () => {
      let text: string | ArrayBuffer = reader.result;
      rs(text);
    };
    reader.readAsText(file);
  });
};

export const getAuthHeaders = async (
  request: IRest,
  type?: EAuthTypes
): Promise<{ [key: string]: any } | IAuthHeader> => {
  if (!type || type == EAuthTypes.None) return Promise.resolve({});

  /*  if (type === EAuthTypes.Inherit) {
    // TODO: add logic to fetch inherit auth
    // set inherit auth to runtimeSlice.inherit
    // update auth headers by inherit auth
  } */

  const { url, method, body, headers, auth } = request;
  let requestAuth = Object.assign({}, auth);

  // @ts-ignore
  let inheritedAuth = request.__meta.inheritedAuth;
  if (type === EAuthTypes.Inherit && inheritedAuth) {
    let normalizedAuth = _auth.normalizeToUi(inheritedAuth.payload);
    requestAuth = {
      value: normalizedAuth[inheritedAuth.type],
      type: inheritedAuth.type,
    };
    type = inheritedAuth.type;
  }

  try {
    const agent =
      _misc.firecampAgent() === EFirecampAgent.Desktop
        ? EFirecampAgent.Desktop
        : EFirecampAgent.Extension;

    // console.log({ extraParams, requestAuth });

    let authvalue = requestAuth.value;
    // console.log({ authvalue });

    // manage OAuth2 payload // TODO: fix Auth2 later
    // if (auth?.type === EAuthTypes.OAuth2) {
    //   const OAuth2 = requestAuth.value as IOAuth2UiState;
    //   authvalue = OAuth2.grantTypes[OAuth2.activeGrantType];
    // }

    const authService = new Auth(type, authvalue, {
      url,
      method,
      body,
      agent,
      headers,
    });
    await authService.authorize();
    const authHeaders = await authService.getHeader();

    // if OAuth2 then set headers with prefix Bearer and set to token
    if (type === EAuthTypes.OAuth2 && authHeaders['Authorization']) {
      authHeaders['Authorization'] = `Bearer ${authHeaders['Authorization']}`;
      return Promise.resolve(authHeaders['Authorization']);
    }

    // prepare auth headers array
    return Promise.resolve(authHeaders);
  } catch (e) {
    console.error(e);
    return Promise.reject({});
  }
};
