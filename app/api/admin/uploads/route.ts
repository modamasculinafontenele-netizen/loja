import { Buffer } from "node:buffer";
import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

const MAX_FILE_SIZE=5*1024*1024; // limite de segurança após a compressão no navegador

export async function POST(request:Request){
  if(!await isAdminRequest(request)) return NextResponse.json({error:"Não autorizado"},{status:401});
  try{
    const form=await request.formData(),file=form.get("file");
    if(!(file instanceof File)||file.size===0) throw new Error("Selecione uma imagem.");
    if(!file.type.startsWith("image/")) throw new Error("O arquivo selecionado não é uma imagem.");
    if(file.size>MAX_FILE_SIZE) throw new Error("Cada imagem deve ter no máximo 5 MB.");
    const extension=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,5)||"jpg";
    const key=`products/${crypto.randomUUID()}.${extension}`;
    const contents=await file.arrayBuffer();
    if(env.BUCKET){
      await env.BUCKET.put(key,contents,{httpMetadata:{contentType:file.type,cacheControl:"public, max-age=31536000, immutable"}});
      return NextResponse.json({url:`/api/uploads/${key}`});
    }
    const dataUrl=`data:${file.type};base64,${Buffer.from(contents).toString("base64")}`;
    return NextResponse.json({url:dataUrl});
  }catch(error:any){
    const message=String(error?.message||"Não foi possível enviar a imagem.");
    const tooLarge=/payload too large|body too large|request entity too large|content-length/i.test(message);
    return NextResponse.json({error:tooLarge?"A imagem enviada ultrapassou o limite aceito pelo servidor. Reduza o tamanho da foto e tente novamente.":message},{status:tooLarge?413:400});
  }
}
