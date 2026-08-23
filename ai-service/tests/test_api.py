"""Test tích hợp cho HTTP API - chạy qua đúng lớp mà app React Native gọi."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from nihongo_ai.api import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_reports_loaded_model(client):
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["model"]["model"] == "char_logreg"
    assert body["model"]["n_examples"] > 500


def test_scenarios_are_listed(client):
    scenarios = client.get("/api/v1/conversation/scenarios").json()
    ids = {s["id"] for s in scenarios}
    assert {"restaurant", "directions", "shopping", "self_intro"} <= ids
    for scenario in scenarios:
        assert scenario["title"] and scenario["goal"] and scenario["personaEmoji"]


def test_start_returns_opening_line_and_hints(client):
    body = client.post(
        "/api/v1/conversation/start", json={"scenarioId": "restaurant"}
    ).json()
    assert body["state"] == "welcome"
    assert body["reply"]["ja"]
    assert body["hints"]


def test_unknown_scenario_is_404(client):
    response = client.post(
        "/api/v1/conversation/start", json={"scenarioId": "khong-ton-tai"}
    )
    assert response.status_code == 404


def test_unknown_state_is_400(client):
    response = client.post(
        "/api/v1/conversation/respond",
        json={
            "scenarioId": "restaurant",
            "state": "khong-ton-tai",
            "text": "二人です",
        },
    )
    assert response.status_code == 400


def test_full_conversation_over_http(client):
    state = client.post(
        "/api/v1/conversation/start", json={"scenarioId": "restaurant"}
    ).json()["state"]

    completed = False
    for text in [
        "二人です",
        "おすすめは何ですか",
        "ラーメンをください",
        "いいえ、大丈夫です",
        "お会計お願いします",
        "ありがとうございました",
    ]:
        body = client.post(
            "/api/v1/conversation/respond",
            json={"scenarioId": "restaurant", "state": state, "text": text},
        ).json()
        state = body["state"]
        completed = body["completed"]
    assert completed


def test_junk_input_is_refused_with_guidance(client):
    body = client.post(
        "/api/v1/conversation/respond",
        json={"scenarioId": "restaurant", "state": "welcome", "text": "asdfghjkl"},
    ).json()
    assert body["outcome"] == "invalid_input"
    assert body["hints"], "người dùng phải luôn có lối đi tiếp"
    assert body["state"] == "welcome", "lượt hỏng không được làm mất trạng thái"


def test_grammar_notes_ride_along_with_the_reply(client):
    body = client.post(
        "/api/v1/conversation/respond",
        json={"scenarioId": "restaurant", "state": "welcome", "text": "こんにちわ"},
    ).json()
    assert any(n["suggestion"] == "こんにちは" for n in body["grammarNotes"])


def test_overlong_text_is_rejected_by_schema(client):
    response = client.post(
        "/api/v1/conversation/respond",
        json={
            "scenarioId": "restaurant",
            "state": "welcome",
            "text": "あ" * 900,
        },
    )
    assert response.status_code == 422
