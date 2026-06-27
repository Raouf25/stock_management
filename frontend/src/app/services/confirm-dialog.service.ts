import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title:       string;
  message:     string;
  confirmText?: string;
  cancelText?:  string;
  danger?:      boolean;
}

interface DialogState extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<DialogState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.state.set({ ...options, resolve });
    });
  }

  respond(result: boolean): void {
    const s = this.state();
    if (!s) return;
    this.state.set(null);
    s.resolve(result);
  }
}
