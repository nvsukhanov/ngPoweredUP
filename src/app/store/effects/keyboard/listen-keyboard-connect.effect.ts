import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { inject } from '@angular/core';
import { ControllerType, WINDOW } from '@app/shared';
import { CONTROLLERS_ACTIONS, CONTROLLER_SELECTORS } from '@app/store';
import { fromEvent, map, switchMap, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { ControllerProfileFactoryService } from '../../../controller-profiles';

const KEY_DOWN_EVENT = 'keydown';

export const LISTEN_KEYBOARD_CONNECT = createEffect((
    actions$: Actions = inject(Actions),
    window: Window = inject(WINDOW),
    store: Store = inject(Store),
    controllerProfileFactory: ControllerProfileFactoryService = inject(ControllerProfileFactoryService),
) => {
    return actions$.pipe(
        ofType(CONTROLLERS_ACTIONS.waitForConnect),
        switchMap(() => fromEvent(window.document, KEY_DOWN_EVENT)),
        concatLatestFrom(() => store.select(CONTROLLER_SELECTORS.selectKeyboard)),
        map(([ , knownKeyboard ]) => {
            const profileUid = controllerProfileFactory.getProfile(ControllerType.Keyboard).uid;
            return knownKeyboard
                   ? CONTROLLERS_ACTIONS.keyboardConnected({ profileUid })
                   : CONTROLLERS_ACTIONS.keyboardDiscovered({ profileUid });
        }),
        take(1)
    );
}, { functional: true });
