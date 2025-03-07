const { performance } = require('perf_hooks');

class Performance {
    constructor(name) {
        this.startTime = performance.now();
        this.name = name;
    }

    getElapsed() {
        return performance.now() - this.startTime;
    }

    log() {
        let task = this.name ? `Task '${this.name}'` : `Task`;
        console.log(`${task} took ${this.getElapsed()}ms to complete`);
    }
}

module.exports = Performance;