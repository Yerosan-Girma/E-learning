#program to write data to a file using writeline

 
 
'''
with open("data1.txt","w") as f:
 lst="write a file of using python"
f.write(lst)
f.close
with open("data1.txt","r") as f:
    read_new_data=f.read()
    print(read_new_data)
'''
ch="y"
f=open("student.txt","a")
while ch=="y":
    name=input("enter the name:")
    age=int(input("eneter age:"))
    f.write(name)
    f.write("\n")
    f.write(str(age))
    f.write("\n")
    f.close()





