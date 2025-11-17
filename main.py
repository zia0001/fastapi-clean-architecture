from fastapi import FastAPI, Response, status,HTTPException
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
      {"title": "importance of poetry", "content": "highways ", "id": 78}
      ]


def post_index(id):
    for i, p in enumerate(my_posts):
        if p['id'] == id:
            return i
    

@app.get("/posts")
def get_posts():
    return {"data": my_posts}


@app.post("/posts", status_code = status.HTTP_201_CREATED)
def create_post(post: Post):
    post_dict = post.model_dump()
    post_dict['id'] = randrange(0, 100000000)
    my_posts.append(post_dict)
    print(my_posts)
    return {"post": post_dict}



@app.get("/posts/latest")
def get_latest_post():
    post = my_posts[len(my_posts) -1 ]
    return {"detail": post}


@app.get("/posts/{id}")
def get_post (id: int, response: Response):
    for post in my_posts:
        if post['id'] == id:
            return {"post_detail": post}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= f"post with id {id} was not found")
        
            
@app.delete("/posts/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int):
   index = post_index(id)
   if index == None:
     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} was not found")
   my_posts.pop(index)
   return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.put("/posts/{id}")
def update_post(id: int, post:Post):
    index = post_index(id)
    if index == None:
     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id {id} was not found")
    
    post_dict = post.model_dump()
    post_dict['id'] = id
    my_posts[index] = post_dict
    return {'data': post_dict}