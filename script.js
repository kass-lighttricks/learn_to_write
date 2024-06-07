const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const resultImage = document.getElementById('resultImage');
const ocrResultDiv = document.getElementById('ocrResult');
const loadingAnimation = document.getElementById('loadingAnimation');
let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'fuchsia'; // Use fuchsia color for brush strokes

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
}

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ocrResultDiv.innerHTML = '';
    resultImage.style.display = 'none';
    loadingAnimation.style.display = 'none';
    canvas.style.display = 'block';
});

document.getElementById('submitBtn').addEventListener('click', () => {
    canvas.toBlob((blob) => {
        Tesseract.recognize(
            blob,
            'eng',
            { logger: (m) => console.log(m) }
        ).then(({ data: { text } }) => {
            console.log(text);
            ocrResultDiv.innerHTML = `OCR Result: ${text}`;
            generateImage(text.trim());
        });
    });
});

async function generateImage(text) {
    loadingAnimation.style.display = 'block';
    canvas.style.display = 'none';
    const formData = new FormData();
    const enhancedText = `colorful and vibrant illustration in a futuristic cartoon style of a: "${text}"`;

    formData.append('prompt', enhancedText);
    formData.append('output_format', 'webp');

    try {
        const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
            method: 'POST',
            headers: {
                'Authorization': 'sk-IJjdPsSzt43DkdTHrNjeAuEUy3FvGBsTJRYK7biYWmaMwOWj', // Replace with your Stable Diffusion API key
                'Accept': 'image/*'
            },
            body: formData
        });

        if (response.status === 200) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            resultImage.src = url;
            resultImage.style.display = 'block';
            loadingAnimation.style.display = 'none';
        } else {
            const errorText = await response.text();
            throw new Error(`${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        loadingAnimation.style.display = 'none';
    }
}
