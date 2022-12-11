import {
  IRestBody,
  ERestBodyTypes,
  IHeader,
  EKeyValueTableRowType,
} from '@firecamp/types';
import { _array } from '@firecamp/utils';
import { nanoid } from 'nanoid';

interface IBodySlice {
  changeBodyValue: (value: any) => void;
  changeBodyType: (bodyType: ERestBodyTypes) => void;
  updateHeadersOnBodyTypeChange: (type: ERestBodyTypes) => void;
}
const createBodySlice = (set, get, initialBody: IRestBody): IBodySlice => {
  return {
    // change the value of active body, example, write the json or multipart table
    changeBodyValue: (value: any) => {
      const state = get();
      const {
        body: { type },
      } = state.request;
      const reqBody = { type, value };
      set((s) => {
        return {
          request: {
            ...s.request,
            body: reqBody,
          },
          runtime: {
            ...s.runtime,
            bodies: {
              ...s.runtime.bodies,
              [type]: value,
            },
          },
        };
      });
      state.equalityChecker({ body: reqBody });
    },
    changeBodyType: (type: ERestBodyTypes) => {
      set((s) => {
        const runtimeBodies = s.runtime.bodies;
        const reqBody = { value: runtimeBodies[type], type };
        s.updateHeadersOnBodyTypeChange(type);
        return {
          request: {
            ...s.request,
            body: reqBody,
          },
        };
      });
    },
    updateHeadersOnBodyTypeChange: (type: ERestBodyTypes) => {
      const state = get();
      const { headers } = state.request;
      let contentType = new String(type);
      let updatedHeaders: IHeader[] = [...headers];

      switch (type) {
        case ERestBodyTypes.GraphQL:
          contentType = ERestBodyTypes.Json;
          break;
        case ERestBodyTypes.Text:
        case ERestBodyTypes.Binary:
          contentType = `text/plain`;
          break;
        default:
          contentType = type;
          break;
      }

      // TODO: check without method for array object
      const headersWithoutContentType: IHeader[] = _array.without(
        headers,
        (h: IHeader) => h.key?.trim().toLowerCase() !== 'content-type'
      ) as unknown as IHeader[];

      if (type?.length) {
        const bodyHeader: IHeader = {
          id: nanoid(),
          key: 'Content-Type',
          value: contentType,
          type: EKeyValueTableRowType.Text,
          disable: false,
          description: '',
        };
        updatedHeaders = [...headersWithoutContentType, bodyHeader];
      } else if (contentType) {
        updatedHeaders = [...headersWithoutContentType];
      }
      state.changeHeaders(updatedHeaders);
    },
  };
};

export { createBodySlice, IBodySlice };
