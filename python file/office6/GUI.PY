import tkinter as tk
from tkinter import messagebox

def on_click(button_text):
    if button_text == '=':
        try:
            result = eval(entry_var.get())
            entry_var.set(result)
        except Exception as e:
            messagebox.showerror("Error", "Invalid Input")
    elif button_text == 'C':
        entry_var.set("")
    else:
        entry_var.set(entry_var.get() + button_text)

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
        button = tk.Button(button_row, text=btn, font=("Arial", 18), command=lambda b=btn: on_click(b))
        button.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)

root.mainloop()
