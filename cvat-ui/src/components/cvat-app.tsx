// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Col, Row } from 'antd/lib/grid';
import Layout from 'antd/lib/layout';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Spin from 'antd/lib/spin';
import Text from 'antd/lib/typography/Text';
import 'antd/dist/antd.css';

import GlobalErrorBoundary from 'components/global-error-boundary/global-error-boundary';
import Header from 'components/header/header';
import ResetPasswordPageConfirmComponent from 'components/reset-password-confirm-page/reset-password-confirm-page';
import ResetPasswordPageComponent from 'components/reset-password-page/reset-password-page';
import ShortcutsDialog from 'components/shortcuts-dialog/shortcuts-dialog';
import ProjectsPageComponent from 'components/projects-page/projects-page';
import CreateProjectPageComponent from 'components/create-project-page/create-project-page';
import UserListComponent from 'components/user-list-page/user-list';
import ProjectPageComponent from 'components/project-page/project-page';
import TasksPageContainer from 'containers/tasks-page/tasks-page';
import LoginWithTokenComponent from 'components/login-with-token/login-with-token';
import ExportDatasetModal from 'components/export-dataset/export-dataset-modal';
import CreateTaskPageContainer from 'containers/create-task-page/create-task-page';
import TaskPageContainer from 'containers/task-page/task-page';
import ModelsPageContainer from 'containers/models-page/models-page';
import AnnotationPageContainer from 'containers/annotation-page/annotation-page';
import LoginPageContainer from 'containers/login-page/login-page';
import RegisterPageContainer from 'containers/register-page/register-page';
import CloudStoragesPageComponent from 'components/cloud-storages-page/cloud-storages-page';
import CreateCloudStoragePageComponent from 'components/create-cloud-storage-page/create-cloud-storage-page';
import UpdateCloudStoragePageComponent from 'components/update-cloud-storage-page/update-cloud-storage-page';
import PageNotFound from 'components/not-found-page/notfoundpage';
import getCore from 'cvat-core-wrapper';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import { NotificationsState } from 'reducers/interfaces';
import { customWaViewHit } from 'utils/enviroment';
import showPlatformNotification, {
    platformInfo,
    stopNotifications,
    showUnsupportedNotification,
} from 'utils/platform-checker';
import '../styles.scss';
import EmailConfirmationPage from './email-confirmation-page/email-confirmed';

interface CVATAppProps {
    loadFormats: () => void;
    loadAbout: () => void;
    verifyAuthorized: () => void;
    loadUserAgreements: () => void;
    initPlugins: () => void;
    initModels: () => void;
    resetErrors: () => void;
    resetMessages: () => void;
    switchShortcutsDialog: () => void;
    switchSettingsDialog: () => void;
    loadAuthActions: () => void;
    keyMap: KeyMap;
    userInitialized: boolean;
    userFetching: boolean;
    pluginsInitialized: boolean;
    pluginsFetching: boolean;
    modelsInitialized: boolean;
    modelsFetching: boolean;
    formatsInitialized: boolean;
    formatsFetching: boolean;
    aboutInitialized: boolean;
    aboutFetching: boolean;
    userAgreementsFetching: boolean;
    userAgreementsInitialized: boolean;
    authActionsFetching: boolean;
    authActionsInitialized: boolean;
    notifications: NotificationsState;
    user: any;
    isModelPluginActive: boolean;
}

