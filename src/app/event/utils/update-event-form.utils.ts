import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { EventInterface } from '../interfaces';

export function ensureTicketTypesForType(form: FormGroup, fb: FormBuilder, type?: string | null) {
  const ticketTypesArr = form.get('ticketTypes') as FormArray;
  const t = (type ?? '').toLowerCase();
  if (t === 'gratis') {
    const first = ticketTypesArr.at(0)?.value;
    const qty = first?.availableQuantity ?? 0;
    ticketTypesArr.clear();
    ticketTypesArr.push(fb.group({
      ticketTypeId: [first?.ticketTypeId ?? undefined],
      name: ['General'],
      description: [''],
      price: [0],
      availableQuantity: [qty]
    }));
    return;
  }

  const values = ticketTypesArr.value ?? [];
  const find = (name: string) => values.find((v: any) => (v.name ?? '').toLowerCase() === name.toLowerCase());
  const general = find('general') ?? values[0] ?? { name: 'General', price: 0, availableQuantity: 0 };
  const vip = find('vip') ?? values.find((v: any) => (v.name ?? '').toLowerCase() === 'vip') ?? { name: 'VIP', price: 0, availableQuantity: 0 };
  ticketTypesArr.clear();
  ticketTypesArr.push(fb.group({
    ticketTypeId: [general?.ticketTypeId ?? undefined],
    name: [general?.name ?? 'General'],
    description: [general?.description ?? ''],
    price: [general?.price ?? 0],
    availableQuantity: [general?.availableQuantity ?? 0]
  }));
  ticketTypesArr.push(fb.group({
    ticketTypeId: [vip?.ticketTypeId ?? undefined],
    name: [vip?.name ?? 'VIP'],
    description: [vip?.description ?? ''],
    price: [vip?.price ?? 0],
    availableQuantity: [vip?.availableQuantity ?? 0]
  }));
}

export function addTicketType(form: FormGroup, fb: FormBuilder, name = 'Custom') {
  const arr = form.get('ticketTypes') as FormArray;
  arr.push(fb.group({
    ticketTypeId: [undefined],
    name: [name],
    description: [''],
    price: [0],
    availableQuantity: [0]
  }));
}

export function removeTicketType(form: FormGroup, index: number) {
  const arr = form.get('ticketTypes') as FormArray;
  arr.removeAt(index);
}

export function updateTicketField(form: FormGroup, index: number, field: string, value: any) {
  const arr = form.get('ticketTypes') as FormArray;
  const ctl = arr.at(index);
  if (!ctl) return;
  const payload: any = {};
  if (field === 'price' || field === 'availableQuantity') payload[field] = value === '' ? 0 : Number(value);
  else payload[field] = value;
  ctl.patchValue(payload);
}

export function updateProductField(form: FormGroup, index: number, field: string, value: any) {
  const arr = form.get('products') as FormArray;
  const ctl = arr.at(index);
  if (!ctl) return;
  const payload: any = {};
  if (field === 'price' || field === 'stock') payload[field] = value === '' ? 0 : Number(value);
  else payload[field] = value;
  ctl.patchValue(payload);
}

export function getTicketSoldQuantity(form: FormGroup, original: EventInterface | null, index: number): number {
  const current = (form.get('ticketTypes') as FormArray).at(index)?.value;
  if (current && (current.soldQuantity !== undefined && current.soldQuantity !== null)) return Number(current.soldQuantity);
  const orig = original?.ticketTypes ?? [];
  const id = current?.ticketTypeId;
  if (id) {
    const found = orig.find((t: any) => t.ticketTypeId === id);
    if (found) return Number(found.soldQuantity ?? 0);
  }
  return 0;
}
