import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Type } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoModule } from '@ngneat/transloco';
import { PushPipe } from '@ngrx/component';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

import { ControllerPluginFactoryService, IControllerPlugin, IControllerSettingsComponent } from '../../plugins';
import { Controller, ControllerSettings } from '../../store';
import { ControllerSettingsRenderDirective } from './controller-settings-render.directive';

@Component({
    standalone: true,
    selector: 'app-controllers-list-item',
    templateUrl: './controllers-list-item.component.html',
    styleUrls: [ './controllers-list-item.component.scss' ],
    imports: [
        MatExpansionModule,
        TranslocoModule,
        PushPipe,
        MatCardModule,
        NgIf,
        ControllerSettingsRenderDirective
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControllersListItemComponent {
    @Output() public readonly settingsChanges = new EventEmitter<ControllerSettings>();

    private _controllerPlugin: IControllerPlugin = this.controllerPluginFactoryService.getPlugin();

    private _controllerSettings?: ControllerSettings;

    constructor(
        private readonly controllerPluginFactoryService: ControllerPluginFactoryService,
    ) {
    }

    @Input()
    public set controller(
        controllerWithSettings: { controller: Controller, settings?: ControllerSettings } | undefined
    ) {
        this._controllerPlugin = this.controllerPluginFactoryService.getPlugin(
            controllerWithSettings?.controller?.controllerType,
            controllerWithSettings?.controller?.id
        );
        this._controllerSettings = controllerWithSettings?.settings;
    }

    public get controllerSettingsComponent(): Type<IControllerSettingsComponent> | undefined {
        return this._controllerPlugin.settingsComponent;
    }

    public get controllerNameL10nKey(): string {
        return this._controllerPlugin.nameL10nKey;
    }

    public get controllerSettings(): ControllerSettings | undefined {
        return this._controllerSettings;
    }

    public controllerSettingsUpdate(
        settings: ControllerSettings
    ): void {
        this.settingsChanges.emit(settings);
    }
}
