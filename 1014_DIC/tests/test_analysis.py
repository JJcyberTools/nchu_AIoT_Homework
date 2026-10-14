from pathlib import Path
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from analysis import load_problem, model_metrics, feature_ranking, evaluate


def test_exact_linear_fit():
    x = pd.DataFrame({
        "x": np.arange(30.0),
        "noise": np.sin(np.arange(30.0)),
    })
    y = pd.Series(3.0 + 2.0 * x["x"])
    result = model_metrics(x.iloc[:25], x.iloc[25:], y.iloc[:25], y.iloc[25:], ["x"])
    assert result["rmse"] < 1e-6
    assert result["r2"] == 1
    assert result["coefficients"]["x"] == 2


def test_feature_rankings():
    x = pd.DataFrame({
        "a": np.arange(30.0),
        "b": np.sin(np.arange(30.0)),
    })
    y = pd.Series(np.arange(30.0) * 2)
    for method in ("Lasso", "ElasticNet"):
        assert sorted(feature_ranking(x, y, method)) == ["a", "b"]


def test_bundled_datasets():
    for problem, expected_rows in (("startup", 50), ("boston", 506)):
        X, y = load_problem(problem)
        assert len(X) == len(y) == expected_rows
        assert X.shape[1] >= 4
        assert not X.isna().any().any()


def test_full_both_problems():
    for name in ("startup", "boston"):
        result = evaluate(name)
        assert result["dataset_rows"] > 40
        assert result["testing_rows"] > 0
        assert len(result["results"]) >= 15
        assert all(np.isfinite(r["rmse"]) for r in result["results"])
