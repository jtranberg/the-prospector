import csv
import tkinter as tk
from tkinter import messagebox
import webbrowser
from pathlib import Path

ELITE_HOME = "https://www.eliteprospects.com/"
ELITE_BCHL_STATS = "https://www.eliteprospects.com/league/bchl/stats/2025-2026"

OUTPUT_FILE = Path("src/data/prospects.csv")


def open_elite():
    webbrowser.open(ELITE_HOME)


def open_bchl_stats():
    webbrowser.open(ELITE_BCHL_STATS)


def paste_clipboard():
    try:
        text_box.delete("1.0", tk.END)
        text_box.insert(tk.END, root.clipboard_get())
    except tk.TclError:
        messagebox.showerror("Clipboard Error", "Nothing found in clipboard.")


def save_csv():
    raw_text = text_box.get("1.0", tk.END).strip()

    if not raw_text:
        messagebox.showwarning("No Data", "Paste copied table rows first.")
        return

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    players = []

    for index, line in enumerate(lines, start=1):
        parts = line.split("\t")

        if len(parts) < 7:
            continue

        players.append({
            "id": index,
            "name": parts[0],
            "team": parts[1] if len(parts) > 1 else "",
            "league": "BCHL",
            "position": parts[2] if len(parts) > 2 else "",
            "age": parts[3] if len(parts) > 3 else "",
            "games": parts[4] if len(parts) > 4 else 0,
            "goals": parts[5] if len(parts) > 5 else 0,
            "assists": parts[6] if len(parts) > 6 else 0,
            "points": parts[7] if len(parts) > 7 else 0,
            "pim": parts[8] if len(parts) > 8 else 0,
            "status": "Watch",
            "upside": "Medium",
        })

    if not players:
        messagebox.showerror(
            "No Players Found",
            "Could not parse rows. Make sure the copied table is tab-separated."
        )
        return

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as file:
        fieldnames = [
            "id",
            "name",
            "team",
            "league",
            "position",
            "age",
            "games",
            "goals",
            "assists",
            "points",
            "pim",
            "status",
            "upside",
        ]

        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(players)

    messagebox.showinfo(
        "Saved",
        f"Saved {len(players)} players to {OUTPUT_FILE}"
    )


root = tk.Tk()
root.title("ScoutBoard Elite Import Tool")
root.geometry("900x650")

title = tk.Label(
    root,
    text="ScoutBoard EliteProspects Import Tool",
    font=("Arial", 18, "bold")
)
title.pack(pady=12)

button_frame = tk.Frame(root)
button_frame.pack(pady=8)

tk.Button(
    button_frame,
    text="Open EliteProspects",
    command=open_elite,
    width=22
).grid(row=0, column=0, padx=6)

tk.Button(
    button_frame,
    text="Open BCHL Stats Page",
    command=open_bchl_stats,
    width=22
).grid(row=0, column=1, padx=6)

tk.Button(
    button_frame,
    text="Paste From Clipboard",
    command=paste_clipboard,
    width=22
).grid(row=0, column=2, padx=6)

tk.Button(
    button_frame,
    text="Save CSV",
    command=save_csv,
    width=22
).grid(row=0, column=3, padx=6)

instructions = tk.Label(
    root,
    text=(
        "Workflow: open EliteProspects → copy visible stat rows → "
        "click Paste From Clipboard → Save CSV."
    ),
    font=("Arial", 10)
)
instructions.pack(pady=6)

text_box = tk.Text(root, wrap="none", font=("Consolas", 10))
text_box.pack(expand=True, fill="both", padx=14, pady=12)

root.mainloop()