class CVATApplication extends React.PureComponent<CVATAppProps & RouteComponentProps> {
    public componentDidMount(): void {
        const core = getCore();
        const { verifyAuthorized, history, location } = this.props;
        // configure({ ignoreRepeatedEventsWhenKeyHeldDown: false });

        // Logger configuration

        // For preventing and 'Right-click' and 'F12', 'Ctrl+Shift+I' button click:
        // document.addEventListener('contextmenu', (e) => {
        //     e.preventDefault();
        // });
        // document.addEventListener('keydown', (e) => {
        //     console.log(e.ctrlKey, e.shiftKey, 'e.key', e.key);

        //     if (e.key == 'F12') {
        //         // Prevent F12
        //         e.preventDefault();
        //         return false;
        //     }
        //     if (e.ctrlKey && e.shiftKey && e.key == 'I') {
        //         e.preventDefault();
        //         return false;
        //     }
        //     if (e.ctrlKey && e.shiftKey && e.key == 'C') {
        //         e.preventDefault();
        //         return false;
        //     }
        //     if (e.ctrlKey && e.shiftKey && e.key == 'J') {
        //         e.preventDefault();
        //         return false;
        //     }
        //     if (e.ctrlKey && e.key == 'U') {
        //         e.preventDefault();
        //         return false;
        //     }
        // });

        const userActivityCallback: (() => void)[] = [];
        window.addEventListener('click', () => {
            userActivityCallback.forEach((handler) => handler());
        });
        core.logger.configure(() => window.document.hasFocus, userActivityCallback);

        customWaViewHit(location.pathname, location.search, location.hash);
        history.listen((_location) => {
            customWaViewHit(_location.pathname, _location.search, _location.hash);
        });

        verifyAuthorized();

        const {
            name, version, engine, os,
        } = platformInfo();

        if (showPlatformNotification()) {
            stopNotifications(false);
            Modal.warning({
                title: 'Unsupported platform detected',
                className: 'cvat-modal-unsupported-platform-warning',
                content: (
                    <>
                        <Row>
                            <Col>
                                <Text>
                                    {`The browser you are using is ${name} ${version} based on ${engine}.` +
                                        ' CVAT was tested in the latest versions of Chrome and Firefox.' +
                                        ' We recommend to use Chrome (or another Chromium based browser)'}
                                </Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Text type='secondary'>{`The operating system is ${os}`}</Text>
                            </Col>
                        </Row>
                    </>
                ),
                onOk: () => stopNotifications(true),
            });
        } else if (showUnsupportedNotification()) {
            stopNotifications(false);
            Modal.warning({
                title: 'Unsupported features detected',
                className: 'cvat-modal-unsupported-features-warning',
                content: (
                    <Text>
                        {`${name} v${version} does not support API, which is used by CVAT. `}
                        It is strongly recommended to update your browser.
                    </Text>
                ),
                onOk: () => stopNotifications(true),
            });
        }
    }
    public componentDidUpdate(): void {
        const {
            verifyAuthorized,
            loadFormats,
            loadAbout,
            loadUserAgreements,
            initPlugins,
            initModels,
            loadAuthActions,
            userInitialized,
            userFetching,
            formatsInitialized,
            formatsFetching,
            aboutInitialized,
            aboutFetching,
            pluginsInitialized,
            pluginsFetching,
            modelsInitialized,
            modelsFetching,
            user,
            userAgreementsFetching,
            userAgreementsInitialized,
            authActionsFetching,
            authActionsInitialized,
            isModelPluginActive,
        } = this.props;

        this.showErrors();
        this.showMessages();

        if (!userInitialized && !userFetching) {
            verifyAuthorized();
            return;
        }

        if (!userAgreementsInitialized && !userAgreementsFetching) {
            loadUserAgreements();
            return;
        }

        if (!authActionsInitialized && !authActionsFetching) {
            loadAuthActions();
        }

        if (user == null || !user.isVerified) {
            return;
        }

        if (!formatsInitialized && !formatsFetching) {
            loadFormats();
        }

        if (!aboutInitialized && !aboutFetching) {
            loadAbout();
        }

        if (isModelPluginActive && !modelsInitialized && !modelsFetching) {
            initModels();
        }

        if (!pluginsInitialized && !pluginsFetching) {
            initPlugins();
        }
    }

