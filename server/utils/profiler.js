/**
 * Performance Profiler Utility
 * 
 * Provides simple, accurate timing for database operations and API endpoints
 * to identify bottlenecks in the approval workflow.
 */

export class Profiler {
  constructor(name) {
    this.name = name;
    this.timings = new Map();
    this.startTime = Date.now();
  }

  // Start timing a specific step
  start(label) {
    this.timings.set(label, { start: Date.now() });
  }

  // End timing a specific step
  end(label) {
    const timing = this.timings.get(label);
    if (timing) {
      timing.end = Date.now();
      timing.duration = timing.end - timing.start;
    }
  }

  // Get duration of a specific step
  getDuration(label) {
    const timing = this.timings.get(label);
    return timing?.duration || 0;
  }

  // Get total duration
  getTotalDuration() {
    return Date.now() - this.startTime;
  }

  // Log all timings
  log() {
    const total = this.getTotalDuration();
    console.log(`\n[Performance] ${this.name} - Total: ${total}ms`);
    
    for (const [label, timing] of this.timings) {
      if (timing.duration !== undefined) {
        const percentage = ((timing.duration / total) * 100).toFixed(1);
        console.log(`  ├─ ${label}: ${timing.duration}ms (${percentage}%)`);
      }
    }
    console.log('');
  }

  // Get report as object
  getReport() {
    const report = {
      name: this.name,
      total: this.getTotalDuration(),
      steps: {}
    };

    for (const [label, timing] of this.timings) {
      if (timing.duration !== undefined) {
        report.steps[label] = timing.duration;
      }
    }

    return report;
  }
}

export default Profiler;
