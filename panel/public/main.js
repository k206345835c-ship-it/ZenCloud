function show(id){
 document.querySelectorAll(".tab").forEach(x=>x.style.display="none");
 document.getElementById(id).style.display="block";
}

fetch("/api/user").then(r=>r.json()).then(u=>{
 document.getElementById("adminBtn").style.display="block";
});

fetch("/api/wallet/me").then(r=>r.json()).then(d=>{
 document.getElementById("balance").innerText=d.balance+" PLN";
});

function addMoney(){
 fetch("/api/wallet/add",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({
   userId:uid.value,
   amount:amount.value
  })
 });
}
