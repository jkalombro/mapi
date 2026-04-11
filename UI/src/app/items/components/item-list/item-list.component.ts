import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '../../store/models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListComponent {
  items = input<Item[]>([]);
  isLoading = input<boolean>(false);

  editClicked = output<Item>();
  deleteClicked = output<string>();

  onEdit(item: Item): void {
    this.editClicked.emit(item);
  }

  onDelete(id: string): void {
    this.deleteClicked.emit(id);
  }
}
