from typing import List, Dict, Any, Tuple

def evaluate_decision_recommendation(
    markets: List[Dict[str, Any]],
    crop: str,
    quantity: float,
    target_date: str
) -> Tuple[Dict[str, Any], Dict[str, str]]:
    """
    Evaluates market comparison results and returns best_market and decision recommendation.
    Recommendation Types:
    - CHOOSE_A_BETTER_MARKET
    - WAIT
    - SELL_NOW
    - HOLD_AND_MONITOR
    """
    if not markets:
        return {}, {
            "type": "HOLD_AND_MONITOR",
            "reason": f"No nearby markets with sufficient price data for {crop} were found within your search radius."
        }

    # Best market based primarily on highest estimated net revenue
    best_market = max(markets, key=lambda x: x["estimated_net_revenue"])
    
    # Nearest market
    nearest_market = min(markets, key=lambda x: x["distance_km"])
    
    avg_current_price = sum(m["current_price"] for m in markets) / len(markets)
    best_pred_price = best_market["predicted_price"]
    best_curr_price = best_market["current_price"]
    net_rev = best_market["estimated_net_revenue"]
    net_rev_str = f"₹{net_rev:,.2f}"

    price_diff = best_pred_price - best_curr_price
    pct_change = (price_diff / best_curr_price) * 100.0

    # Decision Engine Logic:
    # 1. If another market has higher estimated net revenue than nearest market by significant amount
    if best_market["id"] != nearest_market["id"] and (best_market["estimated_net_revenue"] > nearest_market["estimated_net_revenue"] + 500):
        rec_type = "CHOOSE_A_BETTER_MARKET"
        extra_rev = best_market["estimated_net_revenue"] - nearest_market["estimated_net_revenue"]
        reason = (
            f"Based on predicted crop prices for {target_date} and transportation costs, {best_market['market_name']} "
            f"provides the highest estimated net revenue ({net_rev_str}), generating ₹{extra_rev:,.2f} more profit than the nearest market ({nearest_market['market_name']})."
        )
    # 2. Price is expected to increase significantly by target date
    elif pct_change > 3.0:
        rec_type = "WAIT"
        reason = (
            f"The predicted modal price for {crop} in {best_market['market_name']} on {target_date} is ₹{best_pred_price:,.2f}/quintal "
            f"(+{pct_change:.1f}% increase over current price of ₹{best_curr_price:,.2f}). Holding until the selected date maximizes net revenue."
        )
    # 3. Price is expected to fall
    elif pct_change < -2.0:
        rec_type = "SELL_NOW"
        reason = (
            f"The predicted price for {target_date} in {best_market['market_name']} is expected to decrease to ₹{best_pred_price:,.2f}/quintal "
            f"({pct_change:.1f}% change). Selling now in current market conditions avoids anticipated price drop."
        )
    # 4. Moderate/Stable prices
    else:
        rec_type = "HOLD_AND_MONITOR"
        reason = (
            f"{best_market['market_name']} offers the best net revenue ({net_rev_str}) for your selected quantity of {quantity} quintals. "
            f"Predicted price of ₹{best_pred_price:,.2f}/quintal remains steady with minor fluctuations."
        )

    return best_market, {
        "type": rec_type,
        "reason": reason
    }
