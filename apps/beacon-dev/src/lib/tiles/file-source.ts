import fs from "node:fs/promises";

// Minimal Node filesystem Source for the `pmtiles` npm package.
// Only needs to implement getBytes(offset, length). Keeps one file
// handle open per archive for the life of the process.

export class NodeFileSource {
  private handle: fs.FileHandle | null = null;
  constructor(private path: string) {}

  getKey(): string {
    return this.path;
  }

  private async open(): Promise<fs.FileHandle> {
    if (this.handle) return this.handle;
    this.handle = await fs.open(this.path, "r");
    return this.handle;
  }

  async getBytes(offset: number, length: number): Promise<{ data: ArrayBuffer }> {
    const fh = await this.open();
    const buf = Buffer.alloc(length);
    await fh.read(buf, 0, length, offset);
    // Copy into a fresh ArrayBuffer (Buffer may be a pooled slice).
    const ab = new ArrayBuffer(length);
    new Uint8Array(ab).set(buf);
    return { data: ab };
  }
}
