import { APP_INITIALIZER, EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ActionReducer, ActionReducerMap, MetaReducer, Store, provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { Router } from '@angular/router';

import { NAVIGATOR } from '@app/shared';
import { IState } from './i-state';
import {
    BLUETOOTH_AVAILABILITY_REDUCERS,
    CONTROLLERS_REDUCERS,
    CONTROLLER_INPUT_CAPTURE_REDUCERS,
    CONTROLLER_INPUT_REDUCERS,
    CONTROLLER_SETTINGS_REDUCER,
    CONTROL_SCHEME_CONFIGURATION_STATE_REDUCERS,
    CONTROL_SCHEME_REDUCERS,
    CONTROL_SCHEME_RUNNING_STATE_REDUCERS,
    HUBS_REDUCERS,
    HUB_ATTACHED_IOS_REDUCERS,
    HUB_ATTACHED_IO_STATE_REDUCERS,
    HUB_CONNECTION_REDUCERS,
    HUB_DISCOVERY_STATE_REDUCERS,
    HUB_EDIT_FORM_ACTIVE_SAVES_REDUCERS,
    HUB_IO_OUTPUT_MODES_REDUCER,
    HUB_PORT_MODE_INFO_REDUCERS,
    HUB_PORT_TASKS_REDUCERS,
    SERVO_CALIBRATION_REDUCERS
} from './reducers';
import {
    ControlSchemeEffects,
    ControllerInputCaptureEffects,
    GamepadControllerEffects,
    HubAttachedIOsEffects,
    HubAttachedIosStateEffects,
    HubIOSupportedModesEffects,
    HubPortModeInfoEffects,
    HubPortTasksEffects,
    HubsEffects,
    KeyboardControllerEffects,
    NotificationsEffects,
    ServoCalibrationEffects,
} from './effects';
import { bluetoothAvailabilityCheckFactory } from './bluetooth-availability-check-factory';
import { HubStorageService } from './hub-storage.service';
import { HUBS_ACTIONS } from './actions';
import { RoutesBuilderService } from '../routing';

const REDUCERS: ActionReducerMap<IState> = {
    controllers: CONTROLLERS_REDUCERS,
    controllerInput: CONTROLLER_INPUT_REDUCERS,
    controllerInputCapture: CONTROLLER_INPUT_CAPTURE_REDUCERS,
    controllerSettings: CONTROLLER_SETTINGS_REDUCER,
    controlSchemes: CONTROL_SCHEME_REDUCERS,
    controlSchemeConfigurationState: CONTROL_SCHEME_CONFIGURATION_STATE_REDUCERS,
    controlSchemeRunningState: CONTROL_SCHEME_RUNNING_STATE_REDUCERS,
    hubs: HUBS_REDUCERS,
    hubConnections: HUB_CONNECTION_REDUCERS,
    hubDiscoveryState: HUB_DISCOVERY_STATE_REDUCERS,
    hubAttachedIOs: HUB_ATTACHED_IOS_REDUCERS,
    hubAttachedIOState: HUB_ATTACHED_IO_STATE_REDUCERS,
    hubIOSupportedModes: HUB_IO_OUTPUT_MODES_REDUCER,
    hubPortModeInfo: HUB_PORT_MODE_INFO_REDUCERS,
    hubPortTasks: HUB_PORT_TASKS_REDUCERS,
    hubEditFormActiveSaves: HUB_EDIT_FORM_ACTIVE_SAVES_REDUCERS,
    servoCalibrationTaskState: SERVO_CALIBRATION_REDUCERS,
    bluetoothAvailability: BLUETOOTH_AVAILABILITY_REDUCERS,
    router: routerReducer
};

function localStorageSyncReducer(reducer: ActionReducer<IState>): ActionReducer<IState> {
    return localStorageSync({
        keys: [
            'hubs',
            'hubAttachedIOs',
            'controllerSettings',
            'controlSchemes',
            'hubIOSupportedModes',
            'hubPortModeInfo'
        ] satisfies Array<keyof IState>,
        rehydrate: true
    })(reducer);
}

const metaReducers: Array<MetaReducer<IState>> = [ localStorageSyncReducer ];

export function provideApplicationStore(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideStore<IState>(REDUCERS, { metaReducers }),
        provideEffects(
            HubAttachedIOsEffects,
            HubPortModeInfoEffects,
            HubIOSupportedModesEffects,
            HubsEffects,
            ControlSchemeEffects,
            HubPortTasksEffects,
            NotificationsEffects,
            ServoCalibrationEffects,
            HubAttachedIosStateEffects,
            GamepadControllerEffects,
            KeyboardControllerEffects,
            ControllerInputCaptureEffects
        ),
        provideStoreDevtools({
            maxAge: 100,
            logOnly: !isDevMode(),
            autoPause: true,
            trace: false,
            traceLimit: 75,
            actionsBlocklist: [
                HUBS_ACTIONS.setHasCommunication.type,
                HUBS_ACTIONS.rssiLevelReceived.type,
                HUBS_ACTIONS.batteryLevelReceived.type
            ]
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: bluetoothAvailabilityCheckFactory,
            deps: [
                NAVIGATOR,
                Store,
                Router,
                RoutesBuilderService
            ],
            multi: true
        },
        HubStorageService,
        provideRouterStore()
    ]);
}
