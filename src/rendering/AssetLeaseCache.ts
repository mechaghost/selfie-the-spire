export interface AssetLease<T> { ready: Promise<T>; release(): void }
interface Entry<T> { refs: number; ready: Promise<T>; value?: T; settled: boolean }
/** Shared ownership with synchronous disposal. Late loads are disposed after their last consumer leaves. */
export class AssetLeaseCache<T> {
    private entries = new Map<string, Entry<T>>();
    constructor(private load: (key: string) => Promise<T>, private dispose: (value: T) => void) {}
    acquire(key: string): AssetLease<T> {
        let entry = this.entries.get(key);
        if (!entry) {
            const created: Entry<T> = { refs:0, ready:Promise.resolve(undefined as T), settled:false };
            this.entries.set(key, created);
            created.ready = Promise.resolve().then(() => this.load(key)).then(value => {
                created.value = value; created.settled = true; this.collect(key, created); return value;
            }, error => { created.settled = true; this.collect(key, created); throw error; });
            entry = created;
        }
        entry.refs++;
        const owned = entry;
        let released = false;
        return { ready:owned.ready, release:() => {
            if (released) return;
            released = true; owned.refs--; this.collect(key, owned);
        } };
    }
    private collect(key: string, entry: Entry<T>) {
        if (entry.refs || !entry.settled) return;
        if (this.entries.get(key) === entry) this.entries.delete(key);
        if (entry.value !== undefined) this.dispose(entry.value);
    }
    stats() { return { entries:this.entries.size, references:[...this.entries.values()].reduce((sum,e)=>sum+e.refs,0) }; }
}
