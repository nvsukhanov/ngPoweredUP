import { Dictionary } from '@ngrx/entity';
import { Injectable } from '@angular/core';
import { Observable, first, map, of } from 'rxjs';
import { ControlSchemeBindingType, transformRelativeDegToAbsoluteDeg } from '@app/shared';
import { HubFacadeService } from '@app/store';

import { controllerInputIdFn } from '../../../../reducers';
import { AngleShiftTaskPayload, ControlSchemeAngleShiftBinding, ControllerInputModel, PortCommandTask, PortCommandTaskPayload, } from '../../../../models';
import { ITaskPayloadFactory } from './i-task-payload-factory';

@Injectable()
export class AngleShiftTaskPayloadFactoryService implements ITaskPayloadFactory<ControlSchemeBindingType.AngleShift> {
    private readonly inputThreshold = 0.5;

    private readonly angleSnapThresholdDegrees = 15;

    constructor(
        private readonly hubFacade: HubFacadeService,
    ) {
    }

    public buildPayload(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>,
        motorEncoderOffset: number,
        previousTask: PortCommandTask | null
    ): Observable<{ payload: AngleShiftTaskPayload; inputTimestamp: number } | null> {
        if (previousTask && previousTask.bindingId === binding.id) {
            // we know where we are, so we can use the previous task to calculate the next one
            return this.buildPayloadUsingPreviousTask(
                binding,
                inputsState,
                previousTask as PortCommandTask<ControlSchemeBindingType.AngleShift>,
            );
        }
        // there were no previous task or it was for a different binding, so we need to find out where we are
        return this.buildPayloadFromUnknownInitialPosition(binding, inputsState, motorEncoderOffset);
    }

    public buildCleanupPayload(
        previousTask: PortCommandTask
    ): Observable<PortCommandTaskPayload | null> {
        if (previousTask.payload.bindingType !== ControlSchemeBindingType.AngleShift) {
            return of(null);
        }
        return of({
            bindingType: ControlSchemeBindingType.SetSpeed,
            speed: 0,
            power: 0,
            activeInput: false,
            useAccelerationProfile: previousTask.payload.useAccelerationProfile,
            useDecelerationProfile: previousTask.payload.useDecelerationProfile
        });
    }

    private buildPayloadUsingPreviousTask(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>,
        previousTask: PortCommandTask<ControlSchemeBindingType.AngleShift>
    ): Observable<{ payload: AngleShiftTaskPayload; inputTimestamp: number } | null> {
        const { isNextAngleInputActive, isPrevAngleInputActive } = this.getInputsState(binding, inputsState);

        if ((!isNextAngleInputActive && previousTask.payload.nextAngleActiveInput) || (!isPrevAngleInputActive && previousTask.payload.prevAngleActiveInput)) {
            // TODO: this is a hack to preserve the input states when the input is released. Fix this, it lead to issuing a command with the same angle twice
            return of(this.buildPayloadFromTemplate(
                binding,
                previousTask.payload.offset,
                previousTask.payload.angleIndex,
                isNextAngleInputActive,
                isPrevAngleInputActive,
                Date.now()
            ));
        }

        const previousAngleIndex = previousTask.payload.angleIndex;
        const angleChange = this.calculateExpectedAngleIndexChangeDirectionBasedOnPreviousTask(
            binding,
            inputsState,
            previousTask.payload,
            isNextAngleInputActive,
            isPrevAngleInputActive
        );
        const nextAngleIndex = this.calculateUpdatedAngleIndex(binding.angles, previousAngleIndex, angleChange.change);
        return of(this.buildPayloadFromTemplate(
            binding,
            previousTask.payload.offset,
            nextAngleIndex,
            isNextAngleInputActive,
            isPrevAngleInputActive,
            angleChange.inputTimestamp
        ));
    }

