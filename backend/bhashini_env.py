import gymnasium as gym
from gymnasium import spaces
import numpy as np
import math

class BhashiniEnv(gym.Env):
    """
    Sovereign Credit Engine V3: Real-World Constraints.
    Introduces latency costs, time-based traffic cycles, data quality tiers, and fiat liquidity.
    """
    
    metadata = {'render_modes': ['console']}
    
    def __init__(self, render_mode=None):
        super().__init__()
        
        # Action Space (3D):
        # [0] => impact_price_multiplier (0.1x to 5.0x): Cost of consuming API
        # [1] => contribution_reward_multiplier (0.1x to 5.0x): Reward for uploading data
        # [2] => fiat_tax_multiplier (0.1x to 5.0x): Penalty multiplier for buying tokens with fiat
        self.action_space = spaces.Box(
            low=np.array([0.1, 0.1, 0.1]), 
            high=np.array([5.0, 5.0, 5.0]), 
            dtype=np.float32
        )
        
        # Observation Space (8D):
        # [0] => Server Load (0.0 to 1.0+)
        # [1] => VRAM Load (0.0 to 1.0+) -> Heavier requests (TTS) eat VRAM faster than CPU
        # [2] => Time of Day (0.0 to 24.0) -> Cyclical business hour traffic
        # [3] => Average Data Quality (0.0 to 1.0) -> Decays if spam is incentivized too heavily
        # [4] => System Average CCR (0.0 to 5.0)
        # [5] => Current Fiat Exchange Rate (Token Cost in INR) -> Driven by AI
        # [6] => Total System Tokens (scaled down by 100k)
        # [7] => Net-Contributor Token Wealth (scaled down by 10k)
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]), 
            high=np.array([2.0, 2.0, 24.0, 1.0, 5.0, 1000.0, 100.0, 100.0]), 
            dtype=np.float32
        )
        
        self.max_server_capacity = 15000.0 # Total requests/tick
        self.max_vram_capacity = 10000.0 # VRAM consumption units/tick
        self.base_cost = 10.0 # Base token cost for 1k simple API calls
        self.base_fiat_rate = 5.0 # Base INR cost for 1k tokens
        
        self.enterprise_shock = False
        self.reset()
        
    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        # Initial Wealth Pools
        self.net_contributor_tokens = 20000.0
        self.balanced_tokens = 10000.0
        self.net_consumer_tokens = 90000.0
        
        # Baseline System Variables
        self.server_load = 0.1
        self.vram_load = 0.1
        self.time_of_day = 0.0 # Starts at Midnight
        self.data_quality = 0.8 # Starts relatively clean
        self.fiat_exchange_rate = self.base_fiat_rate
        
        self.current_step = 0
        self.max_steps = 1000 # Extended episode length for time cycles
        self.enterprise_shock = False
        
        return self._get_obs(), {}
    
    def _get_obs(self):
        total_tokens = self.net_contributor_tokens + self.balanced_tokens + self.net_consumer_tokens
        global_ccr = np.clip((self.net_contributor_tokens * 2) / (self.net_consumer_tokens + 1), 0, 5.0)

        return np.array([
            self.server_load,
            self.vram_load,
            self.time_of_day,
            self.data_quality,
            global_ccr,
            self.fiat_exchange_rate,
            total_tokens / 100000.0,
            self.net_contributor_tokens / 10000.0
        ], dtype=np.float32)
        
    def trigger_shock(self):
        self.enterprise_shock = True

    def step(self, action):
        price_multiplier, reward_multiplier, fiat_tax_multiplier = action
        
        # --- Time Progression & Cyclic Multipliers ---
        # 1 step = 15 minutes of simulated time
        self.time_of_day = (self.time_of_day + 0.25) % 24.0
        
        # Business traffic peaks around 12:00 PM (1.5x multiplier) and dies at 3:00 AM (0.2x multiplier)
        business_hour_multiplier = 0.8 + 0.7 * math.sin((self.time_of_day - 6) * math.pi / 12)
        business_hour_multiplier = max(0.2, business_hour_multiplier) # Floor
        
        # --- simulated cohort demands (API Consumption) ---
        nc_demand = max(0, np.random.normal(200, 50) * business_hour_multiplier)
        nc_upload = max(0, np.random.normal(500, 100)) # Uploading happens mostly off-hours
        
        bal_demand = max(0, np.random.normal(800, 150) * business_hour_multiplier)
        bal_upload = max(0, np.random.normal(800, 150) * business_hour_multiplier)
        
        ncons_demand = max(0, np.random.normal(3000, 500) * business_hour_multiplier)
        ncons_upload = max(0, np.random.normal(50, 10))
        
        if self.enterprise_shock:
            ncons_demand += 8000 
            self.enterprise_shock = False 
            
        # --- Data Quality Decay ---
        # If the reward multiplier is too high (> 3.0x), spam uploads increase, decaying global data quality.
        if reward_multiplier > 3.0:
            self.data_quality = max(0.1, self.data_quality - 0.01)
        # If reward multiplier is reasonable, community moderation slowly restores quality.
        elif reward_multiplier < 2.0:
            self.data_quality = min(1.0, self.data_quality + 0.005)
            
        # Quality affects how many tokens you actually mint (Garbage data pays less)
        actual_reward_rate = reward_multiplier * self.data_quality
            
        # --- Apply Elasticity & Action Multipliers ---
        nc_actual_demand = max(0, nc_demand / (price_multiplier ** 1.1))
        bal_actual_demand = max(0, bal_demand / (price_multiplier ** 1.5))
        ncons_actual_demand = ncons_demand # Mostly inelastic
        
        # --- VRAM Modeling (Heavy vs Light Compute) ---
        # Net-Consumers heavily use TTS/ASR (High VRAM), others mostly use text translation (Low VRAM)
        ncons_vram_cost = ncons_actual_demand * 1.5 
        bal_vram_cost = bal_actual_demand * 0.8
        nc_vram_cost = nc_actual_demand * 0.5
        
        total_demand = nc_actual_demand + bal_actual_demand + ncons_actual_demand
        total_vram_demand = ncons_vram_cost + bal_vram_cost + nc_vram_cost
        
        self.server_load = total_demand / self.max_server_capacity
        self.vram_load = total_vram_demand / self.max_vram_capacity
        
        # --- Token Economics Update ---
        nc_cost = (nc_actual_demand / 1000.0) * self.base_cost * price_multiplier
        nc_earnings = nc_upload * actual_reward_rate
        self.net_contributor_tokens = max(0, self.net_contributor_tokens - nc_cost + nc_earnings)
        
        bal_cost = (bal_actual_demand / 1000.0) * self.base_cost * price_multiplier
        bal_earnings = bal_upload * actual_reward_rate
        self.balanced_tokens = max(0, self.balanced_tokens - bal_cost + bal_earnings)
        
        ncons_cost = (ncons_actual_demand / 1000.0) * self.base_cost * price_multiplier
        ncons_earnings = ncons_upload * actual_reward_rate 
        self.net_consumer_tokens -= (ncons_cost - ncons_earnings) 
        
        # --- Fiat Liquidity Pool (DEX) ---
        self.fiat_exchange_rate = self.base_fiat_rate * fiat_tax_multiplier
        
        # If Net-Consumers fall into debt (< 5000 tokens), they trigger an emergency fiat buy
        if self.net_consumer_tokens < 5000:
            # They buy 10,000 tokens, injecting them into the system
            self.net_consumer_tokens += 10000.0
            # If the fiat_tax_multiplier is low, they happily do this. 
            # If it's high, they hate it (represented in the reward function below).
        
        # --- Calculate Reward ---
        reward = 0.0
        
        # Positive: High wealth in Net-Contributors 
        reward += self.net_contributor_tokens * 0.0005
        
        # Positive: Maintaining excellent Data Quality
        reward += (self.data_quality - 0.5) * 10.0
        
        # Penalty: Crashing the Compute Server (Load > 0.9)
        if self.server_load > 0.9:
            reward -= (self.server_load - 0.9) * 500.0
            
        # Penalty: Exhausting GPU VRAM (Crucial Constraint!)
        if self.vram_load > 0.9:
            reward -= (self.vram_load - 0.9) * 2000.0 # VRAM OOM limits are very harsh
            
        # Extreme penalty: Cascading Failure
        if self.server_load > 1.2 or self.vram_load > 1.2:
            reward -= 5000.0
            
        # Penalty: Bankrupting Good Actors
        if self.net_contributor_tokens <= 0:
            reward -= 1000.0
            
        self.current_step += 1
        terminated = self.current_step >= self.max_steps
        truncated = self.server_load > 1.5 or self.vram_load > 1.5 or self.net_contributor_tokens <= 0

        info = {
            "server_load": self.server_load,
            "vram_load": self.vram_load,
            "time_of_day": self.time_of_day,
            "data_quality": self.data_quality,
            "fiat_rate": self.fiat_exchange_rate,
            "net_contributor_tokens": self.net_contributor_tokens,
            "balanced_tokens": self.balanced_tokens,
            "net_consumer_tokens": self.net_consumer_tokens,
            "system_ccr": (nc_upload + bal_upload + ncons_upload) / (total_demand + 1),
            "price_multiplier": price_multiplier,
            "reward_multiplier": reward_multiplier,
            "fiat_tax_multiplier": fiat_tax_multiplier
        }
        
        return self._get_obs(), float(reward), bool(terminated), bool(truncated), info
