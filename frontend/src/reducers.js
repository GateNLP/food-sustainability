const defaultState = {
    overview: null,
};

const reducer = (state = defaultState, action) => {
    switch (action.type) {

        case 'GET_INDEX_OVERVIEW':
            state = defaultState;
        case 'SET_INDEX_OVERVIEW':
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default reducer;