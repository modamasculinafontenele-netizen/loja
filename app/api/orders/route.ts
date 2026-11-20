import { NextResponse } from "next/server";
import { createOrder } from "@/lib/store";
export async function POST(request:Request){ try{return NextResponse.json({order:await createOrder(await request.json())},{status:201});}catch(e:any){return NextResponse.json({error:e.message},{status:400});} }
