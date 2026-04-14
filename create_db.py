import sqlite3

conn = sqlite3.connect("complaints.db")

conn.execute("""
CREATE TABLE IF NOT EXISTS complaints(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
phone TEXT,
area TEXT,
problem TEXT,
status TEXT DEFAULT 'Pending'
)
""")

print("Database created")

conn.close()