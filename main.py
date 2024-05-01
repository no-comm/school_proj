import flask
from flask import request
from db import Db
import string
import random
import base64
import qrcode
import io

app = flask.Flask(__name__)
db = Db()

def gen_token():
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(32))

def gen_link(parent: str, child: str):
    return base64.b64encode((parent +":"+ child).encode('utf-8')).decode('utf-8')

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
    
@app.route('/create/<link>', methods=['GET'])
def create_link(link):
    return flask.render_template('null.html')


@app.route('/auth/<link>', methods=['GET'])
def auth_link(link):
    try:
        data = base64.b64decode(link).decode('utf-8')
        print(data)
        db.add_child(data.split(":")[0], data.split(":")[1])
        return flask.redirect('/create/'+data)
    except Exception as e:
        print(e)
        return flask.redirect('/control')
    
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
        if tasks == {}:
            return {'status': 'ok', 'tasks': []}
        return {'status': 'ok', 'tasks': [i[2] for i in tasks[request.form.get('child')]]}
    except Exception as e:
        print(e, request.form)
        return {'status': 'error'}
    
@app.route('/confirm_task', methods=['POST'])
def confirm_task():
    try:
        db.confirm_task(request.form['parent'], request.form['child'], request.form['task'], request.form['file'])
        return {'status': 'ok'}
    except Exception as e:
        print(e)
        return {'status': 'error'}
    

@app.route('/create_child', methods=['POST'])
def create_child():
    try:
        link = gen_link(request.form['parent'], request.form['child'])
        img = qrcode.make(link)
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        image_bytes = buffered.getvalue()
        return {'status': 'ok', 'link': "http://127.0.0.1/auth/"+link, 'qr': "data:image/jpeg;base64,"+base64.b64encode(image_bytes).decode('utf-8')}
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