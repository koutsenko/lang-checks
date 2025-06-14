//@ts-check
import { performance } from 'perf_hooks';
import * as V8 from './nativeSyntax.js';

/**
 * MAKE ENV PHASE.
 */

// Используем %GetOptimizationStatus из V8 для контроля за статусом функции.
const setupShowStatus = (ini) => () => console.log(
    `Status: ${ini++}`,
    V8.getStatusFormatted(action1, "action1"),
    V8.getStatusFormatted(action2, "action2"),
    V8.getStatusFormatted(action3, "action3"),
    V8.getStatusFormatted(mainLoop, "mainLoop"),
);

// Инициализируем функцию с 0 отметкой.
const showStatus = setupShowStatus(0);

// Геттер элемента массива по индексу от 0 до 9_999_999, ограниченному до диапазона 0–31.
// Вместо index % 32 используем index & 31 — более быстрый способ получить остаток от деления на 32.
const actionFunc = (arr) => (index) => arr[index & 0b11111];

// Создаем три testFunc с 3 разными массивами длиной 32.
const action1 = actionFunc([1, 2, 3, 4, 5, 6, 7, 3, 4, 7, 34, 2, 5, 7, 9, 5, 1, 2, 3, 4, 5, 6, 7, 3, 4, 7, 34, 2, 5, 7, 9, 5]);
const action2 = actionFunc([1, 2, 3, 4, 9, 5, 1, 2, 3, 4, 5, 6, 7, 3, 4, 7, 34, 2, 5, 7, 9, 5, 5, 6, 7, 3, 4, 7, 34, 2, 5, 7]);
const action3 = actionFunc([1, 2, 3, 4, 9, 5, 3, 4, 7, 34, 2, 5, 7, 9, 5, 5, 6, 7, 3, 4, 7, 1, 2, 3, 4, 5, 6, 7, 34, 2, 5, 7]);

/**
 * INIT PHASE.
 */

// Инициализируем два значения для теста.
// Сумматор это тестовое число, одинаковость которого между прогонами помогает понять что мы вычисляем одну и ту же работу.
let summatorRoot = 0;
const mask = 0b01111111101111101111111111011101;

// Основная функция, в которой будем итерировать изучаемый код. 
const mainLoop = (summatorIni) => {
    let i = 0;
    for (let i = 0; i < 10_000_000; i++) {
        summatorIni += action1(i);
        summatorIni += action2(i);
        summatorIni += action3(i);
        summatorIni = summatorIni & mask;
    }
    return summatorIni;
}

// Отключаем оптимизации от Turbofan для чистоты эксперимента.
// Если сомневаешься что код рабочий - закомментируй и сравни время исполнения.
V8.neverOpti(action1);
V8.neverOpti(action2);
V8.neverOpti(action3);
V8.neverOpti(mainLoop);

// Получаем подтверждение относительно состояния кода.
showStatus();

/**
 * TEST PHASE.
 */

// Засекаем время.
const startPerf = performance.now();

// Делаем первый прогон тестируемого цикла.
summatorRoot = mainLoop(summatorRoot);

// Перепроверяем состояние функций.
showStatus();

// Делаем второй прогон тестируемого цикла.
summatorRoot += mainLoop(summatorRoot);

// Опять контролируем состояние тестируемых функций.
showStatus();

// Выводим результаты подсчетов + считаем время выполнения.
console.log(`Summator: ${summatorRoot}`);
console.log(`Status performance: ${performance.now() - startPerf}`);

/**
 * Результат запуска, кратко
 * Status: 0 для всех четырех функций: флагов optimized, maglev и turbofanned нет 
 * Status: 1 для всех четырех функций: флагов optimized, maglev и turbofanned нет
 * Status: 2 для всех четырех функций: флагов optimized, maglev и turbofanned нет
 * Summator: 119168
 * Status performance: 830.22
 * Если закомментировать neverOpti - Status performance уменьшится в 10 раз и появятся флаги turbofanned и т.п. 
 */

// TODO Замена let/const на var, второй бенчмарк.
