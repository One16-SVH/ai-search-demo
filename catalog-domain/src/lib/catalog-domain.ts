// DEFAULT FILE UPDATED (keep this filename)
export interface Product {
  id: string;
  name: string;
  tags?: string[];
  description?: string;
}

// Use an abstract class so it can be an Angular DI token
export abstract class ProductRepository {
  abstract findById(id: string): Promise<Product | null>;
  abstract search(query: string): Promise<Product[]>;
  abstract save(p: Product): Promise<void>;
}
