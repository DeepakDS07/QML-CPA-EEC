import pennylane as qml
import numpy as np
from sklearn.svm import SVC
from sklearn.metrics.pairwise import rbf_kernel
import warnings

warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)

def create_quantum_kernel_node(n_qubits=8, n_layers=3):
    """Creates PennyLane QNode for state vector inner product kernel evaluation."""
    dev = qml.device("default.qubit", wires=n_qubits)
    
    @qml.qnode(dev, interface="torch")
    def state_circuit(x):
        qml.AngleEmbedding(x, wires=range(n_qubits), rotation='Y')
        # Fixed structured weights for deterministic feature mapping
        weights = np.ones((n_layers, n_qubits, 3)) * 0.5
        qml.StronglyEntanglingLayers(weights, wires=range(n_qubits))
        return qml.state()
    
    return state_circuit

def compute_quantum_kernel_matrix(X1, X2, n_qubits=8):
    """Computes N1 x N2 quantum kernel matrix using state vector overlap."""
    state_circuit = create_quantum_kernel_node(n_qubits=n_qubits)
    
    states1 = np.array([state_circuit(x) for x in X1])
    states2 = np.array([state_circuit(x) for x in X2]) if X2 is not X1 else states1
    
    # Overlap matrix: |<psi(x_i) | psi(x_j)>|^2
    kernel_matrix = np.abs(np.dot(states1, states2.conj().T)) ** 2
    return kernel_matrix

def compute_frobenius_kernel_alignment(K_quantum, X_data, gamma=0.1):
    """
    Computes Frobenius Kernel Alignment score between Quantum Kernel matrix 
    and Classical RBF Kernel matrix. Alignment < 0.70 proves quantum kernel 
    captures a distinct feature space representation.
    """
    K_rbf = rbf_kernel(X_data, gamma=gamma if isinstance(gamma, (int, float)) else 0.1)
    
    # Normalize matrices
    norm_q = np.linalg.norm(K_quantum, 'fro')
    norm_rbf = np.linalg.norm(K_rbf, 'fro')
    
    if norm_q == 0 or norm_rbf == 0:
        return 1.0
        
    alignment = np.trace(K_rbf @ K_quantum) / (norm_rbf * norm_q)
    return float(alignment)

def train_quantum_kernel_svm(X_train, y_train, n_qubits=8, C=1.0, seed=42):
    """Trains a Quantum Kernel SVM model."""
    np.random.seed(seed)
    K_train = compute_quantum_kernel_matrix(X_train, X_train, n_qubits=n_qubits)
    
    svm = SVC(kernel='precomputed', C=C, probability=True, random_state=seed)
    svm.fit(K_train, y_train)
    
    alignment_score = compute_frobenius_kernel_alignment(K_train, X_train)
    return svm, K_train, alignment_score

def predict_quantum_kernel_svm(svm_model, X_train, X_test, n_qubits=8):
    """Predicts on test data using precomputed test-train quantum kernel matrix."""
    K_test = compute_quantum_kernel_matrix(X_test, X_train, n_qubits=n_qubits)
    probs = svm_model.predict_proba(K_test)[:, 1]
    preds = (probs > 0.5).astype(int)
    return preds, probs
