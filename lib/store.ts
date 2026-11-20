import { env } from "cloudflare:workers";

export type Variant = { id: string; size: string; color: string; stockQty: number; reservedQty: number; minStock: number; available: number };
export type Product = { id: string; name: string; slug: string; sku: string; description: string; category: string; price: number; promoPrice: number | null; costPrice: number; imageUrl: string; images: string[]; active: boolean; featured: boolean; createdAt: string; variants: Variant[]; available: number };
export type StoreSettings = { storeName:string; phone:string; whatsapp:string; instagram:string; address:string; defaultMinStock:number; logoUrl:string; updatedAt:string };

const seed = [
  { id:"p-essence", name:"Blazer Essence", sku:"AVE-BLZ-001", category:"Alfaiataria", price:389.9, promo:null, cost:162, featured:1, image:"https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=85", desc:"Alfaiataria leve, caimento estruturado e acabamento premium para composições versáteis.", colors:["Verde floresta","Preto"], sizes:["P","M","G"] },
  { id:"p-lume", name:"Vestido Lume", sku:"AVE-VST-002", category:"Vestidos", price:329.9, promo:279.9, cost:132, featured:1, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85", desc:"Vestido midi de linhas fluidas, cintura marcada e toque macio.", colors:["Oliva","Preto"], sizes:["P","M","G","GG"] },
  { id:"p-origem", name:"Camisa Origem", sku:"AVE-CAM-003", category:"Camisas", price:189.9, promo:null, cost:74, featured:0, image:"https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=85", desc:"Camisa essencial em tecido respirável, com modelagem contemporânea.", colors:["Off-white","Verde sálvia"], sizes:["P","M","G"] },
  { id:"p-nomade", name:"Calça Nômade", sku:"AVE-CAL-004", category:"Calças", price:259.9, promo:219.9, cost:98, featured:1, image:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1200&q=85", desc:"Cintura alta, corte reto e conforto para acompanhar diferentes rotinas.", colors:["Areia","Preto"], sizes:["36","38","40","42","44"] },
  { id:"p-raiz", name:"Camiseta Raiz", sku:"AVE-TSH-005", category:"Camisetas", price:119.9, promo:null, cost:42, featured:0, image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85", desc:"Algodão encorpado, gola reforçada e silhueta levemente ampla.", colors:["Preto","Musgo","Off-white"], sizes:["P","M","G","GG"] },
  { id:"p-aurora", name:"Jaqueta Aurora", sku:"AVE-JAQ-006", category:"Jaquetas", price:449.9, promo:null, cost:198, featured:1, image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85", desc:"Terceira peça marcante, acabamento fosco e construção confortável.", colors:["Preto","Verde escuro"], sizes:["P","M","G"] },
];

function db(){ if(!env.DB) throw new Error("Banco de dados indisponível"); return env.DB; }
function id(prefix:string){ return `${prefix}-${crypto.randomUUID()}`; }

export async function ensureSeeded(){
  const row = await db().prepare("SELECT COUNT(*) AS n FROM products").first<{n:number}>();
  if(Number(row?.n||0)>0) return;
  const stmts: D1PreparedStatement[]=[];
  for(const p of seed){
    stmts.push(db().prepare("INSERT OR IGNORE INTO products (id,name,slug,sku,description,category,price,promo_price,cost_price,image_url,active,featured) VALUES (?,?,?,?,?,?,?,?,?,?,1,?)").bind(p.id,p.name,p.id.slice(2),p.sku,p.desc,p.category,p.price,p.promo,p.cost,p.image,p.featured));
    p.colors.forEach((color,ci)=>p.sizes.forEach((size,si)=>stmts.push(db().prepare("INSERT OR IGNORE INTO variants (id,product_id,size,color,stock_qty,reserved_qty,min_stock) VALUES (?,?,?,?,?,0,3)").bind(`${p.id}-${ci}-${si}`,p.id,size,color,4+((ci+si)%7)))));
  }
  await db().batch(stmts);
}

export async function cleanupExpiredReservations(){
  const expired = await db().prepare("SELECT id FROM orders WHERE reservation_expires_at < datetime('now') AND status IN ('aguardando_analise','aguardando_pagamento') LIMIT 20").all<{id:string}>();
  for(const order of expired.results){
    const items=await db().prepare("SELECT variant_id, quantity FROM order_items WHERE order_id=?").bind(order.id).all<{variant_id:string;quantity:number}>();
    const stmts=items.results.map(i=>db().prepare("UPDATE variants SET reserved_qty=MAX(0,reserved_qty-?) WHERE id=?").bind(i.quantity,i.variant_id));
    stmts.push(db().prepare("UPDATE orders SET status='cancelado', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id));
    stmts.push(db().prepare("INSERT INTO order_history (id,order_id,from_status,to_status,actor) VALUES (?,?,?,'cancelado','sistema')").bind(id("hist"),order.id,"aguardando_analise"));
    await db().batch(stmts);
  }
}

function group(rows:any[]):Product[]{
  const map=new Map<string,Product>();
  for(const r of rows){
    if(!map.has(r.id)) map.set(r.id,{id:r.id,name:r.name,slug:r.slug,sku:r.sku,description:r.description,category:r.category,price:r.price,promoPrice:r.promo_price,costPrice:r.cost_price,imageUrl:r.image_url,images:[r.image_url],active:!!r.active,featured:!!r.featured,createdAt:r.created_at,variants:[],available:0});
    if(r.variant_id){ const available=Math.max(0,r.stock_qty-r.reserved_qty); map.get(r.id)!.variants.push({id:r.variant_id,size:r.size,color:r.color,stockQty:r.stock_qty,reservedQty:r.reserved_qty,minStock:r.min_stock,available}); map.get(r.id)!.available+=available; }
  }
  return [...map.values()];
}

export async function listProducts(includeInactive=false){
  await ensureSeeded(); await cleanupExpiredReservations();
  const rows=await db().prepare(`SELECT p.*,v.id variant_id,v.size,v.color,v.stock_qty,v.reserved_qty,v.min_stock FROM products p LEFT JOIN variants v ON v.product_id=p.id ${includeInactive?"":"WHERE p.active=1"} ORDER BY p.featured DESC,p.created_at DESC`).all();
  const products=group(rows.results as any[]);
  const imageRows=await db().prepare("SELECT product_id,image_url FROM product_images ORDER BY position,id").all<{product_id:string;image_url:string}>();
  const byProduct=new Map<string,string[]>();
  imageRows.results.forEach(row=>{if(!byProduct.has(row.product_id))byProduct.set(row.product_id,[]);byProduct.get(row.product_id)!.push(row.image_url)});
  products.forEach(product=>{const images=byProduct.get(product.id);if(images?.length){product.images=images;product.imageUrl=images[0]}});
  return products;
}

export async function getStoreSettings():Promise<StoreSettings>{
  await db().prepare("INSERT OR IGNORE INTO store_settings (id,store_name) VALUES ('main','Fontenele Moda Masculina')").run();
  const row=await db().prepare("SELECT * FROM store_settings WHERE id='main'").first<any>();
  return {storeName:row?.store_name||"Fontenele Moda Masculina",phone:row?.phone||"",whatsapp:row?.whatsapp||"",instagram:row?.instagram||"",address:row?.address||"",defaultMinStock:Number(row?.default_min_stock||3),logoUrl:row?.logo_url||"",updatedAt:row?.updated_at||""};
}

export async function saveStoreSettings(body:any){
  const storeName=String(body.storeName||"").trim();
  if(!storeName) throw new Error("Informe o nome da loja.");
  const minStock=Math.max(0,Math.floor(Number(body.defaultMinStock)||0));
  await db().prepare("INSERT INTO store_settings (id,store_name,phone,whatsapp,instagram,address,default_min_stock,logo_url,updated_at) VALUES ('main',?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET store_name=excluded.store_name,phone=excluded.phone,whatsapp=excluded.whatsapp,instagram=excluded.instagram,address=excluded.address,default_min_stock=excluded.default_min_stock,logo_url=excluded.logo_url,updated_at=CURRENT_TIMESTAMP").bind(storeName,String(body.phone||"").trim(),String(body.whatsapp||"").trim(),String(body.instagram||"").trim(),String(body.address||"").trim(),minStock,String(body.logoUrl||"").trim()).run();
  return getStoreSettings();
}

export async function createOrder(body:any){
  const items=Array.isArray(body.items)?body.items:[];
  if(!String(body.customerName||"").trim()||!String(body.customerPhone||"").trim()||items.length===0) throw new Error("Preencha nome, telefone e adicione ao menos um produto.");
  const selected:any[]=[]; let total=0;
  for(const item of items){
    const row=await db().prepare("SELECT v.*,p.name,p.price,p.promo_price,p.active FROM variants v JOIN products p ON p.id=v.product_id WHERE v.id=?").bind(String(item.variantId)).first<any>();
    const qty=Math.max(1,Math.min(20,Number(item.quantity)||1));
    if(!row||!row.active) throw new Error("Um dos produtos não está mais disponível.");
    if(row.stock_qty-row.reserved_qty<qty) throw new Error(`${row.name} não possui a quantidade solicitada.`);
    const unit=Number(row.promo_price??row.price); total+=unit*qty; selected.push({...row,qty,unit});
  }
  const orderId=id("ord"), orderNumber=`AV-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`;
  const expires=new Date(Date.now()+24*60*60*1000).toISOString().slice(0,19).replace("T"," ");
  const stmts:D1PreparedStatement[]=[];
  selected.forEach((s:any)=>stmts.push(db().prepare("UPDATE variants SET reserved_qty=reserved_qty+? WHERE id=?").bind(s.qty,s.id)));
  stmts.push(db().prepare("INSERT INTO orders (id,order_number,customer_name,customer_phone,customer_email,delivery_mode,address,notes,payment_method,status,total,reservation_expires_at) VALUES (?,?,?,?,?,?,?,?,?,'aguardando_analise',?,?)").bind(orderId,orderNumber,String(body.customerName).trim(),String(body.customerPhone).trim(),body.customerEmail||null,body.deliveryMode||"retirada",body.address||null,body.notes||null,body.paymentMethod||"pix",total,expires));
  selected.forEach((s:any)=>stmts.push(db().prepare("INSERT INTO order_items (id,order_id,product_id,variant_id,product_name,size,color,quantity,unit_price,subtotal) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(id("item"),orderId,s.product_id,s.id,s.name,s.size,s.color,s.qty,s.unit,s.unit*s.qty)));
  stmts.push(db().prepare("INSERT INTO order_history (id,order_id,from_status,to_status,actor) VALUES (?,?,NULL,'aguardando_analise','cliente')").bind(id("hist"),orderId));
  try{ await db().batch(stmts); }catch{ throw new Error("O estoque mudou durante a finalização. Revise o carrinho e tente novamente."); }
  return {id:orderId,orderNumber,total,status:"aguardando_analise"};
}

export async function getAdminData(){
  const products=await listProducts(true);
  const activeProducts=products.filter(p=>p.active);
  const settings=await getStoreSettings();
  const orders=await db().prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200").all<any>();
  const items=await db().prepare("SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders ORDER BY created_at DESC LIMIT 200) ORDER BY rowid DESC").all<any>();
  const byOrder=new Map<string,any[]>(); for(const i of items.results){ if(!byOrder.has(i.order_id))byOrder.set(i.order_id,[]); byOrder.get(i.order_id)!.push(i); }
  const orderList=orders.results.map(o=>({...o,items:byOrder.get(o.id)||[]}));
  const paid=orderList.filter(o=>['pagamento_confirmado','em_separacao','pronto_retirada','entregue'].includes(o.status));
  const month=new Date().toISOString().slice(0,7);
  return {products,orders:orderList,settings,metrics:{revenue:paid.reduce((a,o)=>a+Number(o.total),0),monthRevenue:paid.filter(o=>String(o.created_at).startsWith(month)).reduce((a,o)=>a+Number(o.total),0),orders:orderList.length,pending:orderList.filter(o=>o.status==='aguardando_analise').length,products:activeProducts.length,lowStock:activeProducts.reduce((a,p)=>a+p.variants.filter(v=>v.available<=v.minStock).length,0),outOfStock:activeProducts.reduce((a,p)=>a+p.variants.filter(v=>v.available===0).length,0)}};
}

export async function saveProduct(body:any){
  const productId=body.id||id("prd"), slug=String(body.name||"produto").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+productId.slice(-5);
  const imageUrls=[...new Set((Array.isArray(body.imageUrls)?body.imageUrls:[body.imageUrl]).map((value:any)=>String(value||"").trim()).filter(Boolean))].slice(0,6) as string[];
  const name=String(body.name||"").trim(),sku=String(body.sku||"").trim(),imageUrl=imageUrls[0]||"",price=Number(body.price);
  if(!name||!sku||!imageUrl||!Number.isFinite(price)||price<0) throw new Error("Preencha nome, SKU, imagem e um preço válido.");
  const promoPrice=body.promoPrice!==""&&body.promoPrice!=null?Number(body.promoPrice):null;
  const featured=body.featured===true||body.featured==="on"?1:0;
  const active=body.active===false?0:1;
  if(body.id){
    const exists=await db().prepare("SELECT id FROM products WHERE id=?").bind(productId).first();
    if(!exists) throw new Error("Produto não encontrado.");
    await db().prepare("UPDATE products SET name=?,sku=?,description=?,category=?,price=?,promo_price=?,cost_price=?,image_url=?,active=?,featured=? WHERE id=?").bind(name,sku,body.description||"",body.category||"Outros",price,promoPrice,Number(body.costPrice||0),imageUrl,active,featured,productId).run();
  }
  else await db().prepare("INSERT INTO products (id,name,slug,sku,description,category,price,promo_price,cost_price,image_url,active,featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(productId,name,slug,sku,body.description||"",body.category||"Outros",price,promoPrice,Number(body.costPrice||0),imageUrl,1,featured).run();
  const imageStatements:D1PreparedStatement[]=[db().prepare("DELETE FROM product_images WHERE product_id=?").bind(productId)];
  imageUrls.forEach((url,position)=>imageStatements.push(db().prepare("INSERT INTO product_images (id,product_id,image_url,position) VALUES (?,?,?,?)").bind(id("img"),productId,url,position)));
  await db().batch(imageStatements);
  if(!body.id){ const sizes=String(body.sizes||"P,M,G").split(",").map((x:string)=>x.trim()).filter(Boolean), colors=String(body.colors||"Preto").split(",").map((x:string)=>x.trim()).filter(Boolean); const stmts:D1PreparedStatement[]=[]; const defaultMinStock=(await getStoreSettings()).defaultMinStock; colors.forEach((c:string)=>sizes.forEach((s:string)=>stmts.push(db().prepare("INSERT INTO variants (id,product_id,size,color,stock_qty,reserved_qty,min_stock) VALUES (?,?,?,?,?,0,?)").bind(id("var"),productId,s,c,Number(body.stock||0),Number(body.minStock||defaultMinStock))))); if(stmts.length)await db().batch(stmts); }
  return productId;
}

export async function deleteProductPermanently(productId:string){
  const exists=await db().prepare("SELECT id FROM products WHERE id=?").bind(productId).first();
  if(!exists) throw new Error("Produto não encontrado.");
  const variants=await db().prepare("SELECT id FROM variants WHERE product_id=?").bind(productId).all<{id:string}>();
  const statements:D1PreparedStatement[]=[];
  for(const variant of variants.results){
    statements.push(db().prepare("DELETE FROM stock_movements WHERE variant_id=?").bind(variant.id));
    // order_items mantém nome, tamanho, cor, quantidade e valores como histórico; as referências viram NULL pela FK.
    statements.push(db().prepare("UPDATE order_items SET product_id=NULL,variant_id=NULL WHERE variant_id=?").bind(variant.id));
  }
  statements.push(db().prepare("DELETE FROM product_images WHERE product_id=?").bind(productId));
  statements.push(db().prepare("DELETE FROM variants WHERE product_id=?").bind(productId));
  statements.push(db().prepare("DELETE FROM products WHERE id=?").bind(productId));
  await db().batch(statements);
}

export async function setProductActive(productId:string,active:boolean){
  const product=await db().prepare("SELECT id FROM products WHERE id=?").bind(productId).first();
  if(!product) throw new Error("Produto não encontrado.");
  await db().prepare("UPDATE products SET active=? WHERE id=?").bind(active?1:0,productId).run();
}

export async function changeOrderStatus(orderId:string,next:string,actor="administrador"){
  const order=await db().prepare("SELECT status FROM orders WHERE id=?").bind(orderId).first<{status:string}>(); if(!order)throw new Error("Pedido não encontrado.");
  const valid=['aguardando_analise','aguardando_pagamento','pagamento_confirmado','em_separacao','pronto_retirada','entregue','cancelado']; if(!valid.includes(next))throw new Error("Status inválido.");
  const items=await db().prepare("SELECT variant_id,quantity FROM order_items WHERE order_id=? AND variant_id IS NOT NULL").bind(orderId).all<{variant_id:string;quantity:number}>(); const stmts:D1PreparedStatement[]=[];
  const pending=['aguardando_analise','aguardando_pagamento'].includes(order.status);
  const completesReservation=['pagamento_confirmado','em_separacao','pronto_retirada','entregue'].includes(next);
  if(order.status==='cancelado'&&next!=='cancelado') throw new Error("Pedidos cancelados não podem ser reabertos.");
  if(!pending&&['aguardando_analise','aguardando_pagamento'].includes(next)) throw new Error("Não é possível retornar um pedido já confirmado para a etapa de reserva.");
  if(pending&&next==='cancelado') items.results.forEach(i=>stmts.push(db().prepare("UPDATE variants SET reserved_qty=MAX(0,reserved_qty-?) WHERE id=?").bind(i.quantity,i.variant_id)));
  if(pending&&completesReservation) items.results.forEach(i=>{stmts.push(db().prepare("UPDATE variants SET stock_qty=stock_qty-?,reserved_qty=reserved_qty-? WHERE id=?").bind(i.quantity,i.quantity,i.variant_id)); stmts.push(db().prepare("INSERT INTO stock_movements (id,variant_id,type,quantity,reason,actor) VALUES (?,?,'saida',?,'Venda confirmada',?)").bind(id("mov"),i.variant_id,i.quantity,actor));});
  if(!pending&&order.status!=='cancelado'&&next==='cancelado') items.results.forEach(i=>{stmts.push(db().prepare("UPDATE variants SET stock_qty=stock_qty+? WHERE id=?").bind(i.quantity,i.variant_id)); stmts.push(db().prepare("INSERT INTO stock_movements (id,variant_id,type,quantity,reason,actor) VALUES (?,?,'entrada',?,'Cancelamento de venda',?)").bind(id("mov"),i.variant_id,i.quantity,actor));});
  stmts.push(db().prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(next,orderId)); stmts.push(db().prepare("INSERT INTO order_history (id,order_id,from_status,to_status,actor) VALUES (?,?,?,?,?)").bind(id("hist"),orderId,order.status,next,actor)); await db().batch(stmts);
}

export async function adjustStock(variantId:string,delta:number,reason:string){
  await db().batch([db().prepare("UPDATE variants SET stock_qty=stock_qty+? WHERE id=?").bind(delta,variantId),db().prepare("INSERT INTO stock_movements (id,variant_id,type,quantity,reason,actor) VALUES (?,?,?,?,?,'administrador')").bind(id("mov"),variantId,delta>=0?'entrada':'saida',Math.abs(delta),reason||'Ajuste manual')]);
}
