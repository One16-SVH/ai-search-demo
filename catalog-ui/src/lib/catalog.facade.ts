import { Injectable, inject, signal } from '@angular/core';
import { SearchProductsUseCase } from '@ai-workspace/catalog-application';
import { Product } from '@ai-workspace/catalog-domain';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
    #searchProductsUseCase = inject(SearchProductsUseCase);

    #query = signal('');
    #loading = signal(false);
    #items = signal<Product[]>([]);

    readonly query = this.#query.asReadonly();
    readonly loading = this.#loading.asReadonly();
    readonly items = this.#items.asReadonly();

    clear() { 
        this.#items.set([]);
    }

    async search(query: string) {
        if ((query ?? '').trim().length < 2) {
            // clear when query is too short
            this.clear();
            return;
          }

        this.#query.set(query);
        this.#loading.set(true);
        try {
        this.#items.set(await this.#searchProductsUseCase.execute(query));
        } finally {
        this.#loading.set(false);
        }
    }
}
