document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("subscribe-form");
    const emailInput = document.getElementById("email");
    const btn = document.getElementById("submit-btn");
    const inputGroup = form.querySelector(".input-group");
    const successMsg = document.getElementById("success-message");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        if (!emailValue) return;

        // Button loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span style="opacity: 0.8;">Verzenden...</span>';
        btn.disabled = true;

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailValue })
            });

            if (!res.ok) {
                throw new Error("Request failed");
            }

            // Success animatie
            setTimeout(() => {
                inputGroup.style.opacity = "0";
                inputGroup.style.transform = "translateY(10px) scale(0.95)";
                inputGroup.style.pointerEvents = "none";

                setTimeout(() => {
                    successMsg.classList.add("show");
                    emailInput.value = "";
                }, 400);
            }, 800);

        } catch (error) {
            console.error("Error:", error);

            // Reset button bij fout
            btn.innerHTML = originalText;
            btn.disabled = false;

            alert("Er ging iets mis. Probeer opnieuw.");
        }
    });
});
