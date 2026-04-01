$(document).ready(function(){
    $('.Product-Slider').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToShow: 1,
        slidesToScroll: 1
    });
    $('.Customer-Slider').slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2000,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
        
    });
});


let Id = null;
let data = null;
let phone = null;
let whatsappPhone = null;
let assetBasePath = "./Assets";
let vcardFile = "";


async function loadData() {
  try {
    const response = await fetch("./data.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load data.json");
    }
    data = await response.json();
  } catch (error) {
    const fallbackNode = document.getElementById("profile-data-fallback");
    if (!fallbackNode) {
      throw error;
    }
    data = JSON.parse(fallbackNode.textContent);
  }
}

function resolveAssetPath(path) {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("./") || path.startsWith("../")) {
    return path;
  }
  return `${assetBasePath}/${path}`.replace(/\/{2,}/g, "/").replace(":/", "://");
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value || "";
  }
}

function setHtml(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.innerHTML = value || "";
  }
}

function bindOptionalLink(id, value) {
  const node = document.getElementById(id);
  if (!node) return;

  if (value) {
    node.href = value;
    node.style.display = "";
    return;
  }

  node.removeAttribute("href");
  node.style.display = "none";
}

function bindVisibleLink(id, primaryValue, fallbackValue = "") {
  const node = document.getElementById(id);
  if (!node) return;

  const resolvedValue = primaryValue || fallbackValue;
  if (resolvedValue) {
    node.href = resolvedValue;
    node.style.display = "";
    return;
  }

  node.removeAttribute("href");
  node.style.display = "none";
}

async function configurePdfLink(path) {
  const link = document.getElementById("pdfProfileLink");
  if (!link) return;

  if (!path) {
    link.classList.add("is-disabled");
    link.removeAttribute("href");
    return;
  }

  const resolvedPath = resolveAssetPath(path);
  link.href = resolvedPath;
  link.classList.remove("is-disabled");

  if (!window.location.protocol.startsWith("http")) {
    return;
  }

  try {
    const response = await fetch(resolvedPath, { method: "HEAD", cache: "no-store" });
    if (!response.ok) {
      throw new Error("Missing PDF");
    }
  } catch (error) {
    link.classList.add("is-disabled");
    link.removeAttribute("href");
  }
}

