import { ProductRequest } from '../interfaces';

export function buildTicketTypesPayload(ticketTypesForm: any[]): any[] {
  return (ticketTypesForm ?? []).map((t: any) => {
    const out: any = {
      name: t.name,
      description: t.description,
      price: t.price,
      availableQuantity: t.availableQuantity
    };
    if (t.ticketTypeId) out.ticketTypeId = t.ticketTypeId;
    return out;
  });
}

export function buildProductPayload(existingProducts: any[], createdProducts: any[]): ProductRequest[] {
  const out: ProductRequest[] = [];
  for (const p of existingProducts ?? []) {
    const item: any = {
      productId: p.productId,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock
    };
    if (p.imageUrl) item.imageUrl = p.imageUrl;
    out.push(item);
  }
  for (const cp of createdProducts ?? []) {
    out.push({
      productId: (cp as any).productId,
      name: (cp as any).name,
      description: (cp as any).description,
      price: (cp as any).price,
      stock: (cp as any).stock,
      imageUrl: (cp as any).imageUrl
    });
  }
  return out;
}
