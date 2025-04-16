from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os
from urllib.parse import unquote

app = Flask(__name__, static_folder="static")
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "Нет файла!"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Файл не выбран"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    try:
        file.save(file_path)
    except Exception as e:
        return jsonify({"success": False, "error": f"Ошибка сохранения: {str(e)}"}), 500

    return jsonify({"success": True, "message": "Файл загружен!"})

@app.route("/upload_folder", methods=["POST"])
def upload_folder():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"success": False, "error": "Нет файлов!"}), 400

    for file in files:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        try:
            file.save(file_path)
        except Exception as e:
            return jsonify({"success": False, "error": f"Ошибка сохранения файла {file.filename}: {str(e)}"}), 500

    return jsonify({"success": True, "message": "Папка загружена!"})

@app.route("/delete/<path:filename>", methods=["DELETE"])
def delete_file(filename):
    filename = unquote(filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return jsonify({"success": True, "message": "Файл удалён!"})
        except Exception as e:
            return jsonify({"success": False, "error": f"Ошибка удаления: {str(e)}"}), 500

    return jsonify({"success": False, "error": "Файл не найден"}), 404

@app.route("/download/<path:filename>", methods=["GET"])
def download_file(filename):
    filename = unquote(filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if os.path.exists(file_path):
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)

    return jsonify({"error": "Файл не найден"}), 404

@app.route("/files", methods=["GET"])
def list_files():
    try:
        files = os.listdir(UPLOAD_FOLDER)
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": f"Ошибка получения списка файлов: {str(e)}"}), 500

# 💡 Главная страница
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

# 💡 Поддержка всех файлов из static (CSS, JS, иконки и т.д.)
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("static", path)

if __name__ == "__main__":
    print(f"🚀 Сервер запущен! Файлы хранятся в: {UPLOAD_FOLDER}")
    app.run(host="0.0.0.0", port=8000, debug=True)
