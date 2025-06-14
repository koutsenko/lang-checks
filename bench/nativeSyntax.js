"use strict";

/**
 * Обёртка для V8 интринсиков — работает при запуске с --allow-natives-syntax
 */

// %GetOptimizationStatus возвращает числовой флаг состояния
export function getStatusFormatted(fn, name) {
    const status = % GetOptimizationStatus(fn);
    return `\n${name} [V8 status]: ${decodeStatusFlags(status).join(", ")}`;
}

// Запрещаем оптимизацию turbofan
export function neverOpti(fn) {
    % NeverOptimizeFunction(fn);
}

// Расшифровка состояния, см. OptimizationStatus https://github.com/v8/v8/blob/main/src/runtime/runtime.h#L1095
function decodeStatusFlags(status) {
    const flags = [];

    if (status & (1 << 0))  flags.push("kIsFunction");
    if (status & (1 << 1))  flags.push("kNeverOptimize");
    if (status & (1 << 2))  flags.push("kAlwaysOptimize");
    if (status & (1 << 3))  flags.push("kMaybeDeopted");
    if (status & (1 << 4))  flags.push("kOptimized");
    if (status & (1 << 5))  flags.push("kMaglevved");
    if (status & (1 << 6))  flags.push("kTurboFanned");
    if (status & (1 << 7))  flags.push("kInterpreted");
    if (status & (1 << 8))  flags.push("kMarkedForOptimization");
    if (status & (1 << 9))  flags.push("kMarkedForConcurrentOptimization");
    if (status & (1 << 10)) flags.push("kOptimizingConcurrently");
    if (status & (1 << 11)) flags.push("kIsExecuting");
    if (status & (1 << 12)) flags.push("kTopmostFrameIsTurboFanned");
    if (status & (1 << 13)) flags.push("kLiteMode");
    if (status & (1 << 14)) flags.push("kMarkedForDeoptimization");
    if (status & (1 << 15)) flags.push("kBaseline");
    if (status & (1 << 16)) flags.push("kTopmostFrameIsInterpreted");
    if (status & (1 << 17)) flags.push("kTopmostFrameIsBaseline");
    if (status & (1 << 18)) flags.push("kIsLazy");
    if (status & (1 << 19)) flags.push("kTopmostFrameIsMaglev");
    if (status & (1 << 20)) flags.push("kOptimizeOnNextCallOptimizesToMaglev");
    if (status & (1 << 21)) flags.push("kOptimizeMaglevOptimizesToTurbofan");
    if (status & (1 << 22)) flags.push("kMarkedForMaglevOptimization");
    if (status & (1 << 23)) flags.push("kMarkedForConcurrentMaglevOptimization");

    return flags.length > 0 ? flags : ["<no flags>"];
}
