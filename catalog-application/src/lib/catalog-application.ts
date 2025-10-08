import { ProductRepository, Product }from '@ai-workspace/catalog-domain';

export class SearchProductsUseCase {
  constructor(private readonly repo: ProductRepository) {}
  execute(query: string): Promise<Product[]> {
    return this.repo.search(query);
  }
}
