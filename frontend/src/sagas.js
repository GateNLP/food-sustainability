import { all, fork, takeLatest, call, put } from 'redux-saga/effects';

import { setIndexOverview, setFailure } from "./actions";

import API from "./api";


const api = API()

function* watchInputURL() {
    yield takeLatest(["GET_INDEX_OVERVIEW"], handleGetIndexOverview)
}

function* handleGetIndexOverview(action) {
    try {
        let overview = yield call(api.getOverview, action.payload.query, action.payload.analyse);

        yield put(setIndexOverview(overview));
    }
    catch (error) {
        console.log(error);
        yield put(setFailure(true));
    }

}

export default function* rootSaga() {
    yield all([
        fork(watchInputURL),
    ]);
}