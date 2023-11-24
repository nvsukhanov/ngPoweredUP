import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, filter, map, switchMap, take } from 'rxjs';
import { PushPipe } from '@ngrx/component';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { concatLatestFrom } from '@ngrx/effects';
import { ConfirmationDialogModule, ConfirmationDialogService, FeatureToolbarControlsDirective, RoutesBuilderService, TitleService } from '@app/shared';
import { CONTROL_SCHEME_ACTIONS, ControlSchemeBinding, ROUTER_SELECTORS } from '@app/store';

import { BINDING_EDIT_PAGE_SELECTORS } from './binding-edit-page.selectors';
import { BindingEditComponent } from '../common';

@Component({
    standalone: true,
    selector: 'app-binding-edit-page',
    templateUrl: './binding-edit-page.component.html',
    styleUrls: [ './binding-edit-page.component.scss' ],
    imports: [
        PushPipe,
        BindingEditComponent,
        MatButtonModule,
        TranslocoPipe,
        FeatureToolbarControlsDirective,
        ConfirmationDialogModule
    ],
    providers: [
        TitleService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BindingEditPageComponent implements OnInit {
    public readonly binding$: Observable<ControlSchemeBinding | undefined>;

    constructor(
        private readonly store: Store,
        private readonly routesBuilderService: RoutesBuilderService,
        private readonly router: Router,
        private readonly confirmationDialogService: ConfirmationDialogService,
        private readonly translocoService: TranslocoService,
        private readonly titleService: TitleService
    ) {
        this.binding$ = this.store.select(BINDING_EDIT_PAGE_SELECTORS.selectEditedBinding);
    }

    public ngOnInit(): void {
        this.titleService.setTitle$(
            this.store.select(ROUTER_SELECTORS.selectCurrentlyEditedSchemeName).pipe(
                switchMap((controlSchemeName) => this.translocoService.selectTranslate('pageTitle.bindingEdit', { controlSchemeName }))
            )
        );
    }

    public onSave(
        binding: ControlSchemeBinding
    ): void {
        this.store.select(ROUTER_SELECTORS.selectCurrentlyEditedSchemeName).pipe(
            take(1),
            filter((schemeName): schemeName is string => (schemeName) !== null)
        ).subscribe((schemeName) => {
            this.store.dispatch(CONTROL_SCHEME_ACTIONS.saveBinding({
                schemeName,
                binding
            }));
            this.router.navigate(
                this.routesBuilderService.controlSchemeView(schemeName)
            );
        });
    }

    public onCancel(): void {
        this.store.select(ROUTER_SELECTORS.selectCurrentlyEditedSchemeName).pipe(
            take(1),
            filter((id): id is string => id !== null),
            map((id) => this.routesBuilderService.controlSchemeView(id))
        ).subscribe((route) => {
            this.router.navigate(route);
        });
    }

    public onDelete(): void {
        this.confirmationDialogService.confirm(
            this.translocoService.selectTranslate('controlScheme.deleteBindingConfirmationTitle'),
            {
                content$: this.translocoService.selectTranslate('controlScheme.deleteBindingConfirmationContent'),
                confirmTitle$: this.translocoService.selectTranslate('controlScheme.deleteBindingConfirmationConfirmButtonTitle'),
                cancelTitle$: this.translocoService.selectTranslate('controlScheme.deleteBindingConfirmationCancelButtonTitle')
            }
        ).pipe(
            take(1),
            concatLatestFrom(() => [
                this.store.select(ROUTER_SELECTORS.selectCurrentlyEditedSchemeName),
                this.store.select(ROUTER_SELECTORS.selectCurrentlyEditedBindingId)
            ]),
        ).subscribe(([ isConfirmed, schemeName, bindingId ]) => {
            if (isConfirmed === false || schemeName === null || bindingId === null) {
                return;
            }
            this.store.dispatch(CONTROL_SCHEME_ACTIONS.deleteBinding({ schemeName, bindingId }));

            const route = this.routesBuilderService.controlSchemeView(schemeName);
            this.router.navigate(route);
        });
    }
}
