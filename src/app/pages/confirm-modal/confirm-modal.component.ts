import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {

  @Input() visible = false;

  @Input() title = 'Are you sure?';

  @Input() message = 'This action cannot be undone.';

  @Input() confirmText = 'Delete';

  @Input() cancelText = 'Cancel';

  @Output() confirmed = new EventEmitter<void>();

  @Output() cancelled = new EventEmitter<void>();


  public onConfirm(): void {
    this.confirmed.emit();
  }


  public onCancel(): void {
    this.cancelled.emit();
  }


  public onBackdropClick(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.onCancel();
    }

  }

}