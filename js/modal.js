const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("tg-form");

let formOpenedAt = Date.now();

// --- TOAST ---
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- MODAL ---
function openModal() {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    formOpenedAt = Date.now();
}

closeBtn.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

// --- FORM ---
form.onsubmit = async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button");

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("tg_user").value.replace("@", "").trim();
    const age = document.getElementById("age").value.trim();
    const reason = document.getElementById("reason").value.trim();
    const website = document.getElementById("website").value;

    // honeypot (на фронте тоже)
    if (website) return;

    btn.innerText = "SYSTEM PROCESSING...";
    btn.disabled = true;

    try {
        const res = await fetch("/api/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                username,
                age,
                reason,
                timestamp: formOpenedAt,
                website
            })
        });

        if (res.status === 403) {
            showToast("Система закрыта. 09:00–18:00", "error");
            throw new Error();
        }

        if (res.status === 429) {
            showToast("Слишком много попыток. Подожди.", "error");
            throw new Error();
        }

        if (!res.ok) throw new Error();

        showToast("Заявка принята. Система обработает.", "success");

        form.reset();
        modal.style.display = "none";

    } catch {
        showToast("Ошибка. Попробуй позже.", "error");
    } finally {
        btn.innerText = "Apply";
        btn.disabled = false;
        document.body.style.overflow = "auto";
    }
};