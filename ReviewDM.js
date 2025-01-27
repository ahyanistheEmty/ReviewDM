document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = '';
    });

    // Add a message handler for the window
    window.onmessage = function (e) {
        if (e.data === 'beforeunload') {
            e.preventDefault();
            e.returnValue = '';
        }
    };

    const textInput = document.getElementById('text-input');  // Changed from 'text-box' to 'text-input'
    const fileInput = document.getElementById('file-input');
    const summarizeButton = document.getElementById('summarize-button');
    const resultContainer = document.getElementById('result-container');  // Changed to match your HTML

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textInput.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    textInput.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    textInput.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textInput.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    summarizeButton.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (text === '') return;

        summarizeButton.disabled = true;
        summarizeButton.textContent = 'Finding...';
        summarizeButton.classList.add('processing');

        try {
            const response = await fetch('https://r86t08gd-3006.inc1.devtunnels.ms/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('PayloadTooLargeError');
                } else {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
            }

            const data = await response.json();
            let summary = data.summary;

            // Format the summary
            summary = formatBulletPointsAndBoldText(summary);

            // Create a new div element for the summary
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `
                <pre class="code-block">${summary}</pre>
                <button class="copy-button">📋 Copy</button>
            `;

            // Clear the existing content
            resultContainer.innerHTML = '';

            // Append the summary div to the result container
            resultContainer.appendChild(summaryDiv);

            // Add event listener to copy buttons
            document.querySelectorAll('.copy-button').forEach((button) => {
                button.addEventListener('click', (event) => {
                    const codeBlock = event.target.previousElementSibling;
                    const code = codeBlock.innerText;
                    navigator.clipboard.writeText(code).then(() => {
                        button.innerText = '✓ Copied!';
                        setTimeout(() => {
                            button.innerText = '📋 Copy';
                        }, 2000);
                    });
                });
            });

        } catch (error) {
            console.error('Fetch error:', error);
            if (error.message === 'PayloadTooLargeError') {
                alert('The text is too large, try making the text smaller.');
            } else {
                alert('A network error occurred. Please try again later.');
            }
        }

        summarizeButton.disabled = false;
        summarizeButton.textContent = 'Find Review';
        summarizeButton.classList.remove('processing');
    });
});

// JavaScript for Menu Button
const menuBtn = document.getElementById('menu-btn');
const menuList = document.getElementById('menu-list');

menuBtn.addEventListener('click', () => {
    const isOpen = menuList.style.left === '0px';
    menuList.style.left = isOpen ? '-990px' : '0px';
});