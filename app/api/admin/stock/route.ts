import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { adjustStock } from "@/lib/store";
export async function POST(request:Request){ if(!await isAdminRequest(request))return NextResponse.json({error:"Não autorizado"},{status:401}); try{ const b=await request.json() as any; await adjustStock(b.variantId,Number(b.delta),b.reason); return NextResponse.json({ok:true}); }catch(e:any){return NextResponse.json({error:e.message},{status:400});} }
