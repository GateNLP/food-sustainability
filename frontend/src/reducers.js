const defaultState = {
    overview: null,
    query: null,
    analyse: "recipe"
};

const reducer = (state = defaultState, action) => {
    switch (action.type) {

        case 'GET_INDEX_OVERVIEW':
            state = {
                overview: null
            };
        case 'SET_INDEX_OVERVIEW':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};

export default reducer;