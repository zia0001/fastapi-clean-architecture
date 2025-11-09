from fastapi import FastAPI
from fastapi.params import Body
from pydantic import BaseModel
from typing import Optional
from random import randrange



app = FastAPI()


class Post(BaseModel):
    title: str
    content: str
    published: bool = True
    rating: Optional[int] = None
    

my_posts = [
    {"title": "favourite game", "content": "Call of duty is best one", "id": 7},
     {"title": "Caps for sale", "content": "Buy one get one free just for 9$", "id": 3},
     {"title": "Top highways in the world", "content": "highways ", "id": 5},
      ]
    

@app.get("/posts")
def get_posts():
    return {"data": my_posts}


@app.post("/posts")
def create_post(post: Post):
    post_dict = post.model_dump()
    post_dict['id'] = randrange(0, 100000000)
    my_posts.append(post_dict)
    print(my_posts)
    return {"post": post_dict}


@app.get("/posts/{id}")
def get_post (id: int):
    for post in my_posts:
        if post['id'] == id:
            return post
        
    

