import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query

router = APIRouter()

# Mocked / Synthetic dataset of grocery shops and supermarkets across districts in Tamil Nadu
GROCERY_STORES = [
  {
    "id": "store_pazhamudir_cbe",
    "name": "Pazhamudir Nilayam",
    "type": "Chain Produce Store",
    "area": "Gandhipuram",
    "district": "Coimbatore",
    "address": "No. 112, Crosscut Road, Gandhipuram, Coimbatore",
    "prices": {
      "Tomato": {"retail_per_kg": 42.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 38.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 45.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 95.0, "mandi_per_kg": 72.0, "stock": "Limited Stock"},
      "Rice": {"retail_per_kg": 58.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 42.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_reliance_rspuram",
    "name": "Reliance Fresh Supermarket",
    "type": "Supermarket Chain",
    "area": "RS Puram",
    "district": "Coimbatore",
    "address": "DB Road, RS Puram, Coimbatore",
    "prices": {
      "Tomato": {"retail_per_kg": 45.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 40.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 48.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 100.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 62.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 45.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_nilgiris_cbe",
    "name": "Nilgiris Supermarket",
    "type": "Premium Retail Grocery",
    "area": "Race Course",
    "district": "Coimbatore",
    "address": "Race Course Road, Coimbatore",
    "prices": {
      "Tomato": {"retail_per_kg": 48.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 42.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 50.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 105.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 65.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 48.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_organic_cbe",
    "name": "Uzhavar Organic Grocery Market",
    "type": "Farmer Collective Retail",
    "area": "Sowripalayam",
    "district": "Coimbatore",
    "address": "Sowripalayam Main Road, Coimbatore",
    "prices": {
      "Tomato": {"retail_per_kg": 38.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 34.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 42.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 88.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 54.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 38.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_heritage_erode",
    "name": "Heritage Fresh Store",
    "type": "Supermarket Chain",
    "area": "Perundurai Road",
    "district": "Erode",
    "address": "Perundurai Road, Erode",
    "prices": {
      "Tomato": {"retail_per_kg": 40.0, "mandi_per_kg": 27.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 36.0, "mandi_per_kg": 25.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 44.0, "mandi_per_kg": 30.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 92.0, "mandi_per_kg": 70.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 56.0, "mandi_per_kg": 44.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 40.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_fresh_madurai",
    "name": "Madurai Fresh Mart",
    "type": "Local Grocery Supermarket",
    "area": "KK Nagar",
    "district": "Madurai",
    "address": "KK Nagar Main Road, Madurai",
    "prices": {
      "Tomato": {"retail_per_kg": 41.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 37.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 46.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 94.0, "mandi_per_kg": 73.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 57.0, "mandi_per_kg": 45.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 41.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_pazhamudir_salem",
    "name": "Pazhamudir Nilayam",
    "type": "Chain Produce Store",
    "area": "Meyyanur",
    "district": "Salem",
    "address": "Junction Main Road, Meyyanur, Salem, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 43.0, "mandi_per_kg": 29.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 37.0, "mandi_per_kg": 25.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 46.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 96.0, "mandi_per_kg": 73.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 59.0, "mandi_per_kg": 47.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 43.0, "mandi_per_kg": 33.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_kannan_salem",
    "name": "Sri Kannan Departmental Store",
    "type": "Supermarket Chain",
    "area": "Fairlands",
    "district": "Salem",
    "address": "Brindavan Road, Fairlands, Salem, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 44.0, "mandi_per_kg": 29.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 39.0, "mandi_per_kg": 25.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 47.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 98.0, "mandi_per_kg": 73.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 60.0, "mandi_per_kg": 47.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 44.0, "mandi_per_kg": 33.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_reliance_salem",
    "name": "Reliance Smart Supermarket",
    "type": "Supermarket Chain",
    "area": "Five Roads",
    "district": "Salem",
    "address": "Omalur Main Road, Five Roads, Salem, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 46.0, "mandi_per_kg": 29.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 40.0, "mandi_per_kg": 25.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 49.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 102.0, "mandi_per_kg": 73.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 63.0, "mandi_per_kg": 47.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 46.0, "mandi_per_kg": 33.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_pazhamudir_tpr",
    "name": "Pazhamudir Nilayam",
    "type": "Chain Produce Store",
    "area": "Avinashi Road",
    "district": "Tiruppur",
    "address": "Avinashi Road, Gandhi Nagar, Tiruppur, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 42.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 38.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 45.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 95.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 58.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 42.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_kannan_tpr",
    "name": "Sri Kannan Departmental Store",
    "type": "Supermarket Chain",
    "area": "Kumaran Road",
    "district": "Tiruppur",
    "address": "Kumaran Road, Near Railway Station, Tiruppur, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 43.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 37.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 46.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 96.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 59.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 43.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  },
  {
    "id": "store_dmart_tpr",
    "name": "DMart Supermarket",
    "type": "Hypermarket Chain",
    "area": "PN Road",
    "district": "Tiruppur",
    "address": "PN Road, Pitchampalayam Pudur, Tiruppur, Tamil Nadu",
    "prices": {
      "Tomato": {"retail_per_kg": 40.0, "mandi_per_kg": 28.0, "stock": "In Stock"},
      "Potato": {"retail_per_kg": 35.0, "mandi_per_kg": 26.0, "stock": "In Stock"},
      "Onion": {"retail_per_kg": 43.0, "mandi_per_kg": 31.0, "stock": "In Stock"},
      "Chilly": {"retail_per_kg": 90.0, "mandi_per_kg": 72.0, "stock": "In Stock"},
      "Rice": {"retail_per_kg": 55.0, "mandi_per_kg": 46.0, "stock": "In Stock"},
      "Wheat": {"retail_per_kg": 39.0, "mandi_per_kg": 32.0, "stock": "In Stock"},
    }
  }
]

@router.get("/retail-prices")
def get_retail_prices(
    crop: Optional[str] = Query("Tomato", description="Crop name"),
    district: Optional[str] = Query("Coimbatore", description="District location")
):
    """
    Retrieves retail grocery shop prices for crops in specific locations compared to Mandi wholesale prices.
    """
    filtered_stores = []
    
    selected_crop = crop or "Tomato"
    selected_district = district or "Coimbatore"

    total_retail = 0.0
    total_mandi = 0.0
    count = 0

    for store in GROCERY_STORES:
        if selected_district.lower() != "all" and store["district"].lower() != selected_district.lower():
            continue

        price_info = store["prices"].get(selected_crop) or store["prices"].get("Tomato")
        if price_info:
            retail_p = price_info["retail_per_kg"]
            mandi_p = price_info["mandi_per_kg"]
            markup = round(((retail_p - mandi_p) / mandi_p) * 100, 1)

            total_retail += retail_p
            total_mandi += mandi_p
            count += 1

            filtered_stores.append({
                "store_id": store["id"],
                "store_name": store["name"],
                "store_type": store["type"],
                "area": store["area"],
                "district": store["district"],
                "address": store["address"],
                "crop": selected_crop,
                "unit": "1 kg",
                "retail_price_per_kg": retail_p,
                "mandi_price_per_kg": mandi_p,
                "markup_percentage": markup,
                "stock_status": price_info["stock"],
                "last_updated": "Today, 08:30 AM"
            })

    avg_retail = round(total_retail / count, 1) if count > 0 else 0
    avg_mandi = round(total_mandi / count, 1) if count > 0 else 0
    avg_margin = round(((avg_retail - avg_mandi) / avg_mandi) * 100, 1) if avg_mandi > 0 else 0

    return {
        "crop": selected_crop,
        "district": selected_district,
        "summary": {
            "avg_retail_price_per_kg": avg_retail,
            "avg_mandi_price_per_kg": avg_mandi,
            "avg_retail_markup": avg_margin,
            "total_stores_counted": count
        },
        "stores": filtered_stores
    }
