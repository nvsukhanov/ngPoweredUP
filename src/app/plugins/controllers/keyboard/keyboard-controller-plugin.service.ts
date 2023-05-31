import { IControllerPlugin } from '../i-controller-plugin';
import { EMPTY, Observable } from 'rxjs';
import { Memoize } from 'typescript-memoize';
import { TranslocoService } from '@ngneat/transloco';
import { createControllerL10nKey, createScopedControllerL10nKey } from '../create-controller-l10n-key';
import { Injectable } from '@angular/core';
import { KeyboardsSettingsComponent } from './keyboards-settings.component';
import { KeyboardSettings } from '../../../store';

@Injectable()
export class KeyboardControllerPluginService implements IControllerPlugin<KeyboardSettings> {
    public readonly settingsComponent = KeyboardsSettingsComponent;

    public readonly nameL10nKey: string;

    public readonly triggerButtonIndices: ReadonlyArray<number> = [];

    public readonly buttonStateL10nKey = createControllerL10nKey('buttonState');

    public readonly axisStateL10nKey = createControllerL10nKey('axisState');

    private readonly l10nScope = 'keyboard';

    private readonly axisName = EMPTY;

    constructor(
        private readonly translocoService: TranslocoService
    ) {
        this.nameL10nKey = createScopedControllerL10nKey(this.l10nScope, 'name');
    }

    public getAxisName$(): Observable<string> {
        return this.axisName;
    }

    @Memoize()
    public getButtonName$(
        inputId: string
    ): Observable<string> {
        return this.translocoService.selectTranslate(createScopedControllerL10nKey(this.l10nScope, 'button'), { inputId });
    }
}