async function main() {
  await loadData();

  const p = data;
  assetBasePath = p.assetBasePath || "./Assets";
  vcardFile = p.vcardFile || `Profile/${p.firstname}.vcf`;
  Id = p.firstname;        
  phone = (p.country + p.phone).replace(/\s+/g, '').replace(/\+/g, '')
  whatsappPhone = (p.whatsappNumber || phone || "").replace(/\D+/g, "");

  document.documentElement.style.setProperty("--asset-page-bg", `url("${resolveAssetPath("PageBg.svg")}")`);
  document.documentElement.style.setProperty("--asset-bottom-bg", `url("${resolveAssetPath("BottomBuldingBg.svg")}")`);
  document.documentElement.style.setProperty("--asset-whatsapp-icon", `url("${resolveAssetPath("whatsapp_icon.svg")}")`);
  document.documentElement.style.setProperty("--asset-linkedin-icon", `url("${resolveAssetPath("linkedin_icon.svg")}")`);
  document.documentElement.style.setProperty("--asset-facebook-icon", `url("${resolveAssetPath("facebook_icon.svg")}")`);
  document.documentElement.style.setProperty("--asset-xcom-icon", `url("${resolveAssetPath("xcom_icon.svg")}")`);

  // ===== SET VALUES IN HTML =====
  setText("firstname", p.firstname);
  setText("lastname", p.lastname);
  setText("firstnamePreview", p.firstname);
  setText("lastnamePreview", p.lastname);
  setText("role", p.role);
  setText("rolePreview", p.role);
  setText("profile-summary", p.profileSummary || "");
  document.getElementById("profile-image").src = resolveAssetPath(p.profilePhoto || "Profile/Jaykumar.png");
  const previewProfileImage = document.getElementById("profile-image-preview");
  if (previewProfileImage) {
    previewProfileImage.src = resolveAssetPath(p.profileThumbnail || p.profilePhoto || "Profile/ProfileThumbnail.png");
  }
  setText("company-name", p.companyName || "");
  setHtml("company-description", p.companyDescriptionHtml || "");
  setText("company-address", p.companyAddress || "");

  // ===== Phone =====
  setText("country", p.country);
  setText("phone", p.phone);
  document.getElementById("phoneLink").href = `tel:+${phone}`;
  setText("companyCountry", p.country);
  setText("companyPhone", p.phone);
  if (document.getElementById("companyPhoneLink")) {
    document.getElementById("companyPhoneLink").href = `tel:+${phone}`;
  }

  // ===== Email =====
  setText("email", p.email);
  document.getElementById("emailLink").href = `mailto:${p.email}`;
  setText("companyEmail", p.email);
  if (document.getElementById("companyEmailLink")) {
    document.getElementById("companyEmailLink").href = `mailto:${p.email}`;
  }

  // ===== Website =====
  if (p.website) {
    document.getElementById("websiteLink").href = p.website;
  }
  setHtml("website", p.websiteLabel || "");
  bindVisibleLink("poweredByLinkMain", p.website);
  bindVisibleLink("poweredByLinkPreview", p.website);

  // ===== PDF Profile =====
  await configurePdfLink(p.pdfProfile);

  // ===== WhatsApp =====
  if (p.whatsappNumber || p.whatsapp) {
    const whatsappHref = p.whatsapp || `https://wa.me/${whatsappPhone}`;
    document.getElementById("whatsappLink").href = whatsappHref;
    const previewWhatsapp = document.getElementById("previewWhatsappLink");
    if (previewWhatsapp) {
      previewWhatsapp.href = whatsappHref;
      previewWhatsapp.style.display = "";
    }
  }else{
    document.getElementById("whatsappLink").style.display = 'none';
    const previewWhatsapp = document.getElementById("previewWhatsappLink");
    if (previewWhatsapp) {
      previewWhatsapp.style.display = "none";
    }
  }
  // ===== LinkedIn =====
  bindVisibleLink("linkedinLink", p.linkedin, p.website);
  bindVisibleLink("previewLinkedinLink", p.linkedin, p.website);

  const socialLinks = p.socialLinks || {};
  bindOptionalLink("company-youtube", socialLinks.youtube);
  bindOptionalLink("company-facebook", socialLinks.facebook);
  bindOptionalLink("company-instagram", socialLinks.instagram);
  bindOptionalLink("company-linkedin", socialLinks.linkedin);

  generateQrCodePreview(Id);
  imgGenerator();
}

main();



// function showVideo(num) {
//   const videos = document.querySelectorAll(".realestatemain1, .realestatemain2");
//   const tabs = document.querySelectorAll(".tab");

//   videos.forEach(video => {
//     video.pause();
//     video.classList.remove("active");
//     video.currentTime = 0;
//   });

//   tabs.forEach(tab => tab.classList.remove("active"));
//   const selectedVideo = qs("#video" + num);
//   selectedVideo.classList.add("active");
//   selectedVideo.play();

//   tabs[num - 1].classList.add("active");
// }


// function showVideo(num) {
//     const tabs = document.querySelectorAll(".tab");
//     const section1 = document.querySelector(".realestatemain1");
//     const section2 = document.querySelector(".realestatemain2");
//     const videos = document.querySelectorAll(".video");

//     videos.forEach(video => {
//         video.pause();
//         video.classList.remove("active");
//         video.currentTime = 0;
//     });

//     // Remove active class from all tabs
//     tabs.forEach(tab => tab.classList.remove("active"));
//     const selectedVideo = document.getElementById("video" + num);
//     selectedVideo.classList.add("active");
//     selectedVideo.play();

//     // Toggle sections (tabs remain visible)
//     if (num === 1) {
//         section1.style.display = "block";
//         section2.style.display = "none";
//     } else {
//         section1.style.display = "none";
//         section2.style.display = "block";
//     }