    private showMessages(): void {
        function showMessage(title: string): void {
            notification.info({
                message: (
                    <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                            __html: title,
                        }}
                    />
                ),
                duration: 5,
            });
        }

        const { notifications, resetMessages } = this.props;

        let shown = false;
        for (const where of Object.keys(notifications.messages)) {
            for (const what of Object.keys((notifications as any).messages[where])) {
                const message = (notifications as any).messages[where][what];
                shown = shown || !!message;
                if (message) {
                    showMessage(message);
                }
            }
        }

        if (shown) {
            resetMessages();
        }
    }

    private showErrors(): void {
        function showError(title: string, _error: any, className?: string): void {
            const error = _error.toString();
            const dynamicProps = typeof className === 'undefined' ? {} : { className };
            notification.error({
                ...dynamicProps,
                message: (
                    <div
                        // eslint-disable-next-line
                        dangerouslySetInnerHTML={{
                            __html: title,
                        }}
                    />
                ),
                // duration: null,
                duration: 5,
                description: error.length > 200 ? 'Open the Browser Console get details' : error,
            });

            // eslint-disable-next-line no-console
            console.error(error);
        }

        const { notifications, resetErrors } = this.props;

        let shown = false;
        for (const where of Object.keys(notifications.errors)) {
            for (const what of Object.keys((notifications as any).errors[where])) {
                const error = (notifications as any).errors[where][what];
                shown = shown || !!error;
                if (error) {
                    showError(error.message, error.reason, error.className);
                }
            }
        }

        if (shown) {
            resetErrors();
        }
    }

    // Where you go depends on your URL
    public render(): JSX.Element {
        const {
            userInitialized,
            aboutInitialized,
            pluginsInitialized,
            formatsInitialized,
            modelsInitialized,
            switchShortcutsDialog,
            switchSettingsDialog,
            user,
            keyMap,
            // location,
            isModelPluginActive,
        } = this.props;

        const readyForRender =
            (userInitialized && (user == null || !user.isVerified)) ||
            (userInitialized &&
                formatsInitialized &&
                pluginsInitialized &&
                aboutInitialized &&
                (!isModelPluginActive || modelsInitialized));

        const subKeyMap = {
            SWITCH_SHORTCUTS: keyMap.SWITCH_SHORTCUTS,
            SWITCH_SETTINGS: keyMap.SWITCH_SETTINGS,
        };

        const handlers = {
            SWITCH_SHORTCUTS: (event: KeyboardEvent) => {
                if (event) event.preventDefault();

                switchShortcutsDialog();
            },
            SWITCH_SETTINGS: (event: KeyboardEvent) => {
                if (event) event.preventDefault();

                switchSettingsDialog();
            },
        };
        if (readyForRender) {
            if (user && user.isVerified) {
                return (
                    <GlobalErrorBoundary>
                        <Layout>
                            <Header />
                            <Layout.Content style={{ height: '100%' }}>
                                <ShortcutsDialog />
                                <GlobalHotKeys keyMap={subKeyMap} handlers={handlers}>
                                    <Switch>
                                        {/* <Route exact path='/projects'
                                        component={ProjectsPageComponent} /> */}
                                        {/* <Route
                                        exact path='/projects/create'
                                         component={CreateProjectPageComponent} /> */}
                                        <Route
                                            exact
                                            path='/projects/create'
                                            render={() =>
                                                (user?.isSuperuser ? (
                                                    <Route component={CreateProjectPageComponent} />
                                                ) : (
                                                    <Route component={PageNotFound} />
                                                ))}
                                        />
                                        <Route
                                            exact
                                            path='/projects'
                                            render={() =>
                                                (user?.isSuperuser ? (
                                                    <Route component={ProjectsPageComponent} />
                                                ) : (
                                                    <Route component={PageNotFound} />
                                                ))}
                                        />
                                        <Route
                                            exact
                                            path='/tasks/create'
                                            render={() =>
                                                (user?.isSuperuser ? (
                                                    <Route component={CreateTaskPageContainer} />
                                                ) : (
                                                    <Route component={PageNotFound} />
                                                ))}
                                        />

                                        <Route
                                            exact
                                            path='/projects/:id'
                                            render={() =>
                                                (user?.isSuperuser ? (
                                                    <Route component={ProjectPageComponent} />
                                                ) : (
                                                    <Route component={PageNotFound} />
                                                ))}
                                        />
                                        {/* <Route exact path='/projects/:id' component={ProjectPageComponent} /> */}
                                        <Route exact path='/tasks' component={TasksPageContainer} />
                                        {/* <Route exact path='/tasks/create' component={CreateTaskPageContainer} /> */}
                                        <Route exact path='/tasks/:id' component={TaskPageContainer} />
                                        <Route exact path='/tasks/:tid/jobs/:jid' component={AnnotationPageContainer} />
                                        <Route exact path='/cloudstorages' component={CloudStoragesPageComponent} />
                                        <Route
                                            exact
                                            path='/userlist'
                                            render={() =>
                                                (user?.isSuperuser ? (
                                                    <Route component={UserListComponent} />
                                                ) : (
                                                    <Route component={PageNotFound} />
                                                ))}
                                        />
                                        <Route
                                            exact
                                            path='/cloudstorages/create'
                                            component={CreateCloudStoragePageComponent}
                                        />
                                        <Route
                                            exact
                                            path='/cloudstorages/update/:id'
                                            component={UpdateCloudStoragePageComponent}
                                        />
                                        {isModelPluginActive && (
                                            <Route exact path='/models' component={ModelsPageContainer} />
                                        )}
                                        {/* <Redirect
                                            push
                                            to={new URLSearchParams(location.search).get('next') || '/tasks'}
                                        /> */}
                                        {user?.isSuperuser ? (
                                            <Redirect push to='/projects' />
                                        ) : (
                                            <Redirect push to='/tasks' />
                                        )}
                                    </Switch>
                                </GlobalHotKeys>
                                {/* eslint-disable-next-line */}
                                <ExportDatasetModal />
                                {/* eslint-disable-next-line */}
                                <a id='downloadAnchor' target='_blank' style={{ display: 'none' }} download />
                            </Layout.Content>
                        </Layout>
                    </GlobalErrorBoundary>
                );
            }
            if (user && !user.isVerified) {
                return (
                    <GlobalErrorBoundary>
                        <Switch>
                            {/* {!user.isverified && ( */}
                            <Route exact path='/auth/email-confirmation' component={EmailConfirmationPage} />
                            {/* )} */}
                            <Redirect to='/auth/email-confirmation' />
                        </Switch>
                    </GlobalErrorBoundary>
                );
            }
            return (
                <GlobalErrorBoundary>
                    <Switch>
                        <Route exact path='/auth/register' component={RegisterPageContainer} />
                        <Route exact path='/auth/login' component={LoginPageContainer} />
                        <Route
                            exact
                            path='/auth/login-with-token/:sessionId/:token'
                            component={LoginWithTokenComponent}
                        />
                        <Route exact path='/auth/password/reset' component={ResetPasswordPageComponent} />
                        <Route
                            exact
                            path='/auth/password/reset/confirm'
                            component={ResetPasswordPageConfirmComponent}
                        />
                        {/* <Route exact path='/auth/email-confirmation' component={EmailConfirmationPage} /> */}

                        {/* <Redirect
                            to={location.pathname.length > 1 ? `/auth/login/?next=${location.pathname}` : '/auth/login'}
                        /> */}
                        <Redirect to='/auth/login' />
                    </Switch>
                </GlobalErrorBoundary>
            );
        }

        return <Spin size='large' className='cvat-spinner' tip='Loading...' />;
    }
}

export default withRouter(CVATApplication);
