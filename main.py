from fastapi import FastAPI


app = FastAPI()

@app.get("/posts")
def get_posts():
    return {"data": "your posts"}