//     // Activate clicked tab
//     tabs[num - 1].classList.add("active");
// }


function generateQrCodePreview(Id) {
    if (!Id) return;
    let basePath = window.location.href.split("?")[0].split("#")[0];
    if (basePath.endsWith("index.html")) {
        basePath = basePath.replace(/index\.html$/, "");
    }
    const vcfUrl = `${basePath}?@=${Id}`;
    console.log("Generating QR for URL:", vcfUrl);
    QRCode.toString(vcfUrl, { type: "svg", width: 240, height: 240 ,  margin: 0 }, (err, svg) => {
        if (err) return console.error("QR Preview Error:", err);
        document.getElementById("qrcodePreview").innerHTML = svg;
    });
}

function imgGenerator() {
    const buttons = [
        document.getElementById("imgdownloadBtn"),
    ].filter(Boolean);
    const cardPreview = document.getElementById("download-area");
    if (buttons.length === 0 || !cardPreview) return;
    const copySection = document.getElementById("copyurl-section");
    const footerSection = document.getElementById("footer-section-preview");
    const footerLink = document.getElementById("footer-link");

    if (copySection) copySection.style.display = "none";
    if (footerSection) footerSection.style.display = "none";
    if (footerLink) footerLink.style.display = "flex";

    Promise.resolve()
      .then(() => html2canvas(cardPreview, {
          scale: 2,
          backgroundColor: "#fff",
          useCORS: true,
          windowWidth: 2560,
      }))
      .then((canvas) => {
          const aspectRatio = canvas.height / canvas.width;
          const targetWidth = 400;
          const targetHeight = targetWidth * aspectRatio;
          const resizedCanvas = document.createElement("canvas");
          resizedCanvas.width = targetWidth;
          resizedCanvas.height = targetHeight;
          const ctx = resizedCanvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
          const imgData = resizedCanvas.toDataURL("image/jpeg", 1);
          buttons.forEach((btn) => {
              btn.href = imgData;
              btn.download = `${Id}-DigiCard.jpeg`;
          });
      })
      .catch((err) => console.error("Image generation failed:", err))
      .finally(() => {
          if (copySection) copySection.style.display = "flex";
          if (footerSection) footerSection.style.display = "flex";
          if (footerLink) footerLink.style.display = "none";
      });
}


// Safer event bindings
document.getElementById("vcarddownloadBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const vcfPath = resolveAssetPath(vcardFile);
    const a = document. createElement("a");
    a.href = vcfPath;
    a.download = `${Id}.vcf`;
    a.click();
});

document.getElementById("vcarddownloadBtnMobile")?.addEventListener("click", (e) => {
    e.preventDefault();
    const vcfPath = resolveAssetPath(vcardFile);
    const a = document.createElement("a");
    a.href = vcfPath;
    a.download = `${Id}.vcf`;
    a.click();
});

document.getElementById("copyLink")?.addEventListener("click", async function(e) {
    e.preventDefault();
    const currentUrl = window.location.href;

    try {
        if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(currentUrl);
            return;
        }

        const textarea = document.createElement("textarea");
        textarea.value = currentUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    } catch (error) {
        console.error("Copy failed:", error);
    }
});

const cardPreview = document.getElementById("CardPreview");
const formContainer = document.getElementById("container");

function bindClick(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function (e) {
        e.preventDefault();
        handler(e);
    });
}

bindClick("qrpreviewbtn", function () {
    if (!cardPreview) return;
    cardPreview.style.top = "0";
    cardPreview.style.transition = "top 0.5s ease";
});

bindClick("qrpreviewbtnmobile", function () {
    if (!cardPreview) return;
    cardPreview.style.top = "0";
    cardPreview.style.transition = "top 0.5s ease";
});

bindClick("Closebtn", function () {
    if (!cardPreview) return;
    cardPreview.style.top = "-9999px";
});

if (cardPreview) {
    cardPreview.addEventListener("click", function (e) {
        if (e.target === this) {
            document.getElementById("Closebtn")?.click();
        }
    });
}

