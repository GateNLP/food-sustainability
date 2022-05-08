export const getIndexOverview = () => {
    return{
        type : "GET_INDEX_OVERVIEW",
        payload : {

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