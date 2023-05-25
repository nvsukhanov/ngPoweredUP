/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AttachedIO, HUB_ATTACHED_IO_SELECTORS, HubConfiguration, HUBS_ACTIONS, HUBS_SELECTORS, ROUTER_SELECTORS } from '../../../store';
import { Store } from '@ngrx/store';
import { LetDirective, PushPipe } from '@ngrx/component';
import { EMPTY, Observable, switchMap, take } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoModule } from '@ngneat/transloco';
import { HubPropertiesViewComponent } from '../hub-properties-view';
import { HubPortViewComponent } from '../hub-port-view';
import { NotFoundComponent } from '../../../common';
import { Router } from '@angular/router';
import { RoutesBuilderService } from '../../../routing';

@Component({
    standalone: true,
    selector: 'app-hub-view',
    templateUrl: './hub-view.component.html',
    styleUrls: [ './hub-view.component.scss' ],
    imports: [
        PushPipe,
        LetDirective,
        MatButtonModule,
        NgIf,
        NgForOf,
        MatDividerModule,
        TranslocoModule,
        HubPropertiesViewComponent,
        HubPortViewComponent,
        NotFoundComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HubViewComponent {
    public readonly selectedHub$: Observable<HubConfiguration | undefined> = this.store.select(ROUTER_SELECTORS.selectRouteParam('id')).pipe(
        switchMap((id) => id === undefined ? EMPTY : this.store.select(HUBS_SELECTORS.selectHub(id)))
    );

    public readonly selectedHubIOs$: Observable<AttachedIO[] | undefined> = this.store.select(ROUTER_SELECTORS.selectRouteParam('id')).pipe(
        switchMap((id) => id === undefined ? EMPTY : this.store.select(HUB_ATTACHED_IO_SELECTORS.selectHubIOs(id)))
    );

    constructor(
        private readonly store: Store,
        private readonly router: Router,
        private readonly routesBuilderService: RoutesBuilderService
    ) {
    }

    public disconnectHub(): void {
        this.store.select(ROUTER_SELECTORS.selectRouteParam('id')).pipe(
            take(1)
        ).subscribe((id) => {
            if (id === undefined) {
                return;
            }
            this.store.dispatch(HUBS_ACTIONS.userRequestedHubDisconnection({ hubId: id }));
        });
        this.router.navigate(this.routesBuilderService.hubsList);
    }

    public hubIoTrackByFn(
        index: number,
        item: AttachedIO
    ): string {
        return `${item.portId}/${item.ioType}`;
    }
}
