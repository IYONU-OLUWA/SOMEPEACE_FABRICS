const sb = window.supabase.createClient(
    window.SOMEPEACE_SUPABASE_URL,
    window.SOMEPEACE_SUPABASE_ANON_KEY
);
const ADMIN_USER_ID = "7d8f5687-0abd-4778-9bc3-3d642785938b";
const loginPanel=document.getElementById("loginPanel"),dashboard=document.getElementById("dashboard"),logoutBtn=document.getElementById("logoutBtn"),modal=document.getElementById("modal");
const list=document.getElementById("productList"),status=document.getElementById("status"),form=document.getElementById("productForm"),preview=document.getElementById("preview");
let currentImageUrl="";

function configured(){return !window.SOMEPEACE_SUPABASE_URL.startsWith("YOUR_") && !window.SOMEPEACE_SUPABASE_ANON_KEY.startsWith("YOUR_")}
function msg(el,text,error=false){el.textContent=text;el.className="message "+(error?"error":"success");if(!text)el.className="message";}
async function checkAndSetUI(session){
 if (session && session.user && session.user.id !== ADMIN_USER_ID) {
    await sb.auth.signOut();
    alert("Access denied. You are not authorized to access the SOMEPEACE admin panel.");
    setUI(null);
    return;
 }
 setUI(session);
}
async function boot(){
 if(!configured()){msg(document.getElementById("loginMessage"),"Connect your Supabase project first by filling supabase-config.js.",true);return;}
 const {data:{session}}=await sb.auth.getSession();
 await checkAndSetUI(session);
 sb.auth.onAuthStateChange((_e,s)=>checkAndSetUI(s));
}
function setUI(session){if(session){loginPanel.classList.add("hidden");dashboard.classList.remove("hidden");logoutBtn.classList.remove("hidden");loadList()}else{loginPanel.classList.remove("hidden");dashboard.classList.add("hidden");logoutBtn.classList.add("hidden")}}
document.getElementById("loginForm").addEventListener("submit",async e=>{e.preventDefault();const email=document.getElementById("email").value,password=document.getElementById("password").value;const {error}=await sb.auth.signInWithPassword({email,password});msg(document.getElementById("loginMessage"),error?error.message:"")});
logoutBtn.addEventListener("click",()=>sb.auth.signOut());
document.getElementById("addBtn").addEventListener("click",()=>openModal());
document.getElementById("closeModal").addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});

async function loadList(){
 const {data,error}=await sb.from("fabrics").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
 if(error){msg(status,error.message,true);return}
 msg(status,`${data.length} fabric${data.length===1?"":"s"} in your collection.`);
 list.innerHTML=data.map(p=>`<article class="admin-card"><img src="${esc(p.image_url)}" alt=""><div><span>${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><div class="actions"><button data-edit="${p.id}">Edit</button><button class="danger" data-delete="${p.id}">Delete</button></div></div></article>`).join("")||"<p>No fabrics yet. Click Add fabric.</p>";
 list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));
 list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.delete));
}
async function editProduct(id){
 const {data,error}=await sb.from("fabrics").select("*").eq("id",id).single(); if(error)return msg(status,error.message,true);
 document.getElementById("productId").value=data.id;document.getElementById("name").value=data.name;document.getElementById("category").value=data.category;document.getElementById("description").value=data.description||"";document.getElementById("badge").value=data.badge||"";currentImageUrl=data.image_url;preview.innerHTML=`<img src="${esc(currentImageUrl)}" alt="">`;document.getElementById("modalTitle").textContent="Edit Fabric";modal.classList.remove("hidden");
}
function openModal(){form.reset();document.getElementById("productId").value="";currentImageUrl="";preview.innerHTML="";document.getElementById("modalTitle").textContent="Add Fabric";document.getElementById("formMessage").textContent="";modal.classList.remove("hidden")}
function closeModal(){modal.classList.add("hidden")}
document.getElementById("image").addEventListener("change",()=>{const f=document.getElementById("image").files[0];if(f)preview.innerHTML=`<img src="${URL.createObjectURL(f)}" alt="">`});
form.addEventListener("submit",async e=>{
 e.preventDefault();const button=form.querySelector("button[type=submit]");button.disabled=true;msg(document.getElementById("formMessage"),"Saving…");
 try{
  const id=document.getElementById("productId").value,name=document.getElementById("name").value.trim(),category=document.getElementById("category").value,description=document.getElementById("description").value.trim(),badge=document.getElementById("badge").value.trim(),file=document.getElementById("image").files[0];
  let image_url=currentImageUrl;
  if (file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, PNG, and WebP images are allowed.");
    }

    if (file.size > maxSize) {
        throw new Error("Image must be 5 MB or smaller.");
    }

    const extensionMap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    };

    const extension = extensionMap[file.type];
    const path = `${crypto.randomUUID()}.${extension}`;

    const up = await sb.storage
        .from("product-images")
        .upload(path, file, {
            upsert: false,
            contentType: file.type
        });

    if (up.error) throw up.error;

    image_url = sb.storage
        .from("product-images")
        .getPublicUrl(path)
        .data
        .publicUrl;
}
  if(!image_url)throw new Error("Please choose a fabric image.");
  const payload={name,category,description,badge,image_url};
  let result=id?await sb.from("fabrics").update(payload).eq("id",id):await sb.from("fabrics").insert(payload);
  if(result.error)throw result.error;closeModal();msg(status,id?"Fabric updated successfully.":"Fabric added successfully.");await loadList();
 }catch(err){msg(document.getElementById("formMessage"),err.message,true)}finally{button.disabled=false}
});
async function deleteProduct(id){
 if(!confirm("Delete this fabric from the collection?"))return;const {error}=await sb.from("fabrics").delete().eq("id",id);if(error)msg(status,error.message,true);else{msg(status,"Fabric deleted.");loadList()}
}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
boot();
