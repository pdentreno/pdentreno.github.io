window.addEventListener("DOMContentLoaded", () => {
    document.title = "PD Timer";

    document.querySelectorAll("[data-target]").forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.dataset.target;
            if (target) window.location.href = target;
        });
    });
});