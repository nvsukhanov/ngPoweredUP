import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TiltData } from 'rxpoweredup';
import { LetDirective, PushPipe } from '@ngrx/component';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { PitchIndicatorComponent, RollIndicatorComponent, TiltGaugeIconDirective, WidgetComponent, YawIndicatorComponent } from '@app/shared';
import { TiltWidgetConfigModel } from '@app/store';

import { IControlSchemeWidgetComponent } from '../../../widget-container';
import { TiltWidgetDataProviderService } from '../tilt-widget-data-provider.service';

@Component({
    standalone: true,
    selector: 'app-tilt-sensor-widget',
    templateUrl: './tilt-sensor-widget.component.html',
    styleUrls: [ './tilt-sensor-widget.component.scss' ],
    imports: [
        WidgetComponent,
        LetDirective,
        RollIndicatorComponent,
        PushPipe,
        YawIndicatorComponent,
        PitchIndicatorComponent,
        TiltGaugeIconDirective,
        MatButtonModule,
        TranslocoPipe,
    ],
    providers: [
        TiltWidgetDataProviderService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiltSensorWidgetComponent implements IControlSchemeWidgetComponent<TiltWidgetConfigModel> {
    @Output() public readonly edit = new EventEmitter<void>();

    @Output() public readonly delete = new EventEmitter<void>();

    @Input() public canBeDeleted = false;

    @Input() public canBeEdited = false;

    private _config?: TiltWidgetConfigModel;

    private _tiltData$: Observable<TiltData | undefined> = of(undefined);

    constructor(
        private readonly dataProvider: TiltWidgetDataProviderService
    ) {
    }

    @Input()
    public set config(
        config: TiltWidgetConfigModel
    ) {
        if (config !== this._config) {
            if (config.hubId !== this._config?.hubId || config.portId !== this._config?.portId) {
                this._tiltData$ = this.dataProvider.getTilt(config);
            }
            this._config = config;
        }
    }

    public get config(): TiltWidgetConfigModel {
        if (!this._config) {
            throw new Error('Config is not set');
        }
        return this._config;
    }

    public get title(): string {
        if (this._config) {
            return this._config.title;
        }
        return '';
    }

    public get tiltData$(): Observable<TiltData | undefined> {
        return this._tiltData$;
    }

    public onCompensateTilt(
        compensationData?: TiltData
    ): void {
        if (!compensationData) {
            return;
        }
        this.dataProvider.compensateTilt(
            this.config.hubId,
            this.config.portId,
            compensationData
        );
    }

    public onResetTiltCompensation(): void {
        this.dataProvider.resetTiltCompensation(
            this.config.hubId,
            this.config.portId
        );
    }

    public onEdit(): void {
        this.edit.emit();
    }

    public onDelete(): void {
        this.delete.emit();
    }
}