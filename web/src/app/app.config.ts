import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

import { ProductRepository } from '@ai-workspace/catalog-domain';
import { SearchProductsUseCase } from '@ai-workspace/catalog-application';
import { SemanticProductRepository } from '@ai-workspace/catalog-infrastructure';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: ProductRepository,
      useFactory: () => new SemanticProductRepository('/api'),
    },
    {
      provide: SearchProductsUseCase,
      useFactory: (r: ProductRepository) => new SearchProductsUseCase(r),
      deps: [ProductRepository],
    },
  ],
};
