import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { saveStoreSettings } from "@/lib/store";

export async function PUT(request:Request){
  if(!await isAdminRequest(request)) return NextResponse.json({error:"Não autorizado"},{status:401});
  try{return NextResponse.json({settings:await saveStoreSettings(await request.json())});}
  catch(error:any){return NextResponse.json({error:error.message},{status:400});}
}
