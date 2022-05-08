import { all, fork, takeLatest, select, call, put } from 'redux-saga/effects';

import { setIndexOverview }  from "./actions";

import API from "./api";


const api = API()

function* watchInputURL() {
    yield takeLatest(["GET_INDEX_OVERVIEW"], handleGetIndexOverview)
}


function* handleGetIndexOverview(action) {
    let overview = yield call(api.getOverview);

    yield put(setIndexOverview(overview));

}

/*
function* handleInputURL(action) {

    const url = yield select(state => state.url)

    let response = yield call(cloudAPI.process, url)
    
    if (response.error) {
        yield put(setError(response.error))
        return;
    }

    if (!response?.result?.Result || response.result.Result.length < 1) {
        yield put(setError("No valid results were returned for the provided URL. Are you sure the page contains a recipe?"))
        return;
    }

    yield put(setResponse(response.result.Result[0]))
}
*/
export default function* rootSaga() {
    yield all([
        fork(watchInputURL),
    ]);
}