import asyncio
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from stable_baselines3 import PPO
from bhashini_env import BhashiniEnv

app = FastAPI(title="Bhashini Token Economy Balancer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Global Environment
environment = BhashiniEnv()
obs, _ = environment.reset()

try:
    model = PPO.load("ppo_bhashini_market_maker")
    print("Loaded pre-trained PPO model successfully.")
except Exception as e:
    print("Could not load PPO model. Starting with a dummy agent.")
    model = None

# Global state for manual override
manual_override_price = None

@app.post("/api/shock")
async def trigger_shock():
    """Trigger an enterprise consumption spike externally."""
    environment.trigger_shock()
    return {"status": "Enterprise shock wave triggered!"}

@app.websocket("/ws/economy")
async def websocket_economy_endpoint(websocket: WebSocket):
    global obs, manual_override_price
    await websocket.accept()
    
    try:
        while True:
            # 1. Check for incoming control messages from client without blocking for long
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                msg = json.loads(data)
                
                if msg.get("type") == "override":
                    manual_override_price = float(msg.get("value"))
                    print(f"Manual Override ENGAGED: {manual_override_price}x")
                elif msg.get("type") == "auto":
                    manual_override_price = None
                    print("Manual Override DISENGAGED. AI taking control.")
                elif msg.get("type") == "shock":
                    environment.trigger_shock()
                    print("Enterprise Shock injected via WS!")
                    
            except asyncio.TimeoutError:
                pass # Expected, just move on to heartbeat
            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"WebSocket read error: {e}")

            # 2. RL Agent predicts best action
            if model:
                action, _states = model.predict(obs, deterministic=True)
            else:
                action = environment.action_space.sample()
                
            # 3. Apply manual override if active
            is_manual = manual_override_price is not None
            if is_manual:
                # Override the price multiplier action (index 0)
                action[0] = manual_override_price
                
            # 4. Step the simulated economy
            obs, reward, terminated, truncated, info = environment.step(action)
            
            if terminated or truncated:
                obs, _ = environment.reset()
                
            # 5. Broadcast to frontend
            payload = {
                "server_load": float(info["server_load"]),
                "vram_load": float(info["vram_load"]),
                "time_of_day": float(info["time_of_day"]),
                "data_quality": float(info["data_quality"]),
                "fiat_rate": float(info["fiat_rate"]),
                "net_contributor_tokens": float(info["net_contributor_tokens"]),
                "balanced_tokens": float(info["balanced_tokens"]),
                "net_consumer_tokens": float(info["net_consumer_tokens"]),
                "system_ccr": float(info["system_ccr"]),
                "price_multiplier": float(info["price_multiplier"]),
                "reward_multiplier": float(info["reward_multiplier"]),
                "fiat_tax_multiplier": float(info["fiat_tax_multiplier"]),
                "is_manual": is_manual,
                "reward_health": float(reward)
            }
            
            await websocket.send_json(payload)
            
            # Tick rate: 4 updates per second for a fast, dynamic "trading" feel
            await asyncio.sleep(0.25)
            
    except WebSocketDisconnect:
        print("Dashboard client disconnected")

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
else:
    print(f"WARNING: Frontend distribution not found at {frontend_dist}. Please run 'npm run build' in the frontend directory.")