if (formContainer) {
    formContainer.addEventListener("click", function (e) {
        if (e.target === this) {
            document.getElementById("formclosebtn")?.click();
        }
    });
}


// ---------------- FORM FIELDS ----------------
const fields = {
    name: {
        input: document.getElementById("form-name"),
        error: document.getElementById("nameerr"),
        message: "Please enter your name",
        pattern: null,
        required: true
    },
    mobile: {
        input: document.getElementById("form-mobile"),
        error: document.getElementById("mobileerr"),
        message: "Enter a valid 10-digit mobile number",
        pattern: /^[6-9]\d{9}$/,
        required: true
    },
    email: {
        input: document.getElementById("form-email"),
        error: document.getElementById("emailerr"),
        message: "Enter a valid email address",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true
    },
    company: {
        input: document.getElementById("form-company"),
        required: false
    },
    digit: {
        input: document.getElementById("form-digit"),
        required: false
    }
};

// ---------------- SUBMIT FUNCTION ----------------
function sendToWhatsappLegacy() {
    let isValid = true;

    Object.values(fields).forEach(field => {
        const value = field.input?.value.trim() || "";

        if (field.required) {
            if (field.error) field.error.innerHTML = "";
            field.input.classList.remove("error");

            if (!value || (field.pattern && !field.pattern.test(value))) {
                if (field.error) field.error.innerHTML = field.message;
                field.input.classList.add("error");
                isValid = false;
            }
        }
    });

    if (!isValid) return;

    // ---------------- MESSAGE ----------------
    const message =
        `Name : ${fields.name.input.value}\n` +
        `Mobile : ${fields.mobile.input.value}\n` +
        `Email : ${fields.email.input.value}\n` +
        `Company : ${fields.company.input.value || "—"}\n` +
        `Digital Card : ${fields.digit.input.value || "—"}`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // ---------------- CLEAR FORM ----------------
    Object.values(fields).forEach(field => {
        field.input.value = "";
        if (field.error) field.error.innerHTML = "";
        field.input.classList.remove("error");
    });
}

function sendToWhatsapp() {
    let isValid = true;

    Object.values(fields).forEach(field => {
        const value = field.input?.value.trim() || "";

        if (field.required) {
            if (field.error) field.error.innerHTML = "";
            field.input.classList.remove("error");

            if (!value || (field.pattern && !field.pattern.test(value))) {
                if (field.error) field.error.innerHTML = field.message;
                field.input.classList.add("error");
                isValid = false;
            }
        }
    });

    if (!isValid) return;

    const message =
        `Name : ${fields.name.input.value}\n` +
        `Mobile : ${fields.mobile.input.value}\n` +
        `Email : ${fields.email.input.value}\n` +
        `Company : ${fields.company.input.value || "-"}\n` +
        `Digital Card : ${fields.digit.input.value || "-"}`;

    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    Object.values(fields).forEach(field => {
        field.input.value = "";
        if (field.error) field.error.innerHTML = "";
        field.input.classList.remove("error");
    });
}

// ---------------- LIVE ERROR CLEAR ----------------
Object.values(fields).forEach(field => {
    if (!field.required) return;

    field.input.addEventListener("input", () => {
        const value = field.input.value.trim();

        if (value && (!field.pattern || field.pattern.test(value))) {
            if (field.error) field.error.innerHTML = "";
            field.input.classList.remove("error");
        }
    });
});

// OPEN FORM
bindClick("openbtn", function () {
    const formcardPreview = document.getElementById("container");
    if (!formcardPreview) return;
    formcardPreview.style.top = "0";
    formcardPreview.style.transition = "top 0.5s ease";
});

// CLOSE FORM
bindClick("formclosebtn", function () {
    const formcardPreview = document.getElementById("container");
    if (!formcardPreview) return;
    formcardPreview.style.top = "-9999px";
});

bindClick("openbtnmobile", function () {
    const formcardPreview = document.getElementById("container");
    if (!formcardPreview) return;
    formcardPreview.style.top = "0";
    formcardPreview.style.transition = "top 0.5s ease";
});
