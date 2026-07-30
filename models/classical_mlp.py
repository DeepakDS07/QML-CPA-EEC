import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class PyTorchMLP(nn.Module):
    """
    Classical PyTorch MLP with ~81 trainable parameters (8->8->1).
    Strict parameter budget matching the 72-parameter Quantum QNN.
    """
    def __init__(self, in_features=8):
        super().__init__()
        self.fc1 = nn.Linear(in_features, 8)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(8, 1)
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        out = self.relu(self.fc1(x))
        out = self.sigmoid(self.fc2(out))
        return out.squeeze(-1)

def count_parameters(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def train_classical_mlp(X_train, y_train, epochs=50, lr=0.01, batch_size=32, seed=42):
    """Trains classical PyTorch MLP."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    
    model = PyTorchMLP(in_features=X_train.shape[1])
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.BCELoss()
    
    X_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_tensor = torch.tensor(y_train, dtype=torch.float32)
    
    dataset = torch.utils.data.TensorDataset(X_tensor, y_tensor)
    loader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    history = {'loss': [], 'accuracy': []}
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_x, batch_y in loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * batch_x.size(0)
            preds = (outputs > 0.5).float()
            correct += (preds == batch_y).sum().item()
            total += batch_y.size(0)
            
        epoch_loss = running_loss / total
        epoch_acc = correct / total
        history['loss'].append(epoch_loss)
        history['accuracy'].append(epoch_acc)
        
    return model, history

def predict_classical_mlp(model, X):
    model.eval()
    with torch.no_grad():
        X_tensor = torch.tensor(X, dtype=torch.float32)
        probs = model(X_tensor).numpy()
        preds = (probs > 0.5).astype(int)
    return preds, probs

if __name__ == '__main__':
    m = PyTorchMLP()
    print("Classical MLP Parameter Count:", count_parameters(m))
