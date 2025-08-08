document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    const exportBtn = document.getElementById("exportBtn");
    const closeBtn = document.getElementById("closePopup");
    
    const tabs = document.querySelectorAll(".tab"); 
    const tabContents = document.querySelectorAll(".tab-content");
    const downloadBtn = document.getElementById("downloadBtn"); // Get the download button

    const showPopup = () => popup.classList.remove("hidden");
    const hidePopup = () => popup.classList.add("hidden");

    exportBtn.addEventListener("click", showPopup);
    closeBtn.addEventListener("click", hidePopup);

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));

            tab.classList.add("active");
            const tabId = tab.dataset.tab;
            document.getElementById(tabId).classList.add("active");

            // UPDATED: Change button text based on active tab
            if (tabId === 'htmlcss') {
                downloadBtn.textContent = 'Download HTML CSS Project';
            } else {
                downloadBtn.textContent = 'Download Next JS Project';
            }
        });
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            hidePopup();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!popup.classList.contains("hidden") && event.key === "Escape") {
            hidePopup();
        }
    });
});
