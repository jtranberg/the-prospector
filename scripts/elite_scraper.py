from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from bs4 import BeautifulSoup
import pandas as pd
import time

URL = "https://www.eliteprospects.com/league/bchl/stats/2025-2026"

options = Options()

options.debugger_address = "127.0.0.1:9222"

driver = webdriver.Chrome(options=options)

driver.get(URL)

time.sleep(5)

html = driver.page_source

with open("debug_elite.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Page title:", driver.title)

soup = BeautifulSoup(html, "html.parser")

players = []

rows = soup.select("table tbody tr")

for row in rows[:50]:
    cols = row.find_all("td")

    if len(cols) < 8:
        continue

    try:
        player = {
            "name": cols[1].get_text(strip=True),
            "team": cols[2].get_text(strip=True),
            "games": cols[3].get_text(strip=True),
            "goals": cols[4].get_text(strip=True),
            "assists": cols[5].get_text(strip=True),
            "points": cols[6].get_text(strip=True),
        }

        players.append(player)

    except Exception as e:
        print(e)

df = pd.DataFrame(players)

print(df)

if df.empty:
    print("No players found.")
else:
    df.to_csv(
        "src/data/prospects.csv",
        index=False
    )

    print("Saved prospects.csv")