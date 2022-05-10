export const getIndexOverview = (query) => {
    return{
        type : "GET_INDEX_OVERVIEW",
        payload : {
            overview: null,
            query: query || ""
        }
    };
};

export const setIndexOverview = (overview) => {
    return{
        type : "SET_INDEX_OVERVIEW",
        payload : {
            overview : overview,
        }
    };
}