const sb = window.supabase.createClient(
    window.SOMEPEACE_SUPABASE_URL,
    window.SOMEPEACE_SUPABASE_ANON_KEY
);

const fallbackProducts = [
 {id:"local-1",name:"Rossberry Platinum",category:"Ankara",description:"Bold circular pattern with rich red, black and white tones.",badge:"FEATURED",image_url:"assets/somepeace-ankara-rossberry.jpg"},
 {id:"local-2",name:"Textured Collection",category:"Fabrics",description:"Soft-looking textured fabrics available in beautiful colours.",badge:"COLOURS",image_url:"assets/somepeace-fabric-1.jpg"},
 {id:"local-3",name:"Statement Prints",category:"Embroidered",description:"Decorative patterns made to stand out at special occasions.",badge:"DETAILS",image_url:"assets/somepeace-fabric-2.webp"},
 {id:"local-4",name:"More Fabrics",category:"Fabrics",description:"More product photos will be added as the collection expands.",badge:"COMING SOON",image_url:"assets/somepeace-promo.jpg?v=2"}
];

const grid = document.getElementById("products-grid");
const wa = n => `https://wa.me/2349159186865?text=${encodeURIComponent("Hello SOMEPEACE FABRICS, I'm interested in " + n + ". Please send me the price and availability.")}`;

function card(p, i){
 return `<article class="card">
   <div class="card-img"><img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}" loading="lazy">${p.badge?`<span class="badge">${escapeHtml(p.badge)}</span>`:""}</div>
   <div class="card-body"><span class="number">${String(i+1).padStart(2,"0")} • ${escapeHtml((p.category||"FABRICS").toUpperCase())}</span>
   <h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description||"Beautiful fabric from SOMEPEACE FABRICS.")}</p>
   <a href="${wa(p.name)}" target="_blank" rel="noopener">Enquire on WhatsApp →</a></div></article>`;
}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
async function loadProducts(){
 try{
   if(window.SOMEPEACE_SUPABASE_URL.startsWith("YOUR_")) throw new Error("not configured");
   const {data,error}=await sb.from("fabrics").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
   if(error) throw error;
   grid.innerHTML = data?.length ? data.map(card).join("") : `<div class="empty">No fabrics have been added yet.</div>`;
 }catch(e){
   grid.innerHTML=fallbackProducts.map(card).join("");
 }
}
loadProducts();
document.querySelector(".menu")?.addEventListener("click",()=>{const n=document.querySelector(".nav"),b=document.querySelector(".menu");const o=n.classList.toggle("open");b.setAttribute("aria-expanded",o)});
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav").classList.remove("open")));
document.getElementById("year").textContent=new Date().getFullYear();
