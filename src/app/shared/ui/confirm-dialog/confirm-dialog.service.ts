import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogData } from './confirm-dialog.types';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(Dialog);

  ask(data: ConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean, ConfirmDialogData>(
      ConfirmDialogComponent,
      {
        data,
        disableClose: false,
        role: 'alertdialog',
      },
    );

    return new Promise((resolve) => {
      dialogRef.closed.subscribe((result) => {
        resolve(result ?? false);
      });
    });
  }
}
