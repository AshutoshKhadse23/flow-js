/**
 * Logger utility for the FlowJS library
 */
export class Logger {
    constructor(options = {}) {
        this.level = options.level || 'info'; // 'debug', 'info', 'warn', 'error'
        this.prefix = options.prefix || '[FlowJS]';
        this.timestamp = options.timestamp !== false;
    }

    /**
     * Log levels
     */
    static LEVELS = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    /**
     * Check if message should be logged
     */
    shouldLog(level) {
        return Logger.LEVELS[level] >= Logger.LEVELS[this.level];
    }

    /**
     * Format message with prefix and timestamp
     */
    formatMessage(level, message) {
        let formatted = this.prefix;

        if (this.timestamp) {
            const time = new Date().toLocaleTimeString();
            formatted += ` [${time}]`;
        }

        formatted += ` [${level.toUpperCase()}] ${message}`;
        return formatted;
    }

    /**
     * Debug logging
     */
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }

    /**
     * Info logging
     */
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    /**
     * Warning logging
     */
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    /**
     * Error logging
     */
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }

    /**
     * Set log level
     */
    setLevel(level) {
        if (Logger.LEVELS.hasOwnProperty(level)) {
            this.level = level;
        } else {
            this.warn(`Invalid log level: ${level}`);
        }
    }

    /**
     * Group logging
     */
    group(title) {
        console.group(this.formatMessage('info', title));
    }

    /**
     * End group
     */
    groupEnd() {
        console.groupEnd();
    }

    /**
     * Time measurement
     */
    time(label) {
        console.time(this.formatMessage('debug', label));
    }

    /**
     * End time measurement
     */
    timeEnd(label) {
        console.timeEnd(this.formatMessage('debug', label));
    }
}

// Default logger instance
export const logger = new Logger();

/**
 * Performance logger
 */
export class PerformanceLogger {
    constructor() {
        this.metrics = new Map();
        this.logger = new Logger({ prefix: '[FlowJS Performance]' });
    }

    /**
     * Start measuring performance
     */
    start(metric) {
        this.metrics.set(metric, {
            startTime: performance.now(),
            memoryStart: this.getMemoryUsage(),
        });
    }

    /**
     * End measuring and log result
     */
    end(metric) {
        const data = this.metrics.get(metric);
        if (!data) {
            this.logger.warn(`Performance metric "${metric}" not found`);
            return;
        }

        const endTime = performance.now();
        const memoryEnd = this.getMemoryUsage();

        const duration = endTime - data.startTime;
        const memoryDiff = memoryEnd - data.memoryStart;

        this.logger.info(`${metric}: ${duration.toFixed(2)}ms, Memory: ${memoryDiff.toFixed(2)}MB`);

        this.metrics.delete(metric);
        return { duration, memoryDiff };
    }

    /**
     * Get memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1048576; // Convert to MB
        }
        return 0;
    }

    /**
     * Log frame rate
     */
    logFrameRate() {
        let lastTime = performance.now();
        let frameCount = 0;

        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.logger.info(`FPS: ${fps}`);

                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        measureFPS();
    }
}

// Default performance logger
export const performanceLogger = new PerformanceLogger();
