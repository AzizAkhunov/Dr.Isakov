document.getElementById("sendBtn").addEventListener("click", async () => {
  const btn = document.getElementById("sendBtn");
  btn.disabled = true;

  const payload = {
    title: "Заявка с сайта",
    data: {
      Имя: document.getElementById("name").value,
      Телефон: document.getElementById("phone").value
    },
    page: window.location.href,
    ts: new Date().toISOString()
  };

  try {
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.ok) {
      showToast("✅ Успешно отправлено!", "success");
    } else {
      showToast("❌ Ошибка: " + (result.error || "Неизвестно"), "error");
    }
  } catch (err) {
    showToast("❌ Ошибка сети", "error");
  }

  setTimeout(() => {
    btn.disabled = false;
  }, 3000);
});

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}
