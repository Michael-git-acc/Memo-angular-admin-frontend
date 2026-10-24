import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }

    const pad = (num: number): string => num.toString().padStart(2, '0');
    const jour = pad(date.getDate());
    const mois = pad(date.getMonth() + 1);
    const annee = date.getFullYear();
    const heures = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${jour}/${mois}/${annee} ${heures}:${minutes}`;
  }
}
