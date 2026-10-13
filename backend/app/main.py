from fastapi import FastAPI

app = FastAPI(
    title="BookSwap API",
    description="API платформи для обміну та оренди книг",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "BookSwap API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }