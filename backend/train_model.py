from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from bhashini_env import BhashiniEnv

if __name__ == "__main__":
    print("Initializing Bhashini Token Economy Environment...")
    env = BhashiniEnv()
    
    # Check if the environment follows Gymnasium API
    check_env(env, warn=True)
    
    print("Setting up PPO Actor-Critic model...")
    # Initialize PPO model with MLP policy
    model = PPO(
        "MlpPolicy", 
        env, 
        verbose=1,
        learning_rate=0.0005,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99
    )
    
    # Train the model
    # The V3 environment is highly complex (8D Observation, 3D Action). 
    # It requires significantly more timesteps to master the cyclic time and VRAM constraints.
    print("Starting training (1M timesteps)...")
    model.learn(total_timesteps=1_000_000)
    
    # Save the trained agent
    model_path = "ppo_bhashini_market_maker"
    model.save(model_path)
    print(f"Training complete. Model saved to {model_path}.zip")
