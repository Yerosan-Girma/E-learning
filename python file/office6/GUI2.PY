import tkinter as tk
from tkinter import messagebox

# Create main window
root = tk.Tk()
root.title("Calculator")
root.geometry("300x400")

entry_var = tk.StringVar()

# Entry widget to display calculations
entry = tk.Entry(root, textvariable=entry_var, font=("Arial", 20), justify='right', bd=10, relief=tk.GROOVE)
entry.pack(fill=tk.BOTH, ipadx=8, ipady=8, padx=10, pady=10)

# Button layout
buttons = [
    ('7', '8', '9', '/'),
    ('4', '5', '6', '*'),
    ('1', '2', '3', '-'),
    ('C', '0', '=', '+')
]

frame = tk.Frame(root)
frame.pack()

for row in buttons:
    button_row = tk.Frame(frame)
    button_row.pack(fill=tk.BOTH, expand=True)
    for btn in row:
        button = tk.Button(button_row, text=btn, font=("Arial", 18))
        button.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        if btn == '=':
            button.config(command=lambda: entry_var.set(eval(entry_var.get())) if entry_var.get() else None)
        elif btn == 'C':
            button.config(command=lambda: entry_var.set(""))
        else:
            button.config(command=lambda b=btn: entry_var.set(entry_var.get() + b))

root.mainloop()
