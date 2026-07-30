"""
Hybrid Quantum-Classical Neural Network with Data Re-uploading
==============================================================
Uses Data Re-uploading (Pérez-Salinas et al.) to achieve higher expressivity
in 256-dimensional Hilbert space with minimal parameters (57 total params).
"""
import pennylane as qml
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

def create_hybrid_qnn_model(n_qubits=8, n_layers=2):
    """Creates a Hybrid Quantum-Classical Neural Network with Data Re-uploading."""
    dev = qml.device("default.qubit", wires=n_qubits)
    
    @qml.qnode(dev, diff_method="backprop", interface="torch")
    def quantum_circuit(inputs, weights):
        # Layer 1 Data Re-uploading (Y-rotation)
        qml.AngleEmbedding(inputs, wires=range(n_qubits), rotation='Y')
        qml.StronglyEntanglingLayers(weights[0:1], wires=range(n_qubits))
        
        # Layer 2 Data Re-uploading (Z-rotation for phase non-linearity)
        qml.AngleEmbedding(inputs, wires=range(n_qubits), rotation='Z')
        qml.StronglyEntanglingLayers(weights[1:2], wires=range(n_qubits))
        
        return [qml.expval(qml.PauliZ(i)) for i in range(n_qubits)]

    class HybridQNN(nn.Module):
        def __init__(self):
            super().__init__()
            weight_shapes = {"weights": (2, n_qubits, 3)} # 2 x 8 x 3 = 48 quantum params
            self.qlayer = qml.qnn.TorchLayer(quantum_circuit, weight_shapes)
            self.post = nn.Linear(n_qubits, 1) # 8 x 1 + 1 = 9 classical params (Total: 57 params)
            self.sigmoid = nn.Sigmoid()
            
        def forward(self, x):
            q_out = self.qlayer(x)
            out = self.sigmoid(self.post(q_out))
            return out.squeeze(-1)
            
    return HybridQNN()

def train_hybrid_qnn(X_train, y_train, epochs=60, lr=0.03, batch_size=16, n_qubits=8, seed=42):
    """Trains the Hybrid QNN model with Data Re-uploading."""
    torch.manual_seed(seed)
    np.random.seed(seed)
    
    model = create_hybrid_qnn_model(n_qubits=n_qubits)
    
    pos_count = float(np.sum(y_train == 1))
    neg_count = float(np.sum(y_train == 0))
    pos_weight = neg_count / max(1.0, pos_count)
    
    def weighted_bce(outputs, targets):
        outputs = torch.clamp(outputs, 1e-7, 1.0 - 1e-7)
        loss = - (pos_weight * targets * torch.log(outputs) + (1.0 - targets) * torch.log(1.0 - outputs))
        return torch.mean(loss)
    
    optimizer = optim.Adam([
        {'params': model.qlayer.parameters(), 'lr': lr},
        {'params': model.post.parameters(), 'lr': lr * 0.5}
    ])
    
    X_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_tensor = torch.tensor(y_train, dtype=torch.float32)
    
    dataset = torch.utils.data.TensorDataset(X_tensor, y_tensor)
    loader = torch.utils.data.DataLoader(dataset, batch_size=min(batch_size, len(X_train)), shuffle=True)
    
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

def predict_hybrid_qnn(model, X):
    model.eval()
    with torch.no_grad():
        X_tensor = torch.tensor(X, dtype=torch.float32)
        probs = model(X_tensor).numpy()
        preds = (probs > 0.5).astype(int)
    return preds, probs
