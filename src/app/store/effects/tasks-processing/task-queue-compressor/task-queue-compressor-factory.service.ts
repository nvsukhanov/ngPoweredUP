import { Injectable } from '@angular/core';

import { ComposingTaskQueueCompressor } from './composing-task-queue-compressor';
import { LastOfTypeCompressor } from './last-of-type-compressor';
import { ITaskQueueCompressor } from './i-task-queue-compressor';
import { PortCommandTaskType } from '../../../models';

@Injectable({ providedIn: 'root' })
export class TaskQueueCompressorFactoryService {
    public create(): ITaskQueueCompressor {
        return new ComposingTaskQueueCompressor([
            new LastOfTypeCompressor(PortCommandTaskType.SetSpeed),
            new LastOfTypeCompressor(PortCommandTaskType.Servo),
            new LastOfTypeCompressor(PortCommandTaskType.SetAngle),
        ]);
    }
}