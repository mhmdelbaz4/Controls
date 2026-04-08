import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appInput]',
  standalone: true
})
export class InputDirective {
  @Input() totalPages!: number;
  private lastValid = 1;
  
  constructor() {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return;

    const cleaned = input.value.replace(/[^0-9]/g, '');
    if (cleaned !== input.value) {
      input.value = cleaned;
    }
    if (input.value.length > 1 && input.value.startsWith('0')) {
      input.value = String(parseInt(input.value, 10));
    }
  }

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    this.clampValue(input);
  }

  @HostListener('focus', ['$event']) onFocus(event: Event) {
    const input = event.target as HTMLInputElement;
    const raw = input.value.trim();
    const value = parseInt(raw, 10);
    if (!isNaN(value) && value >= 1) {
      if (!this.totalPages || value <= this.totalPages) {
        this.lastValid = value;
      } else {
        this.lastValid = Math.min(value, this.totalPages || value);
      }
    }
  }

  @HostListener('keydown.enter', ['$event']) onEnter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.clampValue(input);
  }

  private clampValue(input: HTMLInputElement) {
    const raw = input.value.trim();

    if (raw === '') {
      input.value = '1';
      input.dispatchEvent(new Event('input'));
      this.lastValid = 1;
      return;
    }

    let value = parseInt(raw, 10);
    if (isNaN(value) || value < 1) value = 1;
    if (this.totalPages && value > this.totalPages) {
      let restore = this.lastValid ?? 1;
      if (this.totalPages && restore > this.totalPages) restore = this.totalPages;
      if (restore < 1) restore = 1;
      if (input.value !== String(restore)) {
        input.value = String(restore);
        input.dispatchEvent(new Event('input'));
      }
      return;
    }

    if (input.value !== String(value)) {
      input.value = String(value);
      input.dispatchEvent(new Event('input'));
    }
    this.lastValid = value;
  }

}
