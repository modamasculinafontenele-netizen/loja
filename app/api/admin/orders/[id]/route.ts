import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { changeOrderStatus } from "@/lib/store";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){ if(!await isAdminRequest(request))return NextResponse.json({error:"Não autorizado"},{status:401}); try{ const {id}=await params,{status}=await request.json() as any; await changeOrderStatus(id,status); return NextResponse.json({ok:true}); }catch(e:any){return NextResponse.json({error:e.message},{status:400});} }
