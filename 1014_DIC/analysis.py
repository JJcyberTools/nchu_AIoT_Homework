"""NCHU AIoT DIC2: reproducible multiple linear regression / feature selection.

Reproduction:
    pip install -r requirements.txt
    python analysis.py
    python -m pytest -q

Feature selection uses the training set only. Dataset files are bundled in data/.
"""
from __future__ import annotations

import argparse
import json
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import ElasticNet, Lasso, LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent
SEED = 42


def load_problem(problem: str, path: str | Path | None = None):
    """Load a class problem. The Boston dataset is strictly for historical teaching."""
    if problem == "startup":
        file = path or ROOT / "data" / "startup.csv"
        target = "Profit"
    elif problem == "boston":
        file = path or ROOT / "data" / "boston.csv"
        target = "medv"
    else:
        raise ValueError("problem must be startup or boston")
    df = pd.read_csv(file)
    if problem == "boston":
        df.columns = [str(c).lower() for c in df.columns]
    if target not in df:
        raise ValueError("Target column missing: " + target)
    df = df.dropna(subset=[target])
    y = pd.to_numeric(df[target], errors="raise")
    X = pd.get_dummies(df.drop(columns=target), drop_first=True, dtype=float)
    X = X.apply(pd.to_numeric, errors="raise")
    if X.isna().any().any():
        raise ValueError("Missing independent values; clean the CSV before fitting")
    return X, y


def model_metrics(X_train, X_test, y_train, y_test, cols):
    """Fit ordinary least squares and evaluate the held-out test partition."""
    model = LinearRegression().fit(X_train[list(cols)], y_train)
    p = model.predict(X_test[list(cols)])
    return {
        "rmse": round(float(np.sqrt(mean_squared_error(y_test, p))), 4),
        "r2": round(float(r2_score(y_test, p)), 6),
        "intercept": round(float(model.intercept_), 4),
        "coefficients": {
            c: round(float(v), 6) for c, v in zip(cols, model.coef_)
        },
    }


def feature_ranking(X_train, y_train, method):
    """Regularize on standardized training predictors, rank by absolute weights."""
    scaler = StandardScaler()
    values = scaler.fit_transform(X_train)
    if method == "Lasso":
        fitted = Lasso(alpha=0.05, max_iter=60000, random_state=SEED)
    elif method == "ElasticNet":
        fitted = ElasticNet(
            alpha=0.05, l1_ratio=0.5, max_iter=60000, random_state=SEED
        )
    else:
        raise ValueError(method)
    fitted.fit(values, y_train)
    weights = dict(zip(X_train.columns, fitted.coef_))
    return sorted(X_train.columns, key=lambda c: (-abs(weights[c]), c))


def evaluate(problem: str, csv_path: str | Path | None = None):
    X, y = load_problem(problem, csv_path)
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=0.20, random_state=SEED
    )
    max_k = min(5, X.shape[1])
    rows = []
    for method in ("Lasso", "ElasticNet", "Forward SFS"):
        ordered = (
            feature_ranking(Xtr, ytr, method)
            if method in ("Lasso", "ElasticNet")
            else None
        )
        selected = []
        for k in range(1, max_k + 1):
            if method == "Forward SFS":
                # Sequential forward search only evaluates TRAIN predictions.
                remaining = [col for col in Xtr if col not in selected]
                best = min(
                    remaining,
                    key=lambda col: (
                        float(
                            np.sqrt(
                                mean_squared_error(
                                    ytr,
                                    LinearRegression()
                                    .fit(Xtr[selected + [col]], ytr)
                                    .predict(Xtr[selected + [col]]),
                                )
                            )
                        ),
                        col,
                    ),
                )
                selected.append(best)
                cols = list(selected)
            else:
                cols = list(ordered[:k])
            rows.append(
                {
                    "method": method,
                    "k": k,
                    "features": cols,
                    **model_metrics(Xtr, Xte, ytr, yte, cols),
                }
            )

    # Exhaustive subset search uses TRAIN adjusted R², never test set labels.
    if X.shape[1] <= 13:
        for k in range(1, max_k + 1):
            def train_adjusted_r2(cols):
                r2 = LinearRegression().fit(Xtr[list(cols)], ytr).score(
                    Xtr[list(cols)], ytr
                )
                n = len(ytr)
                return 1 - (1 - r2) * (n - 1) / (n - k - 1)

            cols = list(
                max(
                    combinations(Xtr.columns, k),
                    key=train_adjusted_r2,
                )
            )
            rows.append(
                {
                    "method": "Exhaustive",
                    "k": k,
                    "features": cols,
                    **model_metrics(Xtr, Xte, ytr, yte, cols),
                }
            )

    lowest = min(rows, key=lambda r: r["rmse"])
    return {
        "problem": problem,
        "dataset_rows": len(X),
        "training_rows": len(Xtr),
        "testing_rows": len(Xte),
        "seed": SEED,
        "predictors": list(X.columns),
        "test_winner_descriptive_only": lowest,
        "results": rows,
        "note": "The held-out test labels were not used for feature selection. Picking the best result by test error can still cause model-selection bias.",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--startup-csv", default=None)
    parser.add_argument("--boston-csv", default=None)
    args = parser.parse_args()
    output = {
        "startup": evaluate("startup", args.startup_csv),
        "boston": evaluate("boston", args.boston_csv),
    }
    target = ROOT / "results.json"
    target.write_text(
        json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("Saved:", target)
    for name, group in output.items():
        result = group["test_winner_descriptive_only"]
        print(
            name, "rows", group["dataset_rows"],
            "min test RMSE (descriptive)", result["method"], result["k"],
            result["rmse"], "R2", result["r2"],
        )


if __name__ == "__main__":
    main()
