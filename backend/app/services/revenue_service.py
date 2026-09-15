from typing import Dict, Any

def calculate_revenue(
    predicted_price_per_quintal: float,
    quantity_quintals: float,
    transport_cost: float,
    other_charges: float = 0.0
) -> Dict[str, float]:
    """
    Calculate Expected Gross Revenue and Estimated Net Revenue.
    
    Expected Gross Revenue = Predicted Price per Quintal * Quantity (Quintals)
    Estimated Net Revenue = Expected Gross Revenue - Estimated Transport Cost - Other Charges
    """
    expected_gross_revenue = predicted_price_per_quintal * quantity_quintals
    estimated_net_revenue = expected_gross_revenue - transport_cost - other_charges

    return {
        "expected_gross_revenue": round(expected_gross_revenue, 2),
        "transport_cost": round(transport_cost, 2),
        "other_charges": round(other_charges, 2),
        "estimated_net_revenue": round(estimated_net_revenue, 2)
    }
