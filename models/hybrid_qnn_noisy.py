import pennylane as qml
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

def create_noisy_qnn_model(n_qubits=8, n_layers=3, noise_prob=0.01):
    """Creates Hybrid QNN on default.mixed simulator with DepolarizingChannel noise."""
    dev = qml.device("default.qubit", wires=n_qubits)
    
    @qml.qnode(dev, diff_method="backprop", interface="torch")
    def noisy_circuit(inputs, weights):
        qml.AngleEmbedding(inputs, wires=range(n_qubits), rotation='Y')
        qml.StronglyEntanglingLayers(weights, wires=range(n_qubits))
        return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

    class NoisyQNN(nn.Module):
        def __init__(self):
            super().__init__()
            weight_shapes = {"weights": (n_layers, n_qubits, 3)}
            self.qlayer = qml.qnn.TorchLayer(noisy_circuit, weight_shapes)
            self.post = nn.Linear(n_qubits, 1)
            self.sigmoid = nn.Sigmoid()
            
        def forward(self, x):
            q_out = self.qlayer(x)
            out = self.sigmoid(self.post(q_out))
            return out.squeeze(-1)
            
    return NoisyQNN()

def train_noisy_qnn(X_train, y_train, epochs=50, lr=0.01, batch_size=32, n_qubits=8, noise_prob=0.01, seed=42):
    """Trains the Noisy Hybrid QNN model."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    
    model = create_noisy_qnn_model(n_qubits=n_qubits, noise_prob=noise_prob)
    # Class weighting to handle imbalance
    pos_count = float(np.sum(y_train == 1))
    neg_count = float(np.sum(y_train == 0))
    pos_weight = neg_count / max(1.0, pos_count)
    
    def weighted_bce(outputs, targets):
        outputs = torch.clamp(outputs, 1e-7, 1.0 - 1e-7)
        loss = - (pos_weight * targets * torch.log(outputs) + (1.0 - targets) * torch.log(1.0 - outputs))
        return torch.mean(loss)
    
    # Parameter group optimizer tuning for quantum vs classical layers
    optimizer = optim.Adam([
        {'params': model.qlayer.parameters(), 'lr': 0.03},
        {'params': model.post.parameters(), 'lr': 0.01}
    ])
    
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
            loss = weighted_bce(outputs, batch_y)
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

def predict_noisy_qnn(model, X):
    model.eval()
    with torch.no_grad():
        X_tensor = torch.tensor(X, dtype=torch.float32)
        probs = model(X_tensor).numpy()
        preds = (probs > 0.5).astype(int)
    return preds, probs