    private buildPayloadFromUnknownInitialPosition(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>,
        motorEncoderOffset: number
    ): Observable<{ payload: AngleShiftTaskPayload; inputTimestamp: number } | null> {
        // we don't know where we are, so we need to query the motor for a position
        return this.hubFacade.getMotorPosition(binding.hubId, binding.portId).pipe(
            first(),
            map((position) => {
                // we got the position relative to the motor encoder offset, so we need to transform it to absolute position
                const absPosition = transformRelativeDegToAbsoluteDeg(motorEncoderOffset + position);
                const { isNextAngleInputActive, isPrevAngleInputActive } = this.getInputsState(binding, inputsState);

                // we need to find an angle index that can be used as a starting point
                // best case scenario - we are already at one of the angles
                const previousAngleIndex = this.findAngleIndexWithingThreshold(binding.angles, absPosition)
                    // if none found - we look for an index with a shortest travel distance from the current position based
                    ?? this.findStartingIndexForInput(binding.angles, absPosition, isNextAngleInputActive, isPrevAngleInputActive)
                    // worst case scenario - we just pick the nearest angle
                    ?? this.findNearestAngleIndex(binding.angles, absPosition);

                // now we know where we are, so we can calculate the angle change direction
                const angleChange = this.calculateExpectedAngleIndexChangeDirection(
                    binding,
                    inputsState,
                    isNextAngleInputActive,
                    isPrevAngleInputActive
                );

                // and the next angle index
                const nextAngleIndex = this.calculateUpdatedAngleIndex(binding.angles, previousAngleIndex, angleChange.change);

                // there is a chance that the motor axle has been rotated by more than 360 degrees when the scheme was not active
                // so we need to store the offset and use it to calculate the absolute position
                const positionZero = position - position % 360;
                const offset = positionZero - motorEncoderOffset;

                return this.buildPayloadFromTemplate(
                    binding,
                    offset,
                    nextAngleIndex,
                    isNextAngleInputActive,
                    isPrevAngleInputActive,
                    angleChange.inputTimestamp
                );
            })
        );
    }

    private findNearestAngleIndex(
        angles: number[],
        absolutePosition: number,
    ): number {
        let nearestAngleIndex = 0;
        let nearestAngleDistance = Math.abs(angles[0] - absolutePosition);
        for (let i = 1; i < angles.length; i++) {
            const currentAngleDistance = Math.abs(angles[i] - absolutePosition);
            if (currentAngleDistance < nearestAngleDistance) {
                nearestAngleDistance = currentAngleDistance;
                nearestAngleIndex = i;
            }
        }
        return nearestAngleIndex;
    }

    private calculateUpdatedAngleIndex(
        angles: number[],
        previousIndex: number,
        indexIncrement: 1 | -1 | 0
    ): number {
        return angles[previousIndex + indexIncrement] !== undefined
               ? previousIndex + indexIncrement
               : previousIndex;
    }

    private calculateExpectedAngleIndexChangeDirection(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>,
        isNextAngleInputActive: boolean,
        isPrevAngleInputActive: boolean
    ): { change: 1 | -1 | 0; inputTimestamp: number } {
        if (isNextAngleInputActive) {
            return {
                change: -1,
                inputTimestamp: inputsState[controllerInputIdFn(binding.inputs.nextAngle)]?.timestamp ?? Date.now()
            };
        }

        if (isPrevAngleInputActive) {
            return {
                change: 1,
                inputTimestamp: (!!binding.inputs.prevAngle && inputsState[controllerInputIdFn(binding.inputs.prevAngle)]?.timestamp) || Date.now()
            };
        }

        return {
            change: 0,
            inputTimestamp: Date.now()
        };
    }

    private calculateExpectedAngleIndexChangeDirectionBasedOnPreviousTask(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>,
        previousTaskPayload: AngleShiftTaskPayload,
        isNextAngleInputActive: boolean,
        isPrevAngleInputActive: boolean
    ): { change: 1 | -1 | 0; inputTimestamp: number } {
        if (isNextAngleInputActive && !previousTaskPayload.nextAngleActiveInput) {
            return {
                change: -1,
                inputTimestamp: inputsState[controllerInputIdFn(binding.inputs.nextAngle)]?.timestamp ?? Date.now()
            };
        }

        if (isPrevAngleInputActive && !previousTaskPayload.nextAngleActiveInput) {
            return {
                change: 1,
                inputTimestamp: (!!binding.inputs.prevAngle && inputsState[controllerInputIdFn(binding.inputs.prevAngle)]?.timestamp) || Date.now()
            };
        }

        return {
            change: 0,
            inputTimestamp: Date.now()
        };
    }

