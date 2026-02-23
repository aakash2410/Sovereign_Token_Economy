# Bhashini Sovereign Credit Engine

This project is a sophisticated **Deep Reinforcement Learning (DRL)** simulation and live dashboard designed to visualize a radically different economic model for the Bhashini API: the **Sovereign Credit Economy**.

Instead of a traditional Fiat-based API gateway (where whoever pays the most INR gets the most compute), this engine algorithms API access based on **Contribution-to-Consumption Ratio (CCR)**—prioritizing actors who build and enrich the ecosystem, while taxing those who extract from it.

![Sovereign Credit Dashboard Demo](/Users/aakashsangani/.gemini/antigravity/brain/fbe17c13-8fcf-4a2c-8c58-2233f8ce8158/v3_constraints_demo_1771861587321.webp)

## 🏗️ Architecture

The application is split into two tightly coupled systems:

1. **The Core Environment (Gymnasium + Stable-Baselines3)**
   - `backend/bhashini_env.py`: A highly complex, custom Gymnasium environment that mathematically simulates the entire Indian language API economy.
   - `backend/train_model.py`: The script that trained a Proximal Policy Optimization (PPO) agent for 1,000,000 timesteps to learn how to stabilize this chaotic economy.
2. **The React Dashboard (FastAPI + Vite/React + WebSockets)**
   - `backend/main.py`: A FastAPI server that acts as a bridge. It loads the trained AI model, steps the simulation forward in real-time, and broadcasts the live economic state via a high-speed WebSocket (`ws://`).
   - `frontend/src/`: A beautiful, dark-mode React UI that subscribes to the WebSocket and charts the Live Agent Cohorts, the VRAM tension, the Diurnal Traffic curves, and the AI's pricing decisions in real time.

---

## ⚖️ The Sovereign Credit Economy

The core thesis of this project is that in a sovereign, public-good infrastructure like Bhashini, compute power shouldn't just go to the highest bidder. It should go to those who advance the mission.

### The Actors (CCR Cohorts)
The simulation natively divides the network ecosystem into three dynamic cohorts based on their behavior, not their corporate title:

1. **Net-Contributors (CCR >= 1.5):** These are the builders. They upload substantially more linguistic data (text, audio, corrections) than they consume via API requests. They are the engine of Bhashini's intelligence.
2. **Balanced (0.5 < CCR < 1.5):** Startups or researchers who consume the API to build products, but give back roughly equal value by contributing datasets or federated models back to the network.
3. **Net-Consumers (CCR <= 0.5):** Heavy extractors (analogous to legacy Enterprises). They hammer the API with massive volume requests but contribute structurally zero novel data back to the ecosystem.

### The Levers (How the AI Moves the Market)
To keep the server from crashing and to protect the wealth of the Net-Contributors, the DRL Agent has access to **Three Primary Levers (The Action Space)**:

- **1. Impact Price Multiplier ($ x \alpha$)**: The core "cost" of making an API call. When the compute server gets stressed, the AI hikes this multiplier. This acts a friction mechanism against Net-Consumers.
- **2. Contribution Reward Multiplier**: The bounty payout for uploading new, valuable data. The AI can raise this to incentivize sudden data-harvesting pushes.
- **3. Fiat Tax Multiplier**: The exchange rate at the "Discount Window." If Net-Consumers completely run out of algorithmic tokens, they are forced to buy emergency tokens using Fiat (INR). The AI controls how extortionate this exchange rate is based on current system health.

---

## 📈 Real-World Constraints

A simple 3-variable simulation isn't realistic. The PPO Agent was trained to navigate a complex, non-linear **8-Dimensional State Space** that mirrors real infrastructure:

- **GPU VRAM vs CPU Load**: A simple text translation takes CPU. A massive Text-To-Speech (TTS) batch eats VRAM. The system tracks `vram_load` independently. If a Net-Consumer begins a massive TTS job, the AI knows they will hit OOM (Out-of-Memory) long before CPU limits, and aggressively prices them out.
- **Diurnal Time Cycles**: Traffic is not random noise; it's a sine wave. The environment simulates a 24-hour cycle of peak Indian Business Hours. The AI had to learn to *predictively* raise prices before 9:00 AM, rather than *reactively* panic-pricing at 10:00 AM.
- **Data Quality Decay**: If the AI sets the `Contribution Reward` too high, bad actors will spam low-quality data just to mint tokens. The environment tracks a `Data Quality` metric. The AI's reward function is severely penalized if the network degrades into a spam-farm.
- **Cascading Economic Failures**: If the AI raises the API price *too* high, it accidentally bankrupts the `Net-Contributors`, the very people it was designed to protect. If it sets the price too low, the servers OOM and crash. The AI must walk a terrifyingly thin tightrope.

---

## 🚀 Running the Engine

Because the API economy must look and feel responsive, this is a fully integrated stack deployment.

1. Ensure you have Node.js (`v20+`) and Python (`v3.9+`) installed.
2. CD into the root directory.
3. Make the runner executable and execute:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
4. The script will automatically build the React frontend and wrap it inside the Python FastAPI server.
5. In your browser window, navigate to **http://localhost:5522** to view the live simulation.
