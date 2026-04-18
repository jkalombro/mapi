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

  getAvatarColor(name: string): string {
    const AVATAR_COLORS = ['indigo', 'teal', 'rose', 'amber', 'violet', 'emerald'];
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }
}
