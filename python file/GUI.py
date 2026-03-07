#python GUI in tkinter
import tkinter as tk
from tkinter import font
from functools import partial
def increase(lbl):
    num=int(str(lbl["tex"]))
    num+=1
    lbl["text"]=str(num)
root=tk.Tk()
root.title("gui in python")
#root.geometry("400x300")
mylabel=tk.Label(root,text="0")
mylabel.pack()
mylabel=tk.Label(root,text="good morning",height=25,width=50)
mylabel.pack()
'''
font=list(font.families())
for f in font:
    print(f)
labelfont=font.font(family="Cascadia Code SemiBold",size=30,weight="bold")
tk.Label(root,tex="good morning",font=labelfont).pack()

compsic=tk.PhotoImage(file="/img/ethio.jpg")
tk=Label(root,Image=compsic)
'''
tk.Button(root,text="click me",width=20,command=partial(increase,mylabel)).pack(side=tk.LEFT)
tk.Button(root,text="ok",width=20,highlightcolor="red").pack(side=tk.RIGHT)
tk.Button(root,text="+",width=30).pack(side=tk.LEFT)
tk.Button(root,text="*",width=20).pack(side=tk.RIGHT)
tk.mainloop()

 