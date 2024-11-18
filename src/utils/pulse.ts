export class Pulse {
  private last: number | null = null;

  beat() {
    this.last = performance.now();
  }

  check(): 'healthy' | 'dying' | 'dead' {
    // if beat is never called
    if (this.last === null) return 'dead';

    const diff = performance.now() - this.last;
    // if the last beat was less than 30 seconds ago, we gucci
    if (diff < 30_000) return 'healthy';
    // less gucci
    if (diff < 60_000) return 'dying';
    // no gucci
    return 'dead';
  }
}

export default new Pulse();
