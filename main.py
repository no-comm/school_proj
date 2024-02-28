import flask
from flask import request
from db import Db
import string
import random

app = flask.Flask(__name__)
db = Db()

def gen_token():
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(32))

@app.route('/')
def index():
    return flask.render_template('Главная.html')

@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        if db.get_user(email) == []:
            token = gen_token()
            db.add_user(email, request.form['name'], request.form['pass'], token)
            return {'status': 'ok', 'login': email, 'role': 'parent', 'token': token}
        else:
            return {'status': 'already exists'}
    return flask.render_template('register.html')

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        login = request.form['email']
        passwd = request.form['passwd']
        if db.get_user(login) != []:
            if db.get_user(login)[0][2] == passwd:
                return {'status': 'ok', 'login': login, 'role': 'parent', 'token': db.get_user(login)[0][4]}
    return {'status': 'password or login incorrect'}

@app.route('/control')
def control():
    return flask.render_template('Мой профиль.html')

@app.route('/get_child', methods=['GET'])
def get_child():
    try:
        childs = db.get_user(token=request.headers.get('Authorization').replace('Bearer ', ''))[0][3]

        return {'status': 'ok', 'childs': '' if childs == None else childs}
    except Exception as e:
        print(e)
        return {'status': 'error'}
    
@app.route('/add_task', methods=['POST'])
def add_task():
    try:
        user = db.get_user(token=request.headers.get('Authorization').replace('Bearer ', ''))[0]
        childs = user[3]
        if request.form['child'] in childs and request.form['parent'] == user[0]:
            db.add_task(request.form['parent'], request.form['child'], request.form['task'])
            return {'status': 'ok'}

        return {'status': 'error'}
    except Exception as e:
        print(e)
        return {'status': 'error'}


@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    try:
        user = db.get_user(token=request.headers.get('Authorization').replace('Bearer ', ''))[0]
        childs = user[3]
        if childs != None:
            if len(childs.split(',')) > 0:
                tasks = db.get_tasks(user[0], childs.split(','))
                return {'status': 'ok', 'tasks': tasks}
    except Exception as e:
        print(e)
        return {'status': 'error'}
    
@app.route('/get_my_tasks', methods=['POST'])
def get_my_tasks():
    try:
        user = db.get_user(request.form.get('parent'))[0]
        tasks = db.get_tasks(user[0], [request.form.get('child')])
        return {'status': 'ok', 'tasks': [i[2] for i in tasks[request.form.get('child')]]}
    except Exception as e:
        print(e)
        return {'status': 'error'}
    
@app.route('/confirm_task', methods=['POST'])
def confirm_task():
    try:
        db.delete_task(request.form['parent'], request.form['child'], request.form['task'])
        return {'status': 'ok'}
    except Exception as e:
        print(e)
        return {'status': 'error'}

@app.route('/delete_task', methods=['POST'])
def delete_task():
    try:
        db.delete_task(request.form['parent'], request.form['child'], request.form['task'])
        return {'status': 'ok'}
    except Exception as e:
        print(e)
        return {'status': 'error'}

if __name__ == '__main__':
    app.run(port=80)