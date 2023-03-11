
import asyncio
import os
from dotenv import load_dotenv
from typing import List, Optional

import aiohttp

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

class SubscriptionClientInput(BaseModel):
    types: List[str]
    username: str
    session_id: str

class Subscription(BaseModel):
    type: str
    version: str = "1"
    condition: dict
    transport: dict


app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

clientSession = None
twitch_app_access_token = None
subscription_version_map = {
    "channel.follow": "2",
    "channel.subscribe": "1"
}

@app.on_event("startup")
async def startup_event():
    global clientSession
    global twitch_app_access_token
    clientSession = aiohttp.ClientSession()
    twitch_app_access_token = await get_twitch_access_token()

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Hello Socket Stream!"}

@app.get("/index.html", response_class=HTMLResponse)
async def read_html_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/subscribe")
async def subscribe(subscription_input: SubscriptionClientInput):
    global clientSession

    headers = build_twitch_subscription_headers()
    bodies = await build_twitch_subscription_bodies(subscription_input)
    print(headers)
    print(bodies)
    subscription_responses = []
    for subscription_body in bodies:
        async with clientSession.post(
            'https://api.twitch.tv/helix/eventsub/subscriptions',
            headers=headers,
            data=subscription_body.json()
        ) as response:
            subscription_responses.append(await response.json())

    return subscription_responses

async def get_twitch_access_token():
    global clientSession
    async with clientSession.post(
        'https://id.twitch.tv/oauth2/token',
        data={
            'client_id': os.environ.get('TWITCH_CLIENT_ID'),
            'client_secret': os.environ.get('TWITCH_CLIENT_SECRET'),
            'grant_type': 'client_credentials'
        }
    ) as response:
        return (await response.json())["access_token"]

async def get_twitch_broadcaster_id(broadcaster_name: Optional[str] = 'bpafoshizle'):
    global clientSession
    global twitch_app_access_token
    async with clientSession.get(
         f"https://api.twitch.tv/helix/users?login={broadcaster_name}",
        headers={
            'Client-Id': os.environ.get('TWITCH_CLIENT_ID'),
            'Authorization': f"Bearer {twitch_app_access_token}"
        }
    ) as response:
        return (await response.json())["data"][0]["id"]
            

def build_twitch_subscription_headers():
    global twitch_app_access_token
    return {
        'Content-Type': 'application/json',
        'Client-Id': os.environ.get('TWITCH_CLIENT_ID'),
        #'Authorization': f"Bearer {twitch_app_access_token}"
        'Authorization': f"Bearer {os.environ.get('TWITCH_USER_ACCESS_TOKEN')}"
    }

async def build_twitch_subscription_bodies(subscription_input: SubscriptionClientInput):
    broadcaster_id = await get_twitch_broadcaster_id(subscription_input.username)
    subscription_bodies = []

    for type in subscription_input.types:
        subscription = Subscription(
            type=type,
            version=subscription_version_map[type],
            condition={
                "broadcaster_user_id": broadcaster_id,
                "moderator_user_id": broadcaster_id
            },
            transport={
                "method": "websocket",
                "session_id": subscription_input.session_id
            }
        )
        subscription_bodies.append(subscription)

    return subscription_bodies
