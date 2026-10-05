import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterNavComponent } from '../../shared/components/footer-nav/footer-nav.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterNavComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public businessName = signal<string>('Madina General Store');
  public category = signal<string>('General Store / Karyana');
  public address = signal<string>('Lahore, Main Bazaar');
  public ownerName = signal<string>('Muhammad Raza');
  public phone = signal<string>('3001234567');
  public email = signal<string>('raza@example.com');
  
  public categories = [
    'General Store / Karyana',
    'Wholesale & Traders',
    'Pharmacy / Medical',
    'Milk & Dairy',
    'Textiles / Cloth',
    'Mobile / Electronics',
    'Other'
  ];

  public isEditing = signal<boolean>(false);

  public toggleEdit() {
    this.isEditing.set(!this.isEditing());
  }

  public selectCategory(cat: string) {
    if (this.isEditing()) {
      this.category.set(cat);
    }
  }

  public saveSettings() {
    // Save logic would go here
    this.isEditing.set(false);
  }
}
