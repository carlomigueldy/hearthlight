import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface AssetEntry {
  id: string
  url: string
}

/** Loads and caches GLB/GLTF assets. Framework-free (uses three directly). */
export class AssetLibrary {
  private readonly loader = new GLTFLoader()
  private readonly cache = new Map<string, GLTF>()

  async load(entries: AssetEntry[]): Promise<void> {
    await Promise.all(
      entries.map(async (e) => {
        const gltf = await this.loader.loadAsync(e.url)
        this.cache.set(e.id, gltf)
      }),
    )
  }

  get(id: string): GLTF | undefined {
    return this.cache.get(id)
  }
}
