import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Account } from './sections/account/account';
import { Preferences } from './sections/preferences/preferences';
import { Security } from './sections/security/security';
import { Notifications} from './sections/notifications/notifications';
@Component({
  selector: 'app-settings',
  imports: [Account, Preferences, Security, Notifications, MatIconModule, MatButtonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  selected: string = 'account';
  private dialogRef = inject(MatDialogRef<Settings>);

  close() {
    this.dialogRef.close();
  }
}
