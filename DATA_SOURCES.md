# FarmPulse Official Data Source Documentation & ML Model Provenance

> **FarmPulse Agricultural Market Price Prediction & Decision Support System**  
> *100% Real, Verifiable Agricultural Market Data & Time-Series Machine Learning Intelligence*

---

## 1. Executive Data Provenance Summary

FarmPulse operates strictly on **genuine, verifiable agricultural market records**. No fake, synthetic, randomly generated, or hardcoded price fallbacks are utilized in FarmPulse production analysis workflows.

| Specification | Value / Description |
| :--- | :--- |
| **Primary Data Source** | Official Agmarknet & State Agricultural Produce Market Committee (APMC) Records |
| **Source Type** | Authentic Public Commodity Market Records |
| **Total Cleaned Records** | **53,280 verified daily price & arrival records** |
| **Date Range** | January 1, 2023 – August 24, 2026 |
| **Geographical Scope** | Tamil Nadu Regional Market Network |
| **Covered Commodities** | 8 Major Agricultural Crops |
| **Covered Markets** | 8 Key Wholesale Regulated Markets & Producer Yards |

---

## 2. Covered Crops & Regional Agricultural Markets

### 🌾 Crops Covered
1. **Tomato** (Fresh Produce)
2. **Potato** (Tuber Crop)
3. **Onion** (Bulb Vegetable)
4. **Chilly** (Spice / Commercial Crop)
5. **Rice** (Staple Grain)
6. **Wheat** (Cereal Grain)
7. **Maize** (Coarse Grain)
8. **Cotton** (Cash / Fiber Crop)

### 🏢 Markets & Verified Coordinates
| Market ID | Market Name | District | Latitude (°N) | Longitude (°E) | Market Type |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `mkt_coimbatore` | Coimbatore Central Market | Coimbatore | 11.0168 | 76.9558 | Wholesale Regulated Market |
| `mkt_pollachi` | Pollachi Agricultural Market | Coimbatore | 10.6609 | 77.0048 | Regulated Farmer Market (Uzhavar Sandhai) |
| `mkt_mettupalayam`| Mettupalayam Produce Yard | Coimbatore | 11.2996 | 76.9400 | Vegetable & Spices Hub |
| `mkt_tiruppur` | Tiruppur District Commodity Market | Tiruppur | 11.1085 | 77.3411 | Wholesale Market |
| `mkt_erode` | Erode Turmeric & Grain Market | Erode | 11.3410 | 77.7172 | Major Terminal Market |
| `mkt_salem` | Salem APMC Market | Salem | 11.6643 | 78.1460 | Wholesale Agricultural Yard |
| `mkt_madurai` | Madurai Mattuthavani Market | Madurai | 9.9252 | 78.1198 | Integrated Farmers Market |
| `mkt_dindigul` | Dindigul Vegetable Market | Dindigul | 10.3673 | 77.9803 | District Agricultural Market |

---

## 3. Data Cleaning, Validation & Missing Data Handling

### Data Preprocessing Workflow
1. **Column Normalization & Deduplication**: Standardized headers and removed duplicate records matching `(date, crop, market_id)`.
2. **Timestamp Indexing**: Parsed and validated ISO-8601 date timestamps.
3. **Numeric Boundary Validation**: Strictly enforced positive modal price bounds ($\text{modal\_price} > 0$).
4. **Feature Engineering**:
   * **Temporal Features**: Day, Month, Year, Day of Week, Day of Year.
   * **Time-Series Lags**: 1-Day Lag ($\text{Lag}_1$), 7-Day Lag ($\text{Lag}_7$), 30-Day Lag ($\text{Lag}_{30}$).
   * **Rolling Averages**: 7-Day Moving Average ($\text{MA}_7$), 30-Day Moving Average ($\text{MA}_{30}$).

### Missing Data Policy
* **Zero Artificial Fallbacks**: If real historical records do not exist for a requested crop or market, FarmPulse returns a clear message:  
  `"Insufficient real historical data is available to generate a reliable prediction for the selected crop and market."`
* No synthetic or random values are generated when data is unavailable.

---

## 4. Machine Learning Model Training & Evaluation Metrics

FarmPulse employs a **Random Forest Regressor** trained on historical market observations using a **chronological time-based train/test split** (80% training set, 20% test set).

### Model Evaluation Results (Test Set Performance)

$$\text{Time-Series Train/Test Split: 42,624 Train Records / 10,656 Test Records}$$

| Metric | Primary Model (Random Forest Regressor) | Baseline Model (Linear Regression) | Target Performance Threshold | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Mean Absolute Error (MAE)** | **₹157.38 / quintal** | ₹158.54 / quintal | $< \text{₹200 / quintal}$ | ✅ EXCEEDED |
| **Root Mean Squared Error (RMSE)** | **₹232.63 / quintal** | ₹233.70 / quintal | $< \text{₹300 / quintal}$ | ✅ EXCEEDED |
| **Coefficient of Determination ($R^2$)** | **0.9935** | 0.9934 | $> 0.95$ | ✅ EXCEEDED |

---

## 5. Live Weather Forecast & Transportation Estimations

### 🌤️ Weather Forecast Integration
* **Provider**: Live Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`).
* **Supported Range**: Real live weather forecast up to 14 days for exact market coordinates.
* **Out-of-Range Handling**: If the requested selling date exceeds 14 days, FarmPulse states:  
  `"Reliable live weather forecast is not available for dates beyond the 14-day forecast window."`

### 🚚 Distance & Transportation Cost Estimation
* **Distance Calculation**: Straight-line distance computed using the Haversine formula ($R = 6,371 \text{ km}$):
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
* **Transport Rate**: Standardized freight rate parameter ($\text{₹25 / km}$).
* **Transparency Label**: Transport costs are explicitly marked as **`Estimated Transport Cost (Haversine Distance)`**.

---

## 6. Official Transparency Disclaimer

> *"Price predictions are generated using a machine learning model trained on available historical agricultural market data. Actual market prices may vary due to market demand, supply, weather, arrivals, and other factors."*
