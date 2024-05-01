import sqlite3
import os
import threading



lock = threading.Lock()

class Db:
    def __init__(self):
        self.database = 'database.db'
        self.database_tasks = 'tasks.db'
        if not os.path.exists(self.database) or not os.path.exists(self.database_tasks):
            self.create_db()
        else:
            self.connection = sqlite3.connect(self.database, check_same_thread=False)
            self.cursor = self.connection.cursor()
            self.connection_tasks = sqlite3.connect(self.database_tasks, check_same_thread=False)
            self.cursor_tasks = self.connection_tasks.cursor()

    def __del__(self):
        self.connection.close()
    
    def add_user(self, email, name, password, token):
        with lock:
            self.cursor.execute(f"INSERT INTO users VALUES ('{email}', '{name}', '{password}', '', '{token}')")
            self.connection.commit()
    
    def get_user(self, email=None, token=None):
        with lock:
            if email:
                self.cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
                return self.cursor.fetchall()
            if token:
                self.cursor.execute(f"SELECT * FROM users WHERE token = '{token}'")
                return self.cursor.fetchall()
            return []
    
    def add_task(self, parent, child, tasks, status="created", image=""):
        with lock:
            self.cursor_tasks.execute(f"INSERT INTO tasks VALUES ('{parent}', '{child}', '{str(tasks)}', '{status}', '{image}')")
            self.connection_tasks.commit()
    
    def get_tasks(self, parent, childs):
        all_tasks = {}
        with lock:
            for i in childs:
                self.cursor_tasks.execute(f"SELECT * FROM tasks WHERE parent = '{parent}' AND child = '{i}'")
                tasks = self.cursor_tasks.fetchall()
                if tasks:
                    all_tasks[i] = tasks
        

        return all_tasks
    
    def add_child(self, parent, child):
        with lock:
            childs = self.cursor.execute(f"SELECT children FROM users WHERE email = '{parent}'").fetchone()[0]
            for i in childs.split(","):
                if i == child:
                    return
            self.cursor.execute(f"UPDATE users SET children = '{childs+child},' WHERE email = '{parent}'")
            self.connection.commit()

    def delete_task(self, parent, child, task):
        with lock:
            self.cursor_tasks.execute(f"DELETE FROM tasks WHERE parent = '{parent}' AND child = '{child}' AND tasks = '{task}'")
            self.connection_tasks.commit()
    

    def confirm_task(self, parent, child, task, image):
        with lock:
            self.cursor_tasks.execute(f"UPDATE tasks SET status = 'confirmed', image = '{image}' WHERE parent = '{parent}' AND child = '{child}' AND tasks = '{task}'")
            self.connection_tasks.commit()

    def create_db(self):
        if not os.path.exists(self.database):
            open(self.database, 'w').close()
            self.connection = sqlite3.connect(self.database, check_same_thread=False)
            self.cursor = self.connection.cursor()
            self.cursor.execute('''CREATE TABLE users
                (email TEXT,
                name TEXT,
                password TEXT,
                children TEXT,
                token TEXT)''')
            self.connection.commit()
        if not os.path.exists(self.database_tasks):
            open(self.database_tasks, 'w').close()
            self.connection_tasks = sqlite3.connect(self.database_tasks, check_same_thread=False)
            self.cursor_tasks = self.connection_tasks.cursor()
            self.cursor_tasks.execute('''CREATE TABLE tasks
                (parent TEXT,
                child TEXT,
                tasks TEXT,
                status TEXT,
                image TEXT)''')
            self.connection_tasks.commit()
