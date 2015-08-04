import {
  CONNECT,
  SEND_TEXT,
  ON_STREAM_LOCAL,
  ON_STREAM_REMOTE,
  ON_OPEN_CHAT_CHANNEL,
  ON_DATA_CHAT_CHANNEL,
  ON_CLOSE_CHAT_CHANNEL,
} from '../constants/ActionTypes';
import formatPeerName from '../utils/formatPeerName';

const initialState = {
  roomKey: '',
  userName: '',
  isConnecting: false,
  local: null,
  remotes: Object.create(null),
  messages: [],
  chatChannel: null,
};

function createMessageId(messages) {
  if (messages.length === 0) {
    return 1;
  }
  const last = messages[messages.length - 1];
  return last.id + 1;
}

export default function chat(state = initialState, action) {
  switch (action.type) {
  case CONNECT:
    {
      const { roomKey, userName } = action;
      return {
        ...state,
        roomKey,
        userName,
        isConnecting: true,
      };
    }

  case SEND_TEXT:
    {
      const { text } = action;
      const { local, messages } = state;
      return {
        ...state,
        messages: [
          ...messages,
          {
            type: 'local',
            id: createMessageId(messages),
            peer: local.peer,
            text,
          },
        ],
      };
    }

  case ON_STREAM_LOCAL:
    {
      const { peer, streamUrl } = action;
      return {
        ...state,
        local: {
          peer,
          streamUrl,
        },
      };
    }

  case ON_STREAM_REMOTE:
    {
      const { peer, peer: { id }, streamUrl } = action;
      if (state.remotes[id]) {
        return state;
      }
      return {
        ...state,
        remotes: {
          ...state.remotes,
          [id]: {
            peer,
            streamUrl,
            isOpen: false,
          },
        },
      };
    }

  case ON_OPEN_CHAT_CHANNEL:
    {
      const { peer, peer: { id }, channel } = action;
      const { remotes, messages } = state;
      if (!remotes[id]) {
        return state;
      }
      return {
        ...state,
        remotes: {
          ...remotes,
          [id]: {
            ...remotes[id],
            isOpen: true,
          },
        },
        channel,
        messages: [
          ...messages,
          {
            type: 'system',
            id: createMessageId(messages),
            peer: peer,
            text: `${formatPeerName(peer)} is here.`,
          },
        ],
      };
    }

  case ON_DATA_CHAT_CHANNEL:
    {
      const { peer, peer: { id }, data } = action;
      const { remotes, messages } = state;
      if (!remotes[id]) {
        return state;
      }
      return {
        ...state,
        remotes: {
          ...remotes,
          [id]: {
            ...remotes[id],
          },
        },
        messages: [
          ...messages,
          {
            type: 'remote',
            id: createMessageId(messages),
            peer,
            text: data,
          },
        ],
      };
    }

  case ON_CLOSE_CHAT_CHANNEL:
    {
      const { peer, peer: { id } } = action;
      const { remotes, messages } = state;
      if (!remotes[id]) {
        return state;
      }
      return {
        ...state,
        remotes: Object.keys(remotes).reduce((acc, k) => {
          if (k !== String(id)) {
            acc[k] = remotes[k];
          }
          return acc;
        }, {}),
        messages: [
          ...messages,
          {
            type: 'system',
            id: createMessageId(messages),
            peer: peer,
            text: `${formatPeerName(peer)} is away.`,
          },
        ],
      };
    }

  default:
    return state;
  }
}
