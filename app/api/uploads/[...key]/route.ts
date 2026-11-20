import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

export async function GET(_request:Request,{params}:{params:Promise<{key:string[]}>}){
  if(!env.BUCKET) return NextResponse.json({error:"Imagem não encontrada."},{status:404});
  const {key}=await params,object=await env.BUCKET.get(key.join("/"));
  if(!object) return NextResponse.json({error:"Imagem não encontrada."},{status:404});
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("cache-control",headers.get("cache-control")||"public, max-age=31536000, immutable");
  return new Response(object.body,{headers});
}
