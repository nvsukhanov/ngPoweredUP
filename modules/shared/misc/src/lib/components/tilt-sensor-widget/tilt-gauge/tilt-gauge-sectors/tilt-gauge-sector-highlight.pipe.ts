import { Pipe, PipeTransform } from '@angular/core';

import { isAngleInSector } from '../../../../math';
import { TiltGaugeSectorDefinition } from './tilt-gauge-sector-definition';

@Pipe({
    standalone: true,
    name: 'libTiltGaugeSectorHighlight',
    pure: true,
})
export class TiltGaugeSectorHighlightPipe implements PipeTransform {
    public transform(
        tiltDegrees?: number,
        gaugeSector?: TiltGaugeSectorDefinition
    ): boolean {
        if (gaugeSector === undefined || tiltDegrees === undefined) {
            return false;
        }

        return isAngleInSector(tiltDegrees, gaugeSector.from, gaugeSector.to) || isAngleInSector(tiltDegrees + 180, gaugeSector.from, gaugeSector.to);
    }
}