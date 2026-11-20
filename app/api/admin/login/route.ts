import { NextResponse } from "next/server";
import { adminCookie, checkCredentials, makeSession } from "@/lib/admin-auth";
export async function POST(request:Request){ const {username,password}=await request.json() as any; if(!await checkCredentials(String(username||""),String(password||"")))return NextResponse.json({error:"Usuário ou senha inválidos."},{status:401}); const response=NextResponse.json({ok:true}); response.headers.set("Set-Cookie",adminCookie(await makeSession(username))); return response; }
export async function DELETE(){ const response=NextResponse.json({ok:true}); response.headers.set("Set-Cookie","av_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"); return response; }
