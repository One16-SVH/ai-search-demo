import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogFacade } from '../catalog.facade';

@Component({
  selector: 'lib-catalog-ui',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './catalog-ui.component.html',
  styleUrl: './catalog-ui.component.scss',
})
export class CatalogUiComponent {
  facade = inject(CatalogFacade);

  query = this.facade.query;

  onSearch(query: string) {
    this.facade.search(query);
  }
}
