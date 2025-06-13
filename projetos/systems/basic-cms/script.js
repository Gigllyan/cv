document.addEventListener('DOMContentLoaded', () => {
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const editableSections = document.querySelectorAll('.cms-section[contenteditable="true"]');

    // Load content from local storage
    loadContent();

    saveChangesBtn.addEventListener('click', saveContent);

    function saveContent() {
        editableSections.forEach(section => {
            localStorage.setItem(section.id, section.innerHTML);
        });
        // Provide some feedback to the user
        const originalButtonText = saveChangesBtn.textContent;
        saveChangesBtn.textContent = 'Saved!';
        saveChangesBtn.style.backgroundColor = '#28a745'; // Green
        setTimeout(() => {
            saveChangesBtn.textContent = originalButtonText;
            saveChangesBtn.style.backgroundColor = '#4CAF50'; // Original color
        }, 2000);
    }

    function loadContent() {
        editableSections.forEach(section => {
            const savedContent = localStorage.getItem(section.id);
            if (savedContent) {
                section.innerHTML = savedContent;
            }
        });
    }

    // Optional: A small visual cue when an editable section is focused
    editableSections.forEach(section => {
        section.addEventListener('focus', () => {
            section.style.borderColor = '#007bff'; // Highlight with a blue border
        });
        section.addEventListener('blur', () => {
            section.style.borderColor = '#ccc'; // Revert to default border
        });
    });
});
