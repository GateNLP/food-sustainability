const defaultState = {
    url: undefined,
    loading : false,
    error: undefined
};

const reducer = (state = defaultState, action) => {
    switch (action.type) {
        case 'SET_INPUT_URL':
            state = defaultState;
        case 'SET_ERROR_MESSAGE':
        case 'SET_RESPONSE':
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default reducer;