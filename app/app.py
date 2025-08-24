from flask import Flask
import redis

import os

app = Flask(__name__)


#Connect to Redis
cache = redis.Redis(host=os.environ.get('REDIS_HOST', 'localhost'), port=6379)


@app.route('/')
def hello():
    count = cache.incr('hits')
    return f"Hello, World! This page has been viewed {count} times."


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)



