// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import {
    all, put, takeLatest, delay,
} from 'redux-saga/effects';
import { AuthSagaActionTypes } from '../actions/auth-saga-actions';
import getCore from '../cvat-core-wrapper';

import isReachable from '../utils/url-checker';
import { ActionUnion, createAction } from '../utils/redux';

const cvat = getCore();

export const authSagaActions = {
    authorizeSuccess: (user: any) => createAction(AuthSagaActionTypes.AUTHORIZED_SUCCESS, { user }),
    authorizeFailed: (error: any) => createAction(AuthSagaActionTypes.AUTHORIZED_FAILED, { error }),
    login: () => createAction(AuthSagaActionTypes.LOGIN),
    loginSuccess: (user: any) => createAction(AuthSagaActionTypes.LOGIN_SUCCESS, { user }),
    loginFailed: (error: any) => createAction(AuthSagaActionTypes.LOGIN_FAILED, { error }),
    register: () => createAction(AuthSagaActionTypes.REGISTER),
    registerSuccess: (user: any) => createAction(AuthSagaActionTypes.REGISTER_SUCCESS, { user }),
    registerFailed: (error: any) => createAction(AuthSagaActionTypes.REGISTER_FAILED, { error }),
    logout: () => createAction(AuthSagaActionTypes.LOGOUT),
    logoutSuccess: () => createAction(AuthSagaActionTypes.LOGOUT_SUCCESS),
    logoutFailed: (error: any) => createAction(AuthSagaActionTypes.LOGOUT_FAILED, { error }),
    changePassword: () => createAction(AuthSagaActionTypes.CHANGE_PASSWORD),
    changePasswordSuccess: () => createAction(AuthSagaActionTypes.CHANGE_PASSWORD_SUCCESS),
    changePasswordFailed: (error: any) => createAction(AuthSagaActionTypes.CHANGE_PASSWORD_FAILED, { error }),
    switchChangePasswordDialog: (showChangePasswordDialog: boolean) =>
        createAction(AuthSagaActionTypes.SWITCH_CHANGE_PASSWORD_DIALOG, { showChangePasswordDialog }),
    requestPasswordReset: () => createAction(AuthSagaActionTypes.REQUEST_PASSWORD_RESET),
    requestPasswordResetSuccess: () => createAction(AuthSagaActionTypes.REQUEST_PASSWORD_RESET_SUCCESS),
    requestPasswordResetFailed: (error: any) =>
        createAction(AuthSagaActionTypes.REQUEST_PASSWORD_RESET_FAILED, { error }),
    resetPassword: () => createAction(AuthSagaActionTypes.RESET_PASSWORD),
    resetPasswordSuccess: () => createAction(AuthSagaActionTypes.RESET_PASSWORD_SUCCESS),
    resetPasswordFailed: (error: any) => createAction(AuthSagaActionTypes.RESET_PASSWORD_FAILED, { error }),
    loadServerAuthActions: () => createAction(AuthSagaActionTypes.LOAD_AUTH_ACTIONS),
    loadServerAuthActionsSuccess: (allowChangePassword: boolean, allowResetPassword: boolean) =>
        createAction(AuthSagaActionTypes.LOAD_AUTH_ACTIONS_SUCCESS, {
            allowChangePassword,
            allowResetPassword,
        }),
    loadServerAuthActionsFailed: (error: any) => createAction(AuthSagaActionTypes.LOAD_AUTH_ACTIONS_FAILED, { error }),
};

export type AuthSagaActions = ActionUnion<typeof authSagaActions>;

function* login(action: any): any {
    try {
        yield cvat.server.login(action.payload.username, action.payload.password);
        yield delay(1000);
        const users = yield cvat.users.get({ self: true });
        yield put(authSagaActions.loginSuccess(users[0]));
    } catch (error) {
        yield put(authSagaActions.loginFailed(error));
    }
}

function* logout(): any {
    try {
        yield cvat.server.logout();
        yield put(authSagaActions.logoutSuccess());
    } catch (error) {
        yield put(authSagaActions.logoutFailed(error));
    }
}

function* changePasswordAsync(action: any): any {
    try {
        yield cvat.server.changePassword(
            action.payload.oldPassword,
            action.payload.newPassword1,
            action.payload.newPassword2,
        );
        yield put(authSagaActions.changePasswordSuccess());
    } catch (error) {
        yield put(authSagaActions.changePasswordFailed(error));
    }
}

function* requestPasswordResetAsync(action: any) {
    try {
        yield cvat.server.requestPasswordReset(action.payload.email);
        yield put(authSagaActions.requestPasswordResetSuccess());
    } catch (error) {
        yield put(authSagaActions.requestPasswordResetFailed(error));
    }
}

function* resetPasswordAsync(action: any) {
    try {
        yield cvat.server.resetPassword(
            action.payload.newPassword1,
            action.payload.newPassword2,
            action.payload.uid,
            action.payload.token,
        );
        yield put(authSagaActions.resetPasswordSuccess());
    } catch (error) {
        yield put(authSagaActions.resetPasswordFailed(error));
    }
}

function* authorizedAsync(): any {
    try {
        yield cvat.server.authorized();
        // const result =
        //  if (result) {
        //      const userInstance = (yield cvat.users.get({ self: true }))[0];
        //      yield put(authSagaActions.authorizeSuccess(userInstance));
        //  } else {
        //      yield put(authSagaActions.authorizeSuccess(null));
        //  }
    } catch (error) {
        yield put(authSagaActions.authorizeFailed(error));
    }
}

function* loadAuthActionsAsync(): any {
    // dispatch(authSagaActions.loadServerAuthActions());
    try {
        const promises: Promise<boolean>[] = [
            isReachable(`${cvat.config.backendAPI}/auth/password/change`, 'OPTIONS'),
            isReachable(`${cvat.config.backendAPI}/auth/password/reset`, 'OPTIONS'),
        ];
        const [allowChangePassword, allowResetPassword] = yield Promise.all(promises);

        yield put(authSagaActions.loadServerAuthActionsSuccess(allowChangePassword, allowResetPassword));
    } catch (error) {
        yield put(authSagaActions.loadServerAuthActionsFailed(error));
    }
}

function* registerAsync(action: any): any {
    // dispatch(authSagaActions.register());

    try {
        const user = yield cvat.server.register(
            action.payload.email,
            action.payload.firstName,
            action.payload.lastName,
            action.payload.email,
            action.payload.password1,
            action.payload.password2,
            action.payload.confirmations,
        );

        yield put(authSagaActions.registerSuccess(user));
    } catch (error) {
        yield put(authSagaActions.registerFailed(error));
    }
}

export function* authWatcher() {
    yield all([
        takeLatest(AuthSagaActionTypes.LOGOUT, logout),
        takeLatest(AuthSagaActionTypes.LOGIN, login),
        takeLatest(AuthSagaActionTypes.CHANGE_PASSWORD, changePasswordAsync),
        takeLatest(AuthSagaActionTypes.REQUEST_PASSWORD_RESET, requestPasswordResetAsync),
        takeLatest(AuthSagaActionTypes.RESET_PASSWORD, resetPasswordAsync),
        takeLatest(AuthSagaActionTypes.LOAD_AUTH_ACTIONS, loadAuthActionsAsync),
        takeLatest(AuthSagaActionTypes.AUTHORIZED_SUCCESS, authorizedAsync),
        takeLatest(AuthSagaActionTypes.REGISTER, registerAsync),
    ]);
}
