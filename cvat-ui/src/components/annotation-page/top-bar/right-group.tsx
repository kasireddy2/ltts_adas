// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Col } from 'antd/lib/grid';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import Select from 'antd/lib/select';
import Button from 'antd/lib/button';
import Text from 'antd/lib/typography/Text';
import Tooltip from 'antd/lib/tooltip';
import Moment from 'react-moment';
import moment from 'moment';
import { useSelector } from 'react-redux';
import Modal from 'antd/lib/modal';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { MenuInfo } from 'rc-menu/lib/interface';
import {
    FilterIcon, FullscreenIcon, InfoIcon, BrainIcon,
} from 'icons';
import {
    CombinedState, DimensionType, Workspace, PredictorState,
} from 'reducers/interfaces';
import image from '../../../assets/keyboard-icon.png';

interface Props {
    workspace: Workspace;
    predictor: PredictorState;
    isTrainingActive: boolean;
    showStatistics(): void;
    switchPredictor(predictorEnabled: boolean): void;
    showFilters(): void;
    changeWorkspace(workspace: Workspace): void;
    jobInstance: any;
    onClickMenu(params: any): void;
    userGroup: any;
    ObjectActivatID: any;
}
export enum Actions {
    REMOVE_ANNO = 'remove_anno',
}
function RightGroup(props: Props): JSX.Element {
    const {
        showStatistics,
        changeWorkspace,
        switchPredictor,
        workspace,
        predictor,
        jobInstance,
        isTrainingActive,
        showFilters,
        onClickMenu,
        userGroup,
        ObjectActivatID,
    } = props;
    const annotationAmount = predictor.annotationAmount || 0;
    const mediaAmount = predictor.mediaAmount || 0;
    const formattedScore = `${(predictor.projectScore * 100).toFixed(0)}%`;
    const role = userGroup.groups['0'];
    const predictorTooltip = (
        <div className='cvat-predictor-tooltip'>
            <span>Adaptive auto annotation is</span>
            {predictor.enabled ? (
                <Text type='success' strong>
                    {' active'}
                </Text>
            ) : (
                <Text type='warning' strong>
                    {' inactive'}
                </Text>
            )}
            <br />
            <span>
                Annotations amount:
                {annotationAmount}
            </span>
            <br />
            <span>
                Media amount:
                {mediaAmount}
            </span>
            <br />
            {annotationAmount > 0 ? (
                <span>
                    Model mAP is
                    {' '}
                    {formattedScore}
                    <br />
                </span>
            ) : null}
            {predictor.error ? (
                <Text type='danger'>
                    {predictor.error.toString()}
                    <br />
                </Text>
            ) : null}
            {predictor.message ? (
                <span>
                    Status:
                    {' '}
                    {predictor.message}
                    <br />
                </span>
            ) : null}
            {predictor.timeRemaining > 0 ? (
                <span>
                    Time Remaining:
                    {' '}
                    <Moment date={moment().add(-predictor.timeRemaining, 's')} format='hh:mm:ss' trim durationFromNow />
                    <br />
                </span>
            ) : null}
            {predictor.progress > 0 ? (
                <span>
                    Progress:
                    {predictor.progress.toFixed(1)}
                    {' '}
                    %
                </span>
            ) : null}
        </div>
    );

    let predictorClassName = 'cvat-annotation-header-button cvat-predictor-button';
    if (!!predictor.error || !predictor.projectScore) {
        predictorClassName += ' cvat-predictor-disabled';
    } else if (predictor.enabled) {
        if (predictor.fetching) {
            predictorClassName += ' cvat-predictor-fetching';
        }
        predictorClassName += ' cvat-predictor-inprogress';
    }

    const filters = useSelector((state: CombinedState) => state.annotation.annotations.filters);

    // code added by giti
    function showKeyboardModal(): void {
        const evt = new KeyboardEvent('keydown', { keyCode: 112, which: 112 });
        document.dispatchEvent(evt);
    }
    // code ended by giti
    // code added by Raju
    function onClickdelete(): void {
        const evt = new KeyboardEvent('keydown', { keyCode: 46, which: 46 });
        document.dispatchEvent(evt);
    }
    function DeleteObject(): void {
        if (ObjectActivatID.activatedStateID !== null) {
            Modal.confirm({
                title: 'annotation will be removed',
                content:
                    'You are going to remove the annotation from the client. ' +
                    'It will stay on the server till you save the job. Continue?',
                className: 'cvat-modal-confirm-remove-annotation',
                onOk: () => {
                    onClickdelete();
                },
                okButtonProps: {
                    type: 'primary',
                    danger: true,
                },
                okText: 'Delete',
            });
        } else {
            Modal.info({
                title: 'annotation will not be removed',
                content:
                    'Please Select One annotation Object' +
                    '',
                className: 'cvat-modal-confirm-remove-annotation',
                okButtonProps: {
                    type: 'primary',
                    danger: true,
                },
            });
        }
    }
    function DeleteAllObject(key: any): void {
        if (key === Actions.REMOVE_ANNO) {
            Modal.confirm({
                title: 'All the annotations will be removed',
                content:
                    'You are going to remove all the annotations from the client. ' +
                    'It will stay on the server till you save the job. Continue?',
                className: 'cvat-modal-confirm-remove-annotation',
                onOk: () => {
                    onClickMenu('remove_anno');
                },
                okButtonProps: {
                    type: 'primary',
                    danger: true,
                },
                okText: 'Delete',
            });
        }
    }

    return (
        <Col className='cvat-annotation-header-right-group'>
            {isTrainingActive && (
                <Button
                    type='link'
                    className={predictorClassName}
                    onClick={() => {
                        switchPredictor(!predictor.enabled);
                    }}
                >
                    <Tooltip title={predictorTooltip}>
                        <Icon component={BrainIcon} />
                    </Tooltip>
                    {annotationAmount ? `mAP ${formattedScore}` : 'not trained'}
                </Button>
            )}
            <Button className='cvat-annotation-header-button' type='link' onClick={() => showKeyboardModal()}>
                <img style={{ width: '30px', marginBottom: '5px' }} alt='keyboard' src={image} />
                Shortcut
            </Button>
            <Button className='cvat-annotation-header-button' type='link' onClick={() => DeleteObject()}>
                <DeleteOutlined style={{ fontSize: '18px' }} />
                <span style={{ marginBottom: '-6px' }}> Delete </span>
            </Button>
            <Button
                className='cvat-annotation-header-button'
                type='link'
                onClick={() => DeleteAllObject('remove_anno')}
            >
                <DeleteOutlined style={{ fontSize: '17px' }} />
                <span style={{ marginBottom: '-6px' }}> Delete All </span>
            </Button>
            <Button
                type='link'
                className='cvat-annotation-header-button'
                onClick={(): void => {
                    if (window.document.fullscreenEnabled) {
                        if (window.document.fullscreenElement) {
                            window.document.exitFullscreen();
                        } else {
                            window.document.documentElement.requestFullscreen();
                        }
                    }
                }}
            >
                <Icon component={FullscreenIcon} />
                Fullscreen
            </Button>
            <Button type='link' className='cvat-annotation-header-button' onClick={showStatistics}>
                <Icon component={InfoIcon} />
                Info
            </Button>
            <Button
                type='link'
                className={`cvat-annotation-header-button ${filters.length ? 'filters-armed' : ''}`}
                onClick={showFilters}
            >
                <Icon component={FilterIcon} />
                Filters
            </Button>
            <div>
                <Select
                    dropdownClassName='cvat-workspace-selector-dropdown'
                    className='cvat-workspace-selector'
                    onChange={changeWorkspace}
                    value={workspace}
                    disabled={role === 'annotator' || role === 'observer' || role === undefined || role === 'user'}
                >
                    {Object.values(Workspace).map((ws) => {
                        if (jobInstance.task.dimension === DimensionType.DIM_3D) {
                            if (ws === Workspace.STANDARD) {
                                return null;
                            }
                            return (
                                <Select.Option disabled={ws !== Workspace.STANDARD3D} key={ws} value={ws}>
                                    {ws}
                                </Select.Option>
                            );
                        }
                        if (ws !== Workspace.STANDARD3D) {
                            return (
                                <Select.Option key={ws} value={ws}>
                                    {ws}
                                </Select.Option>
                            );
                        }
                        return null;
                    })}
                </Select>
            </div>
        </Col>
    );
}

export default React.memo(RightGroup);
