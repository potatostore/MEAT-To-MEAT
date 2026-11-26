"""LLM 호출부. provider만 바꾸면 나머지 코드는 그대로 동작한다.

provider  필요한 환경변수        비고
groq      GROQ_API_KEY         기본값, 무료 등급 (console.groq.com)
gemini    GEMINI_API_KEY       무료 등급 (aistudio.google.com), pip install google-genai 필요
claude    ANTHROPIC_API_KEY    유료, pip install anthropic 필요
mock      없음                 LLM 없이 정답 SQL을 그대로 돌려줌 (파이프라인 점검용)

모델 이름이 바뀌어 오류가 나면 --model 옵션이나 NL2SQL_MODEL 환경변수로 지정한다.
"""
import os
import re

DEFAULT_PROVIDER = os.getenv("NL2SQL_PROVIDER", "groq")

DEFAULT_MODELS = {
    "groq": "openai/gpt-oss-120b",
    "gemini": "gemini-3.5-flash-lite",
    "claude": "claude-haiku-4-5-20251001",
    "mock": "mock",
}


def make_llm(provider=None, model=None):
    """(call(system, user) -> str, 모델 이름)을 돌려준다."""
    provider = provider or DEFAULT_PROVIDER
    model = model or os.getenv("NL2SQL_MODEL") or DEFAULT_MODELS[provider]

    if provider == "groq":
        from openai import OpenAI
        client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=os.environ["GROQ_API_KEY"])

        def call(system, user):
            res = client.chat.completions.create(
                model=model, temperature=0,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}])
            return res.choices[0].message.content

    elif provider == "gemini":
        from google import genai
        from google.genai import types
        client = genai.Client()

        def call(system, user):
            res = client.models.generate_content(
                model=model, contents=user,
                config=types.GenerateContentConfig(system_instruction=system, temperature=0))
            return res.text

    elif provider == "claude":
        import anthropic
        client = anthropic.Anthropic()

        def call(system, user):
            res = client.messages.create(
                model=model, max_tokens=1000, temperature=0, system=system,
                messages=[{"role": "user", "content": user}])
            return res.content[0].text

    elif provider == "mock":
        from questions import QUESTIONS
        answers = {x["q"]: x["ref"] for x in QUESTIONS}

        def call(system, user):
            return answers.get(user, "SELECT 1")

    else:
        raise ValueError(f"알 수 없는 provider: {provider}")

    return call, model


SQL_START = re.compile(r"^\s*(SELECT\b|WITH\s+(RECURSIVE\s+)?`?\w+`?\s*(\([^)]*\))?\s*AS\s*\()", re.I | re.M)


def extract_sql(text):
    """LLM 응답에서 SQL만 꺼낸다. 코드블록이 있으면 그 안쪽만, 앞에 설명이 붙어 있으면 SELECT/WITH부터.

    SQL은 줄 맨 앞의 SELECT 또는 'WITH 이름 AS (' 로만 인정한다.
    ("I can't help with that." 같은 거절 문장의 with를 SQL로 착각하지 않게)
    SQL이 없으면 빈 문자열을 돌려준다.
    """
    text = text or ""
    m = re.search(r"```(?:sql|mysql)?\s*(.*?)```", text, re.S | re.I)
    if m:
        text = m.group(1)
    m = SQL_START.search(text)
    if not m:
        return ""
    return text[m.start():].strip().rstrip(";").strip()
