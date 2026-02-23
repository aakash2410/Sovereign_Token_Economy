import asyncio
import websockets

async def test():
    try:
        async with websockets.connect("ws://localhost:8000/ws/economy") as websocket:
            print("Connected.")
            msg = await websocket.recv()
            print("Received:", msg)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
