const { combineGetters } = require("@yeldirium/redux-combine-getters");
const { combineReducers, createStore } = require("redux");

const chat = (state = { active: false, messages: [] }, action) => {
  switch (action.type) {
    case "ACTIVATE_CHAT":
      return {
        ...state,
        active: true
      };
    case "DEACTIVATE_CHAT":
      return {
        ...state,
        active: false
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message]
      };
    default:
      return state;
  }
};

/*
 * In this store we use the object's keys as identifiers. Each of the properties
 * of this store represents a chat and this reducer only passes actions through
 * to the sub reducers.
 */
const chats = (state = {}, action) => {
  return {
    ...state,
    [action.chatId]: chat(state[action.chatId], action)
  };
};

/*
 * Let's define some getters for a chat.
 * Note that since these will be nested below wildcards their state may be
 * undefined if they are called with a key that doesn't exist in the store.
 */
const isChatActive = chat => chat !== undefined && chat.active;
const getChatMessages = chat => (chat === undefined ? [] : chat.messages);
const getMessageCount = chat => (chat === undefined ? 0 : chat.messages.length);

/*
 * We can use wildcards to represent levels in the getter hierarchy where any
 * key name is possible.
 */
const getters = combineGetters({
  "*": {
    isChatActive,
    getChatMessages,
    getMessageCount
  }
});

/*
 * As the last preparation, let's build the actual redux store.
 */
const store = createStore(rootReducer);

/*
 * Getters that are nested below wildcards take a parameter per wildcard in
 * their path. That parameter routes them to the correct sub-store.
 */
store.dispatch({ type: "ACTIVATE_CHAT", chatId: "someChat" });

getters.isChatActive("someChat", store); // => true
getters.getMessageCount("someNonExistantChat", store); // => 0
getters.getChatMessages(store); // => Exception, missing parameter representing the chatId.
