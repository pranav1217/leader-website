from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, static_folder="static")
CORS(app)


# ============================
# DATABASE INIT
# ============================

def init_db():

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        area TEXT,
        problem TEXT,
        status TEXT DEFAULT 'Pending'
    )
    """)

    conn.commit()
    conn.close()


init_db()
# ============================
# LOAD PDF DATA
# ============================

def load_pdf():
    with open("data.txt", "r", encoding="utf-8") as f:
        return f.read()
    
pdf_text = load_pdf()
# ============================
# CREATE TEXT CHUNKS
# ============================

def create_chunks(text, chunk_size=300):

    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i:i+chunk_size]))

    return chunks

chunks = create_chunks(pdf_text)
# ============================
# AI SEARCH SYSTEM
# ============================

vectorizer = TfidfVectorizer()

chunk_vectors = vectorizer.fit_transform(chunks)


def get_answer(query):

    query_vector = vectorizer.transform([query])

    similarity = cosine_similarity(query_vector, chunk_vectors)

    index = similarity.argmax()

    return chunks[index]

# ============================
# LEADER KNOWLEDGE BASE
# ============================

responses = {

"राजेश मोरे कोण": "राजेश पुंडलिक मोरे हे शिवसेना विभाग प्रमुख आहेत.",

"फोन": "संपर्क क्रमांक: 9282367577",

"नंबर": "संपर्क क्रमांक: 9282367577",

"पत्ता": "ऑफिस नं.2, सोमेश्वर अपार्टमेंट, सोमेश्वर पेठ, पुणे.",

"ईमेल": "ईमेल: rajesh.more2025@gmail.com",

"काम": "विद्यार्थ्यांना मोफत वह्या वाटप, आरोग्य शिबीर, रक्तदान शिबीर, महिला सन्मान कार्यक्रम असे अनेक सामाजिक उपक्रम केले आहेत.",

"उपक्रम": "नेत्यांनी रक्तदान शिबीर, आरोग्य शिबीर, विद्यार्थ्यांना वह्या वाटप असे अनेक उपक्रम केले आहेत."
}


# ============================
# HOME ROUTE
# ============================

@app.route("/")
def home():
    return "Rajesh More Chatbot Server Running"


# ============================
# CHATBOT API
# ============================

@app.route("/chat", methods=["POST"])
def chat():

    user_message = request.json.get("message","").lower()

    # 1️⃣ First check normal chatbot
    for key in responses:
        if key in user_message:
            return jsonify({"reply": responses[key]})

    # 2️⃣ Otherwise use PDF AI
    try:
        answer = get_answer(user_message)
        return jsonify({"reply": answer[:300]})
    except:
        return jsonify({"reply": "माहिती सापडली नाही."})

# ============================
# COMPLAINT API
# ============================

@app.route("/complaints", methods=["POST"])
def complaint():

    try:

        data = request.json

        name = data.get("name")
        phone = data.get("phone")
        area = data.get("area")
        problem = data.get("problem")

        conn = sqlite3.connect("complaints.db")
        cursor = conn.cursor()

        cursor.execute("""
        INSERT INTO complaints (name, phone, area, problem)
        VALUES (?, ?, ?, ?)
        """, (name, phone, area, problem))

        conn.commit()
        conn.close()

        return jsonify({
            "status":"success",
            "message":"तक्रार नोंदवली गेली"
        })

    except Exception as e:

        return jsonify({
            "status":"error",
            "message":"तक्रार नोंदवता आली नाही"
        })


# ============================
# GET ALL COMPLAINTS
# ============================

@app.route("/complaints", methods=["GET"])
def get_complaints():

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM complaints")

    rows = cursor.fetchall()

    conn.close()

    complaints = []

    for row in rows:

        complaints.append({
            "id":row[0],
            "name":row[1],
            "phone":row[2],
            "area":row[3],
            "problem":row[4],
            "status":row[5]
        })

    return jsonify(complaints)


# ============================
# UPDATE STATUS API
# ============================

@app.route("/update-status", methods=["POST"])
def update_status():

    data = request.json

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE complaints
    SET status = ?
    WHERE id = ?
    """, (data["status"], data["id"]))

    conn.commit()
    conn.close()

    return jsonify({"message":"Status updated"})


# ============================
# DELETE COMPLAINT API
# ============================

@app.route("/delete-complaint", methods=["POST"])
def delete_complaint():

    data = request.json
    complaint_id = data.get("id")

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM complaints WHERE id=?", (complaint_id,))

    conn.commit()
    conn.close()

    return jsonify({"message":"Complaint deleted"})

# ============================
# FEEDBACK TABLE
# ============================

def init_feedback():
    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT,
        rating INTEGER
    )
    """)

    conn.commit()
    conn.close()

init_feedback()


# ADD FEEDBACK
@app.route("/feedback", methods=["POST"])
def add_feedback():

    data = request.json

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO feedback (message, rating) VALUES (?,?)",
        (data["message"], data["rating"])
    )

    conn.commit()
    conn.close()

    return jsonify({"message":"Feedback saved"})


# GET FEEDBACK
@app.route("/feedback", methods=["GET"])
def get_feedback():

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM feedback ORDER BY id DESC")

    rows = cursor.fetchall()

    conn.close()

    data = []

    for r in rows:
        data.append({
            "message": r[1],
            "rating": r[2]
        })

    return jsonify(data)
# ============================
# ANALYTICS
# ============================

@app.route("/analytics", methods=["GET"])
def analytics():
    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM complaints")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status='Pending'")
    pending = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status='Solved'")
    solved = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total": total,
        "pending": pending,
        "solved": solved
    })


# ============================
# BANNERS API
# ============================

@app.route("/banners", methods=["GET"])
def get_banners():

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS banners(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT
    )
    """)

    cursor.execute("SELECT * FROM banners ORDER BY id DESC")
    rows = cursor.fetchall()

    conn.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "image": row[1]
        })

    return jsonify(data)


# ============================
# UPLOAD BANNER
# ============================

import os

@app.route("/upload-banner", methods=["POST"])
def upload_banner():

    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file"}), 400

    if not os.path.exists("static/banners"):
        os.makedirs("static/banners")

    filepath = f"banners/{file.filename}"
    file.save(os.path.join("static", filepath))

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("""
CREATE TABLE IF NOT EXISTS banners(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

    cursor.execute("INSERT INTO banners (image) VALUES (?)", (filepath,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Upload success"})

@app.route("/delete-banner", methods=["POST"])
def delete_banner():

    data = request.get_json()
    banner_id = data.get("id")

    conn = sqlite3.connect("complaints.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM banners WHERE id=?", (banner_id,))
    
    conn.commit()
    conn.close()

    return jsonify({"message": "Deleted"})
# ============================
# LOGIN API
# ============================

@app.route("/login", methods=["POST"])
def login():

    data = request.json
    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "1234":
        return jsonify({"status":"success"})
    else:
        return jsonify({"status":"fail"}), 401
# ============================
# RUN SERVER (ALWAYS LAST)
# ============================

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3000, debug=True)    