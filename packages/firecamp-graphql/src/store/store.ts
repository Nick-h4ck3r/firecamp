import create from 'zustand';
import _cloneDeep from 'lodash/cloneDeep';
import createContext from 'zustand/context';
import { buildClientSchema, getIntrospectionQuery } from 'graphql';

import {
  createRequestSlice,
  createPlaygroundsSlice,
  createCollectionSlice,
  createRuntimeSlice,
  createPullActionSlice,
  createUiSlice,
  createRequestChangeStateSlice,
} from './slices';
import {
  ERequestTypes,
  ERestBodyTypes,
  IGraphQL,
  IRest,
  TId,
} from '@firecamp/types';
import { IRestResponse } from '@firecamp/types';
import { _object } from '@firecamp/utils';
import { initialiseStoreFromRequest } from '../services/request.service';
import { IStore, IStoreState } from './store.type';

const {
  Provider: StoreProvider,
  useStore: useStore,
  useStoreApi: useStoreApi,
} = createContext();

const createStore = (initialState: IStoreState) =>
  create<IStore>((set, get): IStore => {
    return {
      ...createRequestSlice(
        set,
        get,
        initialState.request //_object.pick(initialState.request, requestSliceKeys)
      ),
      ...createPlaygroundsSlice(set, get),
      ...createRuntimeSlice(set, get, initialState.runtime),
      ...createCollectionSlice(set, get),
      ...createPullActionSlice(set, get),
      ...createUiSlice(set, get, initialState.ui),
      ...createRequestChangeStateSlice(set, get),

      initialise: (_request: Partial<IGraphQL>, tabId: TId) => {
        // const state = get();
        const initState = initialiseStoreFromRequest(_request, tabId);
        const { request } = initState;
        // console.log(initState, 'initState');
        set((s) => ({
          ...s,
          ...initState,
          // @ts-ignore
          originalRequest: _cloneDeep(request) as IGraphQL,
        }));
      },
      setContext: (ctx: any) => set({ context: ctx }),
      execute: async (opsName: string, query?: string, variables?: string) => {
        const state = get();
        const {
          request,
          runtime: { activePlayground },
        } = state;
        if (!request.url?.raw) return;

        //@ts-ignore
        const _request: IRest = Object.assign(
          {},
          {
            ...request,
            body: {
              value: { query, variables },
              type: ERestBodyTypes.GraphQL,
            },
            __meta: {
              ...request.__meta,
              type: ERequestTypes.Rest,
            },
          }
        );
        // const certificates = [],
        // proxies = [];

        // console.log(_request, 'request...');
        // let response: IRestResponse = { statusCode: 0 };
        state.setRequestRunningFlag(activePlayground, true);
        return state.context.request
          .execute(_request)
          .then((r: IRestResponse) => {
            state.setPlaygroundResponse(r);
            return r;
          })
          .catch((e: IRestResponse) => {
            // executor will never throw an error
          })
          .finally(() => {
            state.setRequestRunningFlag(activePlayground, false);
          });
      },

      fetchIntrospectionSchema: async () => {
        const state = get();
        const {
          request,
          runtime: { isFetchingIntrospection },
        } = state;
        if (isFetchingIntrospection) return;

        const query = getIntrospectionQuery();
        const _request = Object.assign(
          {},
          {
            ...request,
            __meta: request.__meta,
            body: {
              value: { query },
              type: ERestBodyTypes.GraphQL,
            },
          }
        );
        // const certificates = [],
        // proxies = [];

        state.setFetchIntrospectionFlag(true);
        state.context.request
          .execute(_request)
          .then((r: { data: string }) => {
            try {
              const schema = JSON.parse(r.data).data;
              state.setSchema(schema);
            } catch (e) {}
          })
          .catch((e: any) => {
            console.log(e, 'e...');
          })
          .finally(() => {
            state.setFetchIntrospectionFlag(false);
          });
      },
    };
  });

export { StoreProvider, createStore, useStore, useStoreApi };
