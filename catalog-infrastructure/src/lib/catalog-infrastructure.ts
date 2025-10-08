import Fuse from 'fuse.js';
import { ProductRepository, Product } from '@ai-workspace/catalog-domain';

export class SemanticProductRepository implements ProductRepository {
  #cache: Product[] = [];
  #loaded = false;
  #fuse = new Fuse<Product>([], {
    includeScore: true,
    threshold: 0.35,
    keys: ['name', 'tags', 'description'],
  });

  constructor(private apiBase = '/api') {}

  setData(products: Product[]) {
    this.#cache = products;
    this.#fuse.setCollection(products);
    this.#loaded = true;
  }

  private async ensureData() {
    if (this.#loaded) return;
    const r = await fetch(`${this.apiBase}/products`);
    if (!r.ok) throw new Error('products_fetch_failed');
    const items = (await r.json()) as Product[];
    this.setData(items);
  }

  async findById(id: string) {
    await this.ensureData();
    return this.#cache.find((p) => p.id === id) ?? null;
  }

  async search(query: string): Promise<Product[]> {
    await this.ensureData();
    const q = query.trim();
    if (!q) return []; // empty query -> no results
  
    // 1️⃣ Fuzzy search first
    const fuzzyHits = this.#fuse.search(q, { limit: 10 });
    const fuzzyResults = fuzzyHits.map((h) => ({
      product: h.item,
      fuzzyScore: 1 - (h.score ?? 1),
    }));
  
    // If fuzzy found good matches, return those directly
    if (fuzzyResults.length > 0) {
      // threshold for “good enough”
      return fuzzyResults
        .filter((r) => r.fuzzyScore > 0.4)
        .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
        .map((r) => r.product);
    }
  
    // 2️⃣ Fallback to semantic similarity
    const payload = {
      query: q,
      items: this.#cache.map((p) => ({
        id: p.id,
        text: `${p.name}
            ${(p.tags || []).join(', ')}
            ${p.description ?? ''}`,
      })),
    };
  
    const resp = await fetch(`${this.apiBase}/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error('embed_failed');
    const sem: Record<string, number> = await resp.json();
  
    // 3️⃣ Sort semantic results by similarity
    const sorted = Object.entries(sem)
      .filter(([_, score]) => score > 0.55)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.#cache.find((p) => p.id === id))
      .filter(product => !!product);
  
    return sorted;
  }
  

  async save(product: Product) {
    // TODO: Implement save
    console.info('Product:', product);
  }
}
