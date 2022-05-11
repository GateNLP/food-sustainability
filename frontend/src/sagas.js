import { all, fork, takeLatest, select, call, put } from 'redux-saga/effects';

import { setIndexOverview } from "./actions";

import API from "./api";


const api = API()

function* watchInputURL() {
    yield takeLatest(["GET_INDEX_OVERVIEW"], handleGetIndexOverview)
}


function* handleGetIndexOverview(action) {
    let overview = yield call(api.getOverview, action.payload.query, action.payload.analyse);

    yield put(setIndexOverview(overview));

}

export default function* rootSaga() {
    yield all([
        fork(watchInputURL),
    ]);
}