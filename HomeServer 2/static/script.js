// Инициализация частиц для фона
document.addEventListener('DOMContentLoaded', function() {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": true,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
    document.getElementById("fileInput").addEventListener("change", uploadFiles);
document.getElementById("showFiles").addEventListener("click", loadFiles);

function uploadFiles(event) {
  let files = event.target.files;
  if (files.length === 0) return;

  let formData = new FormData();
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const uploadProgress = document.getElementById('uploadProgress');
  uploadProgress.style.display = 'block';
  progressBar.style.width = '0%';
  progressText.textContent = '0%';

  for (let file of files) {
    const path = file.webkitRelativePath || file.name;
    formData.append("files", file, path);
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://192.168.0.26:8000/upload_folder", true);

  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) {
      const percentComplete = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percentComplete + '%';
      progressText.textContent = percentComplete + '%';
    }
  };

  xhr.onload = function () {
    uploadProgress.style.display = 'none';
    if (xhr.status === 200) {
      loadFiles();
    } else {
      console.error("❌ Upload error:", xhr.responseText);
    }
  };

  xhr.send(formData);
}


    // Добавляем обработчики для drag and drop
    const container = document.querySelector('.container');
    const fileInput = document.getElementById('fileInput');

    // Обработчики для drag and drop
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
    });

    container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            uploadFiles({ target: fileInput });
        }
    });
});

document.getElementById("fileInput").addEventListener("change", uploadFiles);
document.getElementById("showFiles").addEventListener("click", loadFiles);

function uploadFiles(event) {
    let files = event.target.files;
    if (files.length === 0) return;

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
            showNotification(data.message, 'success');
            loadFiles();
        } else {
            showNotification("Ошибка загрузки файла", 'error');
            console.error("❌ Ошибка загрузки файла:", xhr.responseText);
        }
    };

    xhr.onerror = function() {
        uploadProgress.style.display = 'none';
        showNotification("Ошибка соединения", 'error');
        console.error("❌ Ошибка соединения");
    };

    xhr.send(formData);
}

function loadFiles() {
    console.log("Кнопка нажата! Загружаем файлы...");
    const loader = document.createElement('div');
    loader.className = 'loader';
    const fileList = document.getElementById("fileList");
    
    // Показываем прелоадер
    fileList.innerHTML = '';
    fileList.appendChild(loader);

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
                return;
            }

            files.forEach(file => {
                let div = document.createElement("div");
                div.classList.add("file-item");

                let fileName = document.createElement("span");
                fileName.textContent = file;
                fileName.classList.add("file-name");

                let encodedFile = encodeURIComponent(file);

                let downloadBtn = document.createElement("a");
                downloadBtn.classList.add("download-btn");
                downloadBtn.innerHTML = "<i class='fas fa-download'></i> Скачать";
                downloadBtn.href = `http://192.168.0.26:8000/download/${encodedFile}`;
                downloadBtn.download = file;

                let deleteBtn = document.createElement("button");
                deleteBtn.classList.add("delete-btn");
                deleteBtn.innerHTML = "<i class='fas fa-trash-alt'></i> Удалить";
                deleteBtn.onclick = () => deleteFile(encodedFile, div);

                div.appendChild(fileName);
                div.appendChild(downloadBtn);
                div.appendChild(deleteBtn);
                fileList.appendChild(div);
            });
        })
        .catch(error => {
            console.error("❌ Ошибка загрузки списка файлов:", error);
            showNotification("Ошибка загрузки списка файлов", 'error');
        });
}

function deleteFile(filename, fileElement) {
    if (!confirm("Вы уверены, что хотите удалить этот файл?")) return;

    fetch(`http://192.168.0.26:8000/delete/${filename}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(`Файл удалён: ${decodeURIComponent(filename)}`, 'success');
                fileElement.classList.add('fade-out');
                setTimeout(() => fileElement.remove(), 300);
            } else {
                showNotification("Ошибка удаления файла", 'error');
                console.error("❌ Ошибка удаления файла:", data.error);
            }
        })
        .catch(error => {
            showNotification("Ошибка запроса на удаление", 'error');
            console.error("❌ Ошибка запроса на удаление:", error);
        });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}


particlesJS('particles-js', {
    "particles": {
      "number": {
        "value": 70,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#4361ee" // Синий цвет частиц
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        }
      },
      "opacity": {
        "value": 0.5,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 2.5,
        "random": true,
        "anim": {
          "enable": true,
          "speed": 2,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 120,
        "color": "#4361ee",
        "opacity": 0.2,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 1.5,
        "direction": "none",
        "random": true,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": true,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse" // Частицы отталкиваются от курсора
        },
        "onclick": {
          "enable": true,
          "mode": "push" // При клике добавляются частицы
        },
        "resize": true
      },
      "modes": {
        "repulse": {
          "distance": 100, // Дистанция реакции на курсор
          "duration": 0.4
        },
        "push": {
          "particles_nb": 6 // Количество добавляемых частиц
        }
      }
    },
    "retina_detect": true
  });
// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification.success {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.notification.error {
    background: linear-gradient(135deg, #F44336, #C62828);
}

.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
}

@keyframes fadeOut {
    to { opacity: 0; transform: translateX(50px); }
}
`;
function loadFiles() {
  console.log("Обновление списка файлов...");
  const fileList = document.getElementById("fileList");
  
  // Создаем красивый прелоадер
  fileList.innerHTML = `
    <div class="loading-animation">
      <div class="wave">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  // Добавляем сообщение об обновлении
  const updateMessage = document.createElement('div');
  updateMessage.className = 'file-update-message';
  updateMessage.textContent = 'Обновление списка файлов...';
  fileList.appendChild(updateMessage);

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
        return;
      }

      files.forEach((file, index) => {
        let div = document.createElement("div");
        div.classList.add("file-item");
        div.style.animationDelay = `${index * 0.05}s`; // Задержка для каждого элемента

        let fileName = document.createElement("span");
        fileName.textContent = file;
        fileName.classList.add("file-name");

        let encodedFile = encodeURIComponent(file);

        let downloadBtn = document.createElement("a");
        downloadBtn.classList.add("download-btn");
        downloadBtn.innerHTML = "<i class='fas fa-download'></i> Скачать";
        downloadBtn.href = `http://192.168.0.26:8000/download/${encodedFile}`;
        downloadBtn.download = file;

        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = "<i class='fas fa-trash-alt'></i> Удалить";
        deleteBtn.onclick = () => deleteFile(encodedFile, div);

        div.appendChild(fileName);
        div.appendChild(downloadBtn);
        div.appendChild(deleteBtn);
        fileList.appendChild(div);
      });

      // Добавляем сообщение о завершении
      const completeMessage = document.createElement('div');
      completeMessage.className = 'file-update-message';
      completeMessage.textContent = `Загружено ${files.length} файлов`;
      fileList.appendChild(completeMessage);
      
      // Удаляем сообщение через 2 секунды
      setTimeout(() => {
        completeMessage.style.opacity = '0';
        setTimeout(() => completeMessage.remove(), 300);
      }, 2000);
    })
    .catch(error => {
      console.error("❌ Ошибка загрузки списка файлов:", error);
      showNotification("Ошибка загрузки списка файлов", 'error');
      fileList.innerHTML = `
        <div class="empty-state error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Ошибка загрузки файлов</p>
        </div>
      `;
    });
}
document.head.appendChild(style);