const defaultState = {
    overview: null,
    query: null,
    analyse: "recipe",
    failed: false
};

const reducer = (state = defaultState, action) => {
    switch (action.type) {

        case 'GET_INDEX_OVERVIEW':
            state = {
                overview: null,
                failed: false
            };
        case 'SET_INDEX_OVERVIEW':
        case 'SET_FAILURE':
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};

export default reducer;