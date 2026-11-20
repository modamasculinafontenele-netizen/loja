import { env } from "cloudflare:workers";

const enc=new TextEncoder();
function cfg(){ return env as unknown as Record<string,string>; }
async function sign(value:string){ const secret=cfg().SESSION_SECRET||"";if(secret.length<32)throw new Error("Configure SESSION_SECRET com pelo menos 32 caracteres.");const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]); const sig=await crypto.subtle.sign("HMAC",key,enc.encode(value)); return btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll("+","-").replaceAll("/","_").replaceAll("=",""); }
export async function makeSession(username:string){ const payload=btoa(JSON.stringify({u:username,e:Date.now()+8*60*60*1000})).replaceAll("+","-").replaceAll("/","_").replaceAll("=",""); return `${payload}.${await sign(payload)}`; }
export async function checkCredentials(username:string,password:string){
  const configuredPassword=cfg().ADMIN_PASSWORD||"";
  return configuredPassword.length>0&&username===(cfg().ADMIN_USERNAME||"admin")&&password===configuredPassword;
}
export async function isAdminRequest(request:Request){ const raw=request.headers.get("cookie")?.match(/(?:^|;\s*)av_session=([^;]+)/)?.[1]; if(!raw)return false; const [payload,sig]=raw.split("."); if(!payload||!sig||(await sign(payload))!==sig)return false; try{ const data=JSON.parse(atob(payload.replaceAll("-","+").replaceAll("_","/"))); return data.e>Date.now()&&data.u===(cfg().ADMIN_USERNAME||"admin"); }catch{return false;} }
export function adminCookie(token:string){ return `av_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`; }
