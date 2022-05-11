export const getIndexOverview = (query, analyse) => {
    return{
        type : "GET_INDEX_OVERVIEW",
        payload : {
            overview: null,
            query: query || "",
            analyse: analyse || "portion"
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