from fastapi import FastAPI
from fastapi.params import Body


app = FastAPI()

@app.get("/posts")
def get_posts():
    return {"data": "your post"}

@app.post("/createpost")
def create_post(payload: dict = Body()):
    print(payload)
    return {"post_data": f"title {payload['title']} content {payload['content']}"}