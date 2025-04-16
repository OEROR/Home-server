document.getElementById("fileInput").addEventListener("change", uploadFiles);
document.getElementById("showFiles").addEventListener("click", loadFiles);
function uploadFiles(event) {
    let files = event.target.files;
    let formData = new FormData();

    // Показываем прогресс-бар
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const uploadProgress = document.getElementById('uploadProgress');
    uploadProgress.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    for (let file of files) {
        formData.append("file", file);
    }

    // Используем XMLHttpRequest для отслеживания прогресса
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://192.168.0.26:8000/upload", true);

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percentComplete + '%';
            progressText.textContent = percentComplete + '%';
        }
    };

    xhr.onload = function() {
        uploadProgress.style.display = 'none';
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data.message);
            loadFiles();
        } else {
            console.error("❌ Ошибка загрузки файла:", xhr.responseText);
        }
    };

    xhr.onerror = function() {
        uploadProgress.style.display = 'none';
        console.error("❌ Ошибка соединения");
    };

    xhr.send(formData);
}

function loadFiles() {
    const loader = document.getElementById('loader');
    const fileList = document.getElementById('fileList');
    
    // Показываем прелоадер и скрываем список
    loader.style.display = 'block';
    fileList.style.display = 'none';

    fetch("http://192.168.0.26:8000/files")
        .then(response => response.json())
        .then(files => {
            fileList.innerHTML = "";

            if (files.length === 0) {
                fileList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>Файлы отсутствуют</p>
                    </div>
                `;
            } else {
                files.forEach(file => {
                    // ... ваш существующий код создания элементов файлов ...
                });
            }
        })
        .catch(error => console.error("❌ Ошибка загрузки списка файлов:", error))
        .finally(() => {
            loader.style.display = 'none';
            fileList.style.display = 'block';
        });
}
function uploadFiles(event) {
    let files = event.target.files;
    let formData = new FormData();

    for (let file of files) {
        formData.append("file", file);
    }

    fetch("http://192.168.0.26:8000/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        loadFiles(); // Обновляем список файлов
    })
    .catch(error => console.error("❌ Ошибка загрузки файла:", error));
}

function loadFiles() {
    console.log("Кнопка нажата! Загружаем файлы...");
    fetch("http://192.168.0.26:8000/files")
        .then(response => response.json())
        .then(files => {
            let fileList = document.getElementById("fileList");
            fileList.innerHTML = "";

            if (files.length === 0) {
                fileList.innerHTML = "<p>📂 Файлы отсутствуют!</p>";
                return;
            }

            files.forEach(file => {
                let div = document.createElement("div");
                div.classList.add("file-item");

                let fileName = document.createElement("span");
                fileName.textContent = file;

                let encodedFile = encodeURIComponent(file);

                let downloadBtn = document.createElement("a");
                downloadBtn.classList.add("download-btn");
                downloadBtn.innerHTML = "💾 Скачать";
                downloadBtn.href = `http://192.168.0.26:8000/download/${encodedFile}`;
                downloadBtn.download = file;

                let deleteBtn = document.createElement("button");
                deleteBtn.classList.add("delete-btn");
                deleteBtn.innerHTML = "🗑 Удалить";
                deleteBtn.onclick = () => deleteFile(encodedFile, div);

                div.appendChild(fileName);
                div.appendChild(downloadBtn);
                div.appendChild(deleteBtn);
                fileList.appendChild(div);
            });

            fileList.style.display = "block";
        })
        .catch(error => console.error("❌ Ошибка загрузки списка файлов:", error));
}

function deleteFile(filename, fileElement) {
    fetch(`http://192.168.0.26:8000/delete/${filename}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Файл ${filename} удалён!`);
                fileElement.remove();
            } else {
                console.error("❌ Ошибка удаления файла:", data.error);
            }
        })
        .catch(error => console.error("❌ Ошибка запроса на удаление:", error));
}