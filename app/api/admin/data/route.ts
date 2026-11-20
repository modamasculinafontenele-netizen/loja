import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/store";
export const dynamic="force-dynamic";
export async function GET(request:Request){ if(!await isAdminRequest(request))return NextResponse.json({error:"Não autorizado"},{status:401}); try{return NextResponse.json(await getAdminData());}catch(e:any){return NextResponse.json({error:e.message},{status:500});} }
