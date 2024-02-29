from datetime import datetime
from flask import Flask, jsonify, redirect, render_template, request, url_for
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
# 資料庫
DATABASE = 'data.db'

def get_db_connection():
    con = sqlite3.connect(DATABASE)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with get_db_connection() as con:
        cursor = con.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data (
                id INTEGER PRIMARY KEY,
                time STRING, --時間
                sensor STRING, --溫度
                pm STRING --PM
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS fan (
                id INTEGER PRIMARY KEY, 
                fan STRING -- FAN
            )
        ''')

init_db()
# view
@app.route('/')
def sign():
    return render_template('index.html')

# GET PM
@app.route('/data/get/<string:sensor>/<string:pm>/<string:fan>')
def data(sensor, pm, fan):
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("INSERT INTO data (time, sensor, pm) VALUES (?, ?, ?)", 
                   (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), sensor, pm))
    con.commit()
    con.close()
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("INSERT INTO fan (fan) VALUES (?)", (fan))
    con.commit()
    con.close()
    return "OK"

# GET PM DATA
@app.route('/data/fetch')
def fetch_data():
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM data ORDER BY time DESC")
    data_records = cursor.fetchall()
    con.close()
    return jsonify([dict(ix) for ix in data_records])

# GET SEND FAN DATA
@app.route('/data/fetch/fan/latest')
def fetch_latest_fan_data():
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM fan ORDER BY id DESC LIMIT 1")
    data_record = cursor.fetchone()
    con.close()
    return jsonify(dict(data_record))

# GET SEND PM DATA
@app.route('/data/fetch/pm/latest')
def fetch_latest_pm_data():
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("SELECT * FROM data ORDER BY id DESC LIMIT 1")
    data_record = cursor.fetchone()
    con.close()
    return jsonify(dict(data_record))

# DELETE DATA
@app.route('/data/del')
def del_data():
    con = get_db_connection()
    cursor = con.cursor()
    cursor.execute("DELETE FROM data")  
    cursor.execute("DELETE FROM fan") 
    cursor.execute("INSERT INTO fan (fan) VALUES (?)", ('0'))
    cursor.execute("INSERT INTO data (time, sensor, pm) VALUES (?, ?, ?)", (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), '0', '0'))
    con.commit() 
    con.close()
    return "Data deleted successfully"  


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  
    app.run(host='0.0.0.0', port=port)
