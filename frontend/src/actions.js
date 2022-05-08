export const setInputURL = (url) => {
    return {
        type: "SET_INPUT_URL",
        payload: {
            url: url,
            loading: true
        }
    }
};

export const setError = (error) => {
    return {
        type: "SET_ERROR_MESSAGE",
        payload: {
            loading: false,
            error: error
        }
    }
};

export const setResponse = (response) => {
    return {
        type: "SET_RESPONSE",
        payload: {
            loading: false,
            response: response
        }
    }
};