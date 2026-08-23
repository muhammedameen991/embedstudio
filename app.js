const $ = s => document.querySelector(s);

const title = $("#title");
const poster = $("#poster");
const source = $("#source");
const frame = $("#frame");
const shell = $("#playerShell");
const empty = $("#emptyState");
const previewTitle = $("#previewTitle");
const posterMini = $("#posterMini");
const codeOutput = $("#codeOutput");

document.querySelectorAll(".segmented button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segmented button").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    applyRatio(btn.dataset.ratio);
  });
});

function applyRatio(ratio){
  shell.classList.remove("square","r43");
  if(ratio === "1/1") shell.classList.add("square");
  if(ratio === "4/3") shell.classList.add("r43");
}

function escapeHTML(value){
  return value.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function validURL(value){
  try {
    const u = new URL(value);
    return ["http:","https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function buildCode(url, label){
  return `<iframe
  src="${escapeHTML(url)}"
  title="${escapeHTML(label)}"
  width="100%"
  height="100%"
  style="border:0;aspect-ratio:16/9;border-radius:16px;display:block"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen>
</iframe>`;
}

function generate(){
  const url = source.value.trim();
  const name = title.value.trim() || "My Video";

  if(!validURL(url)){
    source.focus();
    source.style.borderColor = "#ef4444";
    setTimeout(() => source.style.borderColor = "", 900);
    return;
  }

  frame.src = url;
  frame.title = name;
  shell.classList.add("has-video");
  empty.style.display = "none";
  previewTitle.textContent = name;

  posterMini.style.backgroundImage = poster.value.trim()
    ? `url("${poster.value.trim().replace(/"/g,'\\"')}")`
    : "";
  posterMini.querySelector("span").style.display = poster.value.trim() ? "none" : "block";

  shell.classList.toggle("shadow", $("#shadow").checked);
  shell.classList.toggle("rounded", $("#rounded").checked);

  codeOutput.innerHTML = `<code>${escapeHTML(buildCode(url, name))}</code>`;

  localStorage.setItem("embedstudio:last", JSON.stringify({
    title:name, poster:poster.value.trim(), source:url,
    ratio:document.querySelector(".segmented button.active").dataset.ratio
  }));
}

$("#generate").addEventListener("click", generate);

$("#previewTop").addEventListener("click", () => {
  document.querySelector(".preview-col").scrollIntoView({behavior:"smooth", block:"center"});
});

$("#docsBtn").addEventListener("click", () => {
  $("#guide").scrollIntoView({behavior:"smooth"});
});

$("#fullscreenBtn").addEventListener("click", () => {
  if(document.fullscreenElement) document.exitFullscreen();
  else shell.requestFullscreen?.();
});

$("#copyBtn").addEventListener("click", async () => {
  const text = codeOutput.innerText;
  if(!text || text.startsWith("<!--")) return;

  try {
    await navigator.clipboard.writeText(text);
    const btn = $("#copyBtn");
    btn.textContent = "Copied ✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy code";
      btn.classList.remove("copied");
    }, 1600);
  } catch {
    alert("Copy failed. Select the code manually.");
  }
});

$("#rounded").addEventListener("change", e => {
  shell.style.borderRadius = e.target.checked ? "16px" : "0";
});

$("#shadow").addEventListener("change", e => {
  shell.classList.toggle("shadow", e.target.checked);
});

const saved = localStorage.getItem("embedstudio:last");
if(saved){
  try{
    const d = JSON.parse(saved);
    title.value = d.title || "My Video";
    poster.value = d.poster || "";
    source.value = d.source || "";
    if(d.ratio){
      const btn = document.querySelector(`[data-ratio="${d.ratio}"]`);
      if(btn){ btn.click(); }
    }
  }catch{}
}
