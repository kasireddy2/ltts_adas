// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT
import { UserConfirmation } from '../components/register-page/register-form';

// ... addToDo ...
export enum AuthSagaActionTypes {
    AUTHORIZED_SUCCESS = 'AUTHORIZED_SUCCESS',
    AUTHORIZED_FAILED = 'AUTHORIZED_FAILED',
    LOGIN = 'LOGIN',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    REGISTER = 'REGISTER',
    REGISTER_SUCCESS = 'REGISTER_SUCCESS',
    REGISTER_FAILED = 'REGISTER_FAILED',
    LOGOUT = 'LOGOUT',
    LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
    LOGOUT_FAILED = 'LOGOUT_FAILED',
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS',
    CHANGE_PASSWORD_FAILED = 'CHANGE_PASSWORD_FAILED',
    SWITCH_CHANGE_PASSWORD_DIALOG = 'SWITCH_CHANGE_PASSWORD_DIALOG',
    REQUEST_PASSWORD_RESET = 'REQUEST_PASSWORD_RESET',
    REQUEST_PASSWORD_RESET_SUCCESS = 'REQUEST_PASSWORD_RESET_SUCCESS',
    REQUEST_PASSWORD_RESET_FAILED = 'REQUEST_PASSWORD_RESET_FAILED',
    RESET_PASSWORD = 'RESET_PASSWORD_CONFIRM',
    RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_CONFIRM_SUCCESS',
    RESET_PASSWORD_FAILED = 'RESET_PASSWORD_CONFIRM_FAILED',
    LOAD_AUTH_ACTIONS = 'LOAD_AUTH_ACTIONS',
    LOAD_AUTH_ACTIONS_SUCCESS = 'LOAD_AUTH_ACTIONS_SUCCESS',
    LOAD_AUTH_ACTIONS_FAILED = 'LOAD_AUTH_ACTIONS_FAILED',
}

export function loginAsync(username: string, password: string) {
    return {
        type: AuthSagaActionTypes.LOGIN,
        payload: { username, password },
    };
}

export function logoutAsync() {
    return {
        type: AuthSagaActionTypes.LOGOUT,
        // payload:{}
    };
}

export function changePasswordAsync(
    oldPassword: string,
    newPassword1: string,
    newPassword2: string,
) {
    return {
        type: AuthSagaActionTypes.CHANGE_PASSWORD,
        payload: { oldPassword, newPassword1, newPassword2 },
    };
}

export function requestPasswordResetAsync(email: string) {
    return {
        type: AuthSagaActionTypes.REQUEST_PASSWORD_RESET,
        payload: { email },
    };
}

export function resetPasswordAsync(newPassword1: string, newPassword2: string, uid: string, token: string) {
    return {
        type: AuthSagaActionTypes.RESET_PASSWORD,
        payload: {
            newPassword1, newPassword2, uid, token,
        },
    };
}

export function authorizedAsync() {
    return {
        type: AuthSagaActionTypes.AUTHORIZED_SUCCESS,
    };
}

export function loadAuthActionsAsync() {
    return {
        type: AuthSagaActionTypes.LOAD_AUTH_ACTIONS,
    };
}

export function registerAsync(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password1: string,
    password2: string,
    confirmations: UserConfirmation[],
) {
    return {
        type: AuthSagaActionTypes.REGISTER,
        payload: {
            username,
            firstName,
            lastName,
            email,
            password1,
            password2,
            confirmations,
        },
    };
}