    private buildPayloadFromTemplate(
        binding: ControlSchemeAngleShiftBinding,
        offset: number,
        angleIndex: number,
        isNextAngleInputActive: boolean,
        isPrevAngleInputActive: boolean,
        inputTimestamp: number,
    ): { payload: AngleShiftTaskPayload; inputTimestamp: number } {
        return {
            payload: {
                bindingType: ControlSchemeBindingType.AngleShift,
                angleIndex,
                offset,
                angle: binding.angles[angleIndex],
                speed: binding.speed,
                power: binding.power,
                nextAngleActiveInput: isNextAngleInputActive,
                prevAngleActiveInput: isPrevAngleInputActive,
                useAccelerationProfile: binding.useAccelerationProfile,
                useDecelerationProfile: binding.useDecelerationProfile,
                endState: binding.endState,
            },
            inputTimestamp
        };
    }

    private getInputsState(
        binding: ControlSchemeAngleShiftBinding,
        inputsState: Dictionary<ControllerInputModel>
    ): { isNextAngleInputActive: boolean; isPrevAngleInputActive: boolean } {
        const isNextAngleInputActive = (inputsState[controllerInputIdFn(binding.inputs.nextAngle)]?.value ?? 0) > this.inputThreshold;
        const isPrevAngleInputActive = !!binding.inputs.prevAngle
            && (inputsState[controllerInputIdFn(binding.inputs.prevAngle)]?.value ?? 0) > this.inputThreshold;
        return { isNextAngleInputActive, isPrevAngleInputActive };
    }

    private findAngleIndexWithingThreshold(
        angles: number[],
        absolutePosition: number
    ): number | null {
        let nearestAngleWithinThresholdIndex = -1;
        for (let i = 0; i < angles.length; i++) {
            if (Math.abs(angles[i] - absolutePosition) <= this.angleSnapThresholdDegrees) {
                if (nearestAngleWithinThresholdIndex === -1) {
                    nearestAngleWithinThresholdIndex = i;
                } else if (Math.abs(angles[i] - absolutePosition) < Math.abs(angles[nearestAngleWithinThresholdIndex] - absolutePosition)) {
                    nearestAngleWithinThresholdIndex = i;
                }
            }
        }
        return nearestAngleWithinThresholdIndex === -1 ? null : nearestAngleWithinThresholdIndex;
    }

    private findStartingIndexForInput(
        angles: number[],
        absolutePosition: number,
        isNextAngleInputActive: boolean,
        isPrevAngleInputActive: boolean
    ): number | null {
        let indexWithShortestTravelDistanceForNextAngle = -1;
        let currentShortestTravelDistanceForNextAngle = Number.MAX_SAFE_INTEGER;

        let indexWithShortestTravelDistanceForPrevAngle = -1;
        let currentShortestTravelDistanceForPrevAngle = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < angles.length - 1; i++) {
            const isAngleBetween = this.isAngleBetween(absolutePosition, angles[i], angles[i + 1]);
            if (!isAngleBetween) {
                continue;
            }
            if (isNextAngleInputActive) {
                const distanceToNextAngle = Math.abs(angles[i] - absolutePosition);
                if (distanceToNextAngle < currentShortestTravelDistanceForNextAngle) {
                    currentShortestTravelDistanceForNextAngle = distanceToNextAngle;
                    indexWithShortestTravelDistanceForNextAngle = i + 1;
                }
            }
            if (isPrevAngleInputActive) {
                const distanceToPrevAngle = Math.abs(angles[i + 1] - absolutePosition);
                if (distanceToPrevAngle < currentShortestTravelDistanceForPrevAngle) {
                    currentShortestTravelDistanceForPrevAngle = distanceToPrevAngle;
                    indexWithShortestTravelDistanceForPrevAngle = i;
                }
            }
        }
        if (isNextAngleInputActive && indexWithShortestTravelDistanceForNextAngle !== -1) {
            return indexWithShortestTravelDistanceForNextAngle;
        }
        if (isPrevAngleInputActive && indexWithShortestTravelDistanceForPrevAngle !== -1) {
            return indexWithShortestTravelDistanceForPrevAngle;
        }
        return null;
    }

    private isAngleBetween(
        angle: number,
        angleA: number,
        angleB: number
    ): boolean {
        const [ startAngle, endAngle ] = angleA < angleB ? [ angleA, angleB ] : [ angleB, angleA ];
        return angle >= startAngle && angle <= endAngle;
    }
}