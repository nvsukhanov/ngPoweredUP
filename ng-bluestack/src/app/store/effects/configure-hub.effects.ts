/// <reference types="web-bluetooth" />
// TODO: ambient typing?

import { Inject, Injectable } from '@angular/core';
import { ExtractTokenType, NAVIGATOR } from '../../types';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ACTION_CONFIGURE_HUB_TERMINATION, ACTIONS_CONFIGURE_HUB } from '../actions';
import { IState } from '../i-state';
import { catchError, map, NEVER, of, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { Lpf2HubDiscoveryService, Lpf2HubStorageService } from '../../lego-hub';

@Injectable()
export class ConfigureHubEffects {
    public readonly startListening$ = createEffect(() => this.actions.pipe(
        ofType(ACTIONS_CONFIGURE_HUB.startDiscovery),
        switchMap(() => fromPromise(this.lpf2HubDiscoveryService.discoverLpf2Hub())),
        tap((d) => this.lpf2HubStorageService.registerHub(d)),
        map(() => ACTIONS_CONFIGURE_HUB.deviceConnected()),
        catchError((error) => of(ACTIONS_CONFIGURE_HUB.deviceConnectFailed({ error })))
    ));

    public readonly deviceConnectFailedNotification$ = createEffect(() => this.actions.pipe(
        ofType(ACTIONS_CONFIGURE_HUB.deviceConnectFailed),
        tap((e) => this.snackBar.open(e.error.message))
    ), { dispatch: false });

    public deviceDisconnect$ = createEffect(() => this.actions.pipe(
        ofType(
            ACTIONS_CONFIGURE_HUB.deviceConnected,
            ...ACTION_CONFIGURE_HUB_TERMINATION
        ),
        switchMap((action) => {
                if (action.type === ACTIONS_CONFIGURE_HUB.deviceConnected.type) {
                    return this.lpf2HubStorageService.getHub().onDisconnect$;
                } else {
                    return NEVER;
                }
            }
        ),
        tap(() => this.lpf2HubStorageService.removeHub()),
        map(() => ACTIONS_CONFIGURE_HUB.deviceDisconnected())
    ));

    public userRequestedHubDisconnection$ = createEffect(() => this.actions.pipe(
        ofType(
            ACTIONS_CONFIGURE_HUB.userRequestedHubDisconnection
        ),
        tap(() => {
            this.lpf2HubStorageService.getHub().disconnect();
        })
    ), { dispatch: false });

    constructor(
        @Inject(NAVIGATOR) private readonly navigator: ExtractTokenType<typeof NAVIGATOR>,
        private readonly actions: Actions,
        private readonly store: Store<IState>,
        private readonly snackBar: MatSnackBar,
        private readonly lpf2HubDiscoveryService: Lpf2HubDiscoveryService,
        private readonly lpf2HubStorageService: Lpf2HubStorageService
    ) {
    }
}
