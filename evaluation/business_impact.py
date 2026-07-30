def calculate_business_impact(accuracy_lift_pct, transaction_volume=10000, stockout_cost=82.0):
    """
    Calculates business impact using the given accuracy lift.
    """
    accuracy_lift = accuracy_lift_pct / 100.0 if accuracy_lift_pct > 1 else accuracy_lift_pct
    
    savings = accuracy_lift * transaction_volume * stockout_cost
    
    return {
        "savings": savings,
        "accuracy_lift": accuracy_lift,
        "methodology_note": "Calculated based on estimated reduction in stockouts due to improved prediction.",
        "ihl_citation_caveat": "Based on IHL Group estimates of average out-of-stock costs per transaction in retail."
    }
