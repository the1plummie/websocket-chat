#!/usr/bin/env python3
import asyncio
import json
import logging
import websockets


logging.basicConfig()

# The set of clients connected to this server. It is used to distribute
# messages.
USERS = {} #: {websocket: name}


async def notify_users(users, message):
    if users:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([user.send(message) for user in users.keys()])


async def register(websocket, name):
    print('New client', websocket)
    print(' ({} existing clients)'.format(len(USERS)))

    await notify_users(user, 'Welcome to websocket-chat, {}'.format(name))
    await notify_users(user, 'There are {} other users connected: {}'.format(len(USERS), list(USERS.values())))

    USERS[websocket] = name
    await notify_users(USERS, name + ' has joined the chat')


async def unregister(websocket):
    print('Client closed connection', websocket)
    name = USERS[websocket]
    del USERS[websocket]
    await notify_users(USERS, name + ' has left the chat')


async def chat_handler(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'name' and len(data['name']) > 0:
                await register(websocket, data['name'])
            elif data["type"] == "msg" and len(data['msg']) > 0:
                await notify_users(USERS, '{}: {}'.format(USERS[websocket], data['msg']))
            else:
                logging.error("unsupported event: {}", data)
    finally:
        await unregister(websocket)


start_server = websockets.serve(chat_handler, "localhost", 8080)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
