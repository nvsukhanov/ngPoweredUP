import { Injectable } from '@angular/core';
import { LpuHubProperties } from './lpu-hub-properties';
import { PropertySubscriptionMessageBuilderService } from './property-subscription-message-builder.service';
import { ReplyParserService } from './reply-parsers';
import { LpuCharacteristicsMessenger } from './lpu-characteristics-messenger';
import { Observable } from 'rxjs';
import { LoggingService } from '../logging';

@Injectable({ providedIn: 'root' })
export class LpuHubPropertiesFactoryService {
    constructor(
        private readonly propertySubscriptionMessageBuilderService: PropertySubscriptionMessageBuilderService,
        private readonly replyParserService: ReplyParserService,
        private readonly logging: LoggingService
    ) {
    }

    public create(
        onHubDisconnected: Observable<void>,
        characteristic: BluetoothRemoteGATTCharacteristic,
        messenger: LpuCharacteristicsMessenger
    ): LpuHubProperties {
        return new LpuHubProperties(
            onHubDisconnected,
            this.propertySubscriptionMessageBuilderService,
            this.replyParserService,
            characteristic,
            messenger,
            this.logging,
        );
    }
}
