import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import {
    ControllerConnectionState,
    HubConnectionState,
    IState,
    SELECT_BLUETOOTH_AVAILABILITY,
    SELECT_CONTROLLER_CONNECTION_STATE,
    SELECT_HUB_BATTERY_LEVEL,
    SELECT_HUB_CONNECTION_STATE,
    SELECT_HUB_RSSI_LEVEL
} from '../../store';
import { StatusBarComponent } from '../status-bar';
import { map } from 'rxjs';
import { NavigationComponent } from '../navigation';
import { LetModule, PushModule } from '@ngrx/component';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    standalone: true,
    selector: 'app-root',
    templateUrl: './layout.component.html',
    styleUrls: [ './layout.component.scss' ],
    imports: [
        RouterOutlet,
        StatusBarComponent,
        NavigationComponent,
        PushModule,
        LetModule,
        TranslocoModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
    public isBluetoothAvailable$ = this.store.select(SELECT_BLUETOOTH_AVAILABILITY);

    public isControllerConnected$ = this.store.select(SELECT_CONTROLLER_CONNECTION_STATE).pipe(
        map((t) => t === ControllerConnectionState.Connected)
    );

    public isHubConnected$ = this.store.select(SELECT_HUB_CONNECTION_STATE).pipe(
        map((t) => t === HubConnectionState.Connected)
    );

    public batteryLevel$ = this.store.select(SELECT_HUB_BATTERY_LEVEL);

    public rssiLevel$ = this.store.select(SELECT_HUB_RSSI_LEVEL);

    constructor(
        private readonly store: Store<IState>
    ) {
    }